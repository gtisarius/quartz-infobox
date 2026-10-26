import { QuartzTransformerPlugin, FullSlug } from '@quartz-community/types';
export { Infobox, InfoboxOptions } from './components/index.js';

interface InfoboxPluginOptions {
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
declare const InfoboxStyles: QuartzTransformerPlugin<InfoboxPluginOptions>;

/** Context needed to turn [[wikilinks]] and image paths into working URLs. */
interface RenderCtx {
    /** Slug of the page the infobox is on, e.g. "nations/vicus". */
    src: FullSlug;
    /** Slugs of every page on the site, used to resolve links and spot missing pages. */
    allSlugs: FullSlug[];
    /** Fields the infobox type doesn't know, shown as plain rows at the bottom. */
    extras?: {
        label: string;
        value: unknown;
    }[];
}
/** Frontmatter with keys normalized: lowercase, spaces/hyphens turned into underscores. */
type Fields = Record<string, unknown>;
declare function normalizeKeys(frontmatter: Record<string, unknown> | undefined): Fields;
/**
 * Collect numbered parameters the way Wikipedia infoboxes do.
 * For bases ["leader_title", "leader_name"], this finds leader_title / leader_title1 /
 * leader_title2 / ... with no upper limit. An unnumbered key counts as number 1.
 * Returns one record per number, in numeric order, skipping numbers where every field is empty.
 */
declare function numberedGroups(fields: Fields, bases: string[]): Record<string, unknown>[];
/** Find the page a wikilink points at, using Quartz's "shortest path" rule. */
declare function resolveWikilink(target: string, ctx: RenderCtx): {
    href: string;
    exists: boolean;
    self: boolean;
};
/** URL for an image path written relative to the content folder, e.g. img/flags/Vicus.png. */
declare function resolveAsset(path: string, ctx: RenderCtx): string;

export { type InfoboxPluginOptions, InfoboxStyles as default, normalizeKeys, numberedGroups, resolveAsset, resolveWikilink };
