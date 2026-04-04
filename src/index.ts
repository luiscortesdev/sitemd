#!/usr/bin/env node
import { program } from "commander"
import { listfiles, build, dev, init, addtheme } from "./commands/index.js"

program
    .command("listfiles")
    .description("List all of the current files in the content directory.")
    .action(listfiles)

program
    .command("init")
    .option("-t, --theme <theme>", "Choose a pre-built theme to start building with or to add to your project.", "default")
    .description("Initialize a new SiteMD project")
    .action(init)

program
    .command("build")
    .description("Builds your project into a ready to deploy static site.")
    .action(build)

program
    .command("dev")
    .description("Starts up a development server to see your changes in real-time.")
    .action(dev)

program
    .command("addtheme [theme]")
    .description("Adds the specified theme to your project.")
    .action(addtheme)


program.parse()