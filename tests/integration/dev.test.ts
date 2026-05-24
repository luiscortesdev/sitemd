import path from "path"
import fs from "fs-extra"
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest"
import { JSDOM } from "jsdom"

import { runDev } from "../../src/dev/runDev"

describe("SiteMD Dev Server, Live Reload, and Caching", () => {
    const originalDir = process.cwd()

    // Paths to the basic site fixture and the dev site fixture
    const fixturePath = path.resolve(__dirname, "../fixtures/basic-site")
    const devFixturePath = path.resolve(__dirname, "../fixtures/dev-site")

    // Path to folder containing the ouput dev site
    const outDir = path.join(devFixturePath, ".sitemd", "output")

    // Paths to top level html files in the output dev site
    const indexPath = path.join(outDir, "index.html")
    const aboutPath = path.join(outDir, "about", "index.html")

    // Paths to the folder/files in the output/blog/posts directory in the output dev site
    const postsFolderPath = path.join(outDir, "blog", "posts")
    const post2Path = path.join(postsFolderPath, "post2", "index.html")
    const post5Path = path.join(postsFolderPath, "post5", "index.html")

    // Paths to folders in the content folder of the dev site
    const postsContentFolderPath = path.join(devFixturePath, "content", "blog", "posts")
    const post2ContentFolderPath = path.join(postsContentFolderPath, "post2")
    const post5ContentFolderPath = path.join(postsContentFolderPath, "post5")

    // Paths to files in the content folder of the dev site
    const post2ContentPath = path.join(postsContentFolderPath, "post2", "index.md")
    const post5ContentPath = path.join(postsContentFolderPath, "post5", "index.md")

    // Paths to top level files in the content folder of the dev site
    const indexContentPath = path.join(devFixturePath, "content", "index.md")
    
    // Paths to top level files in the theme folder of the dev site
    const defaultLayoutThemePath = path.join(devFixturePath, "theme", "layouts", "default.njk")

    // instances for devServer and fileWatcher for vitest
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
                console.error("FILE WATCHER CLOSED WITH ERROR:", err);
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

    it("Should apply custom attributes", () => {
        const indexDocument = new JSDOM(fs.readFileSync(indexPath, "utf-8")).window.document

        const mainHeading = indexDocument.querySelector(".text-green")
        expect(mainHeading).not.toBeNull()
        expect(mainHeading?.getAttribute("data-aria")).toBe("home")
        
        const mainHeadingWithId = indexDocument.getElementById("home")
        expect(mainHeadingWithId).not.toBeNull()
    })


    // Rebuild
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
    
    it("Should rebuild on layout modifications", async () => {
        const newDefaultLayout = fs.readFileSync(path.resolve(__dirname, "../fixtures/updates/newDefault.njk"), "utf-8")

        fs.writeFileSync(defaultLayoutThemePath, newDefaultLayout)

        await vi.waitFor(
            () => {
                const indexDocument = new JSDOM(fs.readFileSync(indexPath, "utf-8")).window.document
                const navBar = indexDocument.querySelector("nav > ul")

                expect(navBar?.children.length).toBe(2)
                expect(navBar?.children[1].innerHTML).toBe("Blog")
                expect(navBar?.children[1].getAttribute("href")).toBe("/blog")
            },
            {
                timeout: 3000,
                interval: 50,
            }
        )
    })
    
    it("Should rebuild dependent layouts when a base layout is changed", async () => {
        const secondNewDefaultLayout = fs.readFileSync(path.resolve(__dirname, "../fixtures/updates/secondDefaultLayout.njk"), "utf-8")

        fs.writeFileSync(defaultLayoutThemePath, secondNewDefaultLayout)

        await vi.waitFor(
            () => {
                const aboutDocument = new JSDOM(fs.readFileSync(aboutPath, "utf-8")).window.document
                const navBar = aboutDocument.querySelector("nav > ul")

                expect(navBar?.children.length).toBe(3)
                expect(navBar?.children[2].innerHTML).toBe("About")
                expect(navBar?.children[2].getAttribute("href")).toBe("/about")
            },
            {
                timeout: 3000,
                interval: 50,
            }
        )
    })

    it("Should rebuild when file names are edited and update routes", async () => {
        fs.renameSync(post2ContentFolderPath, post5ContentFolderPath)

        await vi.waitFor(
            () => {
                expect(fs.existsSync(post2Path)).toBe(false)
                expect(fs.existsSync(post5Path)).toBe(true)
            },
            {
                timeout: 3000,
                interval: 50,
            }
        )
    })

    it("Should rebuild when a new file is added", async () => {
        const newPost2File = fs.readFileSync(path.resolve(__dirname, "../fixtures/updates/newPost2.md"), "utf-8")

        fs.outputFileSync(post2ContentPath, newPost2File)

        await vi.waitFor(
            () => {
                expect(fs.existsSync(post2Path)).toBe(true)

                const post2Document = new JSDOM(fs.readFileSync(post2Path, "utf-8")).window.document
                expect(post2Document.title).toBe("New Post 2")
                
                const postHeading = post2Document.querySelector("#new")
                expect(postHeading?.innerHTML).toBe("Welcome to the new second post!")
                expect(postHeading?.className).toBe("main-text heading")
            },
            {
                timeout: 3000,
                interval: 50,
            }
        )
    })

    it("Should rebuild when a file is deleted, cleanup the page in the output", async () => {
        expect(fs.existsSync(post5Path)).toBe(true)
        expect(fs.existsSync(post5ContentPath)).toBe(true)
        
        fs.rmSync(post5ContentFolderPath, { recursive: true })

        await vi.waitFor(
            () => {
                expect(fs.existsSync(post5Path)).toBe(false)
                expect(fs.existsSync(post2Path)).toBe(true)
            },
            {
                timeout: 3000,
                interval: 50,
            }
        )
    })
})