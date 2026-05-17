import path from "path"
import fs from "fs/promises"

import { loadConfig } from "../config/index.js";
import { parsePage, scanDir } from "../content/index.js"
import { buildPage } from "./buildPage.js"
import { copyPublic } from "./copyPublic.js"
import { loadCache, saveCache } from "../cache/index.js"
import { hashContent, outputExists, clearFolder } from "../utils/index.js"
import { buildLayoutGraph, resolveLayout } from "../layouts/index.js"
import { invalidateLayoutCascade, invalidateCollections } from "../cache/index.js"
import { buildCollections, buildCollectionsGraph } from "../collections/index.js"
import { buildPaginatedPages, deletePagination } from "../pagination/index.js";

import type { ParsedPages } from "./build.types.js";

export async function buildSite({ dev }: { dev: boolean }) {
    const config = await loadConfig()
    const root = process.cwd()

    const cache = await loadCache(root)

    const contentDir = path.join(root, config.contentDir)
    const layoutsDir = path.join(root, config.layoutsDir)
    const publicDir = path.join(root, config.publicDir)
    const outputDir = path.join(root, config.outputDir)
    const _siteDir = path.join(root, config._siteDir)
    const themeDir = path.join(root, config.themeDir)
    const themeLayouts = path.join(themeDir, "layouts")

    const layoutGraph = await buildLayoutGraph(layoutsDir, themeLayouts)

    let changedLayouts: string[] = []
    let invalidatedLayouts: string[] = []
    for (const layout of layoutGraph.keys()) {
        const resolvedLayout = await resolveLayout(layout, layoutsDir, themeLayouts)
        const stat = await fs.stat(resolvedLayout)

        const cached = cache.layouts[layout]

        if (!cached || stat.mtimeMs !== cached.mtimeMs) {
            
            changedLayouts.push(layout)
            cache.layouts[layout] = { mtimeMs: stat.mtimeMs }
        }
    }

    for (const layout of changedLayouts) {
        const allInvalidLayouts = invalidateLayoutCascade(layout, layoutGraph, cache)
        for (const invalidLayout of allInvalidLayouts) {
            invalidatedLayouts.push(invalidLayout)
        }
        
    }

    // If we are in build mode then we must clear out the _siteDir before rebuilding to ensure fresh content
    if (!dev) {
        await clearFolder(_siteDir)
    }

    await copyPublic(publicDir, themeDir, dev ? outputDir : _siteDir) // Switch folders based on dev bool

    const pages = await scanDir(contentDir, contentDir)

    const parsedPages: ParsedPages[] = []
    for (const page of pages) {
        const source = await fs.readFile(page.absolutePath, "utf-8")
        const hash = hashContent(source) 

        const cached = cache.pages[page.absolutePath]

        let data = {
            title: "",
            description: "",
            layout: "",
        }

        let html = ""
        
        // Only reused cached parse if we are in dev mode
        if (cached && cached.hash === hash && dev) {
            data = cached.data
            console.log("SKIPPED REBUILDING PAGE: ", page)
            html = cached.html
        } else {
            const rawData = (await parsePage(page.absolutePath))
            console.log("REBUILDING PAGE: ", page)
            data = rawData.data
            html = rawData.html
        }

        parsedPages.push({
            page,
            data,
            html,
            hash,
        })
    }

    console.dir(parsedPages, { depth: null })

    const collections = await buildCollections(parsedPages)
    console.log("COLLECTIONS: ", collections)
    const collectionsGraph = await buildCollectionsGraph(parsedPages)
    console.log("COLLECTIONS GRAPH: ", collectionsGraph)
    const invalidCollections = invalidateCollections(cache, parsedPages, collectionsGraph)
    const layoutsWithChangedCollections = invalidCollections.layoutsWithChangedCollections
    const changedCollections = invalidCollections.changedCollections

    console.log("INVALID LAYOUT COLLECTIONS: ", layoutsWithChangedCollections)
    console.log("INVALIDATED LAYOUTS: ", invalidatedLayouts)

    for (const {page, data, html, hash} of parsedPages) {

        const cached = cache.pages[page.absolutePath]

        const pageLayout = data.layout.endsWith(".njk") ? data.layout : data.layout + ".njk"

        // Only skip if we are in dev mode and all other conditions are true.
        if (
            cached &&
            hash === cached.hash &&
            await outputExists(cached.outputDir) &&
            !invalidatedLayouts.includes(pageLayout) &&
            !layoutsWithChangedCollections.includes(pageLayout) &&
            (data.paginate ? !changedCollections.includes(data.paginate) : true) &&
            dev
        ) {
            // Page's current hash matches cached hash. Therefore, the file 
            // has not been changed and we don't need to rebuild it.
            console.log("SKIPPED ", page)
            
            continue
        }

        // Only update the cache in dev mode
        if (cached && !(await outputExists(cached.outputDir)) && dev) {
            delete cache.pages[page.absolutePath]
        }
        
        // If a paginated page last cycle in dev mode is no longer paginated we need to cleanup its pages.
        if (!data.paginate && cache.pagination.includes(page.absolutePath) && dev) {
            await deletePagination(outputDir, page)
        }

        const safeRoute = page.route.replace(/^\//, "")

        if (data.paginate) {
            console.log("BUILDING PAGINATED PAGE: ", page)
            const paginatedOutputs = await buildPaginatedPages(page, data, html, collections)
            if (!paginatedOutputs || paginatedOutputs.length === 0) continue
            
            // In dev mode sometimes a page folder could be already there. If so, then we want to clear it.
            const pageOutputFolder = path.join(outputDir, safeRoute, "page")
            if (await outputExists(pageOutputFolder)) {
                await clearFolder(pageOutputFolder)
            }

            for (const { html, pageNumber } of paginatedOutputs) {
                const pagePath = 
                    pageNumber === 1 ? 
                        path.join(dev ? outputDir : _siteDir, safeRoute, "index.html") : 
                        path.join(dev ? outputDir : _siteDir, safeRoute, "page", String(pageNumber), "index.html")

                let outputHtml = html

                if (dev) {
                    outputHtml = outputHtml.replace(
                        "</body>",
                        `<script>
                            const ws = new WebSocket("ws://localhost:3000");
                            ws.onmessage = () => location.reload();
                        </script>
                        </body>`
                    )
                }

                await fs.mkdir(path.dirname(pagePath), { recursive: true })
                await fs.writeFile(pagePath, outputHtml)
            }

            const baseOutputPath = path.join(
                dev ? outputDir : _siteDir,
                page.route === "/" ? "" : safeRoute,
                "index.html"
            )
            
            if (dev) {
                cache.pages[page.absolutePath] = {
                    hash,
                    layout: data.layout,
                    outputDir: baseOutputPath,
                    data: data,
                    html: html,
                }
                
                if (!cache.pagination.includes(page.absolutePath)) {
                    cache.pagination.push(page.absolutePath)
                }

                await saveCache(root, cache)
            }

            continue
        }
        
        let outputHtml = await buildPage(collections, data, html)

        const outputPath = path.join(
            dev ? outputDir : _siteDir,
            page.route === "/" ? "" : safeRoute,
            "index.html"
        )

        if (dev) {
            outputHtml = outputHtml.replace(
                "</body>",
                `<script>
                    const ws = new WebSocket("ws://localhost:3000");
                    ws.onmessage = () => location.reload();
                </script>
                </body>`
            )
        }
        
        if (dev) {
            cache.pages[page.absolutePath] = {
                hash,
                layout: data.layout,
                outputDir: outputPath,
                data: data,
                html: html,
            }

            await saveCache(root, cache)
        }

        await fs.mkdir(path.dirname(outputPath), { recursive: true })
        await fs.writeFile(outputPath, outputHtml)
    }

    cache.collections = collectionsGraph
    await saveCache(root, cache)
}