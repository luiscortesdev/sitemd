import path from "path"
import fs from "fs/promises"

import { loadConfig } from "../config/index.js";
import { directoryEmpty } from "../utils/index.js";

export async function deleteOutput(relativePath: string) {
    const config = await loadConfig()
    const root = process.cwd()

    const pathSplit = relativePath.split(path.sep)

    let pathWithoutTopLevelFolders = ""

    if (pathSplit[0] === config.themeDir) {
        if (pathSplit[1] === config.layoutsDir || pathSplit[1] === config.publicDir) {
            pathWithoutTopLevelFolders = pathSplit.slice(2, pathSplit.length).join(path.sep)
        } else {
            console.log("INVALID! DELETED FILE IS IN THE THEME FOLDER, BUT IS NOT IN LAYOUTS OR PUBLIC FOLDER!")
        }
    } else {
        pathWithoutTopLevelFolders = pathSplit.slice(1, pathSplit.length).join(path.sep)
    }

    let outputPath = path.join(root, config.outputDir, pathWithoutTopLevelFolders)

    if (path.extname(outputPath) === ".md") {
        outputPath = outputPath.replace(".md", ".html")
    }

    const outputPathParentFolder = path.dirname(outputPath)


    try {
        await fs.access(outputPath)

        await fs.rm(outputPath)
        try {
            if (await directoryEmpty(outputPathParentFolder)) {
                await fs.rmdir(outputPathParentFolder)
            } 
        } catch {
            console.log(`INTERNAL ERROR: COULD NOT REMOVE ${outputPathParentFolder}`)
        }
    } catch {
        console.log(`INTERNAL ERROR: OUTPUT PATH ${outputPath} DOES NOT EXIST!`)
    }
    
}   