import type { ComponentChildren } from "preact";
import type { FilePath, FullSlug } from "@quartz-community/types";
import { joinSegments, pathToRoot, resolveRelative, slugifyFilePath } from "@quartz-community/utils";

/** Context needed to turn [[wikilinks]] and image paths into working URLs. */
export interface RenderCtx {
  /** Slug of the page the infobox is on, e.g. "nations/vicus". */
  src: FullSlug;
  /** Slugs of every page on the site, used to resolve links and spot missing pages. */
  allSlugs: FullSlug[];
  /** Fields the infobox type doesn't know, shown as plain rows at the bottom. */
  extras?: { label: string; value: unknown }[];
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

/**
 * Rename keys using alias rules. Each rule maps a regex on the normalized key to the
 * new key ("$1" inserts the first captured group, used for numbers). A key that already
 * exists under its new name is never overwritten.
 */
export function applyAliases(fields: Fields, rules: [RegExp, string][]): Fields {
  const out: Fields = { ...fields };
  for (const [key, value] of Object.entries(fields)) {
    for (const [pattern, replacement] of rules) {
      const m = pattern.exec(key);
      if (!m) continue;
      const target = replacement.replace("$1", m[1] ?? "");
      if (target === key) break;
      if (!(target in fields) || !hasValue(fields[target])) {
        out[target] = value;
        delete out[key];
      }
      break;
    }
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
/** The slug of the page a wikilink target points at, or undefined if there isn't exactly one. */
export function findSlug(target: string, ctx: RenderCtx): FullSlug | undefined {
  const page = target.split("#")[0]!.replace(/[*_]+/g, "").trim();
  if (page === "") return ctx.src;
  const slug = slugifyFilePath(`${page}.md` as FilePath);
  const matches = ctx.allSlugs.filter((candidate) =>
    slug.includes("/")
      ? candidate === slug || candidate.endsWith(`/${slug}`)
      : candidate.split("/").at(-1) === slug,
  );
  return matches.length === 1 ? matches[0] : undefined;
}

/** Every wikilink target in a value (strings and lists, any depth). */
export function linkTargets(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(linkTargets);
  if (typeof value !== "string") return [];
  return [...value.matchAll(WIKILINK)].map((m) => m[1]!.split("|")[0]!.trim());
}

/** Find the page a wikilink points at, using Quartz's "shortest path" rule. */
export function resolveWikilink(
  target: string,
  ctx: RenderCtx,
): { href: string; exists: boolean; self: boolean } {
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

  if (page === "") return { href: anchor, exists: true, self: false };

  const slug = slugifyFilePath(`${page}.md` as FilePath);
  const matches = ctx.allSlugs.filter((candidate) =>
    slug.includes("/")
      ? candidate === slug || candidate.endsWith(`/${slug}`)
      : candidate.split("/").at(-1) === slug,
  );

  if (matches.length === 1) {
    return {
      href: resolveRelative(ctx.src, matches[0]!) + anchor,
      exists: true,
      self: matches[0] === ctx.src && anchor === "",
    };
  }
  return {
    href: joinSegments(pathToRoot(ctx.src), slug) + anchor,
    exists: matches.length > 1,
    self: false,
  };
}

/** URL for an image path written relative to the content folder, e.g. img/flags/Vicus.png. */
export function resolveAsset(path: string, ctx: RenderCtx): string {
  const cleaned = path
    .trim()
    .replace(/^!?\[\[/, "")
    .replace(/\]\]$/, "")
    .split("|")[0]!
    .trim();
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(cleaned)) return cleaned;
  // "../img/x.png" is relative to the page's own folder; anything else to the content root.
  let fromRoot = cleaned.replace(/^\//, "");
  if (/^\.\.?\//.test(cleaned)) {
    const parts = ctx.src.split("/").slice(0, -1);
    for (const segment of cleaned.split("/")) {
      if (segment === "..") parts.pop();
      else if (segment !== ".") parts.push(segment);
    }
    fromRoot = parts.join("/");
  }
  return joinSegments(pathToRoot(ctx.src), slugifyFilePath(fromRoot as FilePath));
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

/** Render a [[wikilink]] (the text between the brackets). */
function renderLink(inner: string, ctx: RenderCtx, key: string): ComponentChildren {
  const pipe = inner.indexOf("|");
  const rawTarget = (pipe === -1 ? inner : inner.slice(0, pipe)).trim();
  const target = rawTarget.replace(/[*_]+/g, "").trim();
  const labelText = pipe === -1 ? rawTarget.replace(/#/, " › ") : inner.slice(pipe + 1).trim();
  const label = renderEmphasis(labelText, `${key}lab`);
  const { href, exists, self } = resolveWikilink(target, ctx);
  // A link to the page you're on is shown in bold instead, as on Wikipedia.
  if (self) {
    return (
      <b key={key} class="infobox-selflink">
        {label}
      </b>
    );
  }
  return exists ? (
    <a key={key} href={href} class="internal">
      {label}
    </a>
  ) : (
    <a key={key} href={href} class="internal infobox-redlink" title={`${target} (page does not exist yet)`}>
      {label}
    </a>
  );
}

/**
 * Render one line of text that may contain [[wikilinks]], **bold** and *italic*.
 * Links are swapped for placeholders first, so emphasis can wrap a link
 * ("**[[King of Vicus]]**") without the asterisks inside link targets confusing it.
 */
function renderLine(line: string, ctx: RenderCtx, keyPrefix: string): ComponentChildren[] {
  const links: string[] = [];
  const masked = line.replace(WIKILINK, (_m, inner: string) => `\u0000${links.push(inner) - 1}\u0000`);
  let n = 0;

  const plain = (text: string): ComponentChildren[] =>
    text
      .split(/\u0000(\d+)\u0000/)
      .map((part, i) => (i % 2 === 1 ? renderLink(links[Number(part)]!, ctx, `${keyPrefix}l${n++}`) : part))
      .filter((part) => part !== "");

  const rich = (text: string): ComponentChildren[] => {
    const out: ComponentChildren[] = [];
    let last = 0;
    for (const match of text.matchAll(/\*\*(.+?)\*\*|\*(.+?)\*/g)) {
      if (match.index! > last) out.push(...plain(text.slice(last, match.index)));
      if (match[1] !== undefined) out.push(<b key={`${keyPrefix}b${n++}`}>{rich(match[1])}</b>);
      else out.push(<i key={`${keyPrefix}i${n++}`}>{rich(match[2]!)}</i>);
      last = match.index! + match[0].length;
    }
    if (last < text.length) out.push(...plain(text.slice(last)));
    return out;
  };

  return rich(masked);
}

function scalarToText(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return String(value).trim();
}

export interface Line {
  /** 0 for normal text, 1+ for "* " sub-items (more leading spaces = deeper). */
  level: number;
  text: string;
}

/** Split a value into lines, understanding <br> tags and "* " / "- " sub-items. */
export function parseLines(value: unknown): Line[] {
  return scalarToText(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .split(/\r?\n/)
    .map((raw) => {
      const bullet = /^(\s*)[*-]\s+(.*)$/.exec(raw);
      if (bullet) {
        const indent = bullet[1]!.length;
        return { level: Math.min(1 + Math.floor(indent / 2), 3), text: bullet[2]!.trim() };
      }
      return { level: 0, text: raw.trim() };
    })
    .filter((line) => line.text !== "" && line.text !== "\\");
}

/** Render one parsed line (without its bullet). */
export function renderLineText(text: string, ctx: RenderCtx, keyPrefix: string): ComponentChildren[] {
  return renderLine(text, ctx, keyPrefix);
}

/** Render text: line breaks become separate lines and "* " lines become indented sub-items. */
export function renderInline(value: unknown, ctx: RenderCtx, keyPrefix = "v"): ComponentChildren {
  const lines = parseLines(value);
  if (lines.length === 0) return null;
  if (lines.length === 1 && lines[0]!.level === 0) return renderLine(lines[0]!.text, ctx, `${keyPrefix}0`);
  return lines.map((line, n) => (
    <div key={`${keyPrefix}${n}`} class={line.level ? `infobox-line infobox-sub infobox-sub-${line.level}` : "infobox-line"}>
      {renderLine(line.text, ctx, `${keyPrefix}${n}`)}
    </div>
  ));
}

/**
 * An unquoted `[[Page]]` in YAML is read as a list inside a list (`[["Page"]]`).
 * Turn those back into the wikilink that was meant.
 */
function unnestLinks(value: unknown): unknown {
  const fix = (v: unknown): unknown =>
    Array.isArray(v) && v.length === 1 && typeof v[0] === "string" ? `[[${v[0].trim()}]]` : v;
  if (!Array.isArray(value)) return value;
  if (value.length === 1 && Array.isArray(value[0])) return fix(value[0]);
  return value.map(fix);
}

/** Render any field value: a list becomes a plain (unbulleted) list, anything else inline text. */
export function renderValue(value: unknown, ctx: RenderCtx): ComponentChildren {
  value = unnestLinks(value);
  if (Array.isArray(value)) {
    const items = value.filter(hasValue);
    if (items.length === 1) return renderInline(items[0], ctx);
    return (
      <ul class="infobox-plainlist">
        {items.map((item, n) => {
          const sub = typeof item === "string" ? /^(\s*)[*-]\s+/.exec(item) : null;
          return sub ? (
            <li key={n} class={`infobox-sub infobox-sub-${Math.min(1 + Math.floor(sub[1]!.length / 2), 3)}`}>
              {renderInline(item.slice(sub[0].length), ctx, `li${n}`)}
            </li>
          ) : (
            <li key={n}>{renderInline(item, ctx, `li${n}`)}</li>
          );
        })}
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
