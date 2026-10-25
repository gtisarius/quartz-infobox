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
