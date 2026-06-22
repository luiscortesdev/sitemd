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

    // Paths to folders we need in the site
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

        fs.ensureDirSync(cacheFile)
        fs.copyFileSync(dummyCache, cacheFile)

        process.chdir(cmdFixturePath)
    }, 5000)

    afterAll(async () => {
        process.chdir(originalDir)

        await new Promise(resolve => setTimeout(resolve, 1000));

        if (fs.existsSync(cmdFixturePath)) {
            fs.rmSync(cmdFixturePath, { recursive: true, force: true })
        }

        vi.restoreAllMocks()
    }, 5000)


})
