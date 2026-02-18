import { rm, mkdir } from "fs/promises"

export async function cleanOuput(outputDir: string) {
    await rm(outputDir, { recursive: true, force: true })
    await mkdir(outputDir, { recursive: true })
}