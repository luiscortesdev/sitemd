import type { SiteMDCache } from "./index.js";
import type { CollectionPages } from "../collections/index.js";

function getChangedPageCollections(cache: SiteMDCache, pages: CollectionPages[]): string[] {
    const changedPageCollections: string[] = []

    for (const page of pages) {
        const { data } = page.parsed
        const pageCache = cache.pages[page.page.absolutePath]

        if (!pageCache || !data) continue

        if (!data?.collections) { 
            data.collections = ["none"]
        }

        // Add the all tag to every page if it does not already have it.
        if (!data.collections.includes("all")) {
            data.collections.push("all")
        }
        
        const cachedCollections = pageCache.parsed?.data.collections
        const currentCollections = data.collections

        if (currentCollections !== cachedCollections) {
            currentCollections.forEach((collection: string) => {
                if (!cachedCollections.includes(collection) && !changedPageCollections.includes(collection)) {
                    changedPageCollections.push(collection)
                }
            })

            cachedCollections.forEach((collection: string) => {
                if (!currentCollections.includes(collection) && !changedPageCollections.includes(collection)) {
                    changedPageCollections.push(collection)
                }
            })
        }

    }

    return changedPageCollections
}

export function invalidateCollections(cache: SiteMDCache, pages: CollectionPages[]) {
    const changedCollections: string[] = getChangedPageCollections(cache, pages)
    const invalidLayoutCollections: string[] = []

    for (const page of pages) {
        const { data } = page.parsed
        const pageUsedCollections: string[] = data.usesCollections ?? []
        const pageLayout = data.layout.endsWith(".njk") ? data.layout : data.layout + ".njk"

        pageUsedCollections.forEach(collection => {
            if (changedCollections.includes(collection)) {
                invalidLayoutCollections.push(pageLayout)
            }
        });
    }

    return invalidLayoutCollections
}