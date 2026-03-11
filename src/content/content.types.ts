import type { ParsedPageCache } from "../cache/index.js";

export type PageFile = {
    absolutePath: string;
    relativePath: string;
    route: string;
    segments: string[];
}

interface CollectionItem {
    url: string;
    path: string;
    data: Record<string, any>;
}

export type Collections = Record<string, CollectionItem[]>

export interface CollectionPages {
    page: PageFile
    parsed: ParsedPageCache
}