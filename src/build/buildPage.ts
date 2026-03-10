import path from "path"
import nunjucks from "nunjucks"

import { loadConfig } from "../config/index.js";

import type { PageFile } from "../types/PageFile.js";
import type { Collections } from "../content/content.types.js";
import type { ParsedPage } from "./build.types.js";

const config = await loadConfig()
const root = process.cwd()

// Create a new nunjucks environment each buildPage to prevent stale layouts and
// stale layout inheritance chains from being reused.
function createNunjucksEnvironment(root: string) {
    return new nunjucks.Environment(
        new nunjucks.FileSystemLoader([
            path.join(root, "layouts"),
            path.join(root, "theme/layouts"),
        ], { noCache: true }),
        { autoescape: true }
    )
}

export async function buildPage(collections: Collections, parsed: ParsedPage): Promise<string> {
    const env = createNunjucksEnvironment(root)

    const { html, data } = parsed
    
    const layoutName = data.layout ?? "default"

    const layout = layoutName.endsWith(".njk") ? layoutName : layoutName + ".njk"
    console.log(layout)

    const outputHtml = env.render(layout, {
        ...data,
        site: config.site,
        collections,
        content: html
    })
        
    return outputHtml
}