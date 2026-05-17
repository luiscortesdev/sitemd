import type { PageData } from "../build/build.types.js";

interface PageCacheEntry {
    hash: string;
    layout: string;
    outputDir: string;
    html: string;
    data: PageData;
}

interface LayoutCacheEntry {
    mtimeMs: number;
}

export interface SiteMDCache {
    version: number;
    pages: Record<string, PageCacheEntry>;
    layouts: Record<string, LayoutCacheEntry>;
    collections: Record<string, string[]>;
    pagination: string[];
}