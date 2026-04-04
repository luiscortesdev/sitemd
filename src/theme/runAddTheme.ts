import fs from "fs/promises"
import path from "path";
import chalk from "chalk";
import inquirer from "inquirer";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function runAddTheme(options: { theme: string }) {
    const root = process.cwd()
    const requestedThemePath = path.join(__dirname, `../templates/themes/${options.theme}`)

    try {
        await fs.access(requestedThemePath)
        
    } catch {
        console.log(chalk.redBright(`❌ COULD NOT FIND ${options.theme} THEME. ENSURE IT EXISTS!r5fr`))
    }
}