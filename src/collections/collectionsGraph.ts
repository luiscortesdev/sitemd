import { loadCache } from "../cache/index.js";

import type { ParsedPages } from "../build/build.types.js";
import type { CollectionsGraph } from "./collections.types.js";

export async function buildCollectionsGraph(parsedPages: ParsedPages[]) {
    const cache = await loadCache()

    let collectionsGraph: CollectionsGraph = {}
    
    for (const { page, parsed, hash } of parsedPages) {
        const cached = cache.pages[page.absolutePath]

        let collections;

        if (cached && cached.hash === hash && cached.data?.collections) {
            collections = cached.data.collections
        } else {
            collections = parsed.data.collections
        }

        if (!collections) continue


        for (const collection of collections) {
            if (!collectionsGraph[collection]) {
                collectionsGraph[collection] = [page.absolutePath]
            } else {
                collectionsGraph[collection].push(page.absolutePath)
            }
        }
    }

    return collectionsGraph
}