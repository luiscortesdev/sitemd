import path from "path"
import fs from "fs/promises"
import { pathToFileURL } from "url"

import { SiteMDCacheSchema } from "./schema.js"

import type { UserCache, SiteMDCache } from "./cache.types.js"

import { logger } from "../utils/logger.js"

const CACHE_DIR = ".sitemd"
const CACHE_FILE = "cache.json"

export const DEFAULT_CACHE: SiteMDCache = {
    version: 1,
    pages: {},
    layouts: {},
    collections: {},
    pagination: [],
}

export async function loadCache(root=process.cwd()): Promise<SiteMDCache> {
    const cachePath = path.join(root, CACHE_DIR, CACHE_FILE)
    
    let rawCache: UserCache

    // ensure cache exists
    try {
        await fs.access(cachePath)

        const imported = await import(pathToFileURL(cachePath).href)
        rawCache = imported.defualt ?? imported
    } catch (err) {
        // create a default cache from schema if it doesn't exist
        return SiteMDCacheSchema.parse({})
    }

    const parsedCache = SiteMDCacheSchema.parse(rawCache)

    return parsedCache
}

export async function saveCache(root=process.cwd(), cache: SiteMDCache): Promise<void> {
    const cacheDir = path.join(root, CACHE_DIR)
    const cachePath = path.join(root, CACHE_DIR, CACHE_FILE)

    try {
        await fs.access(cachePath)
    } catch (err) {
        logger.notice(`CREATING NEW CACHE FILE AT ${cachePath}.\n`)
    }

    const parsedCache = SiteMDCacheSchema.parse(cache)

    await fs.mkdir(cacheDir, { recursive: true })
    await fs.writeFile(
        path.join(cacheDir, CACHE_FILE),
        JSON.stringify(parsedCache, null, 2)
    )
}