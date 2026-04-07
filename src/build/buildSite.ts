import path from "path"
import fs from "fs/promises"

import { loadConfig } from "../config/index.js";
import { parsePage, scanDir } from "../content/index.js"
import { buildPage } from "./buildPage.js"
import { copyPublic } from "./copyPublic.js"
import { loadCache, saveCache } from "../cache/index.js"
import { hashContent, outputExists } from "../utils/index.js"
import { buildLayoutGraph, resolveLayout } from "../layouts/index.js"
import { invalidateLayoutCascade, invalidateCollections } from "../cache/index.js"
import { buildCollections, buildCollectionsGraph } from "../collections/index.js"
import { buildPaginatedPages } from "../pagination/index.js";

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


    await copyPublic(publicDir, themeDir, dev ? outputDir : _siteDir) // Switch folders based on dev bool

    const pages = await scanDir(contentDir, contentDir)

    const parsedPages: ParsedPages[] = []
    for (const page of pages) {
        const source = await fs.readFile(page.absolutePath, "utf-8")
        const hash = hashContent(source) 

        const cached = cache.pages[page.absolutePath]

        let parsed
        
        // Only reused cached parse if we are in dev mode
        if (cached && cached.hash === hash && dev) {
            parsed = cached.parsed
        }
        // Always run parsePage when not in dev
        if (!parsed || !dev) {
            parsed = await parsePage(page.absolutePath)
        }

        if (!parsed.data.layout) {
            parsed.data.layout = "default"
        }

        parsedPages.push({
            page,
            parsed,
            hash
        })
    }

    const collections = buildCollections(parsedPages)
    const collectionsGraph = buildCollectionsGraph(parsedPages)
    console.log(collectionsGraph)
    const invalidLayoutCollections = invalidateCollections(cache, parsedPages, collectionsGraph)

    for (const {page, parsed, hash} of parsedPages) {

        const cached = cache.pages[page.absolutePath]

        // Set the page's layout to default if a layout is not defined.
        if (!parsed.data.layout) {
            parsed.data.layout = "default"
        }

        const pageLayout = parsed.data.layout.endsWith(".njk") ? parsed.data.layout : parsed.data.layout + ".njk"

        // Only skip if we are in dev mode and all other conditions are true.
        if (
            cached &&
            hash === cached.hash &&
            await outputExists(cached.outputDir) &&
            !invalidatedLayouts.includes(pageLayout) &&
            !invalidLayoutCollections.includes(pageLayout) &&
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

        const { data } = parsed
        const safeRoute = page.route.replace(/^\//, "")

        if (data.paginate) {
            const paginatedOutputs = await buildPaginatedPages(page, parsed, collections)
            if (!paginatedOutputs) continue

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
                    layout: parsed.data.layout,
                    outputDir: baseOutputPath,
                    parsed: {
                        html: parsed.html,
                        data: parsed.data
                    }
                }
                
                cache.collections = collectionsGraph

                await saveCache(root, cache)
            }

            continue
        }
        
        let outputHtml = await buildPage(collections, parsed)

        const outputPath = path.join(
            dev ? outputDir : _siteDir,
            page.route === "/" ? "" : safeRoute,
            "index.html"
        )

        if (dev === true) {
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
                layout: parsed.data.layout,
                outputDir: outputPath,
                parsed: {
                    html: parsed.html,
                    data: parsed.data
                }
            }

            cache.collections = collectionsGraph

            await saveCache(root, cache)
        }

        await fs.mkdir(path.dirname(outputPath), { recursive: true })
        await fs.writeFile(outputPath, outputHtml)
    }
}