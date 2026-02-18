#!/usr/bin/env node
import { program } from "commander"
import { listfiles } from "./commands/listfiles.js"
import { build } from "./commands/build.js"

program
    .command("listfiles")
    .description("List all of the current files in the content directory")
    .action(listfiles)

program
    .command("build")
    .description("Parses your markdown files in content into html")
    .action(build)

program.parse()