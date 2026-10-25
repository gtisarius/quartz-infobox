import type { VNode } from "preact";
import { type Fields, type RenderCtx, applyAliases, hasValue, plainText, renderInline } from "./render";
import { Rows, box, first, mainImage } from "./rows";

/** Chronicler-style keys → Wikipedia-style keys. */
const ALIASES: [RegExp, string][] = [
  [/^(?:combatants?|belligerents?)_?(\d+)$/, "combatant$1"],
  [/^commanders?(?:_and_leaders)?_?(\d+)$/, "commander$1"],
  [/^units?(?:_involved)?_?(\d+)$/, "units$1"],
  [/^strengths?_?(\d+)$/, "strength$1"],
  [/^casualt(?:y|ies)(?:_and_losses)?_?(\d+)$/, "casualties$1"],
  [/^(?:beginning|began|start|start_date)$/, "date_start"],
  [/^(?:end|ended|end_date)$/, "date_end"],
  [/^location$/, "place"],
  [/^outcome$/, "result"],
  [/^territorial_changes$/, "territory"],
  [/^battles$/, "major_battles"],
  [/^partof$/, "part_of"],
];

/** The per-side fields, each shown as a row of columns under its own header. */
const SIDE_SECTIONS: [string, string][] = [
  ["combatant", "Belligerents"],
  ["commander", "Commanders and leaders"],
  ["units", "Units involved"],
  ["strength", "Strength"],
  ["casualties", "Casualties and losses"],
];

/** Highest side number used by any per-side field (no upper limit). */
function sideCount(fields: Fields): number {
  let max = 0;
  for (const [key, value] of Object.entries(fields)) {
    if (!hasValue(value)) continue;
    for (const [base] of SIDE_SECTIONS) {
      const m = new RegExp(`^${base}(\\d+)$`).exec(key);
      if (m) max = Math.max(max, Number(m[1]));
    }
  }
  return max;
}

export function renderConflict(raw: Fields, ctx: RenderCtx, fallbackTitle: string): VNode | null {
  const fields = applyAliases(raw, ALIASES);

  // A Chronicler subtitle is either "Part of the …" or an alternative name.
  let partOf = fields.part_of;
  let otherNames = fields.other_names;
  if (hasValue(fields.subtitle)) {
    if (/^part of\b/i.test(plainText(fields.subtitle))) partOf = hasValue(partOf) ? partOf : fields.subtitle;
    else otherNames = hasValue(otherNames) ? otherNames : fields.subtitle;
  }

  const r = new Rows(fields, ctx);
  const title = first(fields, "conflict", "title") ?? fallbackTitle;

  if (hasValue(partOf)) {
    const text = String(partOf);
    r.full(
      /^part of\b/i.test(plainText(text)) ? renderInline(text, ctx) : <>Part of {renderInline(text, ctx)}</>,
      "infobox-full infobox-partof",
    );
  }

  mainImage(r, String(title));

  // Date: one combined row when both ends are short, otherwise "Began" and "Ended".
  if (hasValue(fields.date)) r.field("date", "Date");
  else {
    const start = fields.date_start;
    const end = fields.date_end;
    const short = (v: unknown) => hasValue(v) && !/[,[\n]/.test(String(v));
    if (short(start) && short(end)) r.row("Date", `${String(start)} – ${String(end)}`);
    else {
      r.row("Began", start);
      r.row("Ended", end);
    }
  }
  r.field("place", "Location");
  r.field("status", "Status");
  r.field("result", "Result");
  r.field("territory", "Territorial changes");
  r.field("major_battles", "Major battles");

  const sides = sideCount(fields);
  for (const [base, heading] of SIDE_SECTIONS) {
    const cells = Array.from({ length: sides }, (_, i) => fields[`${base}${i + 1}`]);
    r.section(heading, () => {
      r.columns(cells);
    });
  }
  r.fullValue(fields.casualties_note, "infobox-full infobox-note");
  r.fullValue(fields.notes, "infobox-full infobox-note");

  r.extras();

  return box("conflict", title, ctx, r.rows, { below: [otherNames] });
}

/** Keys this infobox type understands; anything else is shown as an extra row. */
export const knownConflict = /^(?:conflict|part_of|partof|other_names|subtitle|image|image_caption|caption|date|date_start|date_end|beginning|began|start|start_date|end|ended|end_date|place|location|status|result|outcome|territory|territorial_changes|major_battles|battles|(?:combatants?|belligerents?|commanders?(?:_and_leaders)?|units?(?:_involved)?|strengths?|casualt(?:y|ies)(?:_and_losses)?)_?\d+|casualties_note|notes)$/;
