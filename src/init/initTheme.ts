import fsSync from "fs";
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
        console.error(`${theme} DOES NOT EXIST AT ${themeDir}!`)
        process.exit(1)
    }

    if (fsSync.existsSync(destinationDir)) {
        console.error(`A THEME FOLDER ALREADY EXISTS AT ${destinationDir}`)
        process.exit(1)
    }

    await fs.cp(
        themeDir,
        destinationDir,
        { recursive: true, errorOnExist: true }
    )
    
    const contentPath = path.join(themeDir, "content")
    if (fsSync.existsSync(contentPath)) {
        await fs.cp(contentPath, path.join(process.cwd(), "content"), { recursive: true })
        await fs.rm(path.join(destinationDir, "content"), { recursive: true })
    } else {
        await fs.mkdir(path.join(process.cwd(), "content"))
    }

    await fs.mkdir(path.join(process.cwd(), "public"))
    await fs.mkdir(path.join(process.cwd(), "layouts"))
}