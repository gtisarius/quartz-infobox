import type { VNode } from "preact";
import {
  type Fields,
  type RenderCtx,
  applyAliases,
  hasValue,
  numberedGroups,
  parseLines,
  renderInline,
} from "./render";
import { Rows, box, first, image, mainImage } from "./rows";

/** Chronicler-style keys → Wikipedia-style keys. */
const ALIASES: [RegExp, string][] = [
  [/^burial$/, "resting_place"],
  [/^consorts$/, "consort"],
  [/^spouses$/, "spouse"],
  [/^service$/, "branch"],
  [/^service_years$|^serviceyears$/, "years_of_service"],
  [/^combat$|^conflicts$|^wars$/, "battles"],
  [/^medals$/, "awards"],
  [/^nicknames$/, "nickname"],
];

/** "Spouse" for one value, "Spouses" for a list of several. */
function plural(singular: string, pluralLabel: string, value: unknown): string {
  return Array.isArray(value) && value.filter(hasValue).length > 1 ? pluralLabel : singular;
}

/** Join several optional values into one multi-line value. */
function lines(...values: unknown[]): string | undefined {
  const kept = values.filter(hasValue).map(String);
  return kept.length ? kept.join("\n") : undefined;
}

/** "Serving with" rows Wikipedia shows inside an office block, in display order. */
const SERVED_WITH: [string, string][] = [
  ["monarch", "Monarch"],
  ["president", "President"],
  ["prime_minister", "Prime Minister"],
  ["chancellor", "Chancellor"],
  ["vice_president", "Vice President"],
  ["deputy", "Deputy"],
  ["governor", "Governor"],
  ["regent", "Regent"],
];

const OFFICE_FIELDS = [
  "office",
  "order",
  "term_label",
  "term_start",
  "term_end",
  "term",
  "coronation",
  "office_note",
  "predecessor",
  "successor",
  ...SERVED_WITH.map(([key]) => key),
];

/** Office blocks from numbered fields: office1, term_start1, predecessor1, … */
function structuredOffices(r: Rows): number {
  // A group without an office name (e.g. a lone "Predecessor:" key) still shows its
  // rows, just without a blue office bar, so nothing written on the page is lost.
  const offices = numberedGroups(r.fields, OFFICE_FIELDS);
  for (const o of offices) {
    if (hasValue(o.office)) {
      r.header(
        <>
          {hasValue(o.order) ? <>{renderInline(o.order, r.ctx)} </> : null}
          {renderInline(o.office, r.ctx)}
        </>,
        "infobox-header infobox-office",
      );
    }
    const label = hasValue(o.term_label) ? String(o.term_label) : null;
    let termText: string | null = null;
    let termLabel = label ?? "In office";
    if (hasValue(o.term)) termText = String(o.term);
    else if (hasValue(o.term_start) && hasValue(o.term_end)) termText = `${String(o.term_start)} – ${String(o.term_end)}`;
    else if (hasValue(o.term_start)) {
      termText = String(o.term_start);
      termLabel = label ?? "Assumed office";
    }
    if (termText) {
      r.full(
        <>
          <b>{termLabel}</b>
          <div>{renderInline(termText, r.ctx)}</div>
        </>,
        "infobox-full infobox-term",
      );
    }
    r.row("Coronation", o.coronation);
    for (const [key, text] of SERVED_WITH) r.row(text, o[key]);
    r.row("Preceded by", o.predecessor);
    r.row("Succeeded by", o.successor);
    r.fullValue(o.office_note, "infobox-full infobox-note");
  }
  return offices.filter((o) => hasValue(o.office)).length;
}

/**
 * Office blocks from a Chronicler-style list, where each item looks like:
 *   **[[Chancellor of Vicus]]**
 *   * 1819 - 1821
 *   * Preceded by: [[Toivan Slavari o-Sanctis]]
 * The first line becomes the header, "Label: value" lines become rows, lines with
 * a year become the term, and anything else becomes a small italic note.
 */
