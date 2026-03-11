import { z } from "zod"

import { ConfigSchema } from "./schema.js"

export type UserConfig = z.input<typeof ConfigSchema>
export type SiteMDConfig = z.output<typeof ConfigSchema>