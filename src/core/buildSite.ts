import path from "path"
import { mkdir, writeFile } from "fs/promises"
import { scanDir } from "./scanDir.js"
import { cleanOuput } from "./cleanOutput.js"
import { buildPage } from "./buildPage.js"
import { copyPublic } from "./copyPublic.js"

export async function buildSite() {
    const root = process.cwd()
    const contentDir = path.join(root, "content")
    const publicDir = path.join(root, "public")
    const outputDir = path.join(root, "output")

    await cleanOuput(outputDir)
    await copyPublic(publicDir, outputDir)
    const pages = await scanDir(contentDir, contentDir)


    for (const page of pages) {
        const parsedPage = await buildPage(page)
        const safeRoute = page.route.replace(/^\//, "")

        const outputPath = path.join(
            outputDir,
            page.route === "/" ? "" : safeRoute,
            "index.html"
        )

        await mkdir(path.dirname(outputPath), { recursive: true })
        await writeFile(outputPath, parsedPage)
    }
}