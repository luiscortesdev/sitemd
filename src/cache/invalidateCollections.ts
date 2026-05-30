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

function getChangedPageCollections(cache: SiteMDCache, collectionsGraph: CollectionsGraph): Set<string> {
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
): { changedCollections: Set<string>, layoutsWithChangedCollections: string[], collectionsWithChangedPages: Set<string> } {
    const changedCollections = getChangedPageCollections(cache, collectionsGraph)
    const layoutsWithChangedCollections: string[] = []
    const collectionsWithChangedPages = getCollectionsWithChangedPages(cache, pages, collectionsGraph)

    logger.debug("CHANGED COLLECTIONS", changedCollections)

    for (const page of pages) {
        const data = page.data
        const pageUsedCollections: string[] = data.usesCollections ?? []
        const pageLayout = data.layout.endsWith(".njk") ? data.layout : data.layout + ".njk"

        pageUsedCollections.forEach(collection => {
            if (changedCollections.has(collection)) {
                layoutsWithChangedCollections.push(pageLayout)
            }
        });
    }

    return { changedCollections, layoutsWithChangedCollections, collectionsWithChangedPages }
}