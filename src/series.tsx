import type { FullSlug } from "@quartz-community/types";
import type { ComponentChildren, VNode } from "preact";
import {
  type RenderCtx,
  findSlug,
  hasValue,
  linkTargets,
  normalizeKeys,
  parseLines,
  renderInline,
  resolveWikilink,
} from "./render";
import { image } from "./rows";

/**
 * A Wikipedia-style "Part of a series on …" sidebar.
 *
 * A series is defined once, on its own page, with `infobox: series`:
 *
 *   infobox: series
 *   name: Avabism              # what other pages write in `series:`
 *   main: "[[Avabism]]"        # optional; the big title links here
 *   image: img/symbols/avab.png
 *   color: "#b8860b"           # optional accent colour
 *   Denominations: ["[[Zascaic Temple|Zascaism]]", "[[Possessionism]]"]
 *   History: ["[[Avab]]", "[[Second Fall of Morev]]"]
 *   footer: ["[[Avabism portal]]"]
 *
 * Every other key becomes a collapsible section, in the order written. A page joins
 * with `series: Avabism` (or a list, for several). The section containing the current
 * page starts open; the rest start collapsed with [show].
 */

/** Keys on a series page that configure the box rather than being sections. */
const SERIES_KEYS =
  /^(?:infobox|name|main|image|image_caption|caption|color|colour|footer|above|collapsible|title|tags|aliases|layout|draft|publish|permalink|description|date|created|modified|lastmod|updated|published|cssclass|cssclasses|enabletoc|comments|lang|socialimage|socialdescription|password|unlisted|series)$/;

