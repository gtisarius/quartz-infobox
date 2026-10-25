# quartz-infobox

Wikipedia-style infoboxes for [Quartz 5](https://quartz.jzhao.xyz), built from each page's frontmatter (Obsidian properties).

- Classic Wikipedia look: gray box, blue section bars, red links for pages that don't exist yet
- Follows Quartz's light/dark toggle; full width on phones
- Numbered fields with no upper limit (`leader_title1`, `leader_title2`, … `leader_title40`)
- `[[wikilinks]]`, `[[Page|label]]`, `**bold**` and `*italic*` work inside values
- Flat keys only, so every field stays editable in Obsidian's Properties panel

## Install

```bash
npx quartz plugin add github:gtisarius/quartz-infobox
```

This adds an entry to `quartz.config.yaml` that places the infobox in the `beforeBody` slot (priority 40, after the title and date). On wide screens it floats to the right of the article text, like Wikipedia.

## Use

Add `infobox: country` (or `nation`) to a page's frontmatter, then any of the fields below. Empty or missing fields are skipped, and a section bar only appears if something is under it.

```yaml
infobox: country
conventional_long_name: Kingdom of Vicus
common_name: Vicus
flag: img/flags/Vicus.png
capital: "[[Mogharbura]]"
leader_title1: King
leader_name1: "[[Yavon Avab I]]"
leader_title2: Chancellor
leader_name2: "[[Mari o-Khamary]]"
```

Wikilinks in YAML must be quoted (`"[[Mogharbura]]"`), otherwise YAML reads the brackets as a list. Any field can also be a list, which displays one item per line. Key names are case-insensitive, and spaces count as underscores, so `Common name` also works.

## Country fields

| Field | Shows as |
|---|---|
| `conventional_long_name` | Title at the top of the box (falls back to `common_name`, then the page title) |
| `common_name` | Short name, used in image alt text |
| `native_name` | Italic line under the title |
| `flag`, `flag_caption` | Flag image (caption defaults to "Flag") |
| `coat_of_arms`, `coat_of_arms_caption` | Coat of arms, beside the flag |
| `motto`, `anthem` | Centered lines under the images |
| `map`, `map_caption` | Map image |
| `status` | e.g. `Mandate of [[Selath]]` |
| `capital`, `largest_city` | Merged into "Capital and largest city" when they match |
| `largest_cities` | List |
| `official_languages`, `national_languages`, `recognized_languages`, `regional_languages` | |
| `ethnic_groups`, `state_religion`, `religion`, `demonym` | |
| `government_type` | "Government" row |
| `leader_titleN` + `leader_nameN` | One sub-row per officeholder, in number order |
| `legislatureN` + `upper_houseN` + `lower_houseN` | One block per legislature; the unnumbered `legislature` counts as 1 |
| `sovereignty_type` | Heading for the formation section (default "Formation") |
| `sovereignty_note` | Small note under that heading |
| `established_eventN` + `established_dateN` | One sub-row per event |
| `area`, `area_note` | "Area" section |
| `population_estimate`, `population_estimate_year` | "Population" section |
| `population_census`, `population_census_year`, `population_density` | |
| `currency`, `calendar` | |
| `preceded_by`, `succeeded_by` | Lists |

`N` is any whole number. Gaps are fine (1, 2, 5), and an unnumbered key counts as 1.

## Images

Write image paths relative to the `content` folder, e.g. `img/flags/Vicus.png` for `content/img/flags/Vicus.png`. An image that hasn't been uploaded yet is hidden instead of showing a broken icon.

## Options

| Option | Default | Description |
|---|---|---|
| `typeKey` | `infobox` | Frontmatter key that selects the infobox type |

## Why the styles are inline

Quartz wraps plugin CSS in a CSS `@layer`, and themes that ship unlayered stylesheets always beat layered CSS, which turned the box into a striped, low-contrast table. The plugin therefore renders its stylesheet as a `<style>` element next to the box.

## Development

```bash
npm install
npm test
npm run build
```

`dist/` is committed so Quartz can use it without building.
