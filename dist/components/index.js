import { createRequire } from 'module';

createRequire(import.meta.url);
var l;
function S(n2) {
  return n2.children;
}
l = { __e: function(n2, l2, u3, t2) {
  for (var i2, r2, o2; l2 = l2.__; ) if ((i2 = l2.__c) && !i2.__) try {
    if ((r2 = i2.constructor) && null != r2.getDerivedStateFromError && (i2.setState(r2.getDerivedStateFromError(n2)), o2 = i2.__d), null != i2.componentDidCatch && (i2.componentDidCatch(n2, t2 || {}), o2 = i2.__d), o2) return i2.__E = i2;
  } catch (l3) {
    n2 = l3;
  }
  throw n2;
} }, "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, Math.random().toString(8);

// node_modules/preact/jsx-runtime/dist/jsxRuntime.mjs
var f2 = 0;
function u2(e2, t2, n2, o2, i2, u3) {
  t2 || (t2 = {});
  var a2, c2, p2 = t2;
  if ("ref" in p2) for (c2 in p2 = {}, t2) "ref" == c2 ? a2 = t2[c2] : p2[c2] = t2[c2];
  var l2 = { type: e2, props: p2, key: n2, ref: a2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f2, __i: -1, __u: 0, __source: i2, __self: u3 };
  if ("function" == typeof e2 && (a2 = e2.defaultProps)) for (c2 in a2) void 0 === p2[c2] && (p2[c2] = a2[c2]);
  return l.vnode && l.vnode(l2), l2;
}

