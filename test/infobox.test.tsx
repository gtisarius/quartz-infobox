import { describe, expect, it } from "vitest";
import { render } from "preact-render-to-string";
import type { FullSlug } from "@quartz-community/types";
import Infobox from "../src/components/Infobox";
import { normalizeKeys, numberedGroups, resolveWikilink } from "../src/render";

const allSlugs = ["index", "nations/vicus", "nations/selath", "cities/mogharbura"] as FullSlug[];
const ctx = { src: "nations/vicus" as FullSlug, allSlugs };

const renderPage = (frontmatter: Record<string, unknown>, slug = "nations/vicus") => {
  const Component = Infobox();
  const vnode = Component({
    fileData: { slug, frontmatter },
    allFiles: allSlugs.map((s) => ({ slug: s })),
  } as never) as Parameters<typeof render>[0];
  return vnode ? render(vnode) : "";
};

describe("numberedGroups", () => {
  it("collects any number of numbered parameters in order", () => {
    const fields = normalizeKeys({
      leader_title1: "King",
      leader_name1: "A",
      leader_title12: "Twelfth",
      leader_name12: "L",
      leader_title3: "Chancellor",
      leader_name3: "C",
    });
    expect(numberedGroups(fields, ["leader_title", "leader_name"]).map((g) => g.leader_name)).toEqual(["A", "C", "L"]);
  });

  it("treats an unnumbered key as number 1", () => {
    const fields = normalizeKeys({ legislature: "Parliament", upper_house: "Congress", legislature2: "Diet" });
    const groups = numberedGroups(fields, ["legislature", "upper_house", "lower_house"]);
    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({ legislature: "Parliament", upper_house: "Congress" });
    expect(groups[1]).toMatchObject({ legislature: "Diet" });
  });
});

describe("resolveWikilink", () => {
  it("finds pages by file name, case-insensitively", () => {
    expect(resolveWikilink("Mogharbura", ctx)).toEqual({ href: "../cities/mogharbura", exists: true });
  });
  it("marks missing pages", () => {
    expect(resolveWikilink("Bazalagard", ctx).exists).toBe(false);
  });
});

describe("Infobox", () => {
  it("renders nothing without an infobox type", () => {
    expect(renderPage({ title: "Vicus" })).toBe("");
  });

  it("renders a country with leaders, legislature and red links", () => {
    const html = renderPage({
      title: "Vicus",
      infobox: "country",
      conventional_long_name: "Kingdom of Vicus",
      capital: "[[Mogharbura]]",
      largest_city: "[[Mogharbura]]",
      government_type: "Monarchy",
      leader_title1: "King",
      leader_name1: "[[Yavon Avab I]]",
      leader_title2: "Chancellor",
      leader_name2: "[[Mari o-Khamary|Mari]]",
      legislature: "Parliament",
      upper_house: "Congress",
      religion: ["[[Avabism]] (state)", "Shazism"],
    });
    expect(html).toContain("Kingdom of Vicus");
    expect(html).toContain("Capital and largest city");
    expect(html).toContain('href="../cities/mogharbura"');
    expect(html).toContain("infobox-redlink");
    expect(html).toContain(">Mari<");
    expect(html.indexOf("King")).toBeLessThan(html.indexOf("Chancellor"));
    expect(html).toContain("Upper house");
    expect(html).not.toContain("Lower house");
  });

  it("accepts Title Case keys with spaces", () => {
    const html = renderPage({ Infobox: "country", "Common name": "Selath", Demonym: "Selathine" });
    expect(html).toContain("Selathine");
  });
});

describe("person", () => {
  it("builds office blocks from numbered fields", () => {
    const html = renderPage({
      infobox: "person",
      name: "Sedorague Hufarii",
      office1: "[[Selathine Consulate|First Consul of the Selathine Republic]]",
      term_start1: 1758,
      term_end1: 1774,
      predecessor1: "*Established*",
      successor1: "[[Benedyri Asiguan]]",
      office2: "Governor of Pashed County",
      term_label2: "Tenure",
      term_start2: 1752,
      term_end2: 1753,
      born: "1724",
      rank: "General",
    });
    expect(html).toContain("First Consul of the Selathine Republic");
    expect(html).toContain("1758 – 1774");
    expect(html).toContain("Tenure");
    expect(html).toContain("Personal details");
    expect(html).toContain("Military service");
    expect(html.indexOf("First Consul")).toBeLessThan(html.indexOf("Governor of Pashed"));
  });

  it("reads Chronicler-style 'Offices held' lists", () => {
    const html = renderPage({
      infobox: "person",
      title: "Avab I",
      Burial: "[[Moghar's Grand Temple]]",
      "Titles held": [
        "**[[King of Vicus]]**\n* 1635 - 1659\n* Predecessor: \n   * [[Sagismar II of Vicus|Sagismar II]] (de jure)\n   * [[Yavon Tobit]] (de facto)\n* Successor: [[Toivan I of Vicus|Toivan I]]",
      ],
      "Offices held": ["**[[Chancellor of Vicus]]**\n* 1819 - 1821\n* [[King of Vicus|King]]: [[Avab II of Vicus|Avab II]]"],
      Medals: ["Order of the Lion"],
    });
    expect(html).toContain("infobox-office");
    expect(html).toContain("1635 - 1659");
    expect(html).toContain(">Predecessor<");
    expect(html).toContain("(de jure)");
    expect(html).toContain("Resting place");
    expect(html).toContain(">King<"); // linked label kept as a label
    expect(html).toContain("Awards");
  });
});

