import * as express from "express";
import { inject, injectable } from "inversify";
import TYPES from "../types";
import logger from "../utils/logger";
import {
  ICustomMiddleware,
  IUserConfigResolver,
  IUserConfig,
  ICustomMiddlewareObject,
} from "../classes/userConfigResolver";
import { ITravelAgentServer } from "../interfaces/index";
import createPrometheusMiddleware, { IPromRoute } from "./prometheus";

export const applyMiddleware = (
  app,
  ...middleware: Array<ICustomMiddleware[]>
): ICustomMiddleware[] => {
  const allMiddleware = middleware.reduce((memo, m) => memo.concat(m), []);

  allMiddleware.forEach(key => {
    if (Array.isArray(key) && key.length === 2) {
      const [path, fn] = <[string, express.RequestHandler]>key;
      app.use(path, fn);
    } else if (typeof key === "object" && key) {
      const options = key as ICustomMiddlewareObject;

      if (options.resolve) {
        app.use(options.route || "/", options.resolve());
      } else {
        app.use(options.route || "/", options.fn);
      }
    } else {
      app.use(key);
    }
  });

  return allMiddleware;
};

export interface IMiddlewareProvider {
  middleware(app: ITravelAgentServer, env?: string): ICustomMiddleware[];
  beforeRoutesMiddleware(app: ITravelAgentServer, env?: string): ICustomMiddleware[];
  postMiddleware(app: ITravelAgentServer, env?: string): ICustomMiddleware[];
}

@injectable()
export default class MiddlewareProvider implements IMiddlewareProvider {
  @inject(TYPES.DefaultMiddleware)
  public defaultMiddleware: (options?: IUserConfig) => ICustomMiddleware[];

  @inject(TYPES.DefaultProductionMiddleware)
  public defaultProductionMiddleware: (
    options?: IUserConfig,
  ) => ICustomMiddleware[];

  @inject(TYPES.DefaultDevMiddleware)
  public defaultDevMiddleware: (options?: IUserConfig) => ICustomMiddleware[];

  @inject(TYPES.DefaultPostMiddleware)
  public defaultPostMiddleware: (
    env: string,
    options?: IUserConfig,
    app?: ITravelAgentServer,
  ) => ICustomMiddleware[];

  public userConfigResolver: IUserConfigResolver;
  public userConfig: IUserConfig;

  constructor(
    @inject(TYPES.IUserConfigResolver)
    customMiddlewareResolver?: IUserConfigResolver,
  ) {
    this.userConfigResolver = customMiddlewareResolver;
    this.userConfig = this.userConfigResolver.resolve();
  }

  public middleware(app: ITravelAgentServer, env = process.env.NODE_ENV) {
    return applyMiddleware(
      app,
      this.defaultMiddleware(this.userConfig),
      env !== "production" ? this.defaultDevMiddleware(this.userConfig) : [],
      env === "production"
        ? this.defaultProductionMiddleware(this.userConfig)
        : [],
      this.userConfig.middleware,
    );
  }

  public postMiddleware(app: ITravelAgentServer, env = process.env.NODE_ENV) {
    return applyMiddleware(
      app,
      this.defaultPostMiddleware(env, {
        ...this.userConfig,
      }, app),
      this.userConfig.postMiddleware || [],
    );
  }

  public beforeRoutesMiddleware(app: ITravelAgentServer, env = process.env.NODE_ENV) {
    const config = this.userConfig;
    const middleware = [
      createPrometheusMiddleware({
        ...(config.prometheus || {}),
        routes: app.routes.reduce<IPromRoute[]>((m, r) => {
          m.push({
            route: r.url,
            name: `${r.controller.name}#${r.handler}`
          });
          return m;
        }, []),
      }),
    ];
    return applyMiddleware(
      app,
      middleware,
    );
  }
}
