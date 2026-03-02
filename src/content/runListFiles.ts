import path from "path";
import { scanDir } from "../content/index.js"
import { loadConfig } from "../core/config/config.js";

export async function runListFiles() {
    const config = await loadConfig()
    const contentDir = config.contentDir

    let files = await scanDir(path.resolve(import.meta.dirname, contentDir), path.resolve(import.meta.dirname, contentDir))
    console.log(files)
}