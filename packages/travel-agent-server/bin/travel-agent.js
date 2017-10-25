#!/usr/bin/env node

const path = require("path");
const program = require("commander");

program
  .version("0.1.0")

program
  .command("add", "add a new module to the app")
  .command("build", "build the app")
  .command("dev", "run server in development mode")
  .command("start", "run server in production mode")
  .parse(process.argv);
