import path from "path"
import { scanDir } from "../core/scanDir.js"

export async function listfiles() {
    let files = await scanDir(path.resolve(import.meta.dirname, "../../content"), path.resolve(import.meta.dirname, "../../content"))
    console.log(files)
}