import path from "path"
import fs from "fs-extra"
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest"
import { JSDOM } from "jsdom"
import matter from "gray-matter"

import { runDev } from "../../src/dev/runDev"
import { setDebugMode} from "../../src/utils/index"

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
    const blogPath = path.join(outDir, "blog", "index.html")

    // Paths to the folder/files in the output/blog/posts directory in the output dev site
    const postsFolderPath = path.join(outDir, "blog", "posts")
    const post2Path = path.join(postsFolderPath, "post2", "index.html")
    const post5Path = path.join(postsFolderPath, "post5", "index.html")
    const directoryFolderPath = path.join(outDir, "directory")
    const directoryPagesFolder = path.join(directoryFolderPath, "page")

    // Paths to folders in the content folder of the dev site
    const postsContentFolderPath = path.join(devFixturePath, "content", "blog", "posts")
    const post2ContentFolderPath = path.join(postsContentFolderPath, "post2")
    const post5ContentFolderPath = path.join(postsContentFolderPath, "post5")

    // Paths to files in the content folder of the dev site
    const post1ContentPath = path.join(postsContentFolderPath, "post1", "index.md")
    const post2ContentPath = path.join(postsContentFolderPath, "post2", "index.md")
    const post3ContentPath = path.join(postsContentFolderPath, "post3", "index.md")
    const post4ContentPath = path.join(postsContentFolderPath, "post4", "index.md")
    const post5ContentPath = path.join(postsContentFolderPath, "post5", "index.md")
    const post6ContentPath = path.join(postsContentFolderPath, "post6", "index.md")

    // Paths to top level files in the content folder of the dev site
    const indexContentPath = path.join(devFixturePath, "content", "index.md")
    const directoryContentPath = path.join(devFixturePath, "content", "directory", "index.md")
    
    // Paths to top level files in the theme folder of the dev site
    const defaultLayoutThemePath = path.join(devFixturePath, "theme", "layouts", "default.njk")

    // instances for devServer and fileWatcher for vitest
    let devServer: any
    let fileWatcher: any

    // Data that will be used to test the posts
    let posts: { innerHTML: string, href: string }[] = []
    let featured: { innerHTML: string, href: string }[] = []

    // async function that updates the posts data with the markdown file content
    async function updatePostsCollection() {
        posts = []
        featured = []

        const contentFolderPosts = fs.readdirSync(postsContentFolderPath)
        
        contentFolderPosts.forEach(post => {
            const currentPost = fs.readFileSync(path.join(postsContentFolderPath, post, "index.md"), "utf-8")
            const postData = matter(currentPost)

            const expectedTagInnerHTML = `${postData.data?.title} : ${postData.data?.description}`
            const expectedTagHref = `/blog/posts/${post}`

            if (postData.data?.collections?.includes("posts")) {            
                posts.push(
                    {
                        innerHTML: expectedTagInnerHTML,
                        href: expectedTagHref,
                    }
                )
            }
            if (postData.data?.collections?.includes("featured")) {            
                featured.push(
                    {
                        innerHTML: expectedTagInnerHTML,
                        href: expectedTagHref,
                    }
                )
            }
        })
    }

    // Setup dev server
    beforeAll(async () => {
        if (fs.existsSync(devFixturePath)) {
            fs.rmSync(devFixturePath, { recursive: true, force: true })
        }
        fs.copySync(fixturePath, devFixturePath)

        await new Promise(resolve => setTimeout(resolve, 1000))

        process.chdir(devFixturePath)
        
        setDebugMode(true)

        const instances = await runDev()
        devServer = instances.server
        fileWatcher = instances.watcher
        
        // Update our posts data
        await updatePostsCollection()
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

    // Setup Collection Tests
    it("Should create a list of posts from 'posts' collection", () => {
        const blogDocument = new JSDOM(fs.readFileSync(blogPath)).window.document
        const outerUlTag = blogDocument.getElementById("posts")
        expect(outerUlTag).not.toBeNull()

        if (!outerUlTag) return

        Array.from(outerUlTag.children).forEach((child: any, index) => {
            expect(child.tagName).toBe("LI")

            const childATag = child.children[0]
            const childATagInfo = posts[index]

            expect(childATag.tagName).toBe("A")
            expect(childATag.innerHTML).toBe(childATagInfo.innerHTML)
            expect(childATag.href).toBe(childATagInfo.href)

        })
    })

    // Setup pagination tests.
    it("Should create the correct number of pages", () => {
        const numberOfPages = fs.readdirSync(directoryPagesFolder).length
        const expectedNumberOfPages = (fs.readdirSync(postsContentFolderPath).length) - 1
    
        expect(numberOfPages).toBe(expectedNumberOfPages)
    })

    it("Should number the pages correctly", () => {
        const pageFolder = fs.readdirSync(directoryPagesFolder)
    
        pageFolder.forEach((page, index) => expect(page).toBe((index + 2).toString()))
    })

    it("Should generate pages with the proper content", () => {
        const pageFolder = fs.readdirSync(directoryPagesFolder)
    
        const indexPageDocument = new JSDOM(fs.readFileSync(path.join(directoryFolderPath, "index.html"), "utf-8")).window.document
        const indexPagePostA = indexPageDocument.querySelector("#posts > li > a")
        const indexHeading = indexPageDocument.getElementById("heading")
    
        expect(indexPagePostA?.innerHTML).toBe(posts[0].innerHTML)
        expect(indexPagePostA?.getAttribute("href")).toBe("/blog/posts/post1")
    
        expect(indexHeading?.innerHTML).toBe("Welcome to the posts directory")
    
        pageFolder.forEach((page, index) => {
            const pageDocument = new JSDOM(fs.readFileSync(path.join(directoryPagesFolder, page, "index.html"), "utf-8")).window.document
            const pagePostA = pageDocument.querySelector("#posts > li > a")
            const pageHeading = pageDocument.getElementById("heading")
    
            expect(pagePostA?.innerHTML).toBe(posts[index + 1].innerHTML)
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
    
            expect(pageNav?.children[0].getAttribute("href")).toBe(((index - 1) === -1 ? `/directory/` : `/directory/page/${pageFolder[index - 1]}`))
            expect(pageNav?.children[0].innerHTML.includes("Previous")).toBe(true)
    
            expect(pageNav?.children[1].getAttribute("href")).toBe(`/directory/page/${pageFolder[index + 1]}`)
            expect(pageNav?.children[1].innerHTML.includes("Next")).toBe(true)
        })
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


    // Collection Rebuild Tests
    it("Should rebuild when a post is removed from the collection", async () => {
        // New post 3 markdown file is no longer a member of the "posts" collection
        const newPost3 = fs.readFileSync(path.resolve(__dirname, "../fixtures/updates/newPost3.md"), "utf-8")

        fs.writeFileSync(post3ContentPath, newPost3)

        await updatePostsCollection()

        await vi.waitFor(
            () => {
                const blogDocument = new JSDOM(fs.readFileSync(blogPath)).window.document
                const outerUlTag = blogDocument.getElementById("posts")
                expect(outerUlTag).not.toBeNull()

                if (!outerUlTag) return

                Array.from(outerUlTag.children).forEach((child: any, index) => {
                    expect(child.tagName).toBe("LI")

                    const childATag = child.children[0]
                    const childATagInfo = posts[index]

                    expect(childATag.tagName).toBe("A")
                    expect(childATag.innerHTML).toBe(childATagInfo.innerHTML)
                    expect(childATag.href).toBe(childATagInfo.href)

                })
            },
            {
                timeout: 3000,
                interval: 50,
            }
        )
    })

    it("Should rebuild when a post is added to the collection", async () => {
        const newPost6File = fs.readFileSync(path.resolve(__dirname, "../fixtures/updates/newPost6.md"), "utf-8")

        fs.outputFileSync(post6ContentPath, newPost6File)

        await updatePostsCollection()

        await vi.waitFor(
            () => {
                const blogDocument = new JSDOM(fs.readFileSync(blogPath)).window.document
                const outerUlTag = blogDocument.getElementById("posts")
                expect(outerUlTag).not.toBeNull()

                if (!outerUlTag) return

                Array.from(outerUlTag.children).forEach((child: any, index) => {
                    expect(child.tagName).toBe("LI")

                    const childATag = child.children[0]
                    const childATagInfo = posts[index]

                    expect(childATag.tagName).toBe("A")
                    expect(childATag.innerHTML).toBe(childATagInfo.innerHTML)
                    expect(childATag.href).toBe(childATagInfo.href)

                })
            },
            {
                timeout: 3000,
                interval: 50,
            }
        )
    })

    it("Should rebuild the collection when a post is edited", async () => {
        const newPost1 = fs.readFileSync(path.resolve(__dirname, "../fixtures/updates/newPost1.md"), "utf-8")

        fs.writeFileSync(post1ContentPath, newPost1)

        await updatePostsCollection()

        console.log(posts)

        await vi.waitFor(
            () => {
                const blogDocument = new JSDOM(fs.readFileSync(blogPath)).window.document
                const outerUlTag = blogDocument.getElementById("posts")
                expect(outerUlTag).not.toBeNull()

                if (!outerUlTag) return

                console.log(outerUlTag.innerHTML)

                Array.from(outerUlTag.children).forEach((child: any, index) => {
                    expect(child.tagName).toBe("LI")

                    const childATag = child.children[0]
                    const childATagInfo = posts[index]

                    

                    expect(childATag.tagName).toBe("A")
                    expect(childATag.innerHTML).toBe(childATagInfo.innerHTML)
                    expect(childATag.href).toBe(childATagInfo.href)

                })
            },
            {
                timeout: 3000,
                interval: 50,
            }
        )
    })

    
    // Pagination Rebuild Tests
    it("Should create a new page if a post is added to the collection and number them correctly", async () => {
        const post3 = fs.readFileSync(post3ContentPath, "utf-8")
        const post3Data = matter(post3)
        post3Data.data.collections = ["posts"]

        const updatedPost3 = matter.stringify(post3Data.content, post3Data.data)

        fs.writeFileSync(post3ContentPath, updatedPost3)

        await updatePostsCollection()

        await vi.waitFor(
            () => {
                const pages = fs.readdirSync(directoryPagesFolder)
                const numberOfPages = pages.length
                const expectedNumberOfPages = (posts.length) - 1

                expect(numberOfPages).toBe(expectedNumberOfPages)

                pages.forEach((page, index) => {
                    expect(page).toBe((index + 2).toString())
                })
            },
            {
                timeout: 3000,
                interval: 50,
            }
        )
        
    })

    it("Should delete a page if a post is removed from the collection and number them correctly", async () => {
        const post6 = fs.readFileSync(post6ContentPath, "utf-8")
        const post6Data = matter(post6)
        post6Data.data.collections = []

        const updatedPost6 = matter.stringify(post6Data.content, post6Data.data)

        fs.writeFileSync(post6ContentPath, updatedPost6)

        await updatePostsCollection()

        await vi.waitFor(
            () => {
                const pages = fs.readdirSync(directoryPagesFolder)
                const numberOfPages = pages.length
                const expectedNumberOfPages = (posts.length) - 1

                expect(numberOfPages).toBe(expectedNumberOfPages)

                pages.forEach((page, index) => {
                    expect(page).toBe((index + 2).toString())
                })
            },
            {
                timeout: 3000,
                interval: 50,
            }
        )
        
    })

    it("Should create the correct amount of pages if the perPage property is changed", async () => {
        const directoryContent = fs.readFileSync(directoryContentPath, "utf-8")
        const directoryContentData = matter(directoryContent)
        const newPerPage = 2

        directoryContentData.data.perPage = newPerPage

        const updatedDirectoryContent = matter.stringify(directoryContentData.content, directoryContentData.data)

        fs.writeFileSync(directoryContentPath, updatedDirectoryContent)

        await vi.waitFor(
            () => {
                const pages = fs.readdirSync(directoryPagesFolder)
                const numberOfPages = pages.length
                const expectedNumberOfPages = (Math.ceil(posts.length / newPerPage)) - 1

                expect(numberOfPages).toBe(expectedNumberOfPages)

                pages.forEach((page, index) => {
                    expect(page).toBe((index + 2).toString())
                })
            },
            {
                timeout: 3000,
                interval: 50,
            }
        ) 
    })

    it("Should delete the pages if the collection is no longer paginated", async () => {
        const directoryContent = fs.readFileSync(directoryContentPath, "utf-8")
        const directoryContentData = matter(directoryContent)
        directoryContentData.data.paginate = ""

        const updatedDirectoryContent = matter.stringify(directoryContentData.content, directoryContentData.data)

        fs.writeFileSync(directoryContentPath, updatedDirectoryContent)

        await vi.waitFor(
            () => {
                expect(fs.existsSync(directoryPagesFolder)).toBe(false)
                
            },
            {
                timeout: 3000,
                interval: 50,
            }
        ) 
    })

    it("Should rebuild the pages if the collection is now paginated", async () => {
        const directoryContent = fs.readFileSync(directoryContentPath, "utf-8")
        const directoryContentData = matter(directoryContent)
        directoryContentData.data.paginate = "posts"
        directoryContentData.data.perPage = 3

        const updatedDirectoryContent = matter.stringify(directoryContentData.content, directoryContentData.data)

        fs.writeFileSync(directoryContentPath, updatedDirectoryContent)

        await vi.waitFor(
            () => {
                expect(fs.existsSync(directoryPagesFolder)).toBe(true)
                const pages = fs.readdirSync(directoryPagesFolder)
                const numberOfPages = pages.length
                const expectedNumberOfPages = (Math.ceil(posts.length / 3)) - 1

                expect(numberOfPages).toBe(expectedNumberOfPages)

                pages.forEach((page, index) => {
                    expect(page).toBe((index + 2).toString())
                })
            },
            {
                timeout: 3000,
                interval: 50,
            }
        ) 
    })

    it("Should rebuild the pages, number them correctly, and have the correct content if the paginated collection is changed", async () => {
        const post1 = fs.readFileSync(post1ContentPath, "utf-8")
        const post1Data = matter(post1)
        post1Data.data.collections = ["featured"]
        const updatedPost1 = matter.stringify(post1Data.content, post1Data.data)
        fs.writeFileSync(post1ContentPath, updatedPost1)

        const post4 = fs.readFileSync(post4ContentPath, "utf-8")
        const post4Data = matter(post4)
        post4Data.data.collections = ["featured", "posts"]
        const updatedPost4 = matter.stringify(post4Data.content, post4Data.data)
        fs.writeFileSync(post4ContentPath, updatedPost4)
        
        const post6 = fs.readFileSync(post6ContentPath, "utf-8")
        const post6Data = matter(post6)
        post6Data.data.collections = ["featured", "posts"]
        const updatedPost6 = matter.stringify(post6Data.content, post6Data.data)
        fs.writeFileSync(post6ContentPath, updatedPost6)

        const directoryContent = fs.readFileSync(directoryContentPath, "utf-8")
        const directoryContentData = matter(directoryContent)
        directoryContentData.data.paginate = "featured"

        const updatedDirectoryContent = matter.stringify(directoryContentData.content, directoryContentData.data)
        fs.writeFileSync(directoryContentPath, updatedDirectoryContent)

        await updatePostsCollection()

        await vi.waitFor(
            () => {
                expect(fs.existsSync(directoryPagesFolder)).toBe(true)
                const pages = fs.readdirSync(directoryPagesFolder)
                const numberOfPages = pages.length
                const expectedNumberOfPages = (Math.ceil(featured.length / 3)) - 1

                expect(numberOfPages).toBe(expectedNumberOfPages)

                pages.forEach((page, index) => {
                    expect(page).toBe((index + 2).toString())
                })
    
                const indexPageDocument = new JSDOM(fs.readFileSync(path.join(directoryFolderPath, "index.html"), "utf-8")).window.document
                const indexPagePostA = indexPageDocument.querySelector("#posts > li > a")
                const indexHeading = indexPageDocument.getElementById("heading")
            
                expect(indexPagePostA?.innerHTML).toBe(featured[0].innerHTML)
                expect(indexPagePostA?.getAttribute("href")).toBe("/blog/posts/post1")
            
                expect(indexHeading?.innerHTML).toBe("Welcome to the posts directory")
            
                pages.forEach((page, index) => {
                    const pageDocument = new JSDOM(fs.readFileSync(path.join(directoryPagesFolder, page, "index.html"), "utf-8")).window.document
                    const pagePostA = pageDocument.querySelector("#posts > li > a")
                    const pageHeading = pageDocument.getElementById("heading")
            
                    expect(pagePostA?.innerHTML).toBe(featured[index + 1].innerHTML)
                    expect(pagePostA?.getAttribute("href")).toBe(`/blog/posts/post${page}`)
                        
                    expect(pageHeading?.innerHTML).toBe("Welcome to the posts directory")
                })
            },
            {
                timeout: 3000,
                interval: 50,
            }
        ) 
    })
})