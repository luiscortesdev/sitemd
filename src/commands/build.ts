import chalk from "chalk"

import { buildSite } from "../build/index.js"
import { timer } from "../utils/index.js"

export async function build() {
    console.log(chalk.blue("BUILDING SITE..."))
    const initialBuildStart = performance.now()

    await buildSite({ dev: false })

    timer("Build", initialBuildStart)
}