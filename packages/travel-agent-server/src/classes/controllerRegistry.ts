/** @flow */
import * as path from "path";
import { inject, injectable } from "inversify";
import { IControllerConstructor } from "./controller";
import getFilePaths from "../utils/getFilePaths";
import isProdEnv from "../utils/isProdEnv";
import { IControllerRegistry, IRequireConstructor } from "../interfaces/index";

@injectable()
export default class ControllerRegistry implements IControllerRegistry {
  public require: IRequireConstructor;
  public controllers: IControllerConstructor[];

  constructor( @inject("IRequireConstructor") require) {
    this.require = require;
    this.controllers = [];
  }

  public register() {
    const controllerPath = path.join(process.cwd());
    const baseDir = isProdEnv() ? "dist" : "app";
    const controllers = getFilePaths(`${baseDir}/modules/**/*controller*(.js|.ts)`);

    controllers.forEach((controller) => {
      const Controller = this.require(`${controllerPath}/${controller}`).default;
      this.controllers.push(Controller);
    });

    return this.controllers;
  }
}
