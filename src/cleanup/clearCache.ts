import path from "path"
import fs from "fs/promises"

import { loadCache, saveCache } from "../cache/index.js"

export async function clearCache() {
    const root = process.cwd()
    
    const cache = await loadCache(root)
}