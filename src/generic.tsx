import type { VNode } from "preact";
import { type Fields, type RenderCtx, hasValue } from "./render";
import { Rows, box, first, mainImage } from "./rows";

/**
 * A plain infobox for page types without their own layout yet (religions, titles,
 * ideologies…): the title, an optional image, then every field as a row, labelled
 * exactly as written and in the order written.
 */
export function renderGeneric(fields: Fields, ctx: RenderCtx, fallbackTitle: string): VNode | null {
  const r = new Rows(fields, ctx);
  const title = first(fields, "name", "title") ?? fallbackTitle;

  mainImage(r, String(title));
  r.extras();

  // Nothing to show (e.g. a stub with only empty fields): no box at all.
  if (r.rows.length === 0) return null;
  return box("generic", title, ctx, r.rows, {
    below: hasValue(fields.subtitle) ? [fields.subtitle] : [],
  });
}

/** Keys the generic box uses itself; every other field becomes a row. */
export const knownGeneric = /^(?:name|subtitle|image|image_caption|caption)$/;
