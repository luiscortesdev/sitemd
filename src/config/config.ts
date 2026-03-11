import path from "path"
import fs from "fs/promises"
import chalk from "chalk"
import { pathToFileURL } from "url"
import { ConfigSchema, DevConfigSchema } from "./schema.js"

import type { UserConfig, SiteMDConfig } from "./config.types.js"

const CONFIG_FILE = "sitemd.config.js"

export async function loadConfig(root=process.cwd()): Promise<SiteMDConfig> {
    const configPath = path.join(root, CONFIG_FILE)

    let rawConfig: UserConfig

    try {
        await fs.access(configPath)

        const imported = await import(pathToFileURL(configPath).href)
        rawConfig = imported.default ?? imported
    } catch (err) {
        const errorMessage = chalk.bold.red(`❌ Failed to load ${configPath}\n`) + chalk.blueBright("Make sure it exists and exports a default config object.")
        throw new Error(errorMessage)
    }

    const parsedConfig = ConfigSchema.parse(rawConfig)

    const normalizedConfig = {
        ...parsedConfig,
        dev: DevConfigSchema.parse(parsedConfig.dev)
    }

    return normalizedConfig
}