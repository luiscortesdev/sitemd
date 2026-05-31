import { buildSite } from "../build/index.js"
import { timer, logger, setDebugMode } from "../utils/index.js"

export async function build(options: { debug: boolean }) {
    if (options.debug) {
        setDebugMode(true)
    } else {
        setDebugMode(false)
    }

    logger.process("BUILDING SITE...")
    const initialBuildStart = performance.now()

    await buildSite({ dev: false })

    timer("Build", initialBuildStart)
}