// node_modules/@quartz-community/utils/dist/index.js
function simplifySlug(fp) {
  const res = stripSlashes(trimSuffix(fp, "index"), true);
  return res.length === 0 ? "/" : res;
}
function slugifyFilePath(fp, excludeExt) {
  fp = stripSlashes(fp);
  const ext = getFileExtension(fp);
  const withoutFileExt = fp.replace(new RegExp(ext + "$"), "");
  const finalExt = [".md", ".html", void 0].includes(ext) ? "" : ext;
  let slug2 = _sluggify(withoutFileExt);
  if (endsWith(slug2, "_index")) {
    slug2 = slug2.replace(/_index$/, "index");
  }
  const segments = slug2.split("/");
  if (segments.length >= 2 && segments[segments.length - 1] === segments[segments.length - 2]) {
    segments[segments.length - 1] = "index";
    slug2 = segments.join("/");
  }
  return slug2 + (finalExt ?? "");
}
function joinSegments(...args) {
  if (args.length === 0) {
    return "";
  }
  let joined = args.filter((segment) => segment !== "" && segment !== "/").map((segment) => stripSlashes(segment)).join("/");
  const first2 = args[0];
  const last = args[args.length - 1];
  if (first2?.startsWith("/")) {
    joined = "/" + joined;
  }
  if (last?.endsWith("/")) {
    joined = joined + "/";
  }
  return joined;
}
function endsWith(s2, suffix) {
  return s2 === suffix || s2.endsWith("/" + suffix);
}
function trimSuffix(s2, suffix) {
  if (endsWith(s2, suffix)) {
    s2 = s2.slice(0, -suffix.length);
  }
  return s2;
}
function stripSlashes(s2, onlyStripPrefix) {
  if (s2.startsWith("/")) {
    s2 = s2.substring(1);
  }
  if (!onlyStripPrefix && s2.endsWith("/")) {
    s2 = s2.slice(0, -1);
  }
  return s2;
}
function getFileExtension(s2) {
  return s2.match(/\.[A-Za-z0-9]+$/)?.[0];
}
function pathToRoot(slug2) {
  let rootPath = slug2.split("/").filter((x2) => x2 !== "").slice(0, -1).map((_2) => "..").join("/");
  if (rootPath.length === 0) {
    rootPath = ".";
  }
  return rootPath;
}
function resolveRelative(current, target) {
  const res = joinSegments(pathToRoot(current), simplifySlug(target));
  return res;
}
function slugifyPath(s2) {
  return s2.split("/").map(
    (segment) => segment.replace(/\s/g, "-").replace(/&/g, "-and-").replace(/%/g, "-percent").replace(/\?/g, "").replace(/#/g, "").replace(/[<>:"|*]/g, "").toLowerCase()
  ).join("/").replace(/\/$/, "");
}
function _sluggify(s2) {
  return slugifyPath(s2);
}

// src/render.tsx
function normalizeKeys(frontmatter) {
  const out = {};
  if (!frontmatter) return out;
  for (const [key, value] of Object.entries(frontmatter)) {
    out[key.trim().toLowerCase().replace(/[\s-]+/g, "_")] = value;
  }
  return out;
}
function applyAliases(fields, rules) {
  const out = { ...fields };
  for (const [key, value] of Object.entries(fields)) {
    for (const [pattern, replacement] of rules) {
      const m2 = pattern.exec(key);
      if (!m2) continue;
      const target = replacement.replace("$1", m2[1] ?? "");
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
function hasValue(value) {
  if (value === void 0 || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(hasValue);
  return true;
}
function numberedGroups(fields, bases) {
  const numbers = /* @__PURE__ */ new Set();
  for (const key of Object.keys(fields)) {
    for (const base of bases) {
      if (key === base) numbers.add(1);
      else if (key.startsWith(base)) {
        const rest = key.slice(base.length);
        if (/^\d+$/.test(rest)) numbers.add(Number(rest));
      }
    }
  }
  return [...numbers].sort((a2, b2) => a2 - b2).map((n2) => {
    const group = {};
    for (const base of bases) {
      const numbered = fields[`${base}${n2}`];
      group[base] = hasValue(numbered) ? numbered : n2 === 1 ? fields[base] : void 0;
    }
    return group;
  }).filter((group) => Object.values(group).some(hasValue));
}
var WIKILINK = /\[\[([^[\]]+?)\]\]/g;
function resolveWikilink(target, ctx) {
  const hashAt = target.indexOf("#");
  const page = (hashAt === -1 ? target : target.slice(0, hashAt)).trim();
  const heading = hashAt === -1 ? "" : target.slice(hashAt + 1).trim();
  const anchor = heading ? "#" + heading.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").trim().replace(/\s+/g, "-") : "";
  if (page === "") return { href: anchor, exists: true };
  const slug2 = slugifyFilePath(`${page}.md`);
  const matches = ctx.allSlugs.filter(
    (candidate) => slug2.includes("/") ? candidate === slug2 || candidate.endsWith(`/${slug2}`) : candidate.split("/").at(-1) === slug2
  );
  if (matches.length === 1) {
    return { href: resolveRelative(ctx.src, matches[0]) + anchor, exists: true };
  }
  return {
    href: joinSegments(pathToRoot(ctx.src), slug2) + anchor,
    exists: matches.length > 1
  };
}
function resolveAsset(path, ctx) {
  const cleaned = path.trim().replace(/^!?\[\[/, "").replace(/\]\]$/, "").split("|")[0].trim();
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(cleaned)) return cleaned;
  let fromRoot = cleaned.replace(/^\//, "");
  if (/^\.\.?\//.test(cleaned)) {
    const parts = ctx.src.split("/").slice(0, -1);
    for (const segment of cleaned.split("/")) {
      if (segment === "..") parts.pop();
      else if (segment !== ".") parts.push(segment);
    }
    fromRoot = parts.join("/");
  }
  return joinSegments(pathToRoot(ctx.src), slugifyFilePath(fromRoot));
}
function renderEmphasis(text, keyPrefix) {
  const out = [];
  const pattern = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0;
  let i2 = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) out.push(text.slice(last, match.index));
    if (match[1] !== void 0) out.push(/* @__PURE__ */ u2("b", { children: match[1] }, `${keyPrefix}b${i2++}`));
    else out.push(/* @__PURE__ */ u2("i", { children: match[2] }, `${keyPrefix}i${i2++}`));
    last = match.index + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
function renderLink(inner, ctx, key) {
  const pipe = inner.indexOf("|");
  const rawTarget = (pipe === -1 ? inner : inner.slice(0, pipe)).trim();
  const target = rawTarget.replace(/[*_]+/g, "").trim();
  const labelText = pipe === -1 ? rawTarget.replace(/#/, " \u203A ") : inner.slice(pipe + 1).trim();
  const label = renderEmphasis(labelText, `${key}lab`);
  const { href, exists } = resolveWikilink(target, ctx);
  return exists ? /* @__PURE__ */ u2("a", { href, class: "internal", children: label }, key) : /* @__PURE__ */ u2("a", { href, class: "internal infobox-redlink", title: `${target} (page does not exist yet)`, children: label }, key);
}
function renderLine(line, ctx, keyPrefix) {
  const links = [];
  const masked = line.replace(WIKILINK, (_m, inner) => `\0${links.push(inner) - 1}\0`);
  let n2 = 0;
  const plain = (text) => text.split(/\u0000(\d+)\u0000/).map((part, i2) => i2 % 2 === 1 ? renderLink(links[Number(part)], ctx, `${keyPrefix}l${n2++}`) : part).filter((part) => part !== "");
  const rich = (text) => {
    const out = [];
    let last = 0;
    for (const match of text.matchAll(/\*\*(.+?)\*\*|\*(.+?)\*/g)) {
      if (match.index > last) out.push(...plain(text.slice(last, match.index)));
      if (match[1] !== void 0) out.push(/* @__PURE__ */ u2("b", { children: rich(match[1]) }, `${keyPrefix}b${n2++}`));
      else out.push(/* @__PURE__ */ u2("i", { children: rich(match[2]) }, `${keyPrefix}i${n2++}`));
      last = match.index + match[0].length;
    }
    if (last < text.length) out.push(...plain(text.slice(last)));
    return out;
  };
  return rich(masked);
}
function scalarToText(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return String(value).trim();
}
function parseLines(value) {
  return scalarToText(value).replace(/<br\s*\/?>/gi, "\n").split(/\r?\n/).map((raw) => {
    const bullet = /^(\s*)[*-]\s+(.*)$/.exec(raw);
    if (bullet) {
      const indent = bullet[1].length;
      return { level: Math.min(1 + Math.floor(indent / 2), 3), text: bullet[2].trim() };
    }
    return { level: 0, text: raw.trim() };
  }).filter((line) => line.text !== "" && line.text !== "\\");
}
function renderInline(value, ctx, keyPrefix = "v") {
  const lines2 = parseLines(value);
  if (lines2.length === 0) return null;
  if (lines2.length === 1 && lines2[0].level === 0) return renderLine(lines2[0].text, ctx, `${keyPrefix}0`);
  return lines2.map((line, n2) => /* @__PURE__ */ u2("div", { class: line.level ? `infobox-line infobox-sub infobox-sub-${line.level}` : "infobox-line", children: renderLine(line.text, ctx, `${keyPrefix}${n2}`) }, `${keyPrefix}${n2}`));
}
function renderValue(value, ctx) {
  if (Array.isArray(value)) {
    const items = value.filter(hasValue);
    if (items.length === 1) return renderInline(items[0], ctx);
    return /* @__PURE__ */ u2("ul", { class: "infobox-plainlist", children: items.map((item, n2) => {
      const sub = typeof item === "string" ? /^(\s*)[*-]\s+/.exec(item) : null;
      return sub ? /* @__PURE__ */ u2("li", { class: `infobox-sub infobox-sub-${Math.min(1 + Math.floor(sub[1].length / 2), 3)}`, children: renderInline(item.slice(sub[0].length), ctx, `li${n2}`) }, n2) : /* @__PURE__ */ u2("li", { children: renderInline(item, ctx, `li${n2}`) }, n2);
    }) });
  }
  return renderInline(value, ctx);
}
function plainText(value) {
  return scalarToText(value).replace(WIKILINK, (_m, inner) => inner.split("|").at(-1)).replace(/\*+/g, "").trim().toLowerCase();
}

// src/rows.tsx
var Rows = class {
  constructor(fields, ctx) {
    this.fields = fields;
    this.ctx = ctx;
  }
  fields;
  ctx;
  rows = [];
  n = 0;
  key() {
    return `r${this.n++}`;
  }
  /** A labelled row: label on the left, value on the right. */
  row(label, value, opts = {}) {
    if (!hasValue(value) && !opts.allowEmpty) return false;
    if (typeof label === "string" && typeof value === "string") {
      const lines2 = value.split(/<br\s*\/?>|\n/i);
      if (lines2.length > 1 && plainText(lines2[0]) === label.toLowerCase()) {
        value = lines2.slice(1).join("\n");
      }
    }
    this.rows.push(
      /* @__PURE__ */ u2("tr", { class: opts.sub ? "infobox-subrow" : void 0, children: [
        /* @__PURE__ */ u2("th", { scope: "row", class: "infobox-label", children: [
          opts.sub ? /* @__PURE__ */ u2("span", { class: "infobox-bullet", children: "\u2022\xA0" }) : null,
          label
        ] }),
        /* @__PURE__ */ u2("td", { class: "infobox-data", children: hasValue(value) ? renderValue(value, this.ctx) : null })
      ] }, this.key())
    );
    return true;
  }
  /** Rows for fields this infobox type doesn't know, labelled with your original key. */
  extras() {
    for (const extra of this.ctx.extras ?? []) this.row(extra.label, extra.value);
  }
  /** Row for a single frontmatter key. */
  field(key, label, opts = {}) {
    return this.row(label, this.fields[key], opts);
  }
  /** A full-width blue section bar. */
  header(text, className = "infobox-header") {
    this.rows.push(
      /* @__PURE__ */ u2("tr", { children: /* @__PURE__ */ u2("th", { colSpan: 2, class: className, children: text }) }, this.key())
    );
  }
  /** A full-width row (images, notes, centered lines). */
  full(content, className = "infobox-full") {
    this.rows.push(
      /* @__PURE__ */ u2("tr", { children: /* @__PURE__ */ u2("td", { colSpan: 2, class: className, children: content }) }, this.key())
    );
  }
  /** Full-width centered value, skipped when empty. */
  fullValue(value, className = "infobox-full") {
    if (!hasValue(value)) return false;
    this.full(renderValue(value, this.ctx), className);
    return true;
  }
  /** Adds a header only if the rows built inside produce something. */
  section(title, build, className) {
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
  columns(cells) {
    if (!cells.some(hasValue)) return false;
    const width = `${(100 / cells.length).toFixed(3)}%`;
    this.full(
      /* @__PURE__ */ u2("table", { class: "infobox-columns", children: /* @__PURE__ */ u2("tbody", { children: /* @__PURE__ */ u2("tr", { children: cells.map((cell, i2) => /* @__PURE__ */ u2("td", { style: { width }, children: hasValue(cell) ? renderValue(cell, this.ctx) : null }, i2)) }) }) }),
      "infobox-full infobox-columns-cell"
    );
    return true;
  }
  /**
   * A labelled grid: one label column, then one column per item (election candidates).
   * `head` cells sit on top without a label; rows whose values are all empty are dropped.
   */
  grid(count, head, gridRows) {
    const kept = gridRows.filter((gr) => gr.values.some(hasValue));
    if (!head && kept.length === 0) return false;
    const width = `${(100 / count).toFixed(3)}%`;
    this.full(
      /* @__PURE__ */ u2("table", { class: "infobox-grid", children: /* @__PURE__ */ u2("tbody", { children: [
        head ? /* @__PURE__ */ u2("tr", { children: [
          /* @__PURE__ */ u2("th", {}),
          head.map((cell, i2) => /* @__PURE__ */ u2("td", { class: "infobox-grid-head", style: { width }, children: cell }, i2))
        ] }) : null,
        kept.map((gr, j2) => /* @__PURE__ */ u2("tr", { children: [
          /* @__PURE__ */ u2("th", { scope: "row", children: gr.label }),
          gr.values.map((value, i2) => /* @__PURE__ */ u2("td", { children: hasValue(value) ? renderValue(value, this.ctx) : null }, i2))
        ] }, j2))
      ] }) }),
      "infobox-full infobox-columns-cell"
    );
    return true;
  }
};
function image(path, alt, ctx, className) {
  if (!hasValue(path)) return null;
  const src = resolveAsset(String(Array.isArray(path) ? path[0] : path), ctx);
  return /* @__PURE__ */ u2("img", { src, alt, class: className, loading: "lazy" });
}
function mainImage(r2, alt, imageKey = "image", captionKey = "image_caption") {
  const img = image(r2.fields[imageKey], alt, r2.ctx, "infobox-image");
  if (!img) return;
  const caption = r2.fields[captionKey] ?? r2.fields.caption;
  r2.full(
    /* @__PURE__ */ u2("figure", { children: [
      img,
      hasValue(caption) ? /* @__PURE__ */ u2("figcaption", { children: renderInline(caption, r2.ctx) }) : null
    ] }),
    "infobox-full infobox-images"
  );
}
function box(type, title, ctx, rows, extras = {}) {
  return /* @__PURE__ */ u2("table", { class: `infobox infobox-${type}`, children: [
    /* @__PURE__ */ u2("caption", { class: "infobox-title", children: [
      hasValue(extras.above) ? /* @__PURE__ */ u2("div", { class: "infobox-above", children: renderValue(extras.above, ctx) }) : null,
      renderInline(title, ctx),
      (extras.below ?? []).filter(hasValue).map((line, i2) => /* @__PURE__ */ u2("div", { class: "infobox-native-name", children: renderValue(line, ctx) }, i2))
    ] }),
    /* @__PURE__ */ u2("tbody", { children: rows })
  ] });
}
function first(fields, ...keys) {
  for (const key of keys) if (hasValue(fields[key])) return fields[key];
  return void 0;
}

// src/conflict.tsx
var ALIASES = [
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
  [/^partof$/, "part_of"]
];
var SIDE_SECTIONS = [
  ["combatant", "Belligerents"],
  ["commander", "Commanders and leaders"],
  ["units", "Units involved"],
  ["strength", "Strength"],
  ["casualties", "Casualties and losses"]
];
function sideCount(fields) {
  let max = 0;
  for (const [key, value] of Object.entries(fields)) {
    if (!hasValue(value)) continue;
    for (const [base] of SIDE_SECTIONS) {
      const m2 = new RegExp(`^${base}(\\d+)$`).exec(key);
      if (m2) max = Math.max(max, Number(m2[1]));
    }
  }
  return max;
}
function renderConflict(raw, ctx, fallbackTitle) {
  const fields = applyAliases(raw, ALIASES);
  let partOf = fields.part_of;
  let otherNames = fields.other_names;
  if (hasValue(fields.subtitle)) {
    if (/^part of\b/i.test(plainText(fields.subtitle))) partOf = hasValue(partOf) ? partOf : fields.subtitle;
    else otherNames = hasValue(otherNames) ? otherNames : fields.subtitle;
  }
  const r2 = new Rows(fields, ctx);
  const title = first(fields, "conflict", "title") ?? fallbackTitle;
  if (hasValue(partOf)) {
    const text = String(partOf);
    r2.full(
      /^part of\b/i.test(plainText(text)) ? renderInline(text, ctx) : /* @__PURE__ */ u2(S, { children: [
        "Part of ",
        renderInline(text, ctx)
      ] }),
      "infobox-full infobox-partof"
    );
  }
  mainImage(r2, String(title));
  if (hasValue(fields.date)) r2.field("date", "Date");
  else {
    const start = fields.date_start;
    const end = fields.date_end;
    const short = (v2) => hasValue(v2) && !/[,[\n]/.test(String(v2));
    if (short(start) && short(end)) r2.row("Date", `${String(start)} \u2013 ${String(end)}`);
    else {
      r2.row("Began", start);
      r2.row("Ended", end);
    }
  }
  r2.field("place", "Location");
  r2.field("status", "Status");
  r2.field("result", "Result");
  r2.field("territory", "Territorial changes");
  r2.field("major_battles", "Major battles");
  const sides = sideCount(fields);
  for (const [base, heading] of SIDE_SECTIONS) {
    const cells = Array.from({ length: sides }, (_2, i2) => fields[`${base}${i2 + 1}`]);
    r2.section(heading, () => {
      r2.columns(cells);
    });
  }
  r2.fullValue(fields.casualties_note, "infobox-full infobox-note");
  r2.fullValue(fields.notes, "infobox-full infobox-note");
  r2.extras();
  return box("conflict", title, ctx, r2.rows, { below: [otherNames] });
}
var knownConflict = /^(?:conflict|part_of|partof|other_names|subtitle|image|image_caption|caption|date|date_start|date_end|beginning|began|start|start_date|end|ended|end_date|place|location|status|result|outcome|territory|territorial_changes|major_battles|battles|(?:combatants?|belligerents?|commanders?(?:_and_leaders)?|units?(?:_involved)?|strengths?|casualt(?:y|ies)(?:_and_losses)?)_?\d+|casualties_note|notes)$/;

// src/country.tsx
var ALIASES2 = [
  [/^full_name$/, "conventional_long_name"],
  [/^official_language$/, "official_languages"],
  [/^national_language$/, "national_languages"],
  [/^regional_language$/, "regional_languages"],
  [/^religions$/, "religion"],
  [/^government$/, "government_type"],
  [/^population$/, "population_estimate"]
];
function renderCountry(raw, ctx, fallbackTitle) {
  const fields = applyAliases(raw, ALIASES2);
  if (hasValue(fields.image) && !hasValue(fields.flag) && !hasValue(fields.map)) {
    const images = (Array.isArray(fields.image) ? fields.image : [fields.image]).filter(hasValue);
    fields.flag = images[0];
    fields.map = images[1];
    delete fields.image;
  }
  const r2 = new Rows(fields, ctx);
  const title = hasValue(fields.conventional_long_name) && fields.conventional_long_name || hasValue(fields.common_name) && fields.common_name || fallbackTitle;
  const shortName = hasValue(fields.common_name) ? plainText(fields.common_name) : fallbackTitle;
  const flag = image(fields.flag, `Flag of ${shortName}`, ctx, "infobox-flag");
  const coat = image(fields.coat_of_arms, `Coat of arms of ${shortName}`, ctx, "infobox-coat");
  if (flag || coat) {
    r2.full(
      /* @__PURE__ */ u2("div", { class: "infobox-symbols", children: [
        flag ? /* @__PURE__ */ u2("figure", { children: [
          flag,
          /* @__PURE__ */ u2("figcaption", { children: hasValue(fields.flag_caption) ? renderInline(fields.flag_caption, ctx) : "Flag" })
        ] }) : null,
        coat ? /* @__PURE__ */ u2("figure", { children: [
          coat,
          /* @__PURE__ */ u2("figcaption", { children: hasValue(fields.coat_of_arms_caption) ? renderInline(fields.coat_of_arms_caption, ctx) : "Coat of arms" })
        ] }) : null
      ] }),
      "infobox-full infobox-images"
    );
  }
  if (hasValue(fields.motto)) {
    r2.full(
      /* @__PURE__ */ u2(S, { children: [
        /* @__PURE__ */ u2("b", { children: "Motto: " }),
        /* @__PURE__ */ u2("i", { children: renderValue(fields.motto, ctx) })
      ] })
    );
  }
  if (hasValue(fields.anthem)) {
    r2.full(
      /* @__PURE__ */ u2(S, { children: [
        /* @__PURE__ */ u2("b", { children: "Anthem: " }),
        /* @__PURE__ */ u2("i", { children: renderValue(fields.anthem, ctx) })
      ] })
    );
  }
  const map = image(fields.map, `Map of ${shortName}`, ctx, "infobox-map");
  if (map) {
    r2.full(
      /* @__PURE__ */ u2("figure", { children: [
        map,
        hasValue(fields.map_caption) ? /* @__PURE__ */ u2("figcaption", { children: renderInline(fields.map_caption, ctx) }) : null
      ] }),
      "infobox-full infobox-images"
    );
  }
  r2.field("status", "Status");
  const sameCity = hasValue(fields.capital) && hasValue(fields.largest_city) && plainText(fields.capital) === plainText(fields.largest_city);
  if (sameCity) {
    r2.field("capital", "Capital and largest city");
  } else {
    r2.field("capital", "Capital");
    r2.field("largest_city", "Largest city");
  }
  r2.field("largest_cities", "Largest cities");
  r2.field("official_languages", "Official languages");
  r2.field("national_languages", "National languages");
  r2.field("recognized_languages", "Recognized languages");
  r2.field("regional_languages", "Regional languages");
  r2.field("ethnic_groups", "Ethnic groups");
  r2.field("state_religion", "State religion");
  r2.field("religion", "Religion");
  r2.field("demonym", "Demonym");
  const leaders = numberedGroups(fields, ["leader_title", "leader_name"]);
  if (hasValue(fields.government_type) || leaders.length > 0) {
    r2.row("Government", fields.government_type, { allowEmpty: true });
    for (const leader of leaders) {
      r2.row(
        hasValue(leader.leader_title) ? renderInline(leader.leader_title, ctx) : "Leader",
        leader.leader_name,
        { sub: true }
      );
    }
  }
  for (const body of numberedGroups(fields, ["legislature", "upper_house", "lower_house"])) {
    r2.row("Legislature", body.legislature, { allowEmpty: true });
    r2.row("Upper house", body.upper_house, { sub: true });
    r2.row("Lower house", body.lower_house, { sub: true });
  }
  const events = numberedGroups(fields, ["established_event", "established_date"]);
  if (events.length > 0 || hasValue(fields.sovereignty_note)) {
    const heading = hasValue(fields.sovereignty_type) ? renderInline(fields.sovereignty_type, ctx) : "Formation";
    r2.section(heading, () => {
      if (hasValue(fields.sovereignty_note)) r2.full(renderInline(fields.sovereignty_note, ctx), "infobox-full infobox-note");
      for (const event of events) {
        r2.row(
          hasValue(event.established_event) ? renderInline(event.established_event, ctx) : "Established",
          event.established_date,
          { sub: true, allowEmpty: true }
        );
      }
    });
  }
  r2.section("Area", () => {
    r2.field("area", "Total", { sub: true });
    r2.field("area_note", "Note", { sub: true });
  });
  r2.section("Population", () => {
    const estimateLabel = hasValue(fields.population_estimate_year) ? `${String(fields.population_estimate_year)} estimate` : "Estimate";
    r2.row(estimateLabel, fields.population_estimate, { sub: true });
    const censusLabel = hasValue(fields.population_census_year) ? `${String(fields.population_census_year)} census` : "Census";
    r2.row(censusLabel, fields.population_census, { sub: true });
    r2.field("population_density", "Density", { sub: true });
  });
  r2.field("currency", "Currency");
  r2.field("calendar", "Calendar");
  r2.field("preceded_by", "Preceded by");
  r2.field("succeeded_by", "Succeeded by");
  r2.extras();
  const subtitle = hasValue(fields.subtitle) && plainText(fields.subtitle) !== plainText(title) ? fields.subtitle : void 0;
  return box("country", title, ctx, r2.rows, { below: [fields.native_name, subtitle] });
}
var knownCountry = /^(?:conventional_long_name|common_name|native_name|subtitle|image|flag|flag_caption|coat_of_arms|coat_of_arms_caption|motto|anthem|map|map_caption|status|capital|largest_city|largest_cities|official_languages?|national_languages?|recognized_languages|regional_languages?|ethnic_groups|state_religion|religions?|demonym|government|government_type|leader_title\d*|leader_name\d*|legislature\d*|upper_house\d*|lower_house\d*|sovereignty_type|sovereignty_note|established_event\d*|established_date\d*|area|area_note|population|population_estimate|population_estimate_year|population_census|population_census_year|population_density|currency|calendar|preceded_by|succeeded_by|full_name)$/;

// src/election.tsx
var ALIASES3 = [
  [/^previous$|^previous_election$/, "previous_election"],
  [/^next$|^next_election$/, "next_election"],
  [/^date$/, "election_date"],
  [/^nominee(\d+)$/, "candidate$1"],
  [/^popular_vote(\d+)$/, "votes$1"],
  [/^school(\d+)$/, "party$1"]
];
function chunk(items) {
  const perRow = items.length === 4 ? 2 : 3;
  const out = [];
  for (let i2 = 0; i2 < items.length; i2 += perRow) out.push(items.slice(i2, i2 + perRow));
  return out;
}
function candidateCount(fields) {
  let max = 0;
  for (const [key, value] of Object.entries(fields)) {
    const m2 = /^candidate(\d+)$/.exec(key);
    if (m2 && hasValue(value)) max = Math.max(max, Number(m2[1]));
  }
  return max;
}
var stripArrows = (v2) => hasValue(v2) ? String(v2).replace(/^\s*[←<]+\s*/, "").replace(/\s*[→>]+\s*$/, "") : void 0;
function renderElection(raw, ctx, fallbackTitle) {
  const fields = applyAliases(raw, ALIASES3);
  const r2 = new Rows(fields, ctx);
  const title = first(fields, "election_name", "title") ?? fallbackTitle;
  const prev = stripArrows(fields.previous_election);
  const next = stripArrows(fields.next_election);
  if (prev || next || hasValue(fields.election_date)) {
    r2.full(
      /* @__PURE__ */ u2("table", { class: "infobox-succession", children: /* @__PURE__ */ u2("tbody", { children: /* @__PURE__ */ u2("tr", { children: [
        /* @__PURE__ */ u2("td", { class: "infobox-prev", children: prev ? /* @__PURE__ */ u2(S, { children: [
          "\u2190 ",
          renderInline(prev, ctx)
        ] }) : null }),
        /* @__PURE__ */ u2("td", { class: "infobox-date", children: hasValue(fields.election_date) ? renderInline(fields.election_date, ctx) : null }),
        /* @__PURE__ */ u2("td", { class: "infobox-next", children: next ? /* @__PURE__ */ u2(S, { children: [
          renderInline(next, ctx),
          " \u2192"
        ] }) : null })
      ] }) }) }),
      "infobox-full infobox-columns-cell"
    );
  }
  mainImage(r2, String(title));
  r2.field("country", "Country");
  r2.field("type", "Type");
  r2.field("location", "Location");
  r2.field("registered", "Registered");
  r2.field("electors", "Electors");
  r2.field("ballots", "Ballots");
  r2.field("majority", "Needed to win");
  r2.field("turnout", "Turnout");
  const partyLabel = hasValue(fields.party_label) ? String(fields.party_label) : "Party";
  const votesLabel = hasValue(fields.votes_label) ? String(fields.votes_label) : "Popular vote";
  const seatsLabel = hasValue(fields.seats_label) ? String(fields.seats_label) : "Seats won";
  const count = candidateCount(fields);
  if (count > 0) {
    const numbers = Array.from({ length: count }, (_2, i2) => i2 + 1).filter((n2) => hasValue(fields[`candidate${n2}`]));
    for (const group of chunk(numbers)) {
      const head = group.map((n2) => {
        const portrait = image(fields[`image${n2}`], `Portrait of candidate ${n2}`, ctx, "infobox-candidate-image");
        return /* @__PURE__ */ u2(S, { children: [
          portrait,
          /* @__PURE__ */ u2("div", { class: "infobox-candidate-name", children: renderInline(fields[`candidate${n2}`], ctx) })
        ] });
      });
      const col = (base) => group.map((n2) => fields[`${base}${n2}`]);
      r2.grid(group.length, head, [
        { label: partyLabel, values: col("party") },
        { label: "Leader", values: col("leader") },
        { label: "Running mate", values: col("running_mate") },
        { label: "Home state", values: col("home_state") },
        { label: votesLabel, values: col("votes") },
        { label: "Percentage", values: col("percentage") },
        { label: seatsLabel, values: col("seats") },
        { label: "Seat change", values: col("seat_change") },
        { label: "Electoral vote", values: col("electoral_vote") },
        { label: "", values: col("note") }
      ]);
    }
  } else if (hasValue(fields.candidates)) {
    const items = (Array.isArray(fields.candidates) ? fields.candidates : [fields.candidates]).filter(hasValue);
    r2.section("Candidates", () => {
      for (const group of chunk(items)) r2.columns(group);
    });
  }
  if (hasValue(fields.before_election) || hasValue(fields.after_election)) {
    const office = hasValue(fields.office) ? String(fields.office) : "Officeholder";
    const cell = (heading, name, party) => hasValue(name) ? [`**${heading}**`, String(name), ...hasValue(party) ? [String(party)] : []].join("\n") : void 0;
    r2.columns([
      cell(`${office} before election`, fields.before_election, fields.before_party),
      cell(`Elected ${office}`, fields.after_election, fields.after_party)
    ]);
  }
  r2.extras();
  return box("election", title, ctx, r2.rows, { below: [fields.subtitle] });
}
var knownElection = /^(?:election_name|subtitle|previous|previous_election|next|next_election|date|election_date|image|image_caption|caption|country|type|location|registered|electors|ballots|majority|turnout|party_label|votes_label|seats_label|(?:candidate|nominee|image|party|school|leader|running_mate|home_state|votes|popular_vote|percentage|seats|seat_change|electoral_vote|note)\d+|candidates|office|before_election|before_party|after_election|after_party)$/;

// src/person.tsx
var ALIASES4 = [
  [/^burial$/, "resting_place"],
  [/^consorts$/, "consort"],
  [/^spouses$/, "spouse"],
  [/^service$/, "branch"],
  [/^service_years$|^serviceyears$/, "years_of_service"],
  [/^combat$|^conflicts$|^wars$/, "battles"],
  [/^medals$/, "awards"],
  [/^nicknames$/, "nickname"]
];
function plural(singular, pluralLabel, value) {
  return Array.isArray(value) && value.filter(hasValue).length > 1 ? pluralLabel : singular;
}
function lines(...values) {
  const kept = values.filter(hasValue).map(String);
  return kept.length ? kept.join("\n") : void 0;
}
var SERVED_WITH = [
  ["monarch", "Monarch"],
  ["president", "President"],
  ["prime_minister", "Prime Minister"],
  ["chancellor", "Chancellor"],
  ["vice_president", "Vice President"],
  ["deputy", "Deputy"],
  ["governor", "Governor"],
  ["regent", "Regent"]
];
var OFFICE_FIELDS = [
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
  ...SERVED_WITH.map(([key]) => key)
];
function structuredOffices(r2) {
  const offices = numberedGroups(r2.fields, OFFICE_FIELDS).filter((o2) => hasValue(o2.office));
  for (const o2 of offices) {
    r2.header(
      /* @__PURE__ */ u2(S, { children: [
        hasValue(o2.order) ? /* @__PURE__ */ u2(S, { children: [
          renderInline(o2.order, r2.ctx),
          " "
        ] }) : null,
        renderInline(o2.office, r2.ctx)
      ] }),
      "infobox-header infobox-office"
    );
    const label = hasValue(o2.term_label) ? String(o2.term_label) : null;
    let termText = null;
    let termLabel = label ?? "In office";
    if (hasValue(o2.term)) termText = String(o2.term);
    else if (hasValue(o2.term_start) && hasValue(o2.term_end)) termText = `${String(o2.term_start)} \u2013 ${String(o2.term_end)}`;
    else if (hasValue(o2.term_start)) {
      termText = String(o2.term_start);
      termLabel = label ?? "Assumed office";
    }
    if (termText) {
      r2.full(
        /* @__PURE__ */ u2(S, { children: [
          /* @__PURE__ */ u2("b", { children: termLabel }),
          /* @__PURE__ */ u2("div", { children: renderInline(termText, r2.ctx) })
        ] }),
        "infobox-full infobox-term"
      );
    }
    r2.row("Coronation", o2.coronation);
    for (const [key, text] of SERVED_WITH) r2.row(text, o2[key]);
    r2.row("Preceded by", o2.predecessor);
    r2.row("Succeeded by", o2.successor);
    r2.fullValue(o2.office_note, "infobox-full infobox-note");
  }
  return offices.length;
}
function freeformOffices(r2, list) {
  const items = (Array.isArray(list) ? list : [list]).filter(hasValue);
  for (const item of items) {
    const parsed = parseLines(item);
    if (parsed.length === 0) continue;
    const [head, ...rest] = parsed;
    r2.header(renderInline(head.text, r2.ctx), "infobox-header infobox-office");
    let pending = null;
    const flush = () => {
      if (pending) r2.row(renderInline(pending.label, r2.ctx), pending.parts.join("\n"), { allowEmpty: true });
      pending = null;
    };
    for (const line of rest) {
      const labelled = /^((?:\[\[[^\]]*\]\]|[^:[\]*])+?):\s*(.*)$/.exec(line.text);
      if (labelled && labelled[1].replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1").length <= 40 && line.level <= 1) {
        flush();
        pending = { label: labelled[1].trim(), parts: labelled[2] ? [labelled[2]] : [] };
      } else if (pending && line.level >= 2) {
        pending.parts.push(line.text);
      } else {
        flush();
        if (/\d/.test(line.text) && !/[[*]/.test(line.text.replace(/\[\[[^\]]*\]\]/g, ""))) {
          r2.full(renderInline(line.text, r2.ctx), "infobox-full infobox-term");
        } else {
          r2.full(renderInline(line.text, r2.ctx), "infobox-full infobox-note");
        }
      }
    }
    flush();
  }
  return items.length;
}
function renderPerson(raw, ctx, fallbackTitle) {
  const fields = applyAliases(raw, ALIASES4);
  const r2 = new Rows(fields, ctx);
  const name = first(fields, "name", "title") ?? fallbackTitle;
  mainImage(r2, `Portrait of ${String(name)}`);
  const officeCount = structuredOffices(r2) + freeformOffices(r2, fields.offices_held) + freeformOffices(r2, fields.titles_held);
  const personal = () => {
    r2.row("Born", first(fields, "born") ?? lines(fields.birth_name, fields.birth_date, fields.birth_place));
    r2.row("Died", first(fields, "died") ?? lines(fields.death_date, fields.death_place));
    r2.field("cause_of_death", "Cause of death");
    r2.field("resting_place", "Resting place");
    r2.field("nationality", "Nationality");
    r2.field("citizenship", "Citizenship");
    r2.field("party", "Political party");
    r2.field("other_party", "Other political affiliations");
    r2.row(plural("Consort", "Consorts", fields.consort), fields.consort);
    r2.row(plural("Spouse", "Spouses", fields.spouse), fields.spouse);
    r2.field("partner", "Partner");
    r2.field("children", "Children");
    r2.field("issue", "Issue");
    r2.row(plural("Parent", "Parents", fields.parents), fields.parents);
    r2.field("father", "Father");
    r2.field("mother", "Mother");
    r2.field("relatives", "Relatives");
    r2.field("family", "Family");
    r2.field("house", "House");
    r2.field("dynasty", "Dynasty");
    r2.field("religion", "Religion");
    r2.field("residence", "Residence");
    r2.field("education", "Education");
    r2.field("alma_mater", "Alma mater");
    r2.field("occupation", "Occupation");
    r2.field("profession", "Profession");
    r2.field("known_for", "Known for");
    r2.row(plural("Nickname", "Nicknames", fields.nickname), fields.nickname);
    const signature = image(fields.signature, `Signature of ${String(name)}`, ctx, "infobox-signature");
    if (signature) {
      r2.full(
        /* @__PURE__ */ u2(S, { children: [
          /* @__PURE__ */ u2("div", { class: "infobox-signature-label", children: "Signature" }),
          signature
        ] }),
        "infobox-full infobox-images"
      );
    }
  };
  if (officeCount > 0) r2.section("Personal details", personal);
  else personal();
  r2.section("Military service", () => {
    r2.field("allegiance", "Allegiance");
    r2.row("Branch/service", fields.branch);
    r2.field("years_of_service", "Years of service");
    r2.field("rank", "Rank");
    r2.field("unit", "Unit");
    r2.field("commands", "Commands");
    r2.row("Battles/wars", fields.battles);
    r2.field("awards", "Awards");
  });
  r2.extras();
  return box("person", name, ctx, r2.rows, {
    above: fields.honorific_prefix,
    below: [fields.honorific_suffix, fields.native_name, fields.subtitle]
  });
}
var knownPerson = /^(?:name|honorific_prefix|honorific_suffix|native_name|subtitle|image|image_caption|caption|(?:office|order|term_label|term_start|term_end|term|coronation|office_note|predecessor|successor|monarch|president|prime_minister|chancellor|vice_president|deputy|governor|regent)\d*|offices_held|titles_held|born|birth_name|birth_date|birth_place|died|death_date|death_place|cause_of_death|resting_place|burial|nationality|citizenship|party|other_party|consorts?|spouses?|partner|children|issue|parents|father|mother|relatives|family|house|dynasty|religion|residence|education|alma_mater|occupation|profession|known_for|nicknames?|signature|allegiance|branch|service|service_years|serviceyears|years_of_service|rank|unit|commands|battles|combat|conflicts|wars|awards|medals)$/;

// src/components/styles/infobox.scss
var infobox_default = '@charset "UTF-8";\n:root body table.infobox.infobox {\n  --ib-bg: #f8f9fa;\n  --ib-border: #a2a9b1;\n  --ib-text: #202122;\n  --ib-header-bg: #cedff2;\n  --ib-link: #3366cc;\n  --ib-redlink: #d73333;\n  --ib-muted: #54595d;\n  float: right;\n  clear: right;\n  width: 22em;\n  max-width: 100%;\n  margin: 0 0 1em 1.25em;\n  padding: 0.2em;\n  border: 1px solid var(--ib-border);\n  border-spacing: 3px;\n  border-collapse: separate;\n  background: var(--ib-bg);\n  color: var(--ib-text);\n  font-size: 88%;\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif;\n  line-height: 1.4em;\n  overflow-wrap: anywhere;\n  border-radius: 0;\n  margin-block: 0 1em;\n}\n:root body table.infobox.infobox tbody,\n:root body table.infobox.infobox tr,\n:root body table.infobox.infobox tbody tr:nth-child(odd),\n:root body table.infobox.infobox tbody tr:nth-child(even) {\n  background: none;\n  border: none;\n  color: var(--ib-text);\n  font-family: inherit;\n  font-size: inherit;\n  line-height: inherit;\n}\n:root body table.infobox.infobox caption.infobox-title {\n  caption-side: top;\n  padding: 0.2em 0.4em 0.3em;\n  font-size: 125%;\n  font-weight: bold;\n  line-height: 1.3em;\n  text-align: center;\n  color: var(--ib-text);\n}\n:root body table.infobox.infobox .infobox-native-name {\n  font-size: 80%;\n  font-weight: normal;\n  font-style: italic;\n}\n:root body table.infobox.infobox th,\n:root body table.infobox.infobox td {\n  padding: 0.15em 0.3em;\n  border: none;\n  border-radius: 0;\n  font-family: inherit;\n  font-size: inherit;\n  font-weight: normal;\n  line-height: inherit;\n  vertical-align: top;\n  text-align: left;\n  background: none;\n  color: var(--ib-text);\n}\n:root body table.infobox.infobox th.infobox-label {\n  width: 40%;\n  font-weight: bold;\n}\n:root body table.infobox.infobox tr.infobox-subrow th.infobox-label {\n  font-weight: normal;\n  padding-left: 0.6em;\n}\n:root body table.infobox.infobox .infobox-bullet {\n  font-weight: bold;\n}\n:root body table.infobox.infobox th.infobox-header {\n  background: var(--ib-header-bg);\n  text-align: center;\n  font-weight: bold;\n  padding: 0.25em 0.4em;\n}\n:root body table.infobox.infobox td.infobox-full {\n  text-align: center;\n}\n:root body table.infobox.infobox td.infobox-note {\n  font-size: 90%;\n  color: var(--ib-muted);\n}\n:root body table.infobox.infobox .infobox-images figure {\n  margin: 0.25em auto;\n}\n:root body table.infobox.infobox .infobox-images figcaption {\n  font-size: 90%;\n  line-height: 1.3em;\n  padding-top: 0.2em;\n}\n:root body table.infobox.infobox .infobox-symbols {\n  display: flex;\n  justify-content: space-around;\n  align-items: flex-end;\n  gap: 0.5em;\n}\n:root body table.infobox.infobox .infobox-symbols figure {\n  flex: 1 1 0;\n  margin: 0;\n}\n:root body table.infobox.infobox img {\n  display: block;\n  margin: 0 auto;\n  max-width: 100%;\n  height: auto;\n  border-radius: 0;\n}\n:root body table.infobox.infobox img.infobox-flag {\n  max-height: 7em;\n  border: 1px solid var(--ib-border);\n}\n:root body table.infobox.infobox img.infobox-coat {\n  max-height: 7em;\n}\n:root body table.infobox.infobox img.infobox-map {\n  max-height: 18em;\n}\n:root body table.infobox.infobox ul.infobox-plainlist {\n  color: inherit;\n  line-height: inherit;\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n:root body table.infobox.infobox ul.infobox-plainlist li {\n  margin: 0;\n  padding-top: 0;\n  padding-bottom: 0;\n  color: inherit;\n  line-height: inherit;\n  font-size: inherit;\n}\n:root body table.infobox.infobox a.internal {\n  color: var(--ib-link);\n  background: none;\n  padding: 0;\n  border-radius: 0;\n  font-weight: normal;\n  text-decoration: none;\n}\n:root body table.infobox.infobox a.internal:hover {\n  text-decoration: underline;\n}\n:root body table.infobox.infobox a.internal.infobox-redlink {\n  color: var(--ib-redlink);\n}\n:root body table.infobox.infobox th a.internal,\n:root body table.infobox.infobox b a.internal,\n:root body table.infobox.infobox strong a.internal {\n  font-weight: inherit;\n}\n:root body table.infobox.infobox .infobox-above {\n  font-size: 80%;\n  font-weight: normal;\n}\n:root body table.infobox.infobox b,\n:root body table.infobox.infobox strong,\n:root body table.infobox.infobox i,\n:root body table.infobox.infobox em {\n  font-family: inherit;\n  font-size: inherit;\n  color: inherit;\n}\n:root body table.infobox.infobox b,\n:root body table.infobox.infobox strong {\n  font-weight: bold;\n}\n:root body table.infobox.infobox i,\n:root body table.infobox.infobox em {\n  font-style: italic;\n}\n:root body table.infobox.infobox .infobox-line {\n  display: block;\n}\n:root body table.infobox.infobox .infobox-sub,\n:root body table.infobox.infobox ul.infobox-plainlist li.infobox-sub {\n  display: block;\n  padding-left: 0.9em;\n  text-indent: -0.6em;\n}\n:root body table.infobox.infobox .infobox-sub::before,\n:root body table.infobox.infobox ul.infobox-plainlist li.infobox-sub::before {\n  content: "\u2022 ";\n}\n:root body table.infobox.infobox .infobox-sub-2 {\n  margin-left: 0.9em;\n}\n:root body table.infobox.infobox .infobox-sub-3 {\n  margin-left: 1.8em;\n}\n:root body table.infobox.infobox th.infobox-header.infobox-office {\n  font-weight: bold;\n}\n:root body table.infobox.infobox td.infobox-term {\n  text-align: center;\n}\n:root body table.infobox.infobox td.infobox-note {\n  text-align: center;\n  font-style: italic;\n}\n:root body table.infobox.infobox .infobox-signature-label {\n  font-weight: bold;\n}\n:root body table.infobox.infobox img.infobox-image {\n  max-height: 20em;\n}\n:root body table.infobox.infobox img.infobox-signature {\n  max-height: 4em;\n}\n:root body table.infobox.infobox td.infobox-partof {\n  text-align: center;\n  font-size: 95%;\n}\n:root body table.infobox.infobox td.infobox-columns-cell {\n  padding: 0;\n}\n:root body table.infobox.infobox table.infobox-columns,\n:root body table.infobox.infobox table.infobox-grid,\n:root body table.infobox.infobox table.infobox-succession {\n  width: 100%;\n  margin: 0;\n  padding: 0;\n  border: none;\n  border-collapse: collapse;\n  border-spacing: 0;\n  background: none;\n  font: inherit;\n  color: inherit;\n  table-layout: fixed;\n  float: none;\n}\n:root body table.infobox.infobox table.infobox-columns td {\n  vertical-align: top;\n  padding: 0.2em 0.35em;\n}\n:root body table.infobox.infobox table.infobox-columns td + td {\n  border-left: 1px solid var(--ib-border);\n}\n:root body table.infobox.infobox table.infobox-grid th {\n  width: 28%;\n  font-weight: bold;\n  vertical-align: top;\n}\n:root body table.infobox.infobox table.infobox-grid td {\n  text-align: center;\n  vertical-align: top;\n}\n:root body table.infobox.infobox table.infobox-grid td.infobox-grid-head {\n  vertical-align: bottom;\n}\n:root body table.infobox.infobox .infobox-candidate-name {\n  font-weight: bold;\n}\n:root body table.infobox.infobox img.infobox-candidate-image {\n  max-height: 9em;\n  margin-bottom: 0.2em;\n}\n:root body table.infobox.infobox table.infobox-succession td {\n  vertical-align: middle;\n}\n:root body table.infobox.infobox table.infobox-succession td.infobox-prev {\n  text-align: left;\n  width: 30%;\n}\n:root body table.infobox.infobox table.infobox-succession td.infobox-date {\n  text-align: center;\n  font-weight: bold;\n}\n:root body table.infobox.infobox table.infobox-succession td.infobox-next {\n  text-align: right;\n  width: 30%;\n}\n\n:root body table.infobox.infobox.infobox-election {\n  width: 25em;\n}\n\n:root[saved-theme=dark] body table.infobox.infobox {\n  --ib-bg: #202122;\n  --ib-border: #54595d;\n  --ib-text: #eaecf0;\n  --ib-header-bg: #2c3a52;\n  --ib-link: #88a3e8;\n  --ib-redlink: #fd7865;\n  --ib-muted: #a2a9b1;\n}\n\n@media (max-width: 800px) {\n  :root body table.infobox.infobox,\n  :root body table.infobox.infobox.infobox-election {\n    float: none;\n    width: 100%;\n    margin: 0 0 1em 0;\n  }\n}';

// src/components/scripts/infobox.inline.ts
var infobox_inline_default = 'function o(){for(let e of document.querySelectorAll(".infobox img")){let n=()=>{let r=e.closest("figure")??e;r.style.display="none";let t=e.closest("tr");t&&![...t.querySelectorAll("figure, img")].some(s=>s.style.display!=="none")&&(t.style.display="none")};e.complete&&e.naturalWidth===0?n():(e.addEventListener("error",n,{once:!0}),window.addCleanup?.(()=>e.removeEventListener("error",n)))}}document.addEventListener("nav",o);document.addEventListener("render",o);\n';

// src/components/Infobox.tsx
var country = { render: renderCountry, known: knownCountry };
var person = { render: renderPerson, known: knownPerson };
var conflict = { render: renderConflict, known: knownConflict };
var election = { render: renderElection, known: knownElection };
var META = /^(?:infobox|title|tags|aliases|layout|draft|publish|permalink|description|date|created|modified|lastmod|updated|published|cssclass|cssclasses|enabletoc|comments|lang|socialimage|socialdescription|password|unlisted)$/;
var renderers = {
  country,
  nation: country,
  former_country: country,
  person,
  officeholder: person,
  politician: person,
  royalty: person,
  monarch: person,
  military_person: person,
  biography: person,
  conflict,
  war: conflict,
  battle: conflict,
  military_conflict: conflict,
  election,
  conclave: election
};
var Infobox_default = ((opts) => {
  const typeKey = (opts?.typeKey ?? "infobox").toLowerCase();
  const Infobox = ({ fileData, allFiles }) => {
    const fields = normalizeKeys(fileData.frontmatter);
    const type = fields[typeKey];
    if (typeof type !== "string") return null;
    const infoboxType = renderers[type.trim().toLowerCase().replace(/[\s-]+/g, "_")];
    if (!infoboxType) return null;
    const original = /* @__PURE__ */ new Map();
    for (const key of Object.keys(fileData.frontmatter ?? {})) {
      original.set(key.trim().toLowerCase().replace(/[\s-]+/g, "_"), key.trim());
    }
    const extras = Object.entries(fields).filter(([key, value]) => !META.test(key) && !infoboxType.known.test(key) && hasValue(value)).map(([key, value]) => ({ label: original.get(key) ?? key, value }));
    const ctx = {
      src: fileData.slug,
      // Tag pages (tags/moremia) are generated by Quartz, not written by you, so they
      // must not make [[Moremia]] look like an existing page.
      extras,
      allSlugs: allFiles.map((f3) => f3.slug).filter((slug2) => typeof slug2 === "string" && !slug2.startsWith("tags/"))
    };
    const fallbackTitle = typeof fields.title === "string" ? fields.title : "";
    const box2 = infoboxType.render(fields, ctx, fallbackTitle);
    if (!box2) return null;
    return /* @__PURE__ */ u2(S, { children: [
      /* @__PURE__ */ u2("style", { "data-infobox-style": true, dangerouslySetInnerHTML: { __html: infobox_default } }),
      box2
    ] });
  };
  Infobox.afterDOMLoaded = infobox_inline_default;
  return Infobox;
});

export { Infobox_default as Infobox };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map