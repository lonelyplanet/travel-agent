import { Application, Router } from "express";
import { Container, inject, injectable, decorate } from "inversify";
import * as path from "path";
import container from "../config/container";
import {
  IControllerFactory,
  IControllerRegistry,
  ITravelAgentModule,
  ITravelAgentServer,
  IRoute,
} from "../interfaces";
import {
  ICustomMiddleware,
  IUserConfigResolver,
} from "../classes/userConfigResolver";
import { IMiddlewareProvider } from "../middleware/middlewareProvider";
import TYPES from "../types";
import { IController, IControllerConstructor } from "./controller";
import createEngine from "./reactEngine";
import findMatchingRoutes from "../utils/findMatchingRoutes";
import logger from "../utils/logger";

@injectable()
export default class TravelAgentServer implements ITravelAgentServer {
  public app: Application;
  public container: Container;
  public controllerFactory: IControllerFactory;
  public controllerRegistry: IControllerRegistry;
  public middlewareResolver: IMiddlewareProvider;
  public routes: IRoute[];
  private defaultRouter: Router;
  private cwd: string;
  private isProdEnv: boolean;

  constructor(
    @inject(TYPES.express) express: Application,
    @inject(TYPES.expressRouter) expressRouter: Router,
    @inject(TYPES.IMiddlewareProvider) middlewareResolver: IMiddlewareProvider,
    @inject(TYPES.IControllerFactory) controllerFactory: IControllerFactory,
    @inject(TYPES.IControllerRegistry) controllerRegistry: IControllerRegistry,
    @inject(TYPES.ICwd) cwd: string,
    @inject(TYPES.IIsProdEnv) isProdEnv: boolean,
  ) {
    this.app = express;
    this.middlewareResolver = middlewareResolver;
    this.controllerFactory = controllerFactory;
    this.controllerRegistry = controllerRegistry;
    this.container = container;
    this.routes = [];
    this.defaultRouter = expressRouter;
    this.cwd = cwd;
    this.isProdEnv = isProdEnv;

    this.createDefaultRoute = this.createDefaultRoute.bind(this);
  }

  public use(...args) {
    return this.app.use(...args);
  }

  public setup() {
    this.middlewareResolver.middleware(this);
    this.createViewEngine();
  }

  public postSetup() {
    this.middlewareResolver.beforeRoutesMiddleware(this);
    this.addDefaultRoute(this.defaultRouter);
    this.middlewareResolver.postMiddleware(this);
  }

  public bind<T = {}>(...args) {
    return container.bind.apply(container, args);
  }

  public addModules() {
    const controllers = this.controllerRegistry.register();
    controllers.forEach(controller => {
      decorate(injectable(), controller.constructor);
      // TODO: Extract to types
      container
        .bind<IController>(TYPES.Controller)
        .to(controller.get())
        .whenTargetNamed(controller.constructor.name);

      this.routes.push(...this.buildRouteObjects(controller.constructor));
    });
  }

  private buildRouteObjects(controller: IControllerConstructor): IRoute[] {
    return Object.keys(controller.routes).reduce<IRoute[]>((memo, key) => {
      const split = key.split(" ");
      const method = split[0].toLocaleLowerCase();
      const url = split[1];
      const handler = controller.routes[key];

      memo.push({
        handler,
        method,
        url,
        middleware: [],
        routes: controller.routes,
        controller,
      });

      return memo;
    }, []);
  }

  private addDefaultRoute(router: Router) {
    router
      .route("*")
      .get(this.createDefaultRoute("get"))
      .post(this.createDefaultRoute("post"))
      .patch(this.createDefaultRoute("patch"))
      .delete(this.createDefaultRoute("delete"));

    this.app.use(router);
  }

  private createDefaultRoute(method: string) {
    return (req, res, next) => {
      const matchingRoutes = findMatchingRoutes(req.path, method, this.routes);

      if (!matchingRoutes.length) {
        return next();
      }

      if (matchingRoutes.length > 1) {
        const matches = matchingRoutes.map((route, index) => {
          return `\n${index + 1}: Controller ${route.controllerName} - method ${
            route.handler
          }`;
        });
        logger.warn(
          `Multiple matching routes for route ${method.toUpperCase()} ${
            req.path
          }`,
          ...matches,
        );
      }

      const route = matchingRoutes[0];
      req.params = route.params;
      this.controllerFactory.create(
        req,
        res,
        next,
        route.controllerName,
        route.handler,
      );
    };
  }

  private createViewEngine() {
    if (this.isProdEnv) {
      this.app.engine(
        "js",
        createEngine({
          layout: "dist/layout",
          isProdEnv: true,
        }),
      );
      this.app.set(
        "views",
        ["dist/modules", "dist"].map(p => path.join(this.cwd, p)),
      ); // specify the views directory
      this.app.set("view engine", "js"); // register the template engine
    } else {
      this.app.engine("tsx", createEngine());
      this.app.set(
        "views",
        ["app/modules", "app"].map(p => path.join(this.cwd, p)),
      ); // specify the views directory
      this.app.set("view engine", "tsx"); // register the template engine
    }
  }
}
