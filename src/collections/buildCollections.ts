import { loadCache } from "../cache/index.js"
import type { Collections, CollectionPages } from "./collections.types.js"

export async function buildCollections(pages: CollectionPages[]): Promise<Collections> {
    const cache = await loadCache()

    const collections: Collections = {}
    collections["all"] = []

    for (const page of pages) {
        const { route, absolutePath } = page.page

        const cached = cache.pages[absolutePath]
        
        // If the page is cached, the cached hash matches the current hash, and it has an array of collections cached, then we can skip parsing its
        // collections.
        if (cached && cached.hash === page.hash && cached.parsed?.data.collections) {
            const collectionsArray = cached.parsed.data.collections
            const { data } = cached.parsed

            for (const collectionName of collectionsArray) {

                if (!collections[collectionName]) {
                    collections[collectionName] = []
                }

                collections[collectionName].push({
                    ...data,
                    url: route,
                    path: absolutePath
                })
            }
        } else {
            const { data } = page.parsed
        

            if (!data?.collections) { 
                data.collections = ["none"]
            }

            // Add the all tag to every page if it does not already have it.
            if (!data.collections.includes("all")) {
                data.collections.push("all")
            }

            const collectionsArray: string[] = data.collections
            
            // Go through every collection in the page's data and add it to the collections array.
            for (const collectionName of collectionsArray) {
                if (!collections[collectionName]) {
                    collections[collectionName] = []
                }

                collections[collectionName].push({
                    ...data,
                    url: route,
                    path: absolutePath
                })
            }
        }

    }


    return collections
}