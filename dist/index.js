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
  const first = args[0];
  const last = args[args.length - 1];
  if (first?.startsWith("/")) {
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
  const cleaned = path.trim().replace(/^!?\[\[/, "").replace(/\]\]$/, "").split("|")[0].trim().replace(/^\.?\//, "");
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(cleaned)) return cleaned;
  return joinSegments(pathToRoot(ctx.src), slugifyFilePath(cleaned));
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
function renderLine(line, ctx, keyPrefix) {
  const out = [];
  let last = 0;
  let i2 = 0;
  for (const match of line.matchAll(WIKILINK)) {
    if (match.index > last) {
      out.push(...renderEmphasis(line.slice(last, match.index), `${keyPrefix}t${i2}`));
    }
    const inner = match[1];
    const pipe = inner.indexOf("|");
    const target = (pipe === -1 ? inner : inner.slice(0, pipe)).trim();
    const label = pipe === -1 ? target.replace(/#/, " \u203A ") : inner.slice(pipe + 1).trim();
    const { href, exists } = resolveWikilink(target, ctx);
    out.push(
      exists ? /* @__PURE__ */ u2("a", { href, class: "internal", children: label }, `${keyPrefix}l${i2}`) : /* @__PURE__ */ u2(
        "a",
        {
          href,
          class: "internal infobox-redlink",
          title: `${target} (page does not exist yet)`,
          children: label
        },
        `${keyPrefix}l${i2}`
      )
    );
    last = match.index + match[0].length;
    i2++;
  }
  if (last < line.length) out.push(...renderEmphasis(line.slice(last), `${keyPrefix}t${i2}`));
  return out;
}
function scalarToText(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return String(value).trim();
}
function renderInline(value, ctx, keyPrefix = "v") {
  const lines = scalarToText(value).split(/\r?\n/);
  const out = [];
  lines.forEach((line, n2) => {
    if (n2 > 0) out.push(/* @__PURE__ */ u2("br", {}, `${keyPrefix}br${n2}`));
    out.push(...renderLine(line, ctx, `${keyPrefix}${n2}`));
  });
  return out;
}
function renderValue(value, ctx) {
  if (Array.isArray(value)) {
    const items = value.filter(hasValue);
    if (items.length === 1) return renderInline(items[0], ctx);
    return /* @__PURE__ */ u2("ul", { class: "infobox-plainlist", children: items.map((item, n2) => /* @__PURE__ */ u2("li", { children: renderInline(item, ctx, `li${n2}`) }, n2)) });
  }
  return renderInline(value, ctx);
}
function plainText(value) {
  return scalarToText(value).replace(WIKILINK, (_m, inner) => inner.split("|").at(-1)).replace(/\*+/g, "").trim().toLowerCase();
}

// src/country.tsx
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
  /** Row for a single frontmatter key. */
  field(key, label, opts = {}) {
    return this.row(label, this.fields[key], opts);
  }
  /** A full-width blue section bar. */
  header(text) {
    this.rows.push(
      /* @__PURE__ */ u2("tr", { children: /* @__PURE__ */ u2("th", { colSpan: 2, class: "infobox-header", children: text }) }, this.key())
    );
  }
  /** A full-width centered row (images, motto, anthem). */
  full(content, className = "infobox-full") {
    this.rows.push(
      /* @__PURE__ */ u2("tr", { children: /* @__PURE__ */ u2("td", { colSpan: 2, class: className, children: content }) }, this.key())
    );
  }
  /** Adds a header only if the rows that follow produce something. */
  section(title, build) {
    const headerAt = this.rows.length;
    this.header(title);
    const before = this.rows.length;
    build();
    if (this.rows.length === before) this.rows.splice(headerAt, 1);
  }
};
function image(path, alt, ctx, className) {
  if (!hasValue(path)) return null;
  const src = resolveAsset(String(Array.isArray(path) ? path[0] : path), ctx);
  return /* @__PURE__ */ u2("img", { src, alt, class: className, loading: "lazy" });
}
function renderCountry(fields, ctx, fallbackTitle) {
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
  return /* @__PURE__ */ u2("table", { class: "infobox infobox-country", children: [
    /* @__PURE__ */ u2("caption", { class: "infobox-title", children: [
      renderInline(title, ctx),
      hasValue(fields.native_name) ? /* @__PURE__ */ u2("div", { class: "infobox-native-name", children: renderValue(fields.native_name, ctx) }) : null
    ] }),
    /* @__PURE__ */ u2("tbody", { children: r2.rows })
  ] });
}

// src/components/styles/infobox.scss
var infobox_default = ':root body table.infobox.infobox {\n  --ib-bg: #f8f9fa;\n  --ib-border: #a2a9b1;\n  --ib-text: #202122;\n  --ib-header-bg: #cedff2;\n  --ib-link: #3366cc;\n  --ib-redlink: #d73333;\n  --ib-muted: #54595d;\n  float: right;\n  clear: right;\n  width: 22em;\n  max-width: 100%;\n  margin: 0 0 1em 1.25em;\n  padding: 0.2em;\n  border: 1px solid var(--ib-border);\n  border-spacing: 3px;\n  border-collapse: separate;\n  background: var(--ib-bg);\n  color: var(--ib-text);\n  font-size: 88%;\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif;\n  line-height: 1.4em;\n  overflow-wrap: anywhere;\n  border-radius: 0;\n  margin-block: 0 1em;\n}\n:root body table.infobox.infobox tbody,\n:root body table.infobox.infobox tr,\n:root body table.infobox.infobox tbody tr:nth-child(odd),\n:root body table.infobox.infobox tbody tr:nth-child(even) {\n  background: none;\n  border: none;\n  color: var(--ib-text);\n  font-family: inherit;\n  font-size: inherit;\n  line-height: inherit;\n}\n:root body table.infobox.infobox caption.infobox-title {\n  caption-side: top;\n  padding: 0.2em 0.4em 0.3em;\n  font-size: 125%;\n  font-weight: bold;\n  line-height: 1.3em;\n  text-align: center;\n  color: var(--ib-text);\n}\n:root body table.infobox.infobox .infobox-native-name {\n  font-size: 80%;\n  font-weight: normal;\n  font-style: italic;\n}\n:root body table.infobox.infobox th,\n:root body table.infobox.infobox td {\n  padding: 0.15em 0.3em;\n  border: none;\n  border-radius: 0;\n  font-family: inherit;\n  font-size: inherit;\n  font-weight: normal;\n  line-height: inherit;\n  vertical-align: top;\n  text-align: left;\n  background: none;\n  color: var(--ib-text);\n}\n:root body table.infobox.infobox th.infobox-label {\n  width: 40%;\n  font-weight: bold;\n}\n:root body table.infobox.infobox tr.infobox-subrow th.infobox-label {\n  font-weight: normal;\n  padding-left: 0.6em;\n}\n:root body table.infobox.infobox .infobox-bullet {\n  font-weight: bold;\n}\n:root body table.infobox.infobox th.infobox-header {\n  background: var(--ib-header-bg);\n  text-align: center;\n  font-weight: bold;\n  padding: 0.25em 0.4em;\n}\n:root body table.infobox.infobox td.infobox-full {\n  text-align: center;\n}\n:root body table.infobox.infobox td.infobox-note {\n  font-size: 90%;\n  color: var(--ib-muted);\n}\n:root body table.infobox.infobox .infobox-images figure {\n  margin: 0.25em auto;\n}\n:root body table.infobox.infobox .infobox-images figcaption {\n  font-size: 90%;\n  line-height: 1.3em;\n  padding-top: 0.2em;\n}\n:root body table.infobox.infobox .infobox-symbols {\n  display: flex;\n  justify-content: space-around;\n  align-items: flex-end;\n  gap: 0.5em;\n}\n:root body table.infobox.infobox .infobox-symbols figure {\n  flex: 1 1 0;\n  margin: 0;\n}\n:root body table.infobox.infobox img {\n  display: block;\n  margin: 0 auto;\n  max-width: 100%;\n  height: auto;\n  border-radius: 0;\n}\n:root body table.infobox.infobox img.infobox-flag {\n  max-height: 7em;\n  border: 1px solid var(--ib-border);\n}\n:root body table.infobox.infobox img.infobox-coat {\n  max-height: 7em;\n}\n:root body table.infobox.infobox img.infobox-map {\n  max-height: 18em;\n}\n:root body table.infobox.infobox ul.infobox-plainlist {\n  color: inherit;\n  line-height: inherit;\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n:root body table.infobox.infobox ul.infobox-plainlist li {\n  margin: 0;\n  padding: 0;\n  color: inherit;\n  line-height: inherit;\n  font-size: inherit;\n}\n:root body table.infobox.infobox a.internal {\n  color: var(--ib-link);\n  background: none;\n  padding: 0;\n  border-radius: 0;\n  font-weight: normal;\n  text-decoration: none;\n}\n:root body table.infobox.infobox a.internal:hover {\n  text-decoration: underline;\n}\n:root body table.infobox.infobox a.internal.infobox-redlink {\n  color: var(--ib-redlink);\n}\n\n:root[saved-theme=dark] body table.infobox.infobox {\n  --ib-bg: #202122;\n  --ib-border: #54595d;\n  --ib-text: #eaecf0;\n  --ib-header-bg: #2c3a52;\n  --ib-link: #88a3e8;\n  --ib-redlink: #fd7865;\n  --ib-muted: #a2a9b1;\n}\n\n@media (max-width: 800px) {\n  :root body table.infobox.infobox {\n    float: none;\n    width: 100%;\n    margin: 0 0 1em 0;\n  }\n}';

// src/components/scripts/infobox.inline.ts
var infobox_inline_default = 'function o(){for(let e of document.querySelectorAll(".infobox img")){let n=()=>{let r=e.closest("figure")??e;r.style.display="none";let t=e.closest("tr");t&&![...t.querySelectorAll("figure, img")].some(s=>s.style.display!=="none")&&(t.style.display="none")};e.complete&&e.naturalWidth===0?n():(e.addEventListener("error",n,{once:!0}),window.addCleanup?.(()=>e.removeEventListener("error",n)))}}document.addEventListener("nav",o);document.addEventListener("render",o);\n';

// src/components/Infobox.tsx
var renderers = {
  country: renderCountry,
  nation: renderCountry
};
var Infobox_default = ((opts) => {
  const typeKey = (opts?.typeKey ?? "infobox").toLowerCase();
  const Infobox = ({ fileData, allFiles }) => {
    const fields = normalizeKeys(fileData.frontmatter);
    const type = fields[typeKey];
    if (typeof type !== "string") return null;
    const render = renderers[type.trim().toLowerCase()];
    if (!render) return null;
    const ctx = {
      src: fileData.slug,
      allSlugs: allFiles.map((f3) => f3.slug).filter(Boolean)
    };
    const fallbackTitle = typeof fields.title === "string" ? fields.title : "";
    const box = render(fields, ctx, fallbackTitle);
    if (!box) return null;
    return /* @__PURE__ */ u2(S, { children: [
      /* @__PURE__ */ u2("style", { "data-infobox-style": true, dangerouslySetInnerHTML: { __html: infobox_default } }),
      box
    ] });
  };
  Infobox.afterDOMLoaded = infobox_inline_default;
  return Infobox;
});

export { Infobox_default as Infobox, normalizeKeys, numberedGroups, resolveAsset, resolveWikilink };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map