import { z } from "zod"
import type { PageData } from "../build/build.types.js"

const PageCacheEntrySchema = z.object({
    hash: z.string(),
    layout: z.string(),
    outputDir: z.string(),
    html: z.string(),
    data: z.unknown() as z.ZodType<PageData>
})
const PageCacheSchema = z.record(z.string(), PageCacheEntrySchema).default({})

const LayoutCacheEntrySchema = z.object({
    mtimeMs: z.number()
})
const LayoutCacheSchema = z.record(z.string(), LayoutCacheEntrySchema).default({})

const CollectionSchema = z.record(z.string(), z.array(z.string())).default({})

const PaginationSchema = z.array(z.string()).default([])

export const SiteMDCacheSchema = z.object({
    version: z.number().min(1).default(1),
    pages: PageCacheSchema,
    layouts: LayoutCacheSchema,
    collections: CollectionSchema,
    pagination: PaginationSchema
})