import type { PageFile } from "../content/index.js";

export interface PageData {
    title: string;
    description: string;
    layout: string;
    collections?: string[];
    paginate?: string;
    perPage?: number;
    usesCollections?: string[];
}

export interface Parsed {
    html: string;
    data: PageData;
}

export interface ParsedPages {
    page: PageFile;
    data: PageData;
    html: string;
    hash: string;
}