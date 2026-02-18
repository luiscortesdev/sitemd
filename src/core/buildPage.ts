import path from "path"
import nunjucks from "nunjucks"
import { readFile } from "fs/promises";
import type { PageFile } from "../types/PageFile.js";
import { parsePage } from "./parsePage.js";

const env = nunjucks.configure("layouts", {
    autoescape: true,
    noCache: true
})

export async function buildPage(page: PageFile) {
    const { html, data } = await parsePage(page.absolutePath)
    console.log(data)

    const layout = (data.layout || "default") + ".njk"

    const outputHtml = env.render(layout, {
        ...data,
        content: html
    })

    return outputHtml
}