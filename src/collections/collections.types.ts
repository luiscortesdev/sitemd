import type { ParsedPageCache } from "../cache/index.js";
import type { PageFile } from "../content/index.js"

export interface CollectionItem {
    url: string;
    path: string;
}

export type Collections = Record<string, CollectionItem[]>

export interface CollectionPages {
    page: PageFile;
    parsed: ParsedPageCache;
    hash: string;
}

export type CollectionsGraph = Record<string, string[]>