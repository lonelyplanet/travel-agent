const path = require("path");
const program = require("commander");

program.version("0.1.0");

program
  .option("--analyze", "run the webpack analyzer")
  .option("-p, --production", "production build")
  .option("--config [config]", "TypeScript config file")
  .description("run a webpack build")
  .parse(process.argv);

process.env.NODE_ENV = "production";

require("ts-node").register({
  project: program.config,
});

const server = require(path.join(process.cwd(), "dist"));
