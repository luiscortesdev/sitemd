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
            console.error(`INTERNAL ERROR CHECKING ITEMS IN ${path}: ${error.message}`)
        } else {
            console.error(`UNKNOWN INTERNAL ERROR OCCURRED IN directoryEmpty(): ${error}`);
        }
        
        return false
    }
}

export async function removeFileFromOutput(path: string) {
    try {
        await fs.access(path)
        await fs.rm(path)

        const parentFolder = PATH.dirname(path)
        
        if (await directoryEmpty(parentFolder)) {
            await fs.rmdir(parentFolder)
        }

        return

    } catch {
        console.log(`INTERNAL ERROR. COULD NOT REMOVE ${path} FROM OUTPUT!`)

        return
    }
}