#!/usr/bin/env node
import { program } from "commander"
import { listfiles } from "./commands/listfiles.js"

program
    .command("listfiles")
    .description("List all of the current files in the content directory")
    .action(listfiles)

program.parse()