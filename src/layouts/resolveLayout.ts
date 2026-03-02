import fs from "fs/promises"
import path from "path"
import chalk from "chalk"

export async function resolveLayout(layoutName: string, userLayoutsDir: string, themeLayoutsDir: string): Promise<string> {
    const userLayout = path.join(userLayoutsDir, layoutName)
    const themeLayout = path.join(themeLayoutsDir, layoutName)
    try {
        await fs.access(userLayout)
        return userLayout
    } catch {
        try {
            await fs.access(themeLayout)
            return themeLayout
        } catch {
            const noLayoutErrorMessage = chalk.redBright(`COULD NOT RESOLVE LAYOUT ${layoutName}.\n`) + chalk.blueBright(`CHECKED ${userLayout} AND ${themeLayout}.`)
            throw new Error(noLayoutErrorMessage)
        }
    }
}