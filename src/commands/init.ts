import { cp } from "fs/promises"

import { fileURLToPath } from "url"
import path from "path"
import chalk from "chalk"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const templatesDir = path.join(__dirname, "../templates")

export async function init() {
    const cwd = process.cwd()

    console.log(chalk.blue("INITIALIZING PROJECT..."))

    await cp(templatesDir, cwd, { recursive: true, errorOnExist: true })

    console.log(chalk.greenBright("✅ Project Initialized!"))
}