import path from "path"
import { pathToFileURL } from "url"
import type { Config } from "./types/Config.js"

const defaultConfig: Config = {
    contentDir: "content",
    outDir: "output",
    layoutsDir: "layouts",
    publicDir: "public",

    site: {
        title: "My SiteMD Website",
        url: "http://localhost:3000"
    },

    dev: {
        port: 3000
    }
}

export async function loadConfig(): Promise<Config> {
    const configPath = path.resolve("sitemd.config.js")

    try {
        const configModule = await import(pathToFileURL(configPath).href)

        const userConfig = configModule.default || {}

        return {
            ...defaultConfig,
            ...userConfig,
            site: {
                ...defaultConfig.site,
                ...userConfig.site
            },

            dev: {
                ...defaultConfig.dev,
                ...userConfig.dev
            }
        }
    } catch {
        return defaultConfig
    }
}