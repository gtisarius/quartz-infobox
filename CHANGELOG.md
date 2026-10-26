# Changelog

## 0.4.0

- New `religion` infobox (Wikipedia's Infobox religion order; reads the Chronicler religion keys as written).
- New `ideology` infobox with Beliefs / Relationships / Symbols sections and colour swatches.
- New `generic` infobox: every field as a row.
- New "Part of a series on …" sidebars: defined once with `infobox: series`, shown on any page with `series:`. Collapsible sections, current page bold and its section open, optional accent colour.
- Links to the page you're on are shown in bold instead of as a link.
- Religion, ideology and generic boxes with no filled-in fields are not drawn.

## 0.3.0

- Wikipedia-style article links: blue for existing pages, red for missing ones, no highlight boxes (`wikiLinks: false` turns this off). Needs `disableBrokenWikilinks: true` on the crawl-links plugin for the red links.
- Styles are now loaded once per site as unlayered stylesheets instead of inlined on every page. The plugin is now both a transformer and a component.

## 0.2.1

- A lone `Predecessor:` / `Successor:` (no numbered office) is shown instead of dropped.
- Unquoted `[[Page]]` values, which YAML reads as a nested list, render as links.
- Image captions are centered.

## 0.2.0

- New `person`, `conflict` and `election` infoboxes, with unlimited numbered offices, sides and candidates.
- Reads old Chronicler frontmatter directly (`Offices held`, `Combatants 1`, `Candidates`, `Full name`, `image: [flag, map]`, …).
- Fields a type doesn't know are shown as extra rows instead of being dropped.
- `<br>`, indented `* ` sub-items, and bold or italic wrapped around links now render properly.
- Quartz tag pages no longer make missing pages look like they exist.

## 0.1.0

- First version: `country` infobox with unlimited numbered leaders, legislatures and formation events.
