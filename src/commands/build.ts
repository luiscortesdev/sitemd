import { buildSite } from "../build/index.js"
import { timer, logger, setDebugMode } from "../utils/index.js"

export async function build(options: { debug: boolean }) {
    if (options.debug) {
        setDebugMode(true)
    }
    
    logger.process("BUILDING SITE...")
    const initialBuildStart = performance.now()

    try {
        await buildSite({ dev: false })
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`BUILD PROCESS FAILED: ${error.message}`)
        } else {
            logger.error("BUILD PROCESS FAILED DUE TO AN UNKNOWN ERROR.")
        }

        process.exit(1)
    }

    timer("Build", initialBuildStart)
}