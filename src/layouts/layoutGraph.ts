import path from "path"
import fs from "fs/promises"

import { getLayoutParent } from "./getLayoutParent.js"
import { logger } from "../utils/index.js"

import type { LayoutMap } from "./layouts.types.js"

export async function buildLayoutGraph(layoutsDir: string, themeLayoutsDir: string) {
    const graph: LayoutMap = new Map()
    const sources = new Map<string, string>() // layout: absolute path

    // go through theme and user layout directories and add each layout to the map
    // user layouts take priority over theme layouts. each layout name must be unique
    async function collect(dir: string) {
        try {
            for (const file of await fs.readdir(dir, { recursive: true })) {
                if (!file.endsWith(".njk")) continue

                if (!sources.has(file)) {
                    sources.set(file, path.join(dir, file))
                }
            }
        } catch {
            throw new Error(`INTERNAL ERROR: COULD NOT COLLECT ${dir} IN LAYOUT GRAPH. ENSURE ${dir} EXISTS IN THE PROJECT.`)
        }
    }

    await collect(layoutsDir)
    await collect(themeLayoutsDir)

    async function resolveDependencies(name: string, seen=new Set<string>()): Promise<string[]> {
        if (seen.has(name)) return []
        seen.add(name)

        const filePath = sources.get(name)

        if (!filePath) return []

        const parent = await getLayoutParent(filePath)
        logger.debug("PARENT OF ", name, " IS ", parent)
        if (!parent) return []

        return [
            parent,
            ...await resolveDependencies(parent, seen)
        ]
    }

    for (const name of sources.keys()) {
        const depedencies = await resolveDependencies(name)
        graph.set(name, depedencies)
    }

    return graph
}