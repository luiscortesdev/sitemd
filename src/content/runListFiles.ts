import path from "path";
import { scanDir } from "../content/index.js"
import { loadConfig } from "../core/config/config.js";

const root = process.cwd()

export async function runListFiles() {
    const config = await loadConfig()
    const contentDir = config.contentDir

    let files = await scanDir(path.resolve(root, contentDir), path.resolve(root, contentDir))
    console.log(files)
}