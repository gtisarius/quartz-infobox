import type { ComponentChildren, VNode } from "preact";
import {
  type Fields,
  type RenderCtx,
  hasValue,
  plainText,
  renderInline,
  renderValue,
  resolveAsset,
} from "./render";

/**
 * Builds the rows of an infobox table. Every helper skips itself when its value is
 * empty, so missing fields never leave blank rows.
 */
export class Rows {
  readonly rows: VNode[] = [];
  private n = 0;
  constructor(
    readonly fields: Fields,
    readonly ctx: RenderCtx,
  ) {}

  key(): string {
    return `r${this.n++}`;
  }

  /** A labelled row: label on the left, value on the right. */
  row(
    label: ComponentChildren,
    value: unknown,
    opts: { sub?: boolean; allowEmpty?: boolean } = {},
  ): boolean {
    if (!hasValue(value) && !opts.allowEmpty) return false;
    // Drop a first line that just repeats the label (old pages wrote "**Preceded by**<br>…").
    if (typeof label === "string" && typeof value === "string") {
      const lines = value.split(/<br\s*\/?>|\n/i);
      if (lines.length > 1 && plainText(lines[0]) === label.toLowerCase()) {
        value = lines.slice(1).join("\n");
      }
    }
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

  /** Rows for fields this infobox type doesn't know, labelled with your original key. */
  extras(): void {
    for (const extra of this.ctx.extras ?? []) this.row(extra.label, extra.value);
  }

  /** Row for a single frontmatter key. */
  field(key: string, label: string, opts: { sub?: boolean } = {}): boolean {
    return this.row(label, this.fields[key], opts);
  }

  /** A full-width blue section bar. */
  header(text: ComponentChildren, className = "infobox-header"): void {
    this.rows.push(
      <tr key={this.key()}>
        <th colSpan={2} class={className}>
          {text}
        </th>
      </tr>,
    );
  }

  /** A full-width row (images, notes, centered lines). */
  full(content: ComponentChildren, className = "infobox-full"): void {
    this.rows.push(
      <tr key={this.key()}>
        <td colSpan={2} class={className}>
          {content}
        </td>
      </tr>,
    );
  }

  /** Full-width centered value, skipped when empty. */
  fullValue(value: unknown, className = "infobox-full"): boolean {
    if (!hasValue(value)) return false;
    this.full(renderValue(value, this.ctx), className);
    return true;
  }

  /** Adds a header only if the rows built inside produce something. */
  section(title: ComponentChildren, build: () => void, className?: string): boolean {
    const headerAt = this.rows.length;
    this.header(title, className);
    const before = this.rows.length;
    build();
    if (this.rows.length === before) {
      this.rows.splice(headerAt, 1);
      return false;
    }
    return true;
  }

  /**
   * Side-by-side columns spanning the full width (belligerents, commanders, candidates).
   * Skipped when every cell is empty.
   */
  columns(cells: unknown[]): boolean {
    if (!cells.some(hasValue)) return false;
    const width = `${(100 / cells.length).toFixed(3)}%`;
    this.full(
      <table class="infobox-columns">
        <tbody>
          <tr>
            {cells.map((cell, i) => (
              <td key={i} style={{ width }}>
                {hasValue(cell) ? renderValue(cell, this.ctx) : null}
              </td>
            ))}
          </tr>
        </tbody>
      </table>,
      "infobox-full infobox-columns-cell",
    );
    return true;
  }

  /**
   * A labelled grid: one label column, then one column per item (election candidates).
   * `head` cells sit on top without a label; rows whose values are all empty are dropped.
   */
  grid(
    count: number,
    head: ComponentChildren[] | null,
    gridRows: { label: ComponentChildren; values: unknown[] }[],
  ): boolean {
    const kept = gridRows.filter((gr) => gr.values.some(hasValue));
    if (!head && kept.length === 0) return false;
    const width = `${(100 / count).toFixed(3)}%`;
    this.full(
      <table class="infobox-grid">
        <tbody>
          {head ? (
            <tr>
              <th />
              {head.map((cell, i) => (
                <td key={i} class="infobox-grid-head" style={{ width }}>
                  {cell}
                </td>
              ))}
            </tr>
          ) : null}
          {kept.map((gr, j) => (
            <tr key={j}>
              <th scope="row">{gr.label}</th>
              {gr.values.map((value, i) => (
                <td key={i}>{hasValue(value) ? renderValue(value, this.ctx) : null}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>,
      "infobox-full infobox-columns-cell",
    );
    return true;
  }
}

/** An <img> for a path relative to the content folder, or null when there is none. */
export function image(path: unknown, alt: string, ctx: RenderCtx, className: string): VNode | null {
  if (!hasValue(path)) return null;
  const src = resolveAsset(String(Array.isArray(path) ? path[0] : path), ctx);
  return <img src={src} alt={alt} class={className} loading="lazy" />;
}

/** The main picture at the top of a box, with its caption. */
export function mainImage(r: Rows, alt: string, imageKey = "image", captionKey = "image_caption"): void {
  const img = image(r.fields[imageKey], alt, r.ctx, "infobox-image");
  if (!img) return;
  const caption = r.fields[captionKey] ?? r.fields.caption;
  r.full(
    <figure>
      {img}
      {hasValue(caption) ? <figcaption>{renderInline(caption, r.ctx)}</figcaption> : null}
    </figure>,
    "infobox-full infobox-images",
  );
}

/** The <table> shell shared by every infobox type. */
export function box(
  type: string,
  title: unknown,
  ctx: RenderCtx,
  rows: VNode[],
  extras: { above?: unknown; below?: unknown[] } = {},
): VNode {
  return (
    <table class={`infobox infobox-${type}`}>
      <caption class="infobox-title">
        {hasValue(extras.above) ? <div class="infobox-above">{renderValue(extras.above, ctx)}</div> : null}
        {renderInline(title, ctx)}
        {(extras.below ?? []).filter(hasValue).map((line, i) => (
          <div key={i} class="infobox-native-name">
            {renderValue(line, ctx)}
          </div>
        ))}
      </caption>
      <tbody>{rows}</tbody>
    </table>
  );
}

/** First non-empty value among several keys. */
export function first(fields: Fields, ...keys: string[]): unknown {
  for (const key of keys) if (hasValue(fields[key])) return fields[key];
  return undefined;
}
