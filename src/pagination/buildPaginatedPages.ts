import { buildPage } from "../build/index.js";
import { paginate } from "./paginate.js";

import type { Collections } from "../collections/index.js";
import type { PageData } from "../build/build.types.js";
import type { PageFile } from "../content/content.types.js";
import type { Pagination, PaginatedOutputs } from "./pagination.types.js";

export async function buildPaginatedPages(page: PageFile, data: PageData, html: string, collections: Collections): Promise<Array<PaginatedOutputs> | undefined> {
    const collectionName = data.paginate
    const perPage =  data.perPage ?? 10

    if (!collectionName) return

    const items = collections[collectionName] || []
    const outputs = []

    if (items.length === 0) {
        console.log(`COLLECTION ${collectionName} COULD NOT BE PAGINATED! ENSURE THE COLLECTION EXISTS!`)
        
        return []
    }

    const paginated = paginate(items, perPage)

    for (let i = 0; i < paginated.length; i++) {
        const pageNumber = i + 1
        const pageItems = paginated[i]
        if (!pageItems) continue

        const prevUrl = i === 0 ? null : ( i === 1 ? page.route : `${page.route}/page/${pageNumber - 1}` )
        const nextUrl = i + 1 < paginated.length ? `${page.route}/page/${pageNumber + 1}` : null

        const pagination: Pagination = {
            items: pageItems,
            pageNumber: pageNumber,
            totalPages: paginated.length,
            hasNext: i < (paginated.length - 1),
            hasPrev: i > 0,
            nextPage: pageNumber + 1,
            prevPage: pageNumber - 1,
            prevUrl: prevUrl,
            nextUrl: nextUrl,
            baseUrl: page.route,
        }

        const outputHtml = await buildPage(collections, data, html, pagination)

        outputs.push({
            html: outputHtml,
            pageNumber,
        })
    }

    return outputs ?? []
}