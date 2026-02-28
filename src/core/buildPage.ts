import path from "path"
import nunjucks from "nunjucks"
import type { PageFile } from "../types/PageFile.js";
import { parsePage } from "./parsePage.js";
import { loadConfig } from "./config/config.js";

const config = await loadConfig()
const root = process.cwd()

// Load the user's layouts first, then put theme layouts that do not overlap.
const env = new nunjucks.Environment(
    new nunjucks.FileSystemLoader([
        path.join(root, "layouts"),
        path.join(root, "theme/layouts"),
    ]),
    { autoescape: true, noCache: true }
)

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