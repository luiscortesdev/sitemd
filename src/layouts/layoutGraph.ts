import path from "path"
import fs from "fs/promises"

import { getLayoutParent } from "./getLayoutParent.js"

import type { LayoutMap } from "./layouts.types.js"

export async function buildLayoutGraph(layoutsDir: string, themeLayoutsDir: string) {
    const graph: LayoutMap = new Map()
    const sources = new Map<string, string>() // layout: absolute path

    async function collect(dir: string) {
        try {
            for (const file of await fs.readdir(dir)) {
                if (!file.endsWith(".njk")) continue

                if (!sources.has(file)) {
                    sources.set(file, path.join(dir, file))
                }
            }
        } catch {
            console.error(`Could not collect ${dir} in layout graph`)
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
        console.log("PARENT OF", name, " IS ", parent)
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