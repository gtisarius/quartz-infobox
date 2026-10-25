import type { QuartzTransformerPlugin } from "@quartz-community/types";
import infoboxCss from "./components/styles/infobox.scss";
import linksCss from "./components/styles/links.scss";

export interface InfoboxPluginOptions {
  /** Frontmatter key that selects the infobox type. Defaults to "infobox". */
  typeKey?: string;
  /** Style article links like Wikipedia's (blue, red for missing pages). Defaults to true. */
  wikiLinks?: boolean;
}

/**
 * Ships the stylesheets. Quartz puts component CSS inside a cascade layer, and
 * unlayered theme CSS always beats layered CSS, so the styles go out as `inline`
 * external resources instead: Quartz writes those to their own unlayered files
 * (static/resource-style-*.css), loaded once for the whole site.
 */
const InfoboxStyles: QuartzTransformerPlugin<InfoboxPluginOptions> = (opts) => {
  const wikiLinks = opts?.wikiLinks ?? true;
  return {
    name: "InfoboxStyles",
    // Quartz only accepts a transformer that has at least one processing hook.
    // This one changes nothing; the plugin only needs externalResources below.
    htmlPlugins() {
      return [];
    },
    externalResources() {
      return {
        css: [
          { content: infoboxCss, inline: true },
          ...(wikiLinks ? [{ content: linksCss, inline: true }] : []),
        ],
      };
    },
  };
};

export default InfoboxStyles;
