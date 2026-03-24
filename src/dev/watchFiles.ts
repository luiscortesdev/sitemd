import chokidar from "chokidar"

import { loadConfig } from "../config/config.js"

export async function watchFiles(onChange: () => Promise<void>, onDeletion: (path: string) => Promise<void>) {
    const config = await loadConfig()


    const watcher = chokidar.watch(
        [config.contentDir, config.layoutsDir, config.publicDir, config.themeDir],
        { ignoreInitial: true }
    )

    watcher.on("unlink", async (path) => {
        console.log("A FILE HAS BEEN DELETED!")
        await onDeletion(path)
    })

    watcher.on("all", async () => {
        console.log("FILE CHANGE DETECTED. REBUILDING...")
        await onChange()
    })
}