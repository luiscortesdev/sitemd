import chalk from "chalk"

import { buildSite } from "../build/index.js"

export async function build() {
    console.log(chalk.blue("BUILDING SITE..."))

    await buildSite({ dev: false })

    console.log(chalk.green("SUCESSFULLY BUILT SITE!!!"))
}