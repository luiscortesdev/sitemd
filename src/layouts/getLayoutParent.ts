import fs from "fs/promises"

const EXTENDS_REGEX = /{%\s*extends\s+["'](.+?)["']\s*%}/


export async function getLayoutParent(layoutPath: string): Promise<string | null> {
    const source = await fs.readFile(layoutPath, "utf-8")

    const match = source.match(EXTENDS_REGEX)

    if (!match) return null

    return match[1] ?? null
}