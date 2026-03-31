#!/usr/bin/env node
import { program } from "commander"
import { listfiles, build, dev, init } from "./commands/index.js"

program
    .command("listfiles")
    .description("List all of the current files in the content directory")
    .action(listfiles)

program
    .command("init")
    .option("-t, --theme <theme>", "Choose a pre-built theme to start building with or to add to your project.", "default")
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

program
    .command("addTheme")
    .option("-t, --theme <theme>", "Specify the theme you would like to add.", "none")
    .description("Adds the specified theme to your project.")

program.parse()