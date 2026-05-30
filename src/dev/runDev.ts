import path from "path"

import { buildSite } from "../build/index.js"
import { handleCleanup, validateCache } from "../cleanup/index.js"
import { startServer, watchFiles, attachLiveReload } from "../dev/index.js"
import { loadConfig } from "../config/index.js"
import { timer, clearFolder, logger } from "../utils/index.js"

export async function runDev() {
    const config = await loadConfig()
    const initialBuildStart = performance.now()

    const root = process.cwd()
    const outputDir = path.join(root, config.outputDir)

    // Clear output folder and initially build site on running dev command
    await clearFolder(outputDir)
    await validateCache()
    await buildSite({ dev: true })

    timer("Build", initialBuildStart)

    const server = await startServer(outputDir, config.dev.port)
    const reload = attachLiveReload(server)

    let isBuilding = false
    let buildPending = false

    const watcher = await watchFiles(
        async () => {
            if (isBuilding) {
                logger.notice("BUILD ALREADY IN PROGRESS, QUEUEING...")
                
                buildPending = true
                return
            }

            isBuilding = true

            do {
                buildPending = false

                try {
                    const reloadBuildStart = performance.now()

                    await buildSite({ dev: true })

                    timer("Reload", reloadBuildStart)

                    reload()
                } catch (error) {

                    logger.error("BUILD FAILED DURING RELOAD WITH ERROR:", error);
                }
            } while (buildPending)

            isBuilding = false
            
        },
        async (path) => {
            const cleanupStart = performance.now()

            await handleCleanup(path)

            timer("Cleanup", cleanupStart)
        }
    )
    
    return { server, watcher }
}