import type { LayoutMap } from "../layouts/index.js";
import type { SiteMDCache } from "./cache.types.js";

function getDependentLayouts(changed: string, graph: LayoutMap) {
    const affectedLayouts = new Set<string>([changed])

    let layoutChanged = true

    while (layoutChanged) {
        layoutChanged = false

        for (const [layout, parents] of graph) {
            if (parents.some(p => affectedLayouts.has(p)) && !affectedLayouts.has(layout)) {
                affectedLayouts.add(layout)
                layoutChanged = true
            }
        }
    }

    return affectedLayouts
}

export function invalidateLayoutCascade(layout: string, graph: LayoutMap, cache: SiteMDCache): string[] {
    const affectedLayouts = getDependentLayouts(layout, graph)

    console.log("AFFECTED LAYOUTS: ", affectedLayouts)
    for (const page in cache.pages) {
        console.log("CACHE PAGES PAGE LAYOUT", cache.pages[page]?.layout)
        if (cache.pages[page] && affectedLayouts.has(cache.pages[page].layout)) {
            delete cache.pages[page]
        }
    }

    return [...affectedLayouts]
}