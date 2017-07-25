import { inject } from "inversify";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as helmet from "helmet";
import * as path from "path";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import TYPES from "../types";
import {
  ICustomMiddlewareResolver,
  ICustomMiddleware,
} from "./customMiddlewareResolver";
import errorHandler from "./errorHandler";
import logger from "../utils/logger";

const health = express.Router();
health.get("/health-check", (req, res) => {
  res.json({
    success: true,
  });
});

export const applyMiddleware = (
  app, defaultMiddleware,
  customMiddleware: ICustomMiddleware
): ICustomMiddleware => {
  const middleware = {
    ...defaultMiddleware,
    ...customMiddleware
  };

  Object.keys(middleware)
  .forEach((key) => {
    logger.debug(`initializing middleware: ${key}`);
    app.use(middleware[key]);
  });
  return middleware;
};

export interface IMiddlewareProvider {
  middleware(app: express.Application): ICustomMiddleware;
}

export default class MiddlewareProvider {
  static defaultMiddleware() {
    return {
      health,
      errorHandler: errorHandler(process.env.NODE_ENV),
      cookieParser: cookieParser(),
      cors: cors(),
      jsonParser: bodyParser.json(),
      bodyParserUrl: bodyParser.urlencoded({ extended: false }),
      static: express.static(path.join(process.cwd(), "public")),
    };
  }

  defaultMiddleware: ICustomMiddleware;
  customMiddlewareResolver: ICustomMiddlewareResolver;

  constructor(
    defaults?: ICustomMiddleware,
    @inject(TYPES.ICustomMiddlewareResolver) customMiddlewareResolver?: ICustomMiddlewareResolver
  ) {
    this.defaultMiddleware = defaults || MiddlewareProvider.defaultMiddleware();
    this.customMiddlewareResolver = customMiddlewareResolver;
  }



  middleware(app) {
    return applyMiddleware(
      app,
      this.defaultMiddleware,
      this.customMiddlewareResolver.resolve()
    );
  }
}
