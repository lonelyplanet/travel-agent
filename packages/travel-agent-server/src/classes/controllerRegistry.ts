/** @flow */
import * as path from "path";
import * as glob from "glob";
import {
  IControllerConstructor,
} from "./controller";

export default class ControllerRegistry {
  controllers: IControllerConstructor[];

  constructor() {
    this.controllers = [];
  }

  register() {
    const controllerPath = path.join(process.cwd());
    const baseDir = process.env.NODE_ENV === "production" ?
      "dist" :
      "app";
    const controllers = glob.sync(`${baseDir}/modules/**/*controller*`);

    controllers.forEach((controller) => {
      const Controller = require(`${controllerPath}/${controller}`).default;
      this.controllers.push(Controller);
    });

    return this.controllers;
  }
}
