import { paginate } from "./paginate.js";

import type { Collections } from "../collections/index.js";
import type { Parsed } from "../build/build.types.js";
import type { PageFile } from "../content/content.types.js";
import { buildPage } from "../build/buildPage.js";
import type { Pagination, PaginationInfo } from "./pagination.types.js";

async function buildPaginatedPages(page: PageFile, parsed: Parsed, collections: Collections) {
    const collectionName = parsed.data.paginate
    const perPage = parsed.data.perPage ?? 10

    const items = collections[collectionName]

    if (!items) {
        console.log(`COLLECTION ${collectionName} COULD NOT BE PAGINATED! ENSURE THE COLLECTION EXISTS!`)
        
        return
    }

    const paginated = paginate(items, perPage)

    for (let i = 0; i < paginated.length; i++) {
        const pageNumber = i + 1
        const pageItems = paginated[i]
        if (!pageItems) continue

        const paginationInfo: PaginationInfo = {
            pageNumber,
            totalPages: paginated.length,
            hasNext: pageNumber < paginated.length,
            hasPrev: pageNumber > 0,
        }

        const pagination: Pagination = {
            items: pageItems,
            pagination: paginationInfo,
        }
    }
}