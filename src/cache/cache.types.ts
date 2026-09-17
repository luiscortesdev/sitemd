import { z } from "zod"

import { SiteMDCacheSchema } from "./schema.js"

export type UserCache = z.input<typeof SiteMDCacheSchema>
export type SiteMDCache = z.output<typeof SiteMDCacheSchema>