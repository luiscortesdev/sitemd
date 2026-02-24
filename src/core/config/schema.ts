import { z } from "zod"

export const SiteConfigSchema = z.object({
    title: z.string().min(1, "Site title cannot be empty"),
    description: z.string().optional(),
    url: z.url("site.url must be a valid url"),
})

export const DevConfigSchema = z.object({
    port: z
        .number()
        .int()
        .min(1)
        .max(65535)
        .default(3000),
}).partial()

export const ConfigSchema = z.object({
    contentDir: z.string().default("content"),
    outputDir: z.string().default("output"),
    layoutsDir: z.string().default("layouts"),
    publicDir: z.string().default("public"),

    site: SiteConfigSchema,
    dev: DevConfigSchema.default({}),
})