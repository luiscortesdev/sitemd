import fs from "fs/promises"

import { loadCache, saveCache } from "../cache/cache.js"

export async function validateCache() {
    const root = process.cwd()
    const cache = await loadCache()

    for (const file in cache.pages) {
        try {
            await fs.access(file)
        } catch {
            console.log(`${file} NO LONGER EXISTS IN USER'S PROJECT. DELETING FROM CACHE...`)

            delete cache.pages[file]
        }
    }

    await saveCache(root, cache)
}