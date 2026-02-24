import { z } from "zod"

export const SiteConfigSchema = z.object({
    title: z.string().min(1, "Site title cannot be empty"),
    description: z.string().optional(),
    url: z.url("site.url must be a valid url")
})