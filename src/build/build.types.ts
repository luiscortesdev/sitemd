import type { PageFile } from "../content/index.js";
import type { ParsedPageCache } from "../cache/index.js";

export interface Parsed {
    html: string;
    data: Record<string, any>;
}

export interface ParsedPages {
    page: PageFile;
    parsed: ParsedPageCache;
    hash: string;
}