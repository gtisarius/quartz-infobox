import type { VNode } from "preact";
import { type Fields, type RenderCtx, hasValue, renderInline } from "./render";
import { Rows, box, first, mainImage } from "./rows";

/**
 * Wikipedia has no single "Infobox ideology" (it uses series sidebars), so this
 * follows the fields its political-party and philosophy boxes share. Each entry is
 * the accepted keys (first one found wins) and the label.
 */
const SECTIONS: [string, [string[], string][]][] = [
  [
    "",
    [
      [["other_names", "other_name", "also_known_as"], "Other names"],
      [["parent", "parent_ideology", "part_of"], "Parent ideology"],
      [["founder", "founders"], "Founders"],
      [["founded", "founded_date"], "Founded"],
      [["origin", "founded_place"], "Origin"],
      [["key_figures", "proponents", "notable_proponents"], "Notable proponents"],
    ],
  ],
  [
    "Beliefs",
    [
      [["key_ideas", "tenets", "core_tenets", "principles"], "Key ideas"],
      [["political_position", "position", "spectrum"], "Political position"],
      [["economics", "economic_ideology"], "Economics"],
      [["religion"], "Religion"],
      [["variants", "branches", "factions"], "Variants"],
    ],
  ],
  [
    "Relationships",
    [
      [["influenced_by", "inspired_by"], "Influenced by"],
      [["influenced"], "Influenced"],
      [["related", "related_ideologies"], "Related ideologies"],
      [["opposed_to", "opposes", "opposition"], "Opposed to"],
      [["parties", "associated_parties"], "Associated parties"],
      [["organizations", "organisations"], "Organizations"],
    ],
  ],
];

const SYMBOLS: [string[], string][] = [
  [["symbol", "symbols"], "Symbol"],
  [["slogan", "motto"], "Slogan"],
  [["anthem"], "Anthem"],
];

const HEX = /^#[0-9a-f]{3,8}$/i;
const NAMED = /^[a-z]{3,20}$/i;

/**
 * Colour swatches. Each item is "#cc0000", "Red #cc0000", or a plain colour name ("Red").
 * Anything that isn't a valid colour is shown as plain text.
 */
function swatches(value: unknown, ctx: RenderCtx) {
  const items = (Array.isArray(value) ? value : String(value).split(/,\s*/)).filter(hasValue).map(String);
  return (
    <span class="infobox-swatches">
      {items.map((item, i) => {
        const parts = item.trim().split(/\s+/);
        const hex = parts.find((p) => HEX.test(p));
        const label = parts.filter((p) => p !== hex).join(" ");
        const colour = hex ?? (NAMED.test(label) ? label : undefined);
        return (
          <span key={i} class="infobox-swatch-item">
            {colour ? <span class="infobox-swatch" style={`background:${colour}`} title={item} /> : null}
            {label ? renderInline(label, ctx) : null}
          </span>
        );
      })}
    </span>
  );
}

export function renderIdeology(fields: Fields, ctx: RenderCtx, fallbackTitle: string): VNode | null {
  const r = new Rows(fields, ctx);
  const title = first(fields, "name", "title") ?? fallbackTitle;

  mainImage(r, String(title));

  for (const [heading, specs] of SECTIONS) {
    const build = () => {
      for (const [keys, label] of specs) r.row(label, first(fields, ...keys));
    };
    if (heading) r.section(heading, build);
    else build();
  }

  r.section("Symbols", () => {
    const colours = first(fields, "colors", "colours", "color", "colour");
    if (hasValue(colours)) {
      r.rows.push(
        <tr key={r.key()}>
          <th scope="row" class="infobox-label">
            Colors
          </th>
          <td class="infobox-data">{swatches(colours, ctx)}</td>
        </tr>,
      );
    }
    for (const [keys, label] of SYMBOLS) r.row(label, first(fields, ...keys));
  });

  r.extras();

  // No filled-in fields (e.g. a stub with `Classification: ""`): no box at all.
  if (r.rows.length === 0) return null;
  return box("ideology", title, ctx, r.rows, { below: [fields.native_name, fields.subtitle] });
}

/** Keys this infobox type understands; anything else is shown as an extra row. */
export const knownIdeology = new RegExp(
  "^(?:" +
    [
      "name",
      "native_name",
      "subtitle",
      "image",
      "image_caption",
      "caption",
      "colors",
      "colours",
      "color",
      "colour",
      ...SECTIONS.flatMap(([, specs]) => specs.flatMap(([keys]) => keys)),
      ...SYMBOLS.flatMap(([keys]) => keys),
    ].join("|") +
    ")$",
);
