import path from "path"

import { buildSite } from "../build/index.js"
import { handleCleanup } from "../cleanup/index.js"
import { startServer, watchFiles, attachLiveReload } from "../dev/index.js"
import { loadConfig } from "../config/index.js"
import { timer, clearFolder } from "../utils/index.js"

export async function runDev() {
    const config = await loadConfig()
    const initialBuildStart = performance.now()

    const root = process.cwd()
    const outputDir = path.join(root, config.outputDir)

    // Clear output folder and initially build site on running dev command
    await clearFolder(outputDir)
    await buildSite({ dev: true })

    timer("Build", initialBuildStart)

    const server = await startServer(outputDir, config.dev.port)
    const reload = attachLiveReload(server)

    await watchFiles(
        async () => {
            const reloadBuildStart = performance.now()

            await buildSite({ dev: true })

            timer("Reload", reloadBuildStart)
            reload()
        },
        async (path) => {
            const cleanupStart = performance.now()

            await handleCleanup(path)

            timer("Cleanup", cleanupStart)
        }
    )
}