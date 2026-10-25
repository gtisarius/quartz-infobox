import { QuartzComponent } from '@quartz-community/types';

interface InfoboxOptions {
    /** Frontmatter key that names the infobox type. Defaults to "infobox". */
    typeKey?: string;
}
declare const _default: (opts?: InfoboxOptions) => QuartzComponent;

export { _default as Infobox, type InfoboxOptions };
