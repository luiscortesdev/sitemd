import path from "path"
import fs from "fs/promises"
import { loadConfig } from "../config/index.js";
import { parsePage, scanDir } from "../content/index.js"
import { buildPage } from "./buildPage.js"
import { copyPublic } from "./copyPublic.js"
import { loadCache, saveCache } from "../cache/index.js"
import { hashContent } from "../utils/hash.js"
import { outputExists } from "../utils/fs.js"
import { buildLayoutGraph } from "../layouts/index.js"
import { invalidateLayoutCascade } from "../cache/index.js"
import { resolveLayout } from "../layouts/index.js"
import { buildCollections } from "../content/index.js";

import type { ParsedPages } from "./build.types.js";

export async function buildSite({ dev }: { dev: boolean }) {
    const config = await loadConfig()
    const root = process.cwd()

    const cache = await loadCache(root)

    const contentDir = path.join(root, config.contentDir)
    const layoutsDir = path.join(root, config.layoutsDir)
    const publicDir = path.join(root, config.publicDir)
    const outputDir = path.join(root, config.outputDir)
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

    

    await copyPublic(publicDir, outputDir)

    const pages = await scanDir(contentDir, contentDir)

    const parsedPages: ParsedPages[] = []
    for (const page of pages) {
        const source = await fs.readFile(page.absolutePath, "utf-8")
        const hash = hashContent(source) 

        const cached = cache.pages[page.absolutePath]

        let parsed

        if (cached && cached.hash === hash) {
            parsed = cached.parsed
        }
        if (!parsed) {
            parsed = await parsePage(page.absolutePath)
        }

        parsedPages.push({
            page,
            parsed,
            hash
        })
    }

    const collections = buildCollections(parsedPages)

    for (const {page, parsed, hash} of parsedPages) {

        const cached  = cache.pages[page.absolutePath]

        const pageLayout = parsed.data.layout.endsWith(".njk") ? parsed.data.layout : parsed.data.layout + ".njk"

        if (cached && hash === cached.hash && await outputExists(cached.outputDir) && !invalidatedLayouts.includes(pageLayout)) {
            // Page's current hash matches cached hash. Therefore, the file 
            // has not been changed and we don't need to rebuild it.
            console.log("SKIPPED ", page)
            
            continue
        }

        if (cached && !(await outputExists(cached.outputDir))) {
            delete cache.pages[page.absolutePath]
        }
        
        let outputHtml = await buildPage(collections, parsed)
        

        const safeRoute = page.route.replace(/^\//, "")

        const outputPath = path.join(
            outputDir,
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

        cache.pages[page.absolutePath] = {
            hash,
            layout: parsed.data.layout,
            outputDir: outputPath,
            parsed: {
                html: parsed.html,
                data: parsed.data
            }
        }

        await fs.mkdir(path.dirname(outputPath), { recursive: true })
        await fs.writeFile(outputPath, outputHtml)
        saveCache(root, cache)
    }
}