import type {
  FullSlug,
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types";
import type { VNode } from "preact";
import { renderCountry } from "../country";
import { type Fields, type RenderCtx, normalizeKeys } from "../render";
import style from "./styles/infobox.scss";
// @ts-expect-error - inline script import handled by the bundler
import script from "./scripts/infobox.inline.ts";

export interface InfoboxOptions {
  /** Frontmatter key that names the infobox type. Defaults to "infobox". */
  typeKey?: string;
}

type Renderer = (fields: Fields, ctx: RenderCtx, fallbackTitle: string) => VNode | null;

/** Infobox types, keyed by the value of `infobox:` in a page's frontmatter. */
const renderers: Record<string, Renderer> = {
  country: renderCountry,
  nation: renderCountry,
};

export default ((opts?: InfoboxOptions) => {
  const typeKey = (opts?.typeKey ?? "infobox").toLowerCase();

  const Infobox: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
    const fields = normalizeKeys(fileData.frontmatter as Record<string, unknown> | undefined);
    const type = fields[typeKey];
    if (typeof type !== "string") return null;
    const render = renderers[type.trim().toLowerCase()];
    if (!render) return null;

    const ctx: RenderCtx = {
      src: fileData.slug as FullSlug,
      allSlugs: allFiles.map((f) => f.slug).filter(Boolean) as FullSlug[],
    };
    const fallbackTitle = typeof fields.title === "string" ? fields.title : "";
    const box = render(fields, ctx, fallbackTitle);
    if (!box) return null;
    // Quartz puts plugin CSS (Component.css) inside an @layer, and unlayered theme CSS
    // always beats layered CSS. Shipping the styles as a plain <style> keeps the
    // infobox looking like Wikipedia whatever theme is active.
    return (
      <>
        <style data-infobox-style dangerouslySetInnerHTML={{ __html: style }} />
        {box}
      </>
    );
  };

  Infobox.afterDOMLoaded = script;
  return Infobox;
}) satisfies QuartzComponentConstructor<InfoboxOptions>;