describe("conflict", () => {
  it("lays out any number of sides as columns", () => {
    const html = renderPage({
      infobox: "war",
      title: "Sello-Moremian War",
      subtitle: "Moremian War of Independence",
      Beginning: "1774, [[First Battle of Morev (1774)|First Battle of Morev]]",
      End: "1775, [[Fall of Pashed]]",
      "Combatants 1": ["[[First Selathine Republic]]", "* [[Deirdun province|Selathine Deirdun]]"],
      "Combatants 2": ["**Before late 1774**", "[[Moremian Confederation]]"],
      "Combatants 3": ["A third side"],
      "Commanders 1": ["[[Benedyri Asiguan]] †"],
    });
    expect(html).toContain("Belligerents");
    expect(html).toContain("Commanders and leaders");
    expect((html.match(/<td style="width:33\.333%;?"/g) ?? []).length).toBe(6);
    expect(html).toContain("Began");
    expect(html).toContain("Moremian War of Independence");
    expect(html).toContain("infobox-sub");
  });

  it("turns a 'Part of' subtitle into the part-of line", () => {
    const html = renderPage({ infobox: "conflict", subtitle: "Part of the [[Time of Troubles]]", Beginning: "1624", End: "1635" });
    expect(html).toContain("infobox-partof");
    expect(html).toContain("1624 – 1635");
  });
});

describe("election", () => {
  it("renders structured candidates in a labelled grid", () => {
    const html = renderPage({
      infobox: "election",
      election_name: "Zaphkenic election",
      previous_election: "[[Zaphkenic election of 1692|1692]]",
      next_election: "[[Zaphkenic election of 1780|1780]]",
      election_date: "1769 - 1770",
      party_label: "School",
      votes_label: "Electors",
      candidate1: "Kyonios tau'Avabias",
      party1: "[[Janurai school]]",
      votes1: 112,
      candidate2: "Kyonios tau'Avabias",
      party2: "[[Shimsi school]]",
      votes2: 25,
      office: "Zaphken",
      after_election: "[[Zaphken Kubael|Kubael]]",
    });
    expect(html).toContain("← ");
    expect(html).toContain(">School<");
    expect(html).toContain(">Electors<");
    expect(html).toContain("Elected Zaphken");
  });

  it("shows Chronicler-style candidate lists as columns, stripping old arrows", () => {
    const html = renderPage({
      infobox: "election",
      Previous: "← [[Zaphkenic election of 1692|1692]]",
      Next: "[[Zaphkenic election of 1780|1780]] →",
      Candidates: ["**Kubael**\n* 112 electors", "Other\n* 25 electors"],
    });
    expect(html.match(/←/g)?.length).toBe(1);
    expect(html.match(/→/g)?.length).toBe(1);
    expect(html).toContain("Candidates");
  });
});

describe("text formatting", () => {
  it("bolds a link wrapped in ** and ignores tag pages when resolving links", () => {
    const Component = Infobox();
    const vnode = Component({
      fileData: { slug: "people/x", frontmatter: { infobox: "person", born: "**[[Selath]]**, [[Moremia]]" } },
      allFiles: [{ slug: "people/x" }, { slug: "nations/selath" }, { slug: "tags/moremia" }],
    } as never) as Parameters<typeof render>[0];
    const html = render(vnode);
    expect(html).toContain('<b><a href="../nations/selath" class="internal">Selath</a></b>');
    expect(html).not.toContain("**");
    expect(html).toMatch(/infobox-redlink[^>]*>Moremia</);
  });
});

describe("extra fields", () => {
  it("shows unknown fields as rows with their original labels, and hides metadata", () => {
    const html = renderPage({
      infobox: "country",
      title: "Artian Empire",
      tags: ["artian empire"],
      layout: [{ type: "columns" }],
      "Full name": "Artian Empire",
      Government: "Absolute monarchy",
      Emperors: ["[[Slavari]] (583 - 614)", "[[Theobi I]] (651 - 688)"],
      "Historical era": "[[Classical era]] to [[Titanic era]]",
    });
    expect(html).toContain("Government");
    expect(html).toContain("Absolute monarchy");
    expect(html).toContain(">Emperors<");
    expect(html).toContain(">Historical era<");
    expect(html).not.toContain("columns");
    expect(html).not.toContain("artian empire<");
  });
});

describe("old Chronicler nation pages", () => {
  it("splits image: [flag, map] and resolves ../ paths from the page's folder", () => {
    const html = renderPage({
      infobox: "country",
      image: ["../img/flags/Vicus.png", "../img/maps/Vicus.png"],
      "Preceded by": "**Preceded by**<br>[[Kingdom of Morev]]",
    });
    expect(html).toContain('src="../img/flags/vicus.png"');
    expect(html).toContain('src="../img/maps/vicus.png"');
    expect(html).toContain("Flag");
    expect(html.match(/Preceded by/g)?.length).toBe(1);
  });
});
