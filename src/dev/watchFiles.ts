import chokidar from "chokidar"

import { loadConfig } from "../config/index.js"
import { logger } from "../utils/index.js"

export async function watchFiles(onChange: () => Promise<void>, onDeletion: (path: string) => Promise<void>) {
    return new Promise(async (resolve) => {
        const config = await loadConfig()


        const watcher = chokidar.watch(
            [config.contentDir, config.layoutsDir, config.publicDir, config.themeDir],
            { 
                ignoreInitial: true, 
                ignored: ["**/.sitemd/**", "**/dist/**", "**/node_modules/**", /(^|[\/\\])\../, "**/_site/**"], 
                persistent: true,
            }
        )

        watcher.on("unlink", async (path) => {
            logger.debug("A FILE HAS BEEN DELETED!")
            await onDeletion(path)
        })

        watcher.on("all", async (event, changedPath) => {
            logger.debug(`[CHOKIDAR] EVENT: '${event}' ON FILE: ${changedPath}`)
            await onChange()
        })

        watcher.on("ready", () => {
            resolve(watcher)
        })
    })
}