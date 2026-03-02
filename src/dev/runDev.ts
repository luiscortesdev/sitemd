import path from "path"
import { buildSite } from "../build/index.js"
import { startServer, watchFiles, attachLiveReload } from "../dev/index.js"
import { loadConfig } from "../core/config/config.js"
import { timer } from "../utils/timer.js"

export async function runDev() {
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