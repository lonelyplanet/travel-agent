const nodemon = require("nodemon");
const path = require("path");
const fs = require("fs");
const program = require("commander");
const chokidar = require("chokidar");
const { spawn } = require("child_process");

program.version("0.1.0");

program
  .option("-d, --debug", "run the nodejs inspector")
  .description("run a dev server")
  .parse(process.argv);

const tsNodePath = path.join(__dirname, "../", "node_modules", "ts-node");

process.env.NODE_ENV = "development";

const server = spawn(
  "node",
  [
    "-r",
    `${tsNodePath}/register`,
    program.debug ? "--inspect" : "",
    path.join(process.cwd(), "app/index"),
  ].filter(arg => arg),
);

server.stdout.on("data", data => {
  process.stdout.write(data);
});

server.stderr.on("data", data => {
  process.stdout.write(data);
});

server.on("close", data => {
  process.stdout.write(`Exited with ${data}`);
});
