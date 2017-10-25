const program = require("commander");
const path = require("path");
const mkdirp = require("mkdirp");
const touch = require("touch");
const fs = require("fs");

const controllerTemplate = (name) => `\
import { Controller, inject } from "@lonelyplanet/travel-agent-server";

export default class ${name[0].toUpperCase() + name.substr(1, name.length)}Controller extends Controller {
  public static routes = {
    [\`GET /${name}\`]: "show",
  };

  public async show() {
    this.response.render("${name}");
  }
}
`;

const indexTemplate = (name) => `\
import * as React from "react";

export default () => (
  <div>
    <h1>${name}</h1>
  </div>
);
`

program
  .version("0.1.0")

program.command("module [name]")
  .description("add a new module")
  .action((name) => {
    const modulesPath = path.join(process.cwd(), "app", "modules");
    const newModulePath = path.join(modulesPath, name);

    mkdirp.sync(newModulePath);

    fs.writeFileSync(path.join(newModulePath, "controller.ts"), controllerTemplate(name));
    fs.writeFileSync(path.join(newModulePath, "index.tsx"), indexTemplate(name));

    const folderPaths = [
      "__tests__",
      "ui"
    ].map((p) => {
      const folderPath = path.join(newModulePath, p);
      mkdirp.sync(folderPath);
      return folderPath;
    });

    const [testPath, uiPath] = folderPaths;
    touch.sync(path.join(testPath, ".gitkeep"));
    touch.sync(path.join(uiPath, ".gitkeep"));

    console.log(`created ${newModulePath}`);
  });

program.parse(process.argv);
