import path from "path"
import { attachLiveReload } from "../core/attachLiveReload.js"
import { buildSite } from "../core/buildSite.js"
import { startServer } from "../core/devServer.js"
import { watchFiles } from "../core/watchFiles.js"
import { loadConfig } from "../config.js"

export async function dev() {

    const config = await loadConfig()

    const root = process.cwd()
    const outputDir = path.join(root, config.outDir)

    await buildSite({ dev: true })

    const server = await startServer(outputDir, config.dev.port)
    const reload = attachLiveReload(server)

    watchFiles(async () => {
        await buildSite({ dev: true })
        reload()
    })
}