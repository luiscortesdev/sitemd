import { runAddTheme } from "../theme/index.js"

export async function addtheme(theme: string) {
    await runAddTheme(theme)
}