import path from "path"
import { attachLiveReload } from "../core/attachLiveReload.js"
import { buildSite } from "../core/buildSite.js"
import { startServer } from "../core/devServer.js"
import { watchFiles } from "../core/watchFiles.js"
import { loadConfig } from "../core/config/config.js"
import { timer } from "../utils/timer.js"

export async function dev() {
    const config = await loadConfig()
    const initialBuildStart = performance.now()

    const root = process.cwd()
    const outputDir = path.join(root, config.outputDir)

    await buildSite({ dev: true })

    timer("Build", initialBuildStart)

    const server = await startServer(outputDir, config.dev.port)
    const reload = attachLiveReload(server)

    watchFiles(async () => {
        const reloadBuildStart = performance.now()

        await buildSite({ dev: true })

        timer("Reload", reloadBuildStart)
        reload()
    })
}