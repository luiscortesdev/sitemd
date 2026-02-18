import { access, cp } from "fs/promises"

export async function copyPublic(publicDir: string, outDir: string) {
    try {
        await access(publicDir)
    } catch {
        return
    }

    await cp(publicDir, outDir, { recursive: true }) 
}