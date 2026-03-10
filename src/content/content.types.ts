import type { PageFile } from "../types/PageFile.js";
import type { ParsedPageCache } from "../types/cache.types.js";

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