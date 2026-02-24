import path from "path"
import fs from "fs/promises"
import { loadConfig } from "./config/config.js"
import { scanDir } from "./scanDir.js"
import { cleanOuput } from "./cleanOutput.js"
import { buildPage } from "./buildPage.js"
import { copyPublic } from "./copyPublic.js"
import { loadCache, saveCache } from "../cache/cache.js"
import { hashContent } from "../utils/hash.js"
import { invalidateLayout } from "../cache/invalidateLayout.js"
import { outputExists } from "../utils/fs.js"

export async function buildSite({ dev }: { dev: boolean }) {
    const config = await loadConfig()
    const root = process.cwd()

    const cache = await loadCache(root)

    const contentDir = path.join(root, config.contentDir)
    const layoutsDir = path.join(root, config.layoutsDir)
    const publicDir = path.join(root, config.publicDir)
    const outputDir = path.join(root, config.outputDir)

    const layoutFiles = await fs.readdir(layoutsDir)

    for (const file of layoutFiles) {
        if (!file.endsWith(".njk")) continue

        const layoutPath = path.join(layoutsDir, file)
        const stat = await fs.stat(layoutPath)
        const cached = cache.layouts[file]

        if (!cached || cached.mtimeMs !== stat.mtimeMs) {
            invalidateLayout(file, cache)
            cache.layouts[file] = { mtimeMs: stat.mtimeMs }
        }
    }

    await copyPublic(publicDir, outputDir)

    const pages = await scanDir(contentDir, contentDir)

    for (const page of pages) {
        const source = await fs.readFile(page.absolutePath, "utf-8")
        const hash = hashContent(source)
        const cached  = cache.pages[page.absolutePath]

        if (cached && hash === cached.hash && await outputExists(cached.outputDir)) {
            // Page's current hash matches cached hash. Therefore, the file 
            // has not been changed and we don't need to rebuild it.
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