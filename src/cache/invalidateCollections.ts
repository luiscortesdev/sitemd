import type { SiteMDCache } from "./index.js";
import type { CollectionPages } from "../collections/index.js";
import type { CollectionsGraph } from "../collections/index.js";

function getChangedPageCollections(cache: SiteMDCache, collectionsGraph: CollectionsGraph): string[] {
    const changedPageCollections: string[] = []

    const cachedCollections = cache.collections

    for (const key in collectionsGraph) {
        if (!cachedCollections[key] || cachedCollections[key] !== collectionsGraph[key]) {
            changedPageCollections.push(key)
        }
    }

    return changedPageCollections
}

export function invalidateCollections(cache: SiteMDCache, pages: CollectionPages[], collectionsGraph: CollectionsGraph) {
    const changedCollections: string[] = getChangedPageCollections(cache, collectionsGraph)
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