import fs from "fs/promises";
import fsSync from "fs";
import path from "path"
import chalk from "chalk";
import { fileURLToPath } from "url";

import { directoryEmpty } from "../utils/fs.js";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function initTheme(theme: string) {
    const themeDir = path.join(__dirname, "../templates/themes", theme)
    const destinationDir = path.join(process.cwd(), "theme")

    try {
        await fs.access(themeDir)
    } catch {
        console.error(`${theme} DOES NOT EXIST IN ${themeDir}! PLEASE ENTER A VALID THEME! AN EMPTY THEME DIRECTORY HAS BEEN CREATED.`)
        await fs.mkdir(destinationDir)
        process.exit(1)
    }

    if (fsSync.existsSync(destinationDir)) {
        console.error(chalk.redBright(`A THEME FOLDER ALREADY EXISTS AT ${destinationDir}!\n`) + chalk.blueBright(`RUN${chalk.cyan(" 'sitemd addtheme' ")}TO ADD A THEME TO AN EXISTING SITEMD PROJECT OR TO SWITCH THEMES.`))        
        process.exit(1)
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
            console.log(chalk.blueBright("THE THEME YOU ARE TRYING TO INITIALIZE HAS A DEFAULT CONTENT FOLDER.\n") + chalk.redBright("HOWEVER, YOUR PROJECT'S CONTENT FOLDER CONTAINS FILES."))
            console.log(chalk.greenBright("TO PREVENT CONTENT LOSS, THE THEME'S CONTENT FOLDER HAS BEEN KEPT IN THE THEME FOLDER.\n"))
        }

        if (await directoryEmpty(userContentDir) === true) {
            await fs.cp(contentPath, userContentDir, { recursive: true })
            await fs.rm(path.join(destinationDir, "content"), { recursive: true })
        }

    }
}