import path from "path";
import fs from "fs/promises"

import type { PageFile } from "../content/index.js";

export async function deletePagination(baseDir: string, page: PageFile) {
    const safeRoute = page.route.replace(/^\//, "")

    const paginatedPagesPath = path.join(baseDir, safeRoute, "page")

    await fs.rm(paginatedPagesPath, { recursive: true, force: true })
}