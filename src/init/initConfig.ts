import fs from "fs/promises"
import fsSync from "fs"
import path from "path"
import chalk from "chalk"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function initConfig() {
    const configPath = path.join(__dirname, "../templates/core/sitemd.config.js")
    const destinationPath = path.join(process.cwd(), "sitemd.config.js")

    try {
        await fs.access(configPath)
    } catch {
        console.log("CONFIG FILE DOESN'T EXIST IN CORE TEMPLATE FILES. TRY REINSTALLING SITEMD.")
        process.exit(1)
    }
    
    if (fsSync.existsSync(path.join(process.cwd(), "sitemd.config.js"))) {
        console.log(chalk.yellowBright("SITEMD.CONFIG.JS ALREADY EXISTS. SKIPPING..."))
    }

    await fs.copyFile(configPath, destinationPath)
}