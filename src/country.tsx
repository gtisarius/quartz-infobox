import type { ComponentChildren, VNode } from "preact";
import {
  type Fields,
  type RenderCtx,
  hasValue,
  numberedGroups,
  plainText,
  renderInline,
  renderValue,
  resolveAsset,
} from "./render";

/** Builds table rows. Every helper skips itself when its value is empty. */
class Rows {
  readonly rows: VNode[] = [];
  private n = 0;
  constructor(
    private readonly fields: Fields,
    private readonly ctx: RenderCtx,
  ) {}

  private key(): string {
    return `r${this.n++}`;
  }

  /** A labelled row: label on the left, value on the right. */
  row(
    label: ComponentChildren,
    value: unknown,
    opts: { sub?: boolean; allowEmpty?: boolean } = {},
  ): boolean {
    if (!hasValue(value) && !opts.allowEmpty) return false;
    this.rows.push(
      <tr key={this.key()} class={opts.sub ? "infobox-subrow" : undefined}>
        <th scope="row" class="infobox-label">
          {opts.sub ? <span class="infobox-bullet">•&nbsp;</span> : null}
          {label}
        </th>
        <td class="infobox-data">{hasValue(value) ? renderValue(value, this.ctx) : null}</td>
      </tr>,
    );
    return true;
  }

  /** Row for a single frontmatter key. */
  field(key: string, label: string, opts: { sub?: boolean } = {}): boolean {
    return this.row(label, this.fields[key], opts);
  }

  /** A full-width blue section bar. */
  header(text: ComponentChildren): void {
    this.rows.push(
      <tr key={this.key()}>
        <th colSpan={2} class="infobox-header">
          {text}
        </th>
      </tr>,
    );
  }

  /** A full-width centered row (images, motto, anthem). */
  full(content: ComponentChildren, className = "infobox-full"): void {
    this.rows.push(
      <tr key={this.key()}>
        <td colSpan={2} class={className}>
          {content}
        </td>
      </tr>,
    );
  }

  /** Adds a header only if the rows that follow produce something. */
  section(title: ComponentChildren, build: () => void): void {
    const headerAt = this.rows.length;
    this.header(title);
    const before = this.rows.length;
    build();
    if (this.rows.length === before) this.rows.splice(headerAt, 1);
  }
}

function image(path: unknown, alt: string, ctx: RenderCtx, className: string): VNode | null {
  if (!hasValue(path)) return null;
  const src = resolveAsset(String(Array.isArray(path) ? path[0] : path), ctx);
  return <img src={src} alt={alt} class={className} loading="lazy" />;
}

export function renderCountry(
  fields: Fields,
  ctx: RenderCtx,
  fallbackTitle: string,
): VNode | null {
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

  return (
    <table class="infobox infobox-country">
      <caption class="infobox-title">
        {renderInline(title, ctx)}
        {hasValue(fields.native_name) ? (
          <div class="infobox-native-name">{renderValue(fields.native_name, ctx)}</div>
        ) : null}
      </caption>
      <tbody>{r.rows}</tbody>
    </table>
  );
}
