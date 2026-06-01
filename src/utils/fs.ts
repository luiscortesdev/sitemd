import fs from "fs/promises"
import PATH from "path"

export async function outputExists(path: string) {
    try {
        await fs.access(path)

        return true
    } catch {
        return false
    }
}

export async function directoryEmpty(path: string) {
    try {
        const directory = await fs.opendir(path)
        const entry = await directory.read()

        await directory.close()
        return entry == null
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`INTERNAL ERROR CHECKING ITEMS IN ${path}: ${error.message}`)
        } else {
            throw new Error(`UNKNOWN INTERNAL ERROR OCCURRED IN directoryEmpty(): ${error}`);
        }
    }
}

export async function clearFolder(path: string) {
    try {
        const entries = await fs.readdir(path)

        for (const entry of entries) {
            const fullPath = PATH.join(path, entry)
            

            const stats = await fs.stat(fullPath)

            if (stats.isFile()) {
                await fs.unlink(fullPath)
            } else if (stats.isDirectory()) {
                await fs.rm(fullPath, { recursive: true })
            }
        }

        return
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`INTERNAL ERROR CLEARING FILES IN ${path}: ${error.message}`)
        } else {
            throw new Error(`UNKNOWN INTERNAL ERROR OCCURRED IN clearFolder(): ${error}`);
        }
    }
}