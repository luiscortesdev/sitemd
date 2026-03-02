import path from "path"
import fs from "fs/promises"
import { loadConfig } from "../core/config/config.js";
import { scanDir } from "../content/index.js"
import { buildPage } from "./buildPage.js"
import { copyPublic } from "./copyPublic.js"
import { loadCache, saveCache } from "../cache/cache.js"
import { hashContent } from "../utils/hash.js"
import { outputExists } from "../utils/fs.js"
import { buildLayoutGraph } from "../layouts/layoutGraph.js"
import { invalidateLayoutCascade } from "../cache/invalidateLayoutCascade.js"
import { resolveLayout } from "../layouts/resolveLayout.js"

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

    console.log(layoutGraph)

    const changedLayouts: string[] = []

    for (const layout of layoutGraph.keys()) {
        const resolvedLayout = await resolveLayout(layout, layoutsDir, themeLayouts)
        const stat = await fs.stat(resolvedLayout)

        const cached = cache.layouts[layout]

        if (!cached || stat.mtimeMs !== cached.mtimeMs) {
            console.log("INVALIDATED", layout)
            changedLayouts.push(layout)
            cache.layouts[layout] = { mtimeMs: stat.mtimeMs }
        }
    }

    for (const layout of changedLayouts) {
        invalidateLayoutCascade(layout, layoutGraph, cache)
        console.log(layoutGraph)
    }

    await copyPublic(publicDir, outputDir)

    const pages = await scanDir(contentDir, contentDir)

    console.log(changedLayouts)
    console.log(cache)
    for (const page of pages) {
        const source = await fs.readFile(page.absolutePath, "utf-8")
        const hash = hashContent(source)
        const cached  = cache.pages[page.absolutePath]

        if (cached && hash === cached.hash && !changedLayouts.includes(cached.layout) && await outputExists(cached.outputDir)) {
            // Page's current hash matches cached hash. Therefore, the file 
            // has not been changed and we don't need to rebuild it.
            console.log("SKIPPED ", page)
            
            continue
        }

        if (cached && !(await outputExists(cached.outputDir))) {
            delete cache.pages[page.absolutePath]
        }
        
        // The file has been changed, so we rebuild it.
        let pageData = await buildPage(page)
        let parsedPage = pageData.html
        let pageLayout = pageData.layout

        const safeRoute = page.route.replace(/^\//, "")

        const outputPath = path.join(
            outputDir,
            page.route === "/" ? "" : safeRoute,
            "index.html"
        )

        if (dev === true) {
            parsedPage = parsedPage.replace(
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
            layout: pageLayout,
            outputDir: outputPath,
        }

        await fs.mkdir(path.dirname(outputPath), { recursive: true })
        await fs.writeFile(outputPath, parsedPage)
        saveCache(root, cache)
    }
}