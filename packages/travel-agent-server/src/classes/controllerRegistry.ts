/** @flow */
import * as glob from "glob";
import * as path from "path";
import {
  IControllerConstructor,
} from "./controller";

export default class ControllerRegistry {
  public controllers: IControllerConstructor[];

  constructor() {
    this.controllers = [];
  }

  public register() {
    const controllerPath = path.join(process.cwd());
    const baseDir = process.env.NODE_ENV === "production" ?
      "dist" :
      "app";
    const controllers = glob.sync(`${baseDir}/modules/**/*controller*(.js|.ts)`);

    controllers.forEach((controller) => {
      const Controller = require(`${controllerPath}/${controller}`).default;
      this.controllers.push(Controller);
    });

    return this.controllers;
  }
}
