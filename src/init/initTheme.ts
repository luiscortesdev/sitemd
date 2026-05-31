import fs from "fs/promises"
import fsSync from "fs"
import path from "path"
import chalk from "chalk"
import { fileURLToPath } from "url"

import { loadConfig, saveConfig } from "../config/index.js"
import { directoryEmpty, logger } from "../utils/index.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function initTheme(theme: string) {
    const config = await loadConfig()
    const themeDir = path.join(__dirname, "../templates/themes", theme)
    const destinationDir = path.join(process.cwd(), config.themeDir)
    
    try {
        await fs.access(themeDir)
    } catch {
        logger.error(`${theme} DOES NOT EXIST IN ${themeDir}! PLEASE ENTER A VALID THEME! AN EMPTY THEME DIRECTORY HAS BEEN CREATED.`)
        await fs.mkdir(destinationDir)
        
        throw new Error(`THEME ${theme} COULD NOT BE FOUND.`)
    }

    if (fsSync.existsSync(destinationDir)) {
        logger.error(`A THEME FOLDER ALREADY EXISTS AT ${destinationDir}!\n`, chalk.blueBright(`RUN 'sitemd addtheme' `), ` TO ADD A THEME TO AN EXISTING SITEMD PROJECT OR TO SWITCH THEMES.`)      

        throw new Error("THEME FOLDER ALREADY EXISTS.")
    }

    await fs.cp(
        themeDir,
        destinationDir,
        { recursive: true, errorOnExist: true }
    )
    
    // If the theme has content, we copy it to the user's content folder.
    const contentPath = path.join(themeDir, "content")
    const userContentDir = path.join(process.cwd(), "content")
    
    if (fsSync.existsSync(contentPath)) {
        if (await directoryEmpty(userContentDir) === false) {
            logger.warning("THE THEME YOU ARE TRYING TO INITIALIZE HAS A DEFAULT CONTENT FOLDER.\n")
            logger.info("HOWEVER, YOUR PROJECT'S CONTENT FOLDER CONTAINS FILES.")
            logger.notice("TO PREVENT CONTENT LOSS, THE THEME'S CONTENT FOLDER HAS BEEN KEPT IN THE THEME FOLDER.\n")
        }

        if (await directoryEmpty(userContentDir) === true) {
            await fs.cp(contentPath, userContentDir, { recursive: true })
            await fs.rm(path.join(destinationDir, "content"), { recursive: true })
        }

    }

    config.theme = theme
    await saveConfig(process.cwd(), config)
}