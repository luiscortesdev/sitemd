import type { CollectionItem } from "../collections/collections.types.js"

export interface Pagination {
    items: CollectionItem[]
    pageNumber: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextPage: number;
    prevPage: number;
    nextUrl: string | null;
    prevUrl: string | null;
    baseUrl: string;
}

export interface PaginatedOutputs {
    html: string;
    pageNumber: number;
}