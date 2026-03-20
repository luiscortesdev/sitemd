import type { CollectionItem } from "../collections/collections.types.js"

export interface PaginationInfo {
    pageNumber: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface Pagination {
    items: CollectionItem[]
    pagination: PaginationInfo
}