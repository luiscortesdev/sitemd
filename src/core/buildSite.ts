import path from "path"
import { mkdir, writeFile } from "fs/promises"
import { loadConfig } from "../config.js"
import { scanDir } from "./scanDir.js"
import { cleanOuput } from "./cleanOutput.js"
import { buildPage } from "./buildPage.js"
import { copyPublic } from "./copyPublic.js"

export async function buildSite({ dev }: { dev: boolean }) {
    const config = await loadConfig()
    const root = process.cwd()

    const contentDir = path.join(root, config.contentDir)
    const publicDir = path.join(root, config.publicDir)
    const outputDir = path.join(root, config.outDir)

    await cleanOuput(outputDir)
    await copyPublic(publicDir, outputDir)
    const pages = await scanDir(contentDir, contentDir)


    for (const page of pages) {
        let parsedPage = await buildPage(page)
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

        await mkdir(path.dirname(outputPath), { recursive: true })
        await writeFile(outputPath, parsedPage)
    }
}