import type { LayoutMap } from "../types/layouts.types.js";
import type { SiteMDCache } from "../types/cache.types.js";

function getDependentLayouts(changed: string, graph: LayoutMap) {
    const affectedLayouts = new Set<string>([changed])

    let layoutChanged = true

    while (layoutChanged) {
        layoutChanged = false

        for (const [layout, parents] of graph) {
            if (parents.some(p => affectedLayouts.has(p) && !affectedLayouts.has(layout))) {
                affectedLayouts.add(layout)
                layoutChanged = true
            }
        }
    }

    return affectedLayouts
}

export function invalidateLayoutCascade(layout: string, graph: LayoutMap, cache: SiteMDCache) {
    const affectedLayouts = getDependentLayouts(layout, graph)
    if (!cache) return

    for (const page in cache.pages) {
        if (cache.pages[page] && affectedLayouts.has(cache.pages[page].layout)) {
            delete cache.pages[page]
        }
    }
}