const COLOR = /^(?:#[0-9a-f]{3,8}|[a-z]{3,20}|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%deg]+\))$/i;

type FileData = { slug?: unknown; frontmatter?: unknown };

export interface SeriesDef {
  slug: FullSlug;
  /** Frontmatter with original keys (section titles keep their spelling). */
  raw: Record<string, unknown>;
}

/** Strip [[…]] and an alias so `series: "[[Avabism (series)|Avabism]]"` also works. */
function bareName(value: unknown): string {
  const text = String(value).trim();
  const link = /^\[\[([^\]|#]+)/.exec(text);
  return (link ? link[1]! : text).trim().toLowerCase();
}

/** The names a series page answers to: its `name`, its title, and its file name. */
function namesOf(def: SeriesDef): string[] {
  const fields = normalizeKeys(def.raw);
  const fileName = def.slug.split("/").at(-1)!.replace(/-/g, " ");
  return [fields.name, fields.title, fileName]
    .filter(hasValue)
    .map(bareName)
    .flatMap((n) => [n, n.replace(/\s*\(series\)$/, "")]);
}

/** All pages that define a series (`infobox: series`). */
export function seriesPages(allFiles: FileData[], typeKey: string): SeriesDef[] {
  return allFiles
    .filter((f) => {
      const fields = normalizeKeys(f.frontmatter as Record<string, unknown> | undefined);
      return typeof f.slug === "string" && String(fields[typeKey] ?? "").trim().toLowerCase() === "series";
    })
    .map((f) => ({ slug: f.slug as FullSlug, raw: (f.frontmatter ?? {}) as Record<string, unknown> }));
}

/** Find the series a page asked for by name. */
export function findSeries(name: unknown, defs: SeriesDef[]): SeriesDef | undefined {
  const wanted = bareName(name).replace(/\s*\(series\)$/, "");
  return defs.find((def) => namesOf(def).includes(wanted));
}

/** Split a section's items into runs of links, broken up by **bold** sub-headings. */
function groups(items: string[]): { heading?: string; items: string[] }[] {
  const out: { heading?: string; items: string[] }[] = [{ items: [] }];
  for (const item of items) {
    if (/^\*\*[^*]+\*\*$/.test(item.trim())) out.push({ heading: item.trim(), items: [] });
    else out.at(-1)!.items.push(item.replace(/^\s*[*-]\s+/, ""));
  }
  return out.filter((g) => g.heading || g.items.length);
}

function itemsOf(value: unknown): string[] {
  const list = Array.isArray(value) ? value : [value];
  return list.filter(hasValue).flatMap((v) =>
    typeof v === "string" ? parseLines(v).map((l) => (l.level ? `* ${l.text}` : l.text)) : [String(v)],
  );
}

function sectionBody(items: string[], ctx: RenderCtx): ComponentChildren {
  return groups(items).map((g, i) => (
    <div key={i} class="sidebar-group">
      {g.heading ? <div class="sidebar-subheading">{renderInline(g.heading, ctx)}</div> : null}
      {g.items.length ? (
        <ul class="sidebar-hlist">
          {g.items.map((item, j) => (
            <li key={j}>{renderInline(item, ctx)}</li>
          ))}
        </ul>
      ) : null}
    </div>
  ));
}

export function renderSeries(def: SeriesDef, pageCtx: RenderCtx): VNode | null {
  const ctx: RenderCtx = { ...pageCtx, extras: [] };
  const fields = normalizeKeys(def.raw);
  const name = hasValue(fields.name) ? String(fields.name) : String(fields.title ?? namesOf(def)[0] ?? "");

  const sections = Object.entries(def.raw).filter(
    ([key, value]) => !SERIES_KEYS.test(key.trim().toLowerCase().replace(/[\s-]+/g, "_")) && hasValue(value),
  );
  const collapsible = fields.collapsible !== false && sections.length > 1;

  // Title: links to `main`, or to the page named like the series if one exists.
  const mainTarget = hasValue(fields.main) ? linkTargets(fields.main)[0] ?? String(fields.main) : name;
  // The series page itself is left out here, so "Avabism" finds the Avabism article,
  // not "series/Avabism".
  const main = resolveWikilink(mainTarget, { ...ctx, allSlugs: ctx.allSlugs.filter((slug) => slug !== def.slug) });
  const titleText = hasValue(fields.main) && !linkTargets(fields.main).length ? String(fields.main) : name;
  const title =
    main.exists && !main.self ? (
      <a href={main.href} class="internal">
        {titleText}
      </a>
    ) : (
      titleText
    );

  const accent = [fields.color, fields.colour].find((c) => typeof c === "string" && COLOR.test(c.trim())) as
    | string
    | undefined;

  const pic = image(fields.image, String(name), ctx, "sidebar-image");
  const view = def.slug !== ctx.src ? resolveWikilink(def.slug, ctx) : null;

  return (
    <aside class="wiki-sidebar" style={accent ? `--sb-accent:${accent.trim()}` : undefined}>
      <div class="sidebar-above">{hasValue(fields.above) ? renderInline(fields.above, ctx) : "Part of a series on"}</div>
      <div class="sidebar-title">{title}</div>
      {pic ? (
        <figure class="sidebar-figure">
          {pic}
          {hasValue(fields.image_caption ?? fields.caption) ? (
            <figcaption>{renderInline(fields.image_caption ?? fields.caption, ctx)}</figcaption>
          ) : null}
        </figure>
      ) : null}
      {sections.map(([key, value], i) => {
        const items = itemsOf(value);
        const heading = renderInline(key, ctx);
        // Open the section that links to the page you're on (or whose heading does).
        const here = [key, ...items].some((text) =>
          linkTargets(text).some((target) => findSlug(target, ctx) === ctx.src),
        );
        if (!collapsible) {
          return (
            <div key={i} class="sidebar-section">
              <div class="sidebar-heading">{heading}</div>
              <div class="sidebar-content">{sectionBody(items, ctx)}</div>
            </div>
          );
        }
        return (
          <details key={i} class="sidebar-section" open={here}>
            <summary class="sidebar-heading">
              <span class="sidebar-heading-text">{heading}</span>
              <span class="sidebar-toggle">
                [<span class="sidebar-show">show</span>
                <span class="sidebar-hide">hide</span>]
              </span>
            </summary>
            <div class="sidebar-content">{sectionBody(items, ctx)}</div>
          </details>
        );
      })}
      {hasValue(fields.footer) ? (
        <div class="sidebar-footer">
          {itemsOf(fields.footer).map((item, i) => (
            <div key={i}>{renderInline(item, ctx)}</div>
          ))}
        </div>
      ) : null}
      {view?.exists ? (
        <div class="sidebar-navbar">
          <a href={view.href} class="internal" title={`View the ${name} series page`}>
            view
          </a>
        </div>
      ) : null}
    </aside>
  );
}
