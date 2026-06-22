import { describe, it, expect, vi, beforeAll, afterAll } from "vitest"
import path from "path"
import fs from "fs-extra"

import { clear } from "../../src/commands/index"

describe("SiteMD CLI Commands Integration Tests", () => {
    const originalDir = process.cwd()

    // Paths to the basic site fixture and the dev site fixture
    const fixturePath = path.resolve(__dirname, "../fixtures/basic-site")
    const cmdFixturePath = path.resolve(__dirname, "../fixtures/cmd-site")

    // Paths to files in the updates folder
    const dummyCache = path.join(path.resolve(__dirname, "../fixtures/updates/dummyCache.json"))

    // Paths to files we need in the site
    const tempFolder = path.join(cmdFixturePath, ".sitemd")
    const cacheFile = path.join(tempFolder, "cache.json")

    beforeAll(async () => {
        if (fs.existsSync(cmdFixturePath)) {
            fs.rmSync(cmdFixturePath, { recursive: true, force: true })
        }
        fs.copySync(fixturePath, cmdFixturePath)

        if (fs.existsSync(tempFolder)) {
            fs.rmSync(tempFolder, { recursive: true, force: true })
        }
        fs.ensureDirSync(tempFolder)

        fs.copyFileSync(dummyCache, cacheFile)

        process.chdir(cmdFixturePath)
    }, 5000)

    afterAll(async () => {
        process.chdir(originalDir)

        await new Promise(resolve => setTimeout(resolve, 1000))

        if (fs.existsSync(cmdFixturePath)) {
            fs.rmSync(cmdFixturePath, { recursive: true, force: true })
        }

        vi.restoreAllMocks()
    }, 5000)

    // Test the clear command
    it("Should sucessfully clear the cache", async () => {
        // Make sure the cache file exists
        expect(fs.existsSync(cacheFile)).toBe(true)
        
        // Load the current cache and check it is not already cleared
        const cacheData = JSON.parse(fs.readFileSync(cacheFile, "utf-8"))
        // Ensure these properties are not empty
        expect(Object.keys(cacheData["pages"]).length).toBeGreaterThan(0)
        expect(Object.keys(cacheData["layouts"]).length).toBeGreaterThan(0)
        expect(Object.keys(cacheData["collections"]).length).toBeGreaterThan(0)
        expect(cacheData["pagination"].length).toBeGreaterThan(0)
        
        // Run clear command
        await clear()

        // Reload cache and ensure properties have been cleared
        const clearedCache = JSON.parse(fs.readFileSync(cacheFile, "utf-8"))
        
        expect(Object.keys(clearedCache["pages"]).length).toBe(0)
        expect(Object.keys(clearedCache["layouts"]).length).toBe(0)
        expect(Object.keys(clearedCache["collections"]).length).toBe(0)
        expect(clearedCache["pagination"].length).toBe(0)
    })
})
