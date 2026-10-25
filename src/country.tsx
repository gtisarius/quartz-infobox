import type { VNode } from "preact";
import {
  type Fields,
  type RenderCtx,
  hasValue,
  numberedGroups,
  plainText,
  renderInline,
  renderValue,
} from "./render";
import { applyAliases } from "./render";
import { Rows, box, image } from "./rows";

/** Chronicler-style keys → Wikipedia-style keys. */
const ALIASES: [RegExp, string][] = [
  [/^full_name$/, "conventional_long_name"],
  [/^official_language$/, "official_languages"],
  [/^national_language$/, "national_languages"],
  [/^regional_language$/, "regional_languages"],
  [/^religions$/, "religion"],
  [/^government$/, "government_type"],
  [/^population$/, "population_estimate"],
];

export function renderCountry(
  raw: Fields,
  ctx: RenderCtx,
  fallbackTitle: string,
): VNode | null {
  const fields = applyAliases(raw, ALIASES);
  // Old Chronicler pages keep flag and map together as `image: [flag, map]`.
  if (hasValue(fields.image) && !hasValue(fields.flag) && !hasValue(fields.map)) {
    const images = (Array.isArray(fields.image) ? fields.image : [fields.image]).filter(hasValue);
    fields.flag = images[0];
    fields.map = images[1];
    delete fields.image;
  }
  const r = new Rows(fields, ctx);
  const title =
    (hasValue(fields.conventional_long_name) && fields.conventional_long_name) ||
    (hasValue(fields.common_name) && fields.common_name) ||
    fallbackTitle;
  const shortName = hasValue(fields.common_name) ? plainText(fields.common_name) : fallbackTitle;

  // Flag and coat of arms, side by side like Wikipedia.
  const flag = image(fields.flag, `Flag of ${shortName}`, ctx, "infobox-flag");
  const coat = image(fields.coat_of_arms, `Coat of arms of ${shortName}`, ctx, "infobox-coat");
  if (flag || coat) {
    r.full(
      <div class="infobox-symbols">
        {flag ? (
          <figure>
            {flag}
            <figcaption>{hasValue(fields.flag_caption) ? renderInline(fields.flag_caption, ctx) : "Flag"}</figcaption>
          </figure>
        ) : null}
        {coat ? (
          <figure>
            {coat}
            <figcaption>
              {hasValue(fields.coat_of_arms_caption) ? renderInline(fields.coat_of_arms_caption, ctx) : "Coat of arms"}
            </figcaption>
          </figure>
        ) : null}
      </div>,
      "infobox-full infobox-images",
    );
  }

  if (hasValue(fields.motto)) {
    r.full(
      <>
        <b>Motto: </b>
        <i>{renderValue(fields.motto, ctx)}</i>
      </>,
    );
  }
  if (hasValue(fields.anthem)) {
    r.full(
      <>
        <b>Anthem: </b>
        <i>{renderValue(fields.anthem, ctx)}</i>
      </>,
    );
  }

  const map = image(fields.map, `Map of ${shortName}`, ctx, "infobox-map");
  if (map) {
    r.full(
      <figure>
        {map}
        {hasValue(fields.map_caption) ? <figcaption>{renderInline(fields.map_caption, ctx)}</figcaption> : null}
      </figure>,
      "infobox-full infobox-images",
    );
  }

  r.field("status", "Status");

  // Capital and largest city, merged into one row when they're the same place.
  const sameCity =
    hasValue(fields.capital) &&
    hasValue(fields.largest_city) &&
    plainText(fields.capital) === plainText(fields.largest_city);
  if (sameCity) {
    r.field("capital", "Capital and largest city");
  } else {
    r.field("capital", "Capital");
    r.field("largest_city", "Largest city");
  }
  r.field("largest_cities", "Largest cities");

  r.field("official_languages", "Official languages");
  r.field("national_languages", "National languages");
  r.field("recognized_languages", "Recognized languages");
  r.field("regional_languages", "Regional languages");
  r.field("ethnic_groups", "Ethnic groups");
  r.field("state_religion", "State religion");
  r.field("religion", "Religion");
  r.field("demonym", "Demonym");

  // Government: the type, then every leader_titleN / leader_nameN pair.
  const leaders = numberedGroups(fields, ["leader_title", "leader_name"]);
  if (hasValue(fields.government_type) || leaders.length > 0) {
    r.row("Government", fields.government_type, { allowEmpty: true });
    for (const leader of leaders) {
      r.row(
        hasValue(leader.leader_title) ? renderInline(leader.leader_title, ctx) : "Leader",
        leader.leader_name,
        { sub: true },
      );
    }
  }

  // Legislatures: legislature / upper_house / lower_house, then legislature2 / upper_house2 / ...
  for (const body of numberedGroups(fields, ["legislature", "upper_house", "lower_house"])) {
    r.row("Legislature", body.legislature, { allowEmpty: true });
    r.row("Upper house", body.upper_house, { sub: true });
    r.row("Lower house", body.lower_house, { sub: true });
  }

  // Formation history.
  const events = numberedGroups(fields, ["established_event", "established_date"]);
  if (events.length > 0 || hasValue(fields.sovereignty_note)) {
    const heading = hasValue(fields.sovereignty_type) ? renderInline(fields.sovereignty_type, ctx) : "Formation";
    r.section(heading, () => {
      if (hasValue(fields.sovereignty_note)) r.full(renderInline(fields.sovereignty_note, ctx), "infobox-full infobox-note");
      for (const event of events) {
        r.row(
          hasValue(event.established_event) ? renderInline(event.established_event, ctx) : "Established",
          event.established_date,
          { sub: true, allowEmpty: true },
        );
      }
    });
  }

  r.section("Area", () => {
    r.field("area", "Total", { sub: true });
    r.field("area_note", "Note", { sub: true });
  });

  r.section("Population", () => {
    const estimateLabel = hasValue(fields.population_estimate_year)
      ? `${String(fields.population_estimate_year)} estimate`
      : "Estimate";
    r.row(estimateLabel, fields.population_estimate, { sub: true });
    const censusLabel = hasValue(fields.population_census_year)
      ? `${String(fields.population_census_year)} census`
      : "Census";
    r.row(censusLabel, fields.population_census, { sub: true });
    r.field("population_density", "Density", { sub: true });
  });

  r.field("currency", "Currency");
  r.field("calendar", "Calendar");

  r.field("preceded_by", "Preceded by");
  r.field("succeeded_by", "Succeeded by");

  r.extras();

  // Show the subtitle under the title unless it just repeats it (e.g. dates of existence).
  const subtitle =
    hasValue(fields.subtitle) && plainText(fields.subtitle) !== plainText(title) ? fields.subtitle : undefined;
  return box("country", title, ctx, r.rows, { below: [fields.native_name, subtitle] });
}

/** Keys this infobox type understands; anything else is shown as an extra row. */
export const knownCountry = /^(?:conventional_long_name|common_name|native_name|subtitle|image|flag|flag_caption|coat_of_arms|coat_of_arms_caption|motto|anthem|map|map_caption|status|capital|largest_city|largest_cities|official_languages?|national_languages?|recognized_languages|regional_languages?|ethnic_groups|state_religion|religions?|demonym|government|government_type|leader_title\d*|leader_name\d*|legislature\d*|upper_house\d*|lower_house\d*|sovereignty_type|sovereignty_note|established_event\d*|established_date\d*|area|area_note|population|population_estimate|population_estimate_year|population_census|population_census_year|population_density|currency|calendar|preceded_by|succeeded_by|full_name)$/;
