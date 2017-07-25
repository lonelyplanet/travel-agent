import { inject, injectable } from "inversify";
import * as path from "path";
import * as express from "express";

export interface ICustomMiddleware {
  [key: string]: express.RequestHandler | express.ErrorRequestHandler,
}

export interface ICustomMiddlewareResolver {
  resolve(): ICustomMiddleware,
}

export interface IRequire {
  (module: string): any;
}

export interface IRequireConstructor extends IRequire {
  resolve(module: string): string;
}

@injectable()
export default class CustomMiddlewareResolver implements ICustomMiddlewareResolver {
  middlewarePath = path.join(process.cwd(), "./config");;
  require: IRequireConstructor;

  constructor(@inject("IRequireConstructor") require) {
    this.require = require;
  }

  resolve() {
    let customMiddleware: ICustomMiddleware = {};

    try {
      const customMiddlewarePath = this.require.resolve(this.middlewarePath);
      customMiddleware = this.require(customMiddlewarePath).middleware;
    }
    catch(e) {}

    return customMiddleware;
  }
}
