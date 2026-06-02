import path from "path";
import util from "util"

import { scanDir } from "../content/index.js"
import { loadConfig } from "../config/index.js";
import { logger } from "../utils/index.js";

export async function runListFiles() {
    const root = process.cwd()
    const config = await loadConfig()
    const contentDir = config.contentDir

    let files = await scanDir(path.resolve(root, contentDir), path.resolve(root, contentDir))
    logger.success("SCANNED FILES SUCCESSFULLY")
    logger.info(`FILES IN CONTENT DIRECTORY ${path.resolve(root, contentDir)}:\n\n`, util.inspect(files, { depth: null }))
}