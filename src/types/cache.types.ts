export interface ParsedPageCache {
    html: string;
    data: Record<string, any>;
}

interface PageCacheEntry {
    hash: string;
    layout: string;
    outputDir: string;

    parsed?: ParsedPageCache;
}

interface LayoutCacheEntry {
    mtimeMs: number;
}

export interface SiteMDCache {
    version: number;
    pages: Record<string, PageCacheEntry>;
    layouts: Record<string, LayoutCacheEntry>;
}