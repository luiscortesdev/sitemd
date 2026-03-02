import fs from "fs/promises"
import path from "path"

const root = process.cwd()

export async function copyPublic(publicDir: string, outDir: string) {
    const themeDir = path.join(root, "theme")
    const themePublicDir = path.join (themeDir, "public")

    try {
        await fs.access(themePublicDir)
        await fs.cp(themePublicDir, outDir, { recursive: true, force: true })
    } catch {
        // There is no theme public dir so we can just continue with the user's public dir
    }

    try {
        await fs.access(publicDir)
    } catch {
        // No user public dir so we can return the function
        return
    }
    
    // We override the theme's public directory files with the user's public directory files. 
    await fs.cp(publicDir, outDir, { recursive: true, force: true }) 
}