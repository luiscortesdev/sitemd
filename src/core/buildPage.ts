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

    const layout = data.layout.endsWith(".njk") ? data.layout : data.layout + ".njk"

    const outputHtml = env.render(layout, {
        ...data,
        site: config.site,
        content: html
    })

    return outputHtml
}