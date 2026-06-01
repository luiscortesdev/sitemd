import { areStringArraysEqual, logger } from "../utils/index.js";

import type { SiteMDCache } from "./index.js";
import type { CollectionsGraph } from "../collections/index.js";
import type { ParsedPages } from "../build/index.js";

function getCollectionsWithChangedPages(cache: SiteMDCache, parsedPages: ParsedPages[], collectionsGraph: CollectionsGraph): Set<string> {
    const collectionsWithChangedPages = new Set<string>()

    for (const key in collectionsGraph) {
        const currentCollection = collectionsGraph[key]

        currentCollection?.forEach(path => {
            let hash = ""
            for (const page of parsedPages) {
                if (page.page.absolutePath === path) {
                    hash = page.hash
                    break
                }
            }

            if (cache.pages[path]?.hash !== hash) {
                collectionsWithChangedPages.add(key)
            }
        })
    }

    return collectionsWithChangedPages
}

function getCollectionsWithMemberChanges(cache: SiteMDCache, collectionsGraph: CollectionsGraph): Set<string> {
    // Ensure that the pages that are a part of each collection are the same.
    // If a page was entirely deleted or an entirely new page was create, we want to make 
    // the collection that page belongs to as changed.
    
    const changedPageCollections = new Set<string>()

    const cachedCollections = cache.collections

    for (const key in collectionsGraph) {
        const oldCollection = cachedCollections[key]
        const newCollection = collectionsGraph[key]
        
        if (!newCollection) continue

        if (!oldCollection || !areStringArraysEqual(oldCollection, newCollection)) {
            logger.debug("CACHED COLLECTION: ", cachedCollections[key])
            logger.debug("NEW COLLECTION", collectionsGraph[key])

            changedPageCollections.add(key)
        }
    }

    for (const key in cachedCollections) {
        const oldCollection = cachedCollections[key]
        const newCollection = collectionsGraph[key]
        
        if (!oldCollection) continue

        if (!newCollection || !areStringArraysEqual(oldCollection, newCollection)) {
            logger.debug("CACHED COLLECTION: ", cachedCollections[key])
            logger.debug("NEW COLLECTION", collectionsGraph[key])

            changedPageCollections.add(key)
        }
    }

    return changedPageCollections
}

export function invalidateCollections(
    cache: SiteMDCache,
    pages: ParsedPages[],
    collectionsGraph: CollectionsGraph,
): { collectionsWithMemberChanges: Set<string>, layoutsWithChangedCollections: string[], collectionsWithChangedPages: Set<string> } {
    const collectionsWithMemberChanges = getCollectionsWithMemberChanges(cache, collectionsGraph)
    const layoutsWithChangedCollections: string[] = []
    const collectionsWithChangedPages = getCollectionsWithChangedPages(cache, pages, collectionsGraph)

    logger.debug("COLLECTIONS WITH MEMBER CHANGES", collectionsWithMemberChanges)

    for (const page of pages) {
        const data = page.data
        const pageUsedCollections: string[] = data.usesCollections ?? []
        const pageLayout = data.layout.endsWith(".njk") ? data.layout : data.layout + ".njk"

        pageUsedCollections.forEach(collection => {
            if (collectionsWithMemberChanges.has(collection)) {
                layoutsWithChangedCollections.push(pageLayout)
            }
        });
    }

    return { collectionsWithMemberChanges, layoutsWithChangedCollections, collectionsWithChangedPages }
}