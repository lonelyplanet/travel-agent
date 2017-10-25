const nodemon = require("nodemon");
const path = require("path");

nodemon({
  ext: "js json ts tsx",
  ignore: ["components"],
  watch: [
    ...[
      "app/services/*.ts",
      "app/modules/**/*.ts",
      "app/shared/**/*.ts",
    ].map(p => path.join(process.cwd(), p)),
    path.join(__dirname, "../dist/**/*"),
  ],
  exec: `${path.join(__dirname, "../node_modules/.bin/ts-node")} --compilerOptions '{"module":"commonjs"}' ${path.join(process.cwd(), "app/index.ts")} `,
});

nodemon.on("start", function () {
  console.log("App has started");
}).on("quit", function () {
  console.log("App has quit");
}).on("restart", function (files) {
  console.log("App restarted due to: ", files);
});
