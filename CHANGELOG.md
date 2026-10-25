# Changelog

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
