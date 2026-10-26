import type { VNode } from "preact";
import { type Fields, type RenderCtx, hasValue, numberedGroups, renderInline } from "./render";
import { Rows, box, first, mainImage } from "./rows";

/**
 * Rows in Wikipedia's "Infobox religion" order. Each entry is the accepted keys
 * (first one found wins) and the label. Your Chronicler keys (Scripture, Theology,
 * Region, Languages, Territory, Founder, Origin, Separated from, Separations,
 * Denominations, Classification) are all here under their own names.
 */
const ROWS: [string[], string][] = [
  [["abbreviation"], "Abbreviation"],
  [["type"], "Type"],
  [["classification", "main_classification"], "Classification"],
  [["orientation"], "Orientation"],
  [["scripture", "scriptures"], "Scripture"],
  [["theology"], "Theology"],
  [["polity"], "Polity"],
  [["governance"], "Governance"],
  [["structure"], "Structure"],
];

const ROWS_AFTER_LEADERS: [string[], string][] = [
  [["fellowships"], "Fellowships"],
  [["associations"], "Associations"],
  [["region", "regions"], "Region"],
  [["language"], "Language"],
  [["languages"], "Languages"],
  [["liturgy"], "Liturgy"],
  [["headquarters"], "Headquarters"],
  [["territory"], "Territory"],
  [["possessions"], "Possessions"],
  [["founder"], "Founder"],
  [["founders"], "Founders"],
];

const ROWS_AFTER_ORIGIN: [string[], string][] = [
  [["independence"], "Independence"],
  [["recognition"], "Recognition"],
  [["branched_from"], "Branched from"],
  [["separated_from"], "Separated from"],
  [["separated_or_inspired_from"], "Separated or inspired from"],
  [["inspired_by"], "Inspired by"],
  [["merger"], "Merger of"],
  [["absorbed"], "Absorbed"],
  [["separations"], "Separations"],
  [["merged_into"], "Merged into"],
  [["defunct"], "Defunct"],
  [["denominations"], "Denominations"],
  [["branches"], "Branches"],
  [["schools"], "Schools"],
  [["congregations"], "Congregations"],
  [["members"], "Members"],
  [["adherents"], "Adherents"],
  [["clergy", "ministers"], "Clergy"],
  [["other_name", "other_names"], "Other name(s)"],
];

function rows(r: Rows, specs: [string[], string][]): void {
  for (const [keys, label] of specs) r.row(label, first(r.fields, ...keys));
}

export function renderReligion(fields: Fields, ctx: RenderCtx, fallbackTitle: string): VNode | null {
  const r = new Rows(fields, ctx);
  const title = first(fields, "name", "title") ?? fallbackTitle;

  mainImage(r, String(title));
  rows(r, ROWS);

  // leader_title1 / leader_name1, leader_title2 / … (no upper limit)
  for (const leader of numberedGroups(fields, ["leader_title", "leader_name"])) {
    r.row(hasValue(leader.leader_title) ? renderInline(leader.leader_title, ctx) : "Leader", leader.leader_name);
  }

  rows(r, ROWS_AFTER_LEADERS);

  // "Origin" is one row: either written directly, or built from founded_date + founded_place.
  const founded = [fields.founded_date ?? fields.founded, fields.founded_place].filter(hasValue).map(String);
  r.row("Origin", hasValue(fields.origin) ? fields.origin : founded.length ? founded.join("\n") : undefined);

  rows(r, ROWS_AFTER_ORIGIN);
  r.extras();

  // No filled-in fields (e.g. a stub with `Classification: ""`): no box at all.
  if (r.rows.length === 0) return null;
  return box("religion", title, ctx, r.rows, { below: [fields.native_name, fields.subtitle] });
}

/** Keys this infobox type understands; anything else is shown as an extra row. */
export const knownReligion = new RegExp(
  "^(?:" +
    [
      "name",
      "native_name",
      "subtitle",
      "image",
      "image_caption",
      "caption",
      "origin",
      "founded",
      "founded_date",
      "founded_place",
      "leader_title\\d*",
      "leader_name\\d*",
      ...[...ROWS, ...ROWS_AFTER_LEADERS, ...ROWS_AFTER_ORIGIN].flatMap(([keys]) => keys),
    ].join("|") +
    ")$",
);
