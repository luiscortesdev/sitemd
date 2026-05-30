import fs from "fs/promises"
import path from "path";
import chalk from "chalk";
import inquirer from "inquirer";
import { fileURLToPath } from "url";

import { loadConfig, saveConfig } from "../config/index.js";
import { clearFolder, logger } from "../utils/index.js";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function runAddTheme(theme: string) {
    const root = process.cwd()
    const config = await loadConfig()

    const requestedThemePath = path.join(__dirname, `../templates/themes/${theme}`)

    try {
        await fs.access(requestedThemePath)
        
    } catch {
        console.log(chalk.redBright(`❌ COULD NOT FIND ${theme} THEME. ENSURE IT EXISTS!`))
        return
    }

    inquirer.prompt(
        [
            {
                type: "confirm",
                name: "rewriteTheme",
                message: `ARE YOU SURE YOU WANT TO REPLACE YOU CURRENT THEME ${config.theme} WITH ${theme}? `,
            }
        ],
    ).then(async (answer) => {
        if (answer.rewriteTheme === false) {
            return
        }

        if (answer.rewriteTheme == true) {
            const userThemePath = path.join(root, config.themeDir)

            await clearFolder(userThemePath)

            await fs.cp(requestedThemePath, path.join(root, config.themeDir), { recursive: true })

            config.theme = theme

            await saveConfig(root, config)

            console.log(chalk.greenBright(`✅ SUCESSFULLY ADDED THE ${theme} THEME TO YOUR PROJECT!`))
            console.log(chalk.blueBright("THE CONTENT FOLDER WAS KEPT IN THE THEME FOLDER TO PREVENT CONTENT LOSS!"))
        }
    })
}