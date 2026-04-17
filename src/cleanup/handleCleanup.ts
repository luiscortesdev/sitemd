import PATH from "path"

import { loadConfig } from "../config/index.js"
import { deleteCache } from "./deleteCache.js"
import { deleteOutput } from "./deleteOutput.js"

export async function handleCleanup(path: string) {
    const root = process.cwd()
    const config = await loadConfig()

    const pathSplit = path.split(PATH.sep)
    const topLevelDir = pathSplit[0]
    const secondLevelDir = pathSplit[1]
    const fileName = pathSplit[pathSplit.length - 1]

    const fullPath = PATH.join(root, path)

    if (!topLevelDir || !secondLevelDir || !fileName) {
        console.log(`${fullPath} IS NOT A VALID PATH!`)
        return
    }
    
    const topAndSecondLevelDir = PATH.join(topLevelDir, secondLevelDir)

    if (topLevelDir === config.contentDir || topLevelDir === config.layoutsDir || topAndSecondLevelDir === PATH.join(config.themeDir, config.layoutsDir)) {
        deleteCache(fullPath, fileName, topLevelDir, secondLevelDir)
    }

    if (topLevelDir === config.contentDir || topLevelDir === config.publicDir || topAndSecondLevelDir === PATH.join(config.themeDir, config.publicDir)) {
        deleteOutput(path)
    }
}