import fsSync from "fs"
import path from "path"

import { initTheme } from "./initTheme.js"
import { initConfig } from "./initConfig.js"
import { initFolders } from "./initFolders.js"
import { logger } from "../utils/index.js"

export async function runInit(options: { theme: string }) {
    const root = process.cwd()

    if (fsSync.existsSync(path.join(root, "/layouts")) && fsSync.existsSync(path.join(root, "/public")) && fsSync.existsSync(path.join(root, "/content")) && fsSync.existsSync(path.join(root, "/theme")) && fsSync.existsSync(path.join(root, "sitemd.config.js"))) {
        logger.notice("PROJECT IS ALREADY INTIALIZED!")
        return
    }

    logger.process("INITIALIZING PROJECT...")
    
    try {
        await initFolders(["layouts", "public", "content"])
        await initConfig()
        await initTheme(options.theme)
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message)
        }
        process.exit(1)
    }

    logger.success("PROJECT INITIALIZED!")
}