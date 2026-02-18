import path from "path"
import { attachLiveReload } from "../core/attachLiveReload.js"
import { buildSite } from "../core/buildSite.js"
import { startServer } from "../core/devServer.js"
import { watchFiles } from "../core/watchFiles.js"

export async function dev() {
    const root = process.cwd()
    const outputDir = path.join(root, "output")

    await buildSite({ dev: true })

    const server = startServer(outputDir, 3000)
    const reload = attachLiveReload(server)

    watchFiles(async () => {
        await buildSite({ dev: true })
        reload()
    })
}