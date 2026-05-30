import { runDev } from "../dev/index.js"

export async function dev(options: { debug: boolean }) {
    await runDev()
}