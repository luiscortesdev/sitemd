import { runDev } from "../dev/index.js"
import { setDebugMode } from "../utils/index.js"

export async function dev(options: { debug: boolean }) {
    if (options.debug) {
        setDebugMode(true)
    }

    await runDev()
}