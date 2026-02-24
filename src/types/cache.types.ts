export interface PageCacheEntry {
    hash: string;
    layout: string;
    outputDir: string;
}

export interface LayoutCacheEntry {
    mtimeMs: number;
}

export interface SiteMDCache {
    version: number;
    pages: Record<string, PageCacheEntry>;
    layouts: Record<string, LayoutCacheEntry>;
}