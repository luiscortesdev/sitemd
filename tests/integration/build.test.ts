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

    // Basic file creation tests.
    it("Should generate an index.html file", () => {
        const indexPath = path.join(outDir, "index.html")

        expect(fs.existsSync(indexPath)).toBe(true)
    })
    it("Should generate an about/index.html file", () => {
        const aboutPath = path.join(outDir, "about", "index.html")

        expect(fs.existsSync(aboutPath)).toBe(true)
    })
    it("Should generate a blog/index.html file", () => {
        const blogPath = path.join(outDir, "blog", "index.html")

        expect(fs.existsSync(blogPath)).toBe(true)
    })
    it("Should generate a blog/posts/post1/index.html file", () => {
        const post1Path = path.join(outDir, "blog", "posts", "post1", "index.html")

        expect(fs.existsSync(post1Path)).toBe(true)
    })
    it("Should generate a blog/posts/post2/index.html file", () => {
        const post2Path = path.join(outDir, "blog", "posts", "post2", "index.html")

        expect(fs.existsSync(post2Path)).toBe(true)
    })
})