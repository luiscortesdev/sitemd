import path from "path"
import nunjucks from "nunjucks"

import { loadConfig } from "../config/index.js";

import type { Collections } from "../collections/index.js";
import type { Parsed } from "./build.types.js";
import type { Pagination } from "../pagination/pagination.types.js";

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

export async function buildPage(collections: Collections, parsed: Parsed, pagination: Pagination | null = null): Promise<string> {
    const env = createNunjucksEnvironment(root)

    const { html, data } = parsed
    
    const layoutName = data.layout ?? "default"

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