import path from "path"

import { loadConfig } from "../config/index.js"
import { loadCache, saveCache } from "../cache/index.js"

export async function deleteCache(fullPath: string, fileName: string, topLevelDir: string, secondLevelDir: string) {
    const root = process.cwd()
    const config = await loadConfig()
    const cache = await loadCache()

    const topAndSecondLevelDir = path.join(topLevelDir, secondLevelDir)
    const themeLayoutsConfigDir = path.join(config.themeDir, config.layoutsDir)
    
    if (topLevelDir === config.contentDir) {
        for (const page in cache.pages) {
            if (page === fullPath) {
                delete cache.pages[page]
                break
            }
        }
    }

    if (topLevelDir === config.layoutsDir || topAndSecondLevelDir === themeLayoutsConfigDir) {
        if (cache.layouts[fileName]) {
            delete cache.layouts[fileName]
        }
    }


    await saveCache(root, cache)
}