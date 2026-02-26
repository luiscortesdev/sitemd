import path from "path"
import fs from "fs/promises"

export async function getLayoutStat(name: string, userLayouts: string, themeDir: string) {
    try {
        return await fs.stat(path.join(userLayouts, name))
    } catch {
        return await fs.stat(path.join(themeDir, name))
    }
}