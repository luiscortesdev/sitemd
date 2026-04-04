import fs from "fs/promises"
import path from "path";
import chalk from "chalk";
import inquirer from "inquirer";

import { fileURLToPath } from "url";
import { loadConfig } from "../config/index.js";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function runAddTheme(options: { theme: string }) {
    const root = process.cwd()
    const config = await loadConfig()
    const requestedThemePath = path.join(__dirname, `../templates/themes/${options.theme}`)

    try {
        await fs.access(requestedThemePath)
        
    } catch {
        console.log(chalk.redBright(`❌ COULD NOT FIND ${options.theme} THEME. ENSURE IT EXISTS!`))
        return
    }

    inquirer.prompt(
        [
            {
                type: "confirm",
                name: "rewriteTheme",
                message: `ARE YOU SURE YOU WANT TO REPLACE YOU CURRENT THEME ${config.theme} WITH ${options.theme}? `,
            }
        ],
    ).then((answer) => {
        if (answer.rewriteTheme === false) {
            return
        }
    })


}