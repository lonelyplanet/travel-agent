#!/usr/bin/env node

var nodemon = require("nodemon");
var path = require("path");

nodemon({
  ext: "ts json",
  watch: [path.join(process.cwd(), "app")],
  exec: `${path.join(__dirname, "../node_modules/.bin/ts-node")} ${path.join(process.cwd(), "app/index.ts")}`,
});

nodemon.on("start", function () {
  console.log("App has started");
}).on("quit", function () {
  console.log("App has quit");
}).on("restart", function (files) {
  console.log("App restarted due to: ", files);
});
