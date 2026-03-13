import type { Collections } from "./content.types.js"
import type { CollectionPages } from "./content.types.js"

export function buildCollections(pages: CollectionPages[]): Collections {
    const collections: Collections = {}
    collections["all"] = []

    for (const page of pages) {
        const { data } = page.parsed
        const { route, absolutePath } = page.page

        if (!data?.collections) { 
            data.collections = ["none"]
        }

        // Add the all tag to every page
        data.collections.push("all")

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


    return collections
}