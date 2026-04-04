import fs from "fs/promises"

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
            console.error(`INTERNAL ERROR CHECKING ITEMS IN ${path}: ${error.message}`)
        } else {
            console.error(`UNKNOWN INTERNAL ERROR OCCURRED IN directoryEmpty(): ${error}`);
        }
        
        return false
    }
}

export async function clearFolder(path: string) {
    try {
        const entries = await fs.readdir(path)

        for (const entry of entries) {
            const stats = await fs.stat(entry)

            if (stats.isFile()) {
                await fs.unlink(entry)
            } else if (stats.isDirectory()) {
                await fs.rm(entry)
            }
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error(`INTERNAL ERROR CLEARING FILES IN ${path}: ${error.message}`)
        } else {
            console.error(`UNKNOWN INTERNAL ERROR OCCURRED IN clearFolder(): ${error}`);
        }

        return
    }
}