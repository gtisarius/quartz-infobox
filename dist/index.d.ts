export { Infobox, InfoboxOptions } from './components/index.js';
import { FullSlug } from '@quartz-community/types';

/** Context needed to turn [[wikilinks]] and image paths into working URLs. */
interface RenderCtx {
    /** Slug of the page the infobox is on, e.g. "nations/vicus". */
    src: FullSlug;
    /** Slugs of every page on the site, used to resolve links and spot missing pages. */
    allSlugs: FullSlug[];
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
};
/** URL for an image path written relative to the content folder, e.g. img/flags/Vicus.png. */
declare function resolveAsset(path: string, ctx: RenderCtx): string;

export { normalizeKeys, numberedGroups, resolveAsset, resolveWikilink };
