const nodemon = require("nodemon");
const path = require("path");
const fs = require("fs");
const program = require("commander");

program
.version("0.1.0")

program
  .option("-d, --debug", "run the nodejs inspector")
  .description("run a dev server")
  .parse(process.argv);

const tsNodePath = fs.existsSync(path.join(__dirname, "../node_modules/.bin/ts-node")) ?
  path.join(__dirname, "../node_modules/.bin/ts-node") :
  path.join(process.cwd(), "./node_modules/.bin/ts-node");

nodemon({
  ext: "js json ts tsx",
  ignore: ["components"],
  watch: [
    ...[
      "app/**/*.ts",
    ].map(p => path.join(process.cwd(), p)),
    path.join(__dirname, "../dist/**/*"),
  ],
  exec: `${tsNodePath} ${program.debug ? "--inspect" : ""} ${path.join(process.cwd(), "app/index.ts")} `,
});

nodemon.on("start", function () {
  console.log("App has started");
}).on("quit", function () {
  console.log("App has quit");
}).on("restart", function (files) {
  console.log("App restarted due to: ", files);
});
