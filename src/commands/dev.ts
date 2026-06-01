import { runDev } from "../dev/index.js"
import { logger, setDebugMode } from "../utils/index.js"

export async function dev(options: { debug: boolean }) {
    if (options.debug) {
        setDebugMode(true)
    }

    logger.process("BUILDING SITE...")
    await runDev()
}