import { readdir } from "fs/promises"
import path from "path"

import type { PageFile } from "../types/PageFile.js"

export async function scanDir(dir: string, baseDir: string): Promise<PageFile[]> {
    const results: PageFile[] = []

    const entries = await readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
            const childResults = await scanDir(fullPath, baseDir)
            results.push(...childResults)
        }

        if (entry.isFile() && entry.name.endsWith(".md")) {
            if (entry.name !== "index.md") {
                throw new Error("Routes can only be defined with index.md")
            }

            const folderPath = path.dirname(fullPath)
            const relativeFolder = path.relative(baseDir, folderPath)
            const segments = relativeFolder.split(path.sep)

            const forwardSlashPath = relativeFolder
                .split(path.sep)
                .join("/")

            let route = "/" + forwardSlashPath

            if (route === "/") route = "/"
            if (route === "/.") route = "/"

            results.push({
                absolutePath: fullPath,
                relativePath: relativeFolder,
                route,
                segments
            })
        }
    }

    return results
}