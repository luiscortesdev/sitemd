import fsSync from "fs"
import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function initConfig() {
    const configPath = path.join(__dirname, "../templates/core/sitemd.config.js")
    const destinationPath = path.join(process.cwd(), "sitemd.config.js")

    try {
        await fs.access(configPath)
    } catch {
        console.log("CONFIG FILE DOESN'T EXIST IN CORE TEMPLATE FILES. TRY REINSTALLING THE MODULE.")
        process.exit(1)
    }
    
    if (fsSync.existsSync(path.join(process.cwd(), "sitemd.config.js"))) {
        console.error("SITEMD.CONFIG.JS ALREADY EXISTS")
        process.exit(1)
    }

    await fs.copyFile(configPath, destinationPath)
}