import * as express from "express";
import { inject, injectable } from "inversify";
import * as path from "path";
import logger from "../utils/logger";

export interface ICustomMiddleware {
  [key: string]: express.RequestHandler | express.ErrorRequestHandler | [string, express.RequestHandler | express.ErrorRequestHandler];
}

export interface IUserConfig {
  webpack?: any;
  middleware?: ICustomMiddleware;
  postMiddleware?: ICustomMiddleware;
  sendProductionErrors?: boolean;
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

  constructor(@inject("IRequireConstructor") require) {
    this.require = require;
  }

  public resolve() {
    let customMiddleware: Partial<IUserConfig> = {};

    try {
      const customMiddlewarePath = this.require.resolve(this.middlewarePath);
      customMiddleware = this.require(customMiddlewarePath) as IUserConfig;
    } catch (e) {
      logger.debug(e);
    }

    return customMiddleware;
  }
}
