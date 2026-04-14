import { areStringArraysEqual } from "../utils/comparisons.js";

import type { SiteMDCache } from "./index.js";
import type { CollectionsGraph } from "../collections/index.js";
import type { ParsedPages } from "../build/index.js";

function getChangedPageCollections(cache: SiteMDCache, collectionsGraph: CollectionsGraph): string[] {
    const changedPageCollections: string[] = []

    const cachedCollections = cache.collections

    for (const key in collectionsGraph) {
        const oldCollection = cachedCollections[key]
        const newCollection = collectionsGraph[key]
        
        if (!newCollection) continue

        if (!oldCollection || !areStringArraysEqual(oldCollection, newCollection)) {
            console.log("CACHED COLLECTION: ", cachedCollections[key])
            console.log("NEW COLLECTION", collectionsGraph[key])
            changedPageCollections.push(key)
        }
    }

    return changedPageCollections
}

export function invalidateCollections(cache: SiteMDCache, pages: ParsedPages[], collectionsGraph: CollectionsGraph) {
    const changedCollections: string[] = getChangedPageCollections(cache, collectionsGraph)
    const invalidLayoutCollections: string[] = []

    console.log("CHANGED COLLECTIONS", changedCollections)

    for (const page of pages) {
        const data = page.data
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