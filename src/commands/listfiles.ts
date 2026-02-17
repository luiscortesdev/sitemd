import path from "path"
import { readdir } from "fs/promises"


export async function listfiles() {
    let files = await readdir(path.resolve(import.meta.dirname, "../../content"), { recursive: true })
    console.log(files)
}