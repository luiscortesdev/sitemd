import { createServer } from "http"
import { readFile, stat } from "fs/promises"
import path from "path"

export async function startServer(outDir: string, port = 3000) {

    const server = createServer(async (req, res) => {
        let filePath = path.join(outDir, req.url || "")

        try {
            let file = await stat(filePath)

            if (file.isDirectory()) {
                filePath = path.join(filePath, "index.html")
            }

            const data = await readFile(filePath)
            res.writeHead(200)
            res.end(data)
        } catch {
            res.writeHead(404)
            res.end("Not Found")
        }
    })

    server.listen(port, () => {
        console.log(`Dev server running at http://localhost:${port}`)
    })

    return server
}