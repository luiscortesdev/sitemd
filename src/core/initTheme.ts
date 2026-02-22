import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path"
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function initTheme(theme: string) {
    const themeDir = path.join(__dirname, "../templates/themes", theme)
    const destinationDir = path.join(process.cwd(), "theme")

    try {
        await fs.access(themeDir)
    } catch {
        console.error(`${theme} DOES NOT EXIST!`)
        process.exit(1)
    }

    if (existsSync(destinationDir)) {
        console.error(`A THEME FOLDER ALREADY EXISTS AT ${destinationDir}`)
        process.exit(1)
    }

    await fs.cp(
        themeDir,
        destinationDir,
        { recursive: true, errorOnExist: true }
    )
}