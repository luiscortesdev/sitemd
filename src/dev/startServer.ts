import fs from "fs/promises"
import path from "path"
import { createServer } from "http"

import { logger } from "../utils/index.js"

export async function startServer(outDir: string, port = 3000) {

    const server = createServer(async (req, res) => {
        let filePath = path.join(outDir, req.url || "")

        try {
            let file = await fs.stat(filePath)

            if (file.isDirectory()) {
                filePath = path.join(filePath, "index.html")
            }

            const data = await fs.readFile(filePath)
            res.writeHead(200)
            res.end(data)
        } catch {
            res.writeHead(404)
            res.end("Not Found")
        }
    })

    server.listen(port, () => {
        logger.info(`DEV SERVER RUNNING AT http://localhost:${port}`)
    })

    return server
}