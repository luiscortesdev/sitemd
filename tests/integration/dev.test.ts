import { describe, it, expect, vi, beforeAll, afterAll } from "vitest"
import path from "path"
import fs from "fs-extra"
import { JSDOM } from "jsdom"

import { runDev } from "../../src/dev/runDev"


describe("SiteMD Dev Server, Live Reload, and Caching", () => {
    const originalDir = process.cwd()
    const fixturePath = path.resolve(__dirname, "../fixtures/basic-site")
    const devFixturePath = path.resolve(__dirname, "../fixtures/dev-site")

    const outDir = path.join(devFixturePath, ".sitemd", "output")

    const indexPath = path.join(outDir, "index.html")
    const indexContentPath = path.join(devFixturePath, "content", "index.md")

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

        await new Promise(resolve => setTimeout(resolve, 2000))
    }, 5000)

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
    }, 10000)

    it("Should initially build the page", () => {
        const indexDocument = new JSDOM(fs.readFileSync(indexPath, "utf-8")).window.document

        const mainHeading = indexDocument.getElementById("home")
        expect(mainHeading).not.toBeNull()
        expect(mainHeading?.innerHTML).toBe("Hello Vitest")
    })

    it("Should rebuild on file modifications", async () => {
        const newIndexFile = `---
title: Test Modification
description: A test
layout: default
---
# I have been updated {.text-green}
`   
        await new Promise(resolve => setTimeout(resolve, 1000));

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
                interval: 500,
            }
        )
    })
})