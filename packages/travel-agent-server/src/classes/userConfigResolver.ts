import * as express from "express";
import { inject, injectable } from "inversify";
import * as path from "path";
import logger from "../utils/logger";
import { IPrometheusConfigurationOptions } from "../middleware/prometheus";
import { IRequireConstructor, ICwd } from "../interfaces/index";
import TYPES from "../types";

export interface ICustomMiddlewareObject {
  route?: string;
  resolve?: () => ICustomMiddleware;
  fn?: ICustomMiddleware;
}

export type ICustomMiddleware =
  | express.RequestHandler
  | express.ErrorRequestHandler
  | [string, express.RequestHandler | express.ErrorRequestHandler]
  | ICustomMiddlewareObject;

export interface IUserConfig {
  [key: string]: any;
  prometheus?: IPrometheusConfigurationOptions;
  airbrakeId?: string;
  airbrakeKey?: string;
  webpack?: any;
  middleware?: ICustomMiddleware[];
  postMiddleware?: ICustomMiddleware[];
  sendProductionErrors?: boolean;
  production?: IUserConfig;
  serveAssets?: boolean;
}

export interface IUserConfigResolver {
  resolve(): IUserConfig;
}

@injectable()
export default class UserConfigResolver implements IUserConfigResolver {
  public middlewarePath: string;
  public require: IRequireConstructor;
  private cwd: string;

  constructor(
    @inject(TYPES.IRequireConstructor) require,
    @inject(TYPES.ICwd) cwd: string,
  ) {
    this.require = require;
    this.middlewarePath = path.join(cwd, "./config");
  }

  public resolve() {
    let userConfig: Partial<IUserConfig> = {};
    try {
      const customMiddlewarePath = this.require.resolve(this.middlewarePath);
      userConfig = this.require(customMiddlewarePath) as IUserConfig;
    } catch (e) {
      logger.debug("Error loading user configuration");
      logger.debug(e);
    }

    if (userConfig.default) {
      return userConfig.default;
    }

    return userConfig;
  }
}
