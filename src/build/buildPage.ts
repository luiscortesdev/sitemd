import path from "path"
import nunjucks from "nunjucks"

import { loadConfig } from "../config/index.js";

import type { Collections } from "../collections/index.js";
import type { PageData } from "./build.types.js";
import type { Pagination } from "../pagination/index.js";

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

export async function buildPage(collections: Collections, data: PageData, html: string, pagination: Pagination | null = null): Promise<string> {
    const config = await loadConfig()
    const root = process.cwd()
    
    const env = createNunjucksEnvironment(root)
    
    const layoutName = data.layout || "default"

    const layout = layoutName.endsWith(".njk") ? layoutName : layoutName + ".njk"

    const outputHtml = env.render(layout, {
        ...data,
        site: config.site,
        collections,
        pagination: pagination,
        content: html,
    })
        
    return outputHtml
}