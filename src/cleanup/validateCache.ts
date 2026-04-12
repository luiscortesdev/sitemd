import path from "path"
import fs from "fs/promises"

import { loadCache, saveCache } from "../cache/cache.js"
import { loadConfig } from "../config/config.js"
import { outputExists } from "../utils/fs.js"

export async function validateCache() {
    const root = process.cwd()

    const config = await loadConfig(root)
    const cache = await loadCache()

    const layoutDir = config.layoutsDir
    const themeLayoutsDir = path.join(root, config.themeDir, config.layoutsDir)

    for (const file in cache.pages) {
        const entry = cache.pages[file]
        if (!entry) continue

        try {
            await fs.access(file)
        } catch {
            console.log(`${file} NO LONGER EXISTS IN USER'S PROJECT. DELETING FROM CACHE...`)
                
            delete cache.pages[file]
        }
    }

    for (const layout in cache.layouts) {
        const layoutPath = path.join(layoutDir, layout)
        const themeLayoutsPath = path.join(themeLayoutsDir, layout)
        
        // If the layout does not exist in either the user's layouts or the theme's layouts then
        // we delete it from the cache.
        if (!(await outputExists(layoutPath)) && !(await outputExists(themeLayoutsPath))) {
            delete cache.layouts[layout]
        }
    }

    await saveCache(root, cache)
}