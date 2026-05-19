import path from "path"
import fs from "fs-extra"
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest"
import { JSDOM } from "jsdom"

import { build } from "../../src/commands/build"

describe("SiteMD Build Pipeline", () => {
    const fixturePath = path.resolve(__dirname, "../fixtures/basic-site")
    const outDir = path.join(fixturePath, "_site")

    // Paths to Expected Html Files
    const indexPath = path.join(outDir, "index.html")
    const aboutPath = path.join(outDir, "about", "index.html")
    const blogPath = path.join(outDir, "blog", "index.html")
    const post1Path = path.join(outDir, "blog", "posts", "post1", "index.html")
    const post2Path = path.join(outDir, "blog", "posts", "post2", "index.html")

    // Paths to Expected Output Folders
    const directoryFolderPath = path.join(outDir, "directory")
    const directoryPagesFolder = path.join(directoryFolderPath, "page")

    // Paths to Content Folders
    const postsFolder = path.join(fixturePath, "content", "blog", "posts")

    // Placeholder for document object for html files we will test.
    let homeDocument: Document;
    let blogDocument: Document;

    // Configure the framework to function properly with tests.
    beforeAll(async () => {
        vi.spyOn(process, "cwd").mockReturnValue(fixturePath)

        vi.spyOn(process, "exit").mockImplementation(() => undefined as never)

        if (fs.existsSync(outDir)) {
            fs.emptyDirSync(outDir)
        }

        await build()

        const homeDom = new JSDOM(fs.readFileSync(indexPath, "utf-8"))
        const blogDom = new JSDOM(fs.readFileSync(blogPath, "utf-8"))

        homeDocument = homeDom.window.document
        blogDocument = blogDom.window.document
    })

    afterAll(() => {
        vi.restoreAllMocks()
    })
    

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
        const mainHeading = homeDocument.querySelector(".text-green")
        expect(mainHeading).not.toBeNull()
        expect(mainHeading?.getAttribute("data-aria")).toBe("home")
        const mainHeadingWithId = homeDocument.getElementById("home")
        expect(mainHeadingWithId).not.toBeNull()

        
        const blogHeading = blogDocument.querySelector(".text-green")
        expect(blogHeading).not.toBeNull()
    })


    // Nunjucks Tests
    it("Should wrap content in nunjucks layout", () => {
        const mainTag = homeDocument.querySelector("main")
        expect(mainTag).not.toBeNull()
    })


    // Collections Tests
    const posts = [
        {
            href: "/blog/posts/post1",
            innerText: "Post 1 : The First Post"
        },
        {
            href: "/blog/posts/post2",
            innerText: "Post 2 : The Second Post"
        },
        {
            href: "/blog/posts/post3",
            innerText: "Post 3 : The Third Post"
        },
        {
            href: "/blog/posts/post4",
            innerText: "Post 4 : The Fourth Post"
        },
    ]

    it("Should create a list of posts from 'posts' collection", () => {
        const outerUlTag = blogDocument.getElementById("posts")
        expect(outerUlTag).not.toBeNull()

        if (!outerUlTag) return

        Array.from(outerUlTag.children).forEach((child: any, index) => {
            expect(child.tagName).toBe("LI")

            const childATag = child.children[0]
            const childATagInfo = posts[index]
            expect(childATag.tagName).toBe("A")
            expect(childATag.innerHTML).toBe(childATagInfo.innerText)
            expect(childATag.href).toBe(childATagInfo.href)
            
        })
    })


    // Pagination Tests
    it("Should create the correct number of pages", () => {
        const numberOfPages = fs.readdirSync(directoryPagesFolder).length
        const expectedNumberOfPages = (fs.readdirSync(postsFolder).length) - 1

        expect(numberOfPages).toBe(expectedNumberOfPages)
    })

    const expectedPageNames = ["2", "3", "4"]
    it("Should number the pages correctly", () => {
        const pageFolder = fs.readdirSync(directoryPagesFolder)

        pageFolder.forEach((page, index) => expect(page).toBe(expectedPageNames[index]))
    })

    it("Should generate pages with the proper content", () => {
        const pageFolder = fs.readdirSync(directoryPagesFolder)

        const indexPageDocument = new JSDOM(fs.readFileSync(path.join(directoryFolderPath, "index.html"), "utf-8")).window.document
        const indexPagePostA = indexPageDocument.querySelector("#posts > li > a")
        const indexHeading = indexPageDocument.getElementById("heading")

        expect(indexPagePostA?.innerHTML).toBe(posts[0].innerText)
        expect(indexPagePostA?.getAttribute("href")).toBe("/blog/posts/post1")
        expect(indexHeading?.innerHTML).toBe("Welcome to the posts directory")

        pageFolder.forEach((page, index) => {
            const pageDocument = new JSDOM(fs.readFileSync(path.join(directoryPagesFolder, page, "index.html"), "utf-8")).window.document
            const pagePostA = pageDocument.querySelector("#posts > li > a")
            const pageHeading = pageDocument.getElementById("heading")

            expect(pagePostA?.innerHTML).toBe(posts[index + 1].innerText)
            expect(pagePostA?.getAttribute("href")).toBe(`/blog/posts/post${page}`)
            expect(pageHeading?.innerHTML).toBe("Welcome to the posts directory")
        })
    })

    it("Should generate pages with the proper navigation controls", () => {
        const pageFolder = fs.readdirSync(directoryPagesFolder)

        const indexPageDocument = new JSDOM(fs.readFileSync(path.join(directoryFolderPath, "index.html"), "utf-8")).window.document
        const indexPageNav = indexPageDocument.querySelector("#posts > nav")
        expect(indexPageNav?.children.length).toBe(1)
        expect(indexPageNav?.children[0].getAttribute("href")).toBe("/directory/page/2")
        expect(indexPageNav?.children[0].innerHTML.includes("Next")).toBe(true)

        pageFolder.forEach((page, index) => {
            const pageDocument = new JSDOM(fs.readFileSync(path.join(directoryPagesFolder, page, "index.html"), "utf-8")).window.document
            const pageNav = pageDocument.querySelector("#posts > nav")
            
            // Last page should not have a next option
            if (index === (pageFolder.length - 1)) {
                expect(pageNav?.children.length).toBe(1)
                expect(pageNav?.children[0].getAttribute("href")).toBe(`/directory/page/${pageFolder[index - 1]}`)
                expect(pageNav?.children[0].innerHTML.includes("Previous")).toBe(true)

                return
            }

            expect(pageNav?.children.length).toBe(2)
            console.log(path.join(directoryPagesFolder, page, "index.html"))
            expect(pageNav?.children[0].getAttribute("href")).toBe(((index - 1) === -1 ? `/directory/` : `/directory/page/${pageFolder[index - 1]}`))
            expect(pageNav?.children[0].innerHTML.includes("Previous")).toBe(true)
            expect(pageNav?.children[1].getAttribute("href")).toBe(`/directory/page/${pageFolder[index + 1]}`)
            expect(pageNav?.children[1].innerHTML.includes("Next")).toBe(true)
        })
    })
})