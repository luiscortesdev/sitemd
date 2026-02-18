import path from "path"
import { readFile } from "fs/promises";
import type { PageFile } from "../types/PageFile.js";
import { parsePage } from "./parsePage.js";

export async function buildPage(page: PageFile) {
    const { html, data } = await parsePage(page.absolutePath)
    console.log(data)

    const layoutPath = path.resolve(`layouts/${data.layout}.html`)
    const layoutTemplate = await readFile(layoutPath, "utf-8")

    const outputHtml = layoutTemplate
        .replace("{{ content }}", html)
        .replace("{{ title }}", data.title || "My SiteMD Page")
        .replace("{{ description }}", data.description || "My descriptive and well executed SiteMD page")

    return outputHtml
}