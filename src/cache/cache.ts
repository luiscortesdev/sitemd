import path from "path"
import fs from "fs/promises"

import type { SiteMDCache } from "./cache.types.js"

const CACHE_DIR = ".sitemd"
const CACHE_FILE = "cache.json"

export async function loadCache(root=process.cwd()): Promise<SiteMDCache> {
    try {
        const file = await fs.readFile(
            path.join(root, CACHE_DIR, CACHE_FILE),
            "utf-8",
        )

        return JSON.parse(file)
    } catch {
        return {
            version: 1,
            pages: {},
            layouts: {},
        }
    }
}

export async function saveCache(root=process.cwd(), cache: SiteMDCache): Promise<void> {
    const dir = path.join(root, CACHE_DIR)

    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(
        path.join(dir, CACHE_FILE),
        JSON.stringify(cache, null, 2)
    )
}