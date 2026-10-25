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

Add `infobox:` with a type to a page's frontmatter, then any of the fields below. Empty or missing fields are skipped, and a section bar only appears if something is under it.

| `infobox:` | Also accepted | Modelled on Wikipedia's |
|---|---|---|
| `country` | `nation`, `former country` | Infobox country |
| `person` | `officeholder`, `politician`, `royalty`, `monarch`, `military person`, `biography` | Infobox officeholder / royalty / military person |
| `conflict` | `war`, `battle`, `military conflict` | Infobox military conflict |
| `election` | `conclave` | Infobox election |

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

Old Chronicler keys also work: `Full name`, `Official language`, `Religions`, `Government`, `Population`, and `image: [flag, map]` with `../` paths.

## Person fields

| Field | Shows as |
|---|---|
| `name` | Title (falls back to the page title) |
| `honorific_prefix`, `honorific_suffix`, `native_name`, `subtitle` | Small lines above/below the title |
| `image`, `image_caption` | Portrait |
| `officeN` | Blue bar for each office held, in number order |
| `orderN` | Shown before the office, e.g. `1st` |
| `term_startN`, `term_endN` (or `termN`) | "In office" line, e.g. 1758 – 1774 |
| `term_labelN` | Replaces "In office", e.g. `Reign` |
| `coronationN`, `monarchN`, `presidentN`, `prime_ministerN`, `chancellorN`, `vice_presidentN`, `deputyN`, `governorN`, `regentN` | "Serving with" rows inside the office block |
| `predecessorN`, `successorN` | Preceded by / Succeeded by |
| `office_noteN` | Small italic note under the office |
| `offices_held`, `titles_held` | Chronicler-style lists (see below) |
| `born` (or `birth_name` + `birth_date` + `birth_place`) | |
| `died` (or `death_date` + `death_place`), `cause_of_death`, `resting_place` | |
| `nationality`, `citizenship`, `party`, `other_party` | |
| `consort`, `spouse`, `partner`, `children`, `issue`, `parents`, `father`, `mother`, `relatives`, `family`, `house`, `dynasty` | Labels become plural for lists of several |
| `religion`, `residence`, `education`, `alma_mater`, `occupation`, `profession`, `known_for`, `nickname`, `signature` | |
| `allegiance`, `branch`, `years_of_service`, `rank`, `unit`, `commands`, `battles`, `awards` | "Military service" section |

"Personal details" gets its own bar only when office blocks sit above it, as on Wikipedia.

**Chronicler-style office lists.** Each item's first line becomes the office bar. `Label: value` lines become rows (the label can be a link), more-indented `* ` lines under a label join its value, lines containing a year become the term, and anything else becomes a small italic note:

```yaml
Offices held:
  [
    "**[[Chancellor of Vicus]]**

      * 1819 - 1821

      * [[King of Vicus|King]]: [[Avab II of Vicus|Avab II]]

      * Preceded by: [[Toivan Slavari o-Sanctis]]"
  ]
```

Also accepted: `Burial`, `Consorts`, `Service` (branch), `Combat` / `Conflicts` (battles), `Medals` (awards).

## Conflict fields

| Field | Shows as |
|---|---|
| `conflict` | Title (falls back to the page title) |
| `part_of` | "Part of …" line under the title |
| `other_names` | Italic line under the title |
| `image`, `image_caption` | |
| `date` (or `date_start` + `date_end`) | Combined as "1624 – 1635" when both are short, otherwise "Began" / "Ended" rows |
| `place`, `status`, `result`, `territory`, `major_battles` | |
| `combatantN` | "Belligerents": one column per side, as many sides as you number |
| `commanderN`, `unitsN`, `strengthN`, `casualtiesN` | Same columns, under their own bars |
| `casualties_note`, `notes` | Small notes at the bottom |

A Chronicler `subtitle` becomes the "Part of" line if it starts with "Part of", otherwise an alternative name. Also accepted: `Beginning`, `End`, `Location`, `Outcome`, `Major Battles`, `Combatants 1`, `Commanders 1`, …

Inside a column, a list item starting with `* ` is indented as a member of the line above it, and `**Supported by**` lines become bold sub-headings.

## Election fields

| Field | Shows as |
|---|---|
| `election_name` | Title (falls back to the page title); `subtitle` below it |
| `previous_election`, `election_date`, `next_election` | "← 1692 · date · 1780 →" row |
| `country`, `type`, `location`, `registered`, `electors`, `ballots`, `majority`, `turnout` | |
| `candidateN`, `imageN` | Candidate columns (3 across; 4 split 2 + 2) |
| `partyN`, `leaderN`, `running_mateN`, `home_stateN`, `votesN`, `percentageN`, `seatsN`, `seat_changeN`, `electoral_voteN`, `noteN` | Rows under each candidate |
| `party_label`, `votes_label`, `seats_label` | Rename those rows, e.g. `School`, `Electors` for a conclave |
| `office`, `before_election`, `before_party`, `after_election`, `after_party` | "{office} before election" / "Elected {office}" at the bottom |
| `candidates` | Chronicler-style list: each item's first line is the name, `* ` lines below |

Also accepted: `Previous`, `Next` (old arrows are removed), `Date`, `nomineeN`, `popular_voteN`, `schoolN`.

## Fields an infobox doesn't know

Nothing is dropped: any field a type doesn't recognize appears as a plain row at the bottom, labelled exactly as you wrote the key (`Emperors`, `Historical era`). Metadata such as `tags`, `aliases`, `title`, `date` and the old Chronicler `layout` block is never shown.

## Images

Write image paths relative to the `content` folder, e.g. `img/flags/Vicus.png` for `content/img/flags/Vicus.png`. An image that hasn't been uploaded yet is hidden instead of showing a broken icon.

## Options

| Option | Default | Description |
|---|---|---|
| `typeKey` | `infobox` | Frontmatter key that selects the infobox type |
| `wikiLinks` | `true` | Style article links like Wikipedia: blue for existing pages, red for missing ones, no highlight boxes. Tag links keep the theme's style. |

For red links, Quartz has to mark links to missing pages. Turn that on in the crawl-links plugin:

```yaml
  - source: "@quartz-community/crawl-links"
    options:
      markdownLinkResolution: shortest
      disableBrokenWikilinks: true
```

## How the styles load

Quartz wraps component CSS in a CSS `@layer`, and themes that ship unlayered stylesheets always beat layered CSS, which turned the box into a striped, low-contrast table. So the plugin is also a small transformer whose only job is to hand Quartz its stylesheets as `inline` external resources; Quartz writes those to unlayered files (`static/resource-style-*.css`) loaded once for the whole site.

## Links

Links follow Quartz's own "shortest path" rule, so `[[Mogharbura]]` finds `cities/Mogharbura.md` wherever it lives. Links to pages that don't exist yet are red. Quartz's automatic tag pages don't count as pages.

## Development

```bash
npm install
npm test
npm run build
```

`dist/` is committed so Quartz can use it without building.
