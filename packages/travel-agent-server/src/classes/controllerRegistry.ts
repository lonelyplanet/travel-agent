/** @flow */
import * as path from "path";
import { inject, injectable } from "inversify";
import { IControllerConstructor } from "./controller";
import getFilePaths from "../utils/getFilePaths";
import TYPES from "../types";
import { IControllerRegistry, IRequireConstructor } from "../interfaces/index";

@injectable()
export default class ControllerRegistry implements IControllerRegistry {
  public require: IRequireConstructor;
  public controllers: {
    constructor: IControllerConstructor;
    get: () => IControllerConstructor;
  }[];
  private cwd: string;
  private isProdEnv: boolean;

  constructor(
    @inject("IRequireConstructor") require,
    @inject(TYPES.ICwd) cwd: string,
    @inject(TYPES.IIsProdEnv) isProdEnv: boolean,
  ) {
    this.require = require;
    this.controllers = [];
    this.cwd = cwd;
    this.isProdEnv = isProdEnv;
  }

  public register() {
    const controllerPath = path.join(this.cwd);
    const baseDir = this.isProdEnv ? "dist" : "app";
    const controllers = getFilePaths(
      `${baseDir}/modules/**/*controller*(.js|.ts)`,
    );

    controllers.forEach(controller => {
      const Controller = this.require(`${controllerPath}/${controller}`)
        .default;
      this.controllers.push({
        constructor: Controller,
        get: () => this.require(`${controllerPath}/${controller}`).default,
      });
    });

    return this.controllers;
  }
}
