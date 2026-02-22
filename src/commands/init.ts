import { cp } from "fs/promises"

import { fileURLToPath } from "url"
import path from "path"
import chalk from "chalk"
import fs from "fs"

import { initTheme } from "../core/initTheme.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const templatesDir = path.join(__dirname, "../templates")

export async function init(options: { theme: string }) {
    const cwd = process.cwd()

    if (fs.existsSync(path.join(cwd, "/layouts")) || fs.existsSync(path.join(cwd, "/public")) || fs.existsSync(path.join(cwd, "/content"))) {
        console.log(chalk.yellowBright("🚨 PROJECT IS ALREADY INTIALIZED!"))
        return
    }

    console.log(chalk.blue("INITIALIZING PROJECT..."))

    await initTheme(options.theme)

    console.log(chalk.greenBright("✅ PROJECT INITIALIZED!"))
}