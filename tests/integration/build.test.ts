import { describe, it, expect, vi, beforeAll, afterAll } from "vitest"
import path from "path"
import fs from "fs-extra"
import { build } from "../../src/commands/build"

describe("SiteMD Build Pipeline", () => {
    const fixturePath = path.resolve(__dirname, "../fixtures/basic-site")
    const outDir = path.join(fixturePath, "_site")

    // Configure the framework to function properly with tests.
    beforeAll(async () => {
        vi.spyOn(process, "cwd").mockReturnValue(fixturePath)

        vi.spyOn(process, "exit").mockImplementation(() => undefined as never)

        if (fs.existsSync(outDir)) {
            fs.emptyDirSync(outDir)
        }

        await build()
    })
    afterAll(() => {
        vi.restoreAllMocks()
    })

    // Paths to Expected Html Files
    const indexPath = path.join(outDir, "index.html")
    const aboutPath = path.join(outDir, "about", "index.html")
    const blogPath = path.join(outDir, "blog", "index.html")
    const post1Path = path.join(outDir, "blog", "posts", "post1", "index.html")
    const post2Path = path.join(outDir, "blog", "posts", "post2", "index.html")

    // Basic file creation tests.
    it("Should generate an index.html file", () => {
        expect(fs.existsSync(indexPath)).toBe(true)
    })
    it("Should generate an about/index.html file", () => {
        expect(fs.existsSync(aboutPath)).toBe(true)
    })
    it("Should generate a blog/index.html file", () => {
        expect(fs.existsSync(blogPath)).toBe(true)
    })
    it("Should generate a blog/posts/post1/index.html file", () => {
        expect(fs.existsSync(post1Path)).toBe(true)
    })
    it("Should generate a blog/posts/post2/index.html file", () => {
        expect(fs.existsSync(post2Path)).toBe(true)
    })

    // Custom Attributes Tests
    it("Should apply custom attributes", () => {
        const homeHtml = fs.readFileSync(indexPath, "utf-8")
        expect(homeHtml).toContain(`<h1 data-aria="home" id="home" class="text-green">Hello Vitest</h1>`)

        const blogHtml = fs.readFileSync(blogPath, "utf-8")
        expect(blogHtml).toContain(`<h2 class="text-green">Welcome to my test blog.</h2>`)
    })
})