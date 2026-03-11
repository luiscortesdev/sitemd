import chalk from "chalk"
import type { TimerLabels } from "./utils.types.js"

export function timer(label: TimerLabels, start: number) {
    const ms = performance.now() - start

    if (label === "Build") {
        const buildMessage = chalk.greenBright(`✅ Built project in ${ms.toFixed(1)}ms`)
        console.log(buildMessage)
    }

    if (label === "Reload") {
        const reloadMessage = chalk.blueBright(`⚒️ Rebuilt project in ${ms.toFixed(1)}ms`)
        console.log(reloadMessage)
    }
}