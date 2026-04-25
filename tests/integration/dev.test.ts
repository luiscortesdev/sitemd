import path from "path"
import fs from "fs-extra"
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest"
import { JSDOM } from "jsdom"

import { runDev } from "../../src/dev/runDev"


describe("SiteMD Dev Server, Live Reload, and Caching", () => {
    const originalDir = process.cwd()
    const fixturePath = path.resolve(__dirname, "../fixtures/basic-site")
    const devFixturePath = path.resolve(__dirname, "../fixtures/dev-site")

    const outDir = path.join(devFixturePath, ".sitemd", "output")
    const tempFolderDir = path.join(devFixturePath, ".sitemd")

    const indexPath = path.join(outDir, "index.html")
    const indexContentPath = path.join(devFixturePath, "content", "index.md")

    const devCache = path.join(tempFolderDir, "cache.json")

    let devServer: any
    let fileWatcher: any

    // Setup dev server
    beforeAll(async () => {
        if (fs.existsSync(devFixturePath)) {
            fs.rmSync(devFixturePath, { recursive: true, force: true })
        }
        fs.copySync(fixturePath, devFixturePath)

        await new Promise(resolve => setTimeout(resolve, 1000))

        process.chdir(devFixturePath)

        const instances = await runDev()
        devServer = instances.server
        fileWatcher = instances.watcher
    })

    // Clean up dev server after tests
    afterAll(async () => {
        if (devServer) {
            await new Promise<void>((resolve, reject) => {
                devServer.close((err?: Error) => {
                    if (err) {
                        return reject(err)
                    }
                    console.log("TEST SERVER CLOSED.")
                    resolve()
                })
            })
        }

        if (fileWatcher) {
            fileWatcher.removeAllListeners()
            try {
                fileWatcher.close();
            } catch (err) {
                console.error("WATCHER CLOSE ERROR:", err);
            }
        }
        
        process.chdir(originalDir)

        await new Promise(resolve => setTimeout(resolve, 1000));

        if (fs.existsSync(devFixturePath)) {
            fs.rmSync(devFixturePath, { recursive: true, force: true })
        }

        vi.restoreAllMocks()
    }, 5000)

    // Setup Tests
    it("Should initially build the page", () => {
        const indexDocument = new JSDOM(fs.readFileSync(indexPath, "utf-8")).window.document

        const mainHeading = indexDocument.getElementById("home")
        expect(mainHeading).not.toBeNull()
        expect(mainHeading?.innerHTML).toBe("Hello Vitest")
    })
    it("Should create a correct, initial cache", () => {
        const rawDevCacheModel = fs.readFileSync(path.resolve(__dirname, "../fixtures/initial/devCache.json"), "utf-8")
        const initialDevCacheModel = JSON.parse(rawDevCacheModel)

        const rawDevCache = fs.readFileSync(devCache, "utf-8")
        const initialDevCache = normalizePaths(JSON.parse(rawDevCache))

        expect(initialDevCache).toEqual(initialDevCacheModel)
    })

    it("Should rebuild on file modifications", async () => {
        const newIndexFile = fs.readFileSync(path.resolve(__dirname, "../fixtures/updates/newIndex.md"), "utf-8")

        fs.writeFileSync(indexContentPath, newIndexFile)

        await vi.waitFor(
            () => {
                const indexDocument = new JSDOM(fs.readFileSync(indexPath, "utf-8")).window.document

                const mainHeading = indexDocument.querySelector(".text-green")
                expect(mainHeading).not.toBeNull()
                expect(mainHeading?.innerHTML).toBe("I have been updated")
            },
            {
                timeout: 3000,
                interval: 50,
            }
        )
    })

    function normalizePaths(obj: any) {
        const cwd = devFixturePath
        
        
        const escapedCwd = cwd.replace(/\\/g, '\\\\\\\\')
        const regex = new RegExp(escapedCwd, 'gi')

        
        const str = JSON.stringify(obj).replace(regex, "ROOT")

        return JSON.parse(str)
    }
})