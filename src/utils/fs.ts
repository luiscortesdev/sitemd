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