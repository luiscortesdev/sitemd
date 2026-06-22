import { saveCache } from "../cache/index.js"
import { logger } from "../utils/index.js"

import { DEFAULT_CACHE } from "../cache/cache.js"

export async function clearCache() {
    const root = process.cwd()

    logger.process("CLEARING CACHE IN .sitemd!")
    
    try {
        saveCache(root, DEFAULT_CACHE)

        logger.success("SUCCESSFULLY CLEARED CACHE IN .sitemd!")
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`COULD NOT CLEAR CACHE IN .sitemd!\n ERROR: ${error.message}!`)
        }
    }
}