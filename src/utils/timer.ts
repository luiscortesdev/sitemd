import { logger } from "./logger.js"

import type { TimerLabels } from "./utils.types.js"

export function timer(label: TimerLabels, start: number) {
    const ms = performance.now() - start

    if (label === "Build") {
        logger.success(`BUILT PROJECT IN ${ms.toFixed(1)}ms`)
    }

    if (label === "Reload") {
        logger.success(`REBUILT PROJECT IN ${ms.toFixed(1)}ms`)
    }

    if (label === "Cleanup") {
        logger.process(`CLEANED UP FILE IN ${ms.toFixed(1)}ms`)
    }
}