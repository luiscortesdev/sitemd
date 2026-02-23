import { access, cp } from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = process.cwd()

export async function copyPublic(publicDir: string, outDir: string) {
    const themeDir = path.join(root, "theme")
    const themePublicDir = path.join (themeDir, "public")

    try {
        await access(themePublicDir)
        await cp(themePublicDir, outDir, { recursive: true, force: true })
    } catch {
        // There is no theme public dir so we can just continue with the user's public dir
    }

    try {
        await access(publicDir)
    } catch {
        // No user public dir so we can return the function
        return
    }
    
    // We override the theme's public directory files with the user's public directory files. 
    await cp(publicDir, outDir, { recursive: true, force: true }) 
}