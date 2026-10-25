import type { ComponentChildren } from "preact";
import type { FilePath, FullSlug } from "@quartz-community/types";
import { joinSegments, pathToRoot, resolveRelative, slugifyFilePath } from "@quartz-community/utils";

/** Context needed to turn [[wikilinks]] and image paths into working URLs. */
export interface RenderCtx {
  /** Slug of the page the infobox is on, e.g. "nations/vicus". */
  src: FullSlug;
  /** Slugs of every page on the site, used to resolve links and spot missing pages. */
  allSlugs: FullSlug[];
}

/** Frontmatter with keys normalized: lowercase, spaces/hyphens turned into underscores. */
export type Fields = Record<string, unknown>;

export function normalizeKeys(frontmatter: Record<string, unknown> | undefined): Fields {
  const out: Fields = {};
  if (!frontmatter) return out;
  for (const [key, value] of Object.entries(frontmatter)) {
    out[key.trim().toLowerCase().replace(/[\s-]+/g, "_")] = value;
  }
  return out;
}

/** True when a value has something worth showing. */
export function hasValue(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(hasValue);
  return true;
}

/**
 * Collect numbered parameters the way Wikipedia infoboxes do.
 * For bases ["leader_title", "leader_name"], this finds leader_title / leader_title1 /
 * leader_title2 / ... with no upper limit. An unnumbered key counts as number 1.
 * Returns one record per number, in numeric order, skipping numbers where every field is empty.
 */
export function numberedGroups(fields: Fields, bases: string[]): Record<string, unknown>[] {
  const numbers = new Set<number>();
  for (const key of Object.keys(fields)) {
    for (const base of bases) {
      if (key === base) numbers.add(1);
      else if (key.startsWith(base)) {
        const rest = key.slice(base.length);
        if (/^\d+$/.test(rest)) numbers.add(Number(rest));
      }
    }
  }
  return [...numbers]
    .sort((a, b) => a - b)
    .map((n) => {
      const group: Record<string, unknown> = {};
      for (const base of bases) {
        const numbered = fields[`${base}${n}`];
        group[base] = hasValue(numbered) ? numbered : n === 1 ? fields[base] : undefined;
      }
      return group;
    })
    .filter((group) => Object.values(group).some(hasValue));
}

const WIKILINK = /\[\[([^[\]]+?)\]\]/g;

/** Find the page a wikilink points at, using Quartz's "shortest path" rule. */
export function resolveWikilink(
  target: string,
  ctx: RenderCtx,
): { href: string; exists: boolean } {
  const hashAt = target.indexOf("#");
  const page = (hashAt === -1 ? target : target.slice(0, hashAt)).trim();
  const heading = hashAt === -1 ? "" : target.slice(hashAt + 1).trim();
  const anchor = heading
    ? "#" +
      heading
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .trim()
        .replace(/\s+/g, "-")
    : "";

  if (page === "") return { href: anchor, exists: true };

  const slug = slugifyFilePath(`${page}.md` as FilePath);
  const matches = ctx.allSlugs.filter((candidate) =>
    slug.includes("/")
      ? candidate === slug || candidate.endsWith(`/${slug}`)
      : candidate.split("/").at(-1) === slug,
  );

  if (matches.length === 1) {
    return { href: resolveRelative(ctx.src, matches[0]!) + anchor, exists: true };
  }
  return {
    href: joinSegments(pathToRoot(ctx.src), slug) + anchor,
    exists: matches.length > 1,
  };
}

/** URL for an image path written relative to the content folder, e.g. img/flags/Vicus.png. */
export function resolveAsset(path: string, ctx: RenderCtx): string {
  const cleaned = path
    .trim()
    .replace(/^!?\[\[/, "")
    .replace(/\]\]$/, "")
    .split("|")[0]!
    .trim()
    .replace(/^\.?\//, "");
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(cleaned)) return cleaned;
  return joinSegments(pathToRoot(ctx.src), slugifyFilePath(cleaned as FilePath));
}

/** Render **bold** and *italic* inside a plain-text run. */
function renderEmphasis(text: string, keyPrefix: string): ComponentChildren[] {
  const out: ComponentChildren[] = [];
  const pattern = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0;
  let i = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index! > last) out.push(text.slice(last, match.index));
    if (match[1] !== undefined) out.push(<b key={`${keyPrefix}b${i++}`}>{match[1]}</b>);
    else out.push(<i key={`${keyPrefix}i${i++}`}>{match[2]}</i>);
    last = match.index! + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Render one line of text that may contain [[wikilinks]], **bold** and *italic*. */
function renderLine(line: string, ctx: RenderCtx, keyPrefix: string): ComponentChildren[] {
  const out: ComponentChildren[] = [];
  let last = 0;
  let i = 0;
  for (const match of line.matchAll(WIKILINK)) {
    if (match.index! > last) {
      out.push(...renderEmphasis(line.slice(last, match.index), `${keyPrefix}t${i}`));
    }
    const inner = match[1]!;
    const pipe = inner.indexOf("|");
    const target = (pipe === -1 ? inner : inner.slice(0, pipe)).trim();
    const label = pipe === -1 ? target.replace(/#/, " › ") : inner.slice(pipe + 1).trim();
    const { href, exists } = resolveWikilink(target, ctx);
    out.push(
      exists ? (
        <a key={`${keyPrefix}l${i}`} href={href} class="internal">
          {label}
        </a>
      ) : (
        <a
          key={`${keyPrefix}l${i}`}
          href={href}
          class="internal infobox-redlink"
          title={`${target} (page does not exist yet)`}
        >
          {label}
        </a>
      ),
    );
    last = match.index! + match[0].length;
    i++;
  }
  if (last < line.length) out.push(...renderEmphasis(line.slice(last), `${keyPrefix}t${i}`));
  return out;
}

function scalarToText(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return String(value).trim();
}

/** Render text, splitting on line breaks. */
export function renderInline(value: unknown, ctx: RenderCtx, keyPrefix = "v"): ComponentChildren {
  const lines = scalarToText(value).split(/\r?\n/);
  const out: ComponentChildren[] = [];
  lines.forEach((line, n) => {
    if (n > 0) out.push(<br key={`${keyPrefix}br${n}`} />);
    out.push(...renderLine(line, ctx, `${keyPrefix}${n}`));
  });
  return out;
}

/** Render any field value: a list becomes a plain (unbulleted) list, anything else inline text. */
export function renderValue(value: unknown, ctx: RenderCtx): ComponentChildren {
  if (Array.isArray(value)) {
    const items = value.filter(hasValue);
    if (items.length === 1) return renderInline(items[0], ctx);
    return (
      <ul class="infobox-plainlist">
        {items.map((item, n) => (
          <li key={n}>{renderInline(item, ctx, `li${n}`)}</li>
        ))}
      </ul>
    );
  }
  return renderInline(value, ctx);
}

/** Plain string version of a value, used to compare fields such as capital vs largest_city. */
export function plainText(value: unknown): string {
  return scalarToText(value)
    .replace(WIKILINK, (_m, inner: string) => inner.split("|").at(-1)!)
    .replace(/\*+/g, "")
    .trim()
    .toLowerCase();
}
