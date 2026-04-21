import chokidar from "chokidar"

import { loadConfig } from "../config/config.js"

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
            console.log("A FILE HAS BEEN DELETED!")
            await onDeletion(path)
        })

        watcher.on("all", async (event, changedPath) => {
            console.log(`[CHOKIDAR] Event: '${event}' on file: ${changedPath}`)
            await onChange()
        })

        watcher.on("ready", () => {
            resolve(watcher)
        })
    })
}