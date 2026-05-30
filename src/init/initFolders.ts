import fs from "fs/promises"
import fsSync from "fs"
import path from "path"

import { logger } from "../utils/index.js"

import type { NewFolderTypes } from "./init.types.js"

export async function initFolders(folders: NewFolderTypes[]) {
    const root = process.cwd()

    folders.forEach(async (folder) => {
        const folderDir = path.join(root, folder)

        if (!fsSync.existsSync(folderDir)) {
            await fs.mkdir(folderDir)
            logger.success(`CREATED ${folder.toUpperCase()} DIRECTORY!`)
        } else {
            logger.notice(`${folder.toUpperCase()} DIRECTORY EXISTS. SKIPPING...`)
        }
    })
}