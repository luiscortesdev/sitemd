import path from "path"
import fs from "fs/promises"

import { loadCache, saveCache } from "../cache/cache.js"
import { directoryEmpty } from "../utils/fs.js"

export async function validateCache() {
    const root = process.cwd()
    const cache = await loadCache()

    for (const file in cache.pages) {
        const entry = cache.pages[file]
        if (!entry) continue

        try {
            await fs.access(file)
        } catch {
            console.log(`${file} NO LONGER EXISTS IN USER'S PROJECT. DELETING FROM CACHE...`)
            const parentPath = path.dirname(entry.outputDir)

            try {
                await fs.access(entry.outputDir)
            
                await fs.rm(entry.outputDir)
                    try {
                        if (await directoryEmpty(parentPath)) {
                            await fs.rmdir(parentPath)
                        } 
                    } catch {
                        console.log(`INTERNAL ERROR: COULD NOT REMOVE ${parentPath}`)
                    }
                } catch {
                    console.log(`INTERNAL ERROR: OUTPUT PATH ${entry.outputDir} DOES NOT EXIST!`)
                }
                
            delete cache.pages[file]
        }
    }

    await saveCache(root, cache)
}