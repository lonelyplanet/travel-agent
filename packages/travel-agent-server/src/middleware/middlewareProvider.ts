import * as express from "express";
import { inject, injectable } from "inversify";
import TYPES from "../types";
import logger from "../utils/logger";
import catchAll from "./catchAll";
import {
  ICustomMiddleware,
  ICustomMiddlewareResolver,
} from "./customMiddlewareResolver";
import errorHandler from "./errorHandler";

export const applyMiddleware = (
  app,
  ...middleware: ICustomMiddleware[],
): ICustomMiddleware => {
  const allMiddleware = middleware.reduce((memo, m) => ({ ...memo, ...m }), {});

  Object.keys(allMiddleware)
  .forEach((key) => {
    logger.debug(`initializing middleware: ${key}`);
    if (Array.isArray(allMiddleware[key]) && allMiddleware[key].length === 2) {
      const [path, fn] = <[string, express.RequestHandler]>allMiddleware[key];
      app.use(path, fn);
    } else {
      app.use(allMiddleware[key]);
    }
  });
  return allMiddleware;
};

export interface IMiddlewareProvider {
  middleware(app: express.Application, env?: string): ICustomMiddleware;
  postMiddleware(app: express.Application, env?: string): ICustomMiddleware;
}

@injectable()
export default class MiddlewareProvider implements IMiddlewareProvider {
  public static postMiddleware() {
    return {
      errorHandler: errorHandler(process.env.NODE_ENV),
      catchAll,
    };
  }

  @inject(TYPES.DefaultMiddleware) public defaultMiddleware: () => ICustomMiddleware;
  @inject(TYPES.DefaultProductionMiddleware) public defaultProductionMiddleware: () => ICustomMiddleware;
  @inject(TYPES.DefaultDevMiddleware) public defaultDevMiddleware: () => ICustomMiddleware;
  public customMiddlewareResolver: ICustomMiddlewareResolver;

  constructor(
    @inject(TYPES.ICustomMiddlewareResolver) customMiddlewareResolver?: ICustomMiddlewareResolver,
  ) {
    this.customMiddlewareResolver = customMiddlewareResolver;
  }

  public middleware(app, env = process.env.NODE_ENV) {
    return applyMiddleware(
      app,
      this.defaultMiddleware(),
      env !== "production" ? this.defaultDevMiddleware() : {},
      env === "production" ? this.defaultProductionMiddleware() : {},
      this.customMiddlewareResolver.resolve(),
    );
  }

  public postMiddleware(app, env = process.env.NODE_ENV) {
    return applyMiddleware(
      app,
      MiddlewareProvider.postMiddleware(),
    );
  }
}
