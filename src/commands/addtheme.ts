import { runAddTheme } from "../theme/runAddTheme.js"

export async function addtheme(options: { theme: string }) {
    await runAddTheme(options)
}