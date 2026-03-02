import { runInit } from "../init/index.js"

export async function init(options: { theme: string }) {
    await runInit(options)
}