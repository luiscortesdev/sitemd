import fs from "fs/promises"
import fsSync from "fs"
import path from "path"
import chalk from "chalk"

import type { NewFolderTypes } from "./init.types.js"

export async function initFolders(folders: NewFolderTypes[]) {
    const root = process.cwd()

    folders.forEach(async (folder) => {
        const folderDir = path.join(root, folder)

        if (!fsSync.existsSync(folderDir)) {
            await fs.mkdir(folderDir)
            console.log(chalk.blueBright(`CREATED ${folder.toUpperCase()} DIRECTORY!`))
        } else {
            console.log(chalk.yellowBright(`${folder.toUpperCase()} DIRECTORY EXISTS. SKIPPING...`))
        }
    })
}