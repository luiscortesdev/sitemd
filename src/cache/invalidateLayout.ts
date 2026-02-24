import type { SiteMDCache } from "../types/cache.types.js";

export function invalidateLayout(layoutName: string, cache: SiteMDCache) {
    if (!cache) return
    for (const page in cache.pages) {
        if (cache.pages[page] && cache.pages[page].layout === layoutName) {
            delete cache.pages[page]
        }
    }
}