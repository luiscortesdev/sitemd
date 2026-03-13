import type { Collections } from "./content.types.js"
import type { CollectionPages } from "./content.types.js"

export function buildCollections(pages: CollectionPages[]): Collections {
    const collections: Collections = {}

    for (const page of pages) {
        const { data } = page.parsed
        const { route, absolutePath } = page.page

        if (!data?.collections) { 
            data.collections = ["all"]
        }

        const collectionsArray: string[] = data.collections
        
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