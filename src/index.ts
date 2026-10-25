// The transformer is the default export: Quartz uses it to load the stylesheets.
// The Infobox component itself is registered from ./components via the manifest.
export { default } from "./transformer";
export type { InfoboxPluginOptions } from "./transformer";
export { default as Infobox } from "./components/Infobox";
export type { InfoboxOptions } from "./components/Infobox";
export { numberedGroups, normalizeKeys, resolveWikilink, resolveAsset } from "./render";
