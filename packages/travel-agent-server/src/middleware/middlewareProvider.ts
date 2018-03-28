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
      const route = options.route || "/";
      if (options.resolve) {
        app.use(route, options.resolve());
      } else {
        app.use(route, options.fn);
      }
    } else {
      app.use(key);
    }
  });
  return allMiddleware;
};

export interface IMiddlewareProvider {
  middleware(app: ITravelAgentServer): ICustomMiddleware[];
  beforeRoutesMiddleware(app: ITravelAgentServer): ICustomMiddleware[];
  postMiddleware(app: ITravelAgentServer): ICustomMiddleware[];
}

@injectable()
export default class MiddlewareProvider implements IMiddlewareProvider {
  @inject(TYPES.DefaultMiddleware)
  public defaultMiddleware: (options?: IUserConfig) => ICustomMiddleware[];

  @inject(TYPES.DefaultProductionMiddleware)
  public defaultProductionMiddleware: (
    options?: IUserConfig,
  ) => ICustomMiddleware[];

  @inject(TYPES.DefaultTestMiddleware)
  public defaultTestMiddleware: (options?: IUserConfig) => ICustomMiddleware[];

  @inject(TYPES.DefaultDevMiddleware)
  public defaultDevMiddleware: (options?: IUserConfig) => ICustomMiddleware[];

  @inject(TYPES.DefaultPostMiddleware)
  public defaultPostMiddleware: (
    isProdEnv: boolean,
    options?: IUserConfig,
    app?: ITravelAgentServer,
  ) => ICustomMiddleware[];

  public userConfigResolver: IUserConfigResolver;
  public userConfig: IUserConfig;
  private nodeEnv: string;

  constructor(
    @inject(TYPES.NodeEnv) nodeEnv: string,
    @inject(TYPES.IUserConfigResolver)
    customMiddlewareResolver?: IUserConfigResolver,
  ) {
    this.nodeEnv = nodeEnv;
    this.userConfigResolver = customMiddlewareResolver;
    this.userConfig = this.userConfigResolver.resolve();
  }

  public middleware(app: ITravelAgentServer) {
    let middleware;

    if (this.nodeEnv === "test") {
      middleware = this.defaultTestMiddleware();
    } else if (this.nodeEnv === "production") {
      middleware = this.defaultProductionMiddleware(this.userConfig);
    } else {
      this.defaultDevMiddleware(this.userConfig);
    }

    return applyMiddleware(
      app,
      this.defaultMiddleware(this.userConfig),
      middleware,
      this.userConfig.middleware,
    );
  }

  public postMiddleware(app: ITravelAgentServer) {
    let middleware;

    if (this.nodeEnv === "test") {
      middleware = [];
    } else {
      middleware = this.defaultPostMiddleware(
        this.nodeEnv === "production",
        {
          ...this.userConfig,
        },
        app,
      );
    }

    return applyMiddleware(
      app,
      middleware,
      this.userConfig.postMiddleware || [],
    );
  }

  public beforeRoutesMiddleware(app: ITravelAgentServer) {
    const config = this.userConfig;
    let middleware;

    if (this.nodeEnv === "test") {
      middleware = [];
    } else {
      middleware = [
        createPrometheusMiddleware({
          ...(config.prometheus || {}),
          routes: app.routes.reduce<IPromRoute[]>((m, r) => {
            m.push({
              route: r.url,
              name: `${r.controller.name}#${r.handler}`,
            });
            return m;
          }, []),
        }),
      ];
    }

    return applyMiddleware(app, middleware);
  }
}
