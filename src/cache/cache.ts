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
    const dir = path.join(root, CACHE_DIR)

    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(
        path.join(dir, CACHE_FILE),
        JSON.stringify(cache, null, 2)
    )
}