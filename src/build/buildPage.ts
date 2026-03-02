import path from "path"
import nunjucks from "nunjucks"
import type { PageFile } from "../types/PageFile.js";
import { parsePage } from "../content/index.js";
import { loadConfig } from "../core/config/config.js";

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

export async function buildPage(page: PageFile) {
    const env = createNunjucksEnvironment(root)

    const { html, data } = await parsePage(page.absolutePath)
    
    if (data) {
        const layoutName = data.layout ? data.layout : "default"

        const layout = layoutName.endsWith(".njk") ? layoutName : layoutName + ".njk"
        console.log(layout)

        const outputHtml = env.render(layout, {
            ...data,
            site: config.site,
            content: html
        })
        
        return { html: outputHtml, layout }
    }

    return { html, layout: "" }
}