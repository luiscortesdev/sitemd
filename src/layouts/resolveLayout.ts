import fs from "fs/promises"
import path from "path"

import { logger } from "../utils/index.js"

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
            logger.error(`COULD NOT RESOLVE LAYOUT ${layoutName}.\n`)
            logger.info(`CHECKED ${userLayout} AND ${themeLayout}.`)

            throw new Error(`COULD NOT RESOLVE LAYOUT ${layoutName}`)
        }
    }
}