import path from "path"
import fs from "fs/promises"
import util from "util"

import { loadConfig } from "../config/index.js";
import { parsePage, scanDir } from "../content/index.js"
import { buildPage } from "./buildPage.js"
import { copyPublic } from "./copyPublic.js"
import { loadCache, saveCache } from "../cache/index.js"
import { hashContent, outputExists, clearFolder, logger, normalizePath } from "../utils/index.js"
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

    // Get every layout and it's parents
    const layoutGraph = await buildLayoutGraph(layoutsDir, themeLayouts)

    let changedLayouts: string[] = []
    let invalidatedLayouts: string[] = []

    // Invalidate the layouts whose content have been edited
    for (const layout of layoutGraph.keys()) {
        const resolvedLayout = await resolveLayout(layout, layoutsDir, themeLayouts)
        const stat = await fs.stat(resolvedLayout)

        const cached = cache.layouts[layout]

        if (!cached || stat.mtimeMs !== cached.mtimeMs) {
            changedLayouts.push(layout)
            cache.layouts[layout] = { mtimeMs: stat.mtimeMs }
        }
    }

    // Invalidate all of the dependent layouts of a base layout if it has been edited.
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

    const pages = await scanDir(contentDir, contentDir) // Scan the directory for content pages

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
        
        // Only reused cached page parse if we are in dev mode
        if (cached && cached.hash === hash && dev) {
            data = cached.data
            logger.debug("SKIPPED REBUILDING PAGE: ", page)
            html = cached.html
        } else {
            const rawData = (await parsePage(page.absolutePath))
            logger.debug("REBUILDING PAGE: ", page)
            data = rawData.data
            html = rawData.html
        }

        logger.debug(`PAGE DATA ${path}: `, util.inspect(data, {depth:null}))

        parsedPages.push({
            page,
            data,
            html,
            hash,
        })
    }

    logger.debug("FULL PARSED PAGES OBJECT: ", util.inspect(parsedPages, { depth: null, colors: true }))

    // Get the full page objects for the pages belonging to each collection
    const collections = await buildCollections(parsedPages)
    logger.debug("COLLECTIONS FOR BUILDING PAGE: ", collections)

    // Get just the absolute path for the pages belonging to each collection
    const collectionsGraph = await buildCollectionsGraph(parsedPages)
    logger.debug("COLLECTIONS GRAPH FOR CACHING: ", collectionsGraph)
    
    // Get layouts who are being used in pages with changed collections, collections whose member pages have changed, and collections whose
    // pages have been directly edited.
    const { layoutsWithChangedCollections, collectionsWithMemberChanges, collectionsWithChangedPages } = invalidateCollections(cache, parsedPages, collectionsGraph)

    logger.debug("INVALID LAYOUT COLLECTIONS: ", layoutsWithChangedCollections)
    logger.debug("INVALIDATED LAYOUTS: ", invalidatedLayouts)
    logger.debug("INVALID PAGES: ",  collectionsWithChangedPages)

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
            !(data?.usesCollections?.some((collection) => collectionsWithChangedPages.has(collection) || collectionsWithMemberChanges.has(collection))) &&
            (data.paginate ? !collectionsWithMemberChanges.has(data.paginate) && !collectionsWithChangedPages.has(data.paginate) : true) &&
            dev
        ) {
            // If all conditions above passed, we can safely skip rebuilding this page.
            logger.debug("SKIPPED BUILDING PAGE: ", page)
            
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
            logger.debug("BUILDING PAGINATED PAGE: ", page)
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
                    outputDir: normalizePath(baseOutputPath, path.sep),
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
                outputDir: normalizePath(outputPath, path.sep),
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