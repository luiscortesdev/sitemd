#!/usr/bin/env node
import { program } from "commander"
import { listfiles } from "./commands/listfiles.js"
import { build } from "./commands/build.js"
import { dev } from "./commands/dev.js"
import { init } from "./commands/init.js"

program
    .command("listfiles")
    .description("List all of the current files in the content directory")
    .action(listfiles)

program
    .command("init")
    .description("Initialize a new SiteMD project")
    .action(init)

program
    .command("build")
    .description("Parses your markdown files in content into html")
    .action(build)

program
    .command("dev")
    .description("Starts up a development server to see your changes in real-time")
    .action(dev)

program.parse()