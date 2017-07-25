import { inject, injectable } from "inversify";
import * as express from "express";
import TYPES from "../types";
import {
  ICustomMiddlewareResolver,
  ICustomMiddleware,
} from "./customMiddlewareResolver";
import errorHandler from "./errorHandler";
import catchAll from "./catchAll";
import logger from "../utils/logger";

export const applyMiddleware = (
  app,
  ...middleware: ICustomMiddleware[],
): ICustomMiddleware => {
  const allMiddleware = middleware.reduce((memo, m) => ({ ...memo, ...m }), {});
  Object.keys(allMiddleware)
  .map((key) => {
    logger.debug(`initializing middleware: ${key}`);
    app.use(allMiddleware[key]);
  });
  return allMiddleware;
};

export interface IMiddlewareProvider {
  middleware(app: express.Application, env?: string): ICustomMiddleware;
  postMiddleware(app: express.Application, env?: string): ICustomMiddleware;
}

@injectable()
export default class MiddlewareProvider implements IMiddlewareProvider {
  static postMiddleware() {
    return {
      errorHandler: errorHandler(process.env.NODE_ENV),
      catchAll,
    };
  }

  @inject(TYPES.DefaultMiddleware) defaultMiddleware: () => ICustomMiddleware;
  @inject(TYPES.DefaultProductionMiddleware) defaultProductionMiddleware: () => ICustomMiddleware;
  customMiddlewareResolver: ICustomMiddlewareResolver;

  constructor(
    @inject(TYPES.ICustomMiddlewareResolver) customMiddlewareResolver?: ICustomMiddlewareResolver
  ) {
    this.customMiddlewareResolver = customMiddlewareResolver;
  }

  middleware(app, env = process.env.NODE_ENV) {
    return applyMiddleware(
      app,
      this.defaultMiddleware(),
      this.customMiddlewareResolver.resolve(),
      env === "production" ? this.defaultProductionMiddleware() : {},
    );
  }

  postMiddleware(app, env = process.env.NODE_ENV) {
    return applyMiddleware(
      app,
      MiddlewareProvider.postMiddleware(),
    );
  }
}
