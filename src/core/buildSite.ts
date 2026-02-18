import path from "path"
import { scanDir } from "./scanDir.js"
import { cleanOuput } from "./cleanOutput.js"

export async function buildSite() {
    const root = process.cwd()
    const contentDir = path.join(root, "content")
    const outputDir = path.join(root, "output")

    await cleanOuput(outputDir)
    const pages = await scanDir(contentDir, contentDir)
}