function freeformOffices(r: Rows, list: unknown): number {
  const items = (Array.isArray(list) ? list : [list]).filter(hasValue);
  for (const item of items) {
    const parsed = parseLines(item);
    if (parsed.length === 0) continue;
    const [head, ...rest] = parsed;
    r.header(renderInline(head!.text, r.ctx), "infobox-header infobox-office");

    type Pending = { label: string; parts: string[] };
    // A label may itself be a link, e.g. "[[King of Vicus|King]]: [[Avab II]]".
    let pending: Pending | null = null;
    const flush = () => {
      if (pending) r.row(renderInline(pending.label, r.ctx), pending.parts.join("\n"), { allowEmpty: true });
      pending = null;
    };
    for (const line of rest) {
      const labelled = /^((?:\[\[[^\]]*\]\]|[^:[\]*])+?):\s*(.*)$/.exec(line.text);
      if (labelled && labelled[1]!.replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1").length <= 40 && line.level <= 1) {
        flush();
        pending = { label: labelled[1]!.trim(), parts: labelled[2] ? [labelled[2]] : [] };
      } else if (pending && line.level >= 2) {
        pending.parts.push(line.text);
      } else {
        flush();
        if (/\d/.test(line.text) && !/[[*]/.test(line.text.replace(/\[\[[^\]]*\]\]/g, ""))) {
          r.full(renderInline(line.text, r.ctx), "infobox-full infobox-term");
        } else {
          r.full(renderInline(line.text, r.ctx), "infobox-full infobox-note");
        }
      }
    }
    flush();
  }
  return items.length;
}

export function renderPerson(raw: Fields, ctx: RenderCtx, fallbackTitle: string): VNode | null {
  const fields = applyAliases(raw, ALIASES);
  const r = new Rows(fields, ctx);
  const name = first(fields, "name", "title") ?? fallbackTitle;

  mainImage(r, `Portrait of ${String(name)}`);

  const officeCount =
    structuredOffices(r) + freeformOffices(r, fields.offices_held) + freeformOffices(r, fields.titles_held);

  const personal = () => {
    r.row("Born", first(fields, "born") ?? lines(fields.birth_name, fields.birth_date, fields.birth_place));
    r.row("Died", first(fields, "died") ?? lines(fields.death_date, fields.death_place));
    r.field("cause_of_death", "Cause of death");
    r.field("resting_place", "Resting place");
    r.field("nationality", "Nationality");
    r.field("citizenship", "Citizenship");
    r.field("party", "Political party");
    r.field("other_party", "Other political affiliations");
    r.row(plural("Consort", "Consorts", fields.consort), fields.consort);
    r.row(plural("Spouse", "Spouses", fields.spouse), fields.spouse);
    r.field("partner", "Partner");
    r.field("children", "Children");
    r.field("issue", "Issue");
    r.row(plural("Parent", "Parents", fields.parents), fields.parents);
    r.field("father", "Father");
    r.field("mother", "Mother");
    r.field("relatives", "Relatives");
    r.field("family", "Family");
    r.field("house", "House");
    r.field("dynasty", "Dynasty");
    r.field("religion", "Religion");
    r.field("residence", "Residence");
    r.field("education", "Education");
    r.field("alma_mater", "Alma mater");
    r.field("occupation", "Occupation");
    r.field("profession", "Profession");
    r.field("known_for", "Known for");
    r.row(plural("Nickname", "Nicknames", fields.nickname), fields.nickname);
    const signature = image(fields.signature, `Signature of ${String(name)}`, ctx, "infobox-signature");
    if (signature) {
      r.full(
        <>
          <div class="infobox-signature-label">Signature</div>
          {signature}
        </>,
        "infobox-full infobox-images",
      );
    }
  };
  // Wikipedia only labels this section when office blocks sit above it.
  if (officeCount > 0) r.section("Personal details", personal);
  else personal();

  r.section("Military service", () => {
    r.field("allegiance", "Allegiance");
    r.row("Branch/service", fields.branch);
    r.field("years_of_service", "Years of service");
    r.field("rank", "Rank");
    r.field("unit", "Unit");
    r.field("commands", "Commands");
    r.row("Battles/wars", fields.battles);
    r.field("awards", "Awards");
  });

  r.extras();

  return box("person", name, ctx, r.rows, {
    above: fields.honorific_prefix,
    below: [fields.honorific_suffix, fields.native_name, fields.subtitle],
  });
}

/** Keys this infobox type understands; anything else is shown as an extra row. */
export const knownPerson = /^(?:name|honorific_prefix|honorific_suffix|native_name|subtitle|image|image_caption|caption|(?:office|order|term_label|term_start|term_end|term|coronation|office_note|predecessor|successor|monarch|president|prime_minister|chancellor|vice_president|deputy|governor|regent)\d*|offices_held|titles_held|born|birth_name|birth_date|birth_place|died|death_date|death_place|cause_of_death|resting_place|burial|nationality|citizenship|party|other_party|consorts?|spouses?|partner|children|issue|parents|father|mother|relatives|family|house|dynasty|religion|residence|education|alma_mater|occupation|profession|known_for|nicknames?|signature|allegiance|branch|service|service_years|serviceyears|years_of_service|rank|unit|commands|battles|combat|conflicts|wars|awards|medals)$/;
