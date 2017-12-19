import * as express from "express";
import { inject, injectable } from "inversify";
import * as path from "path";
import logger from "../utils/logger";
import { IPrometheusConfigurationOptions } from "../middleware/prometheus";

export interface ICustomMiddlewareObject {
  route?: string,
  resolve?: () => ICustomMiddleware,
  fn?: ICustomMiddleware,
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

export type IRequire = (module: string) => any;

export interface IRequireConstructor extends IRequire {
  resolve(module: string): string;
}

@injectable()
export default class UserConfigResolver implements IUserConfigResolver {
  public middlewarePath = path.join(process.cwd(), "./config");
  public require: IRequireConstructor;

  constructor( @inject("IRequireConstructor") require) {
    this.require = require;
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

    return userConfig;
  }
}
