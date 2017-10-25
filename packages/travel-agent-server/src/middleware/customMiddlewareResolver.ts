import * as express from "express";
import { inject, injectable } from "inversify";
import * as path from "path";
import logger from "../utils/logger";

export interface ICustomMiddleware {
  [key: string]: express.RequestHandler | express.ErrorRequestHandler | [string, express.RequestHandler | express.ErrorRequestHandler];
}

export interface ICustomMiddlewareResolver {
  resolve(): ICustomMiddleware;
}

export type IRequire = (module: string) => any;

export interface IRequireConstructor extends IRequire {
  resolve(module: string): string;
}

@injectable()
export default class CustomMiddlewareResolver implements ICustomMiddlewareResolver {
  public middlewarePath = path.join(process.cwd(), "./config");
  public require: IRequireConstructor;

  constructor(@inject("IRequireConstructor") require) {
    this.require = require;
  }

  public resolve() {
    let customMiddleware: ICustomMiddleware = {};

    try {
      const customMiddlewarePath = this.require.resolve(this.middlewarePath);
      customMiddleware = this.require(customMiddlewarePath).middleware;
    } catch (e) {
      logger.debug(e);
    }

    return customMiddleware;
  }
}
