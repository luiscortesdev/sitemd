import { buildSite } from "../core/buildSite.js"
import chalk from "chalk"

export async function build() {
    console.log(chalk.blue("BUILDING SITE..."))

    await buildSite({ dev: false })

    console.log(chalk.green("SUCESSFULLY BUILT SITE!!!"))
}