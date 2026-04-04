import { runAddTheme } from "../theme/runAddTheme.js"

export async function addtheme(theme: string) {
    await runAddTheme(theme)
}