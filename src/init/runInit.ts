import fsSync from "fs"
import path from "path"
import chalk from "chalk"

import { initTheme } from "../init/initTheme.js"
import { initConfig } from "../init/initConfig.js"
import { initFolders } from "./initFolders.js"

export async function runInit(options: { theme: string }) {
    const root = process.cwd()

    if (fsSync.existsSync(path.join(root, "/layouts")) && fsSync.existsSync(path.join(root, "/public")) && fsSync.existsSync(path.join(root, "/content")) && fsSync.existsSync(path.join(root, "/theme")) && fsSync.existsSync(path.join(root, "sitemd.config.js"))) {
        console.log(chalk.yellowBright("🚨 PROJECT IS ALREADY INTIALIZED!"))
        return
    }

    console.log(chalk.blue("INITIALIZING PROJECT..."))
    
    await initFolders(["layouts", "public", "content"])
    await initConfig()
    await initTheme(options.theme)

    console.log(chalk.greenBright("✅ PROJECT INITIALIZED!"))
}