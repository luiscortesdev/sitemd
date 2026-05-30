import { logger } from "./logger.js"

import type { TimerLabels } from "./utils.types.js"

export function timer(label: TimerLabels, start: number) {
    const ms = performance.now() - start

    if (label === "Build") {
        logger.success(`Built project in ${ms.toFixed(1)}ms`)
    }

    if (label === "Reload") {
        logger.process(`Rebuilt project in ${ms.toFixed(1)}ms`)
    }

    if (label === "Cleanup") {
        logger.process(`Cleaned up file in ${ms.toFixed(1)}ms`)
    }
}