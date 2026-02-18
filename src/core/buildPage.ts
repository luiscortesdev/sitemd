import nunjucks from "nunjucks"
import type { PageFile } from "../types/PageFile.js";
import { parsePage } from "./parsePage.js";
import { loadConfig } from "../config.js";

const config = await loadConfig()

const env = nunjucks.configure(config.layoutsDir, {
    autoescape: true,
    noCache: true
})

export async function buildPage(page: PageFile) {
    const { html, data } = await parsePage(page.absolutePath)
    
    if (data) {
        const layoutName = data.layout ? data.layout : "default"

        const layout = layoutName.endsWith(".njk") ? layoutName : layoutName + ".njk"

        const outputHtml = env.render(layout, {
            ...data,
            site: config.site,
            content: html
        })

        return outputHtml
    }

    return html
}