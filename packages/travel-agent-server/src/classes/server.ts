import * as express from "express";
import { Container, inject, injectable } from "inversify";
import * as path from "path";
import { matchPath } from "react-router-dom";
import container from "../config/container";
import { IControllerFactory, ITravelAgentModule, ITravelAgentServer, IRoute } from "../interfaces";
import { ICustomMiddleware, ICustomMiddlewareResolver } from "../middleware/customMiddlewareResolver";
import { IMiddlewareProvider } from "../middleware/middlewareProvider";
import TYPES from "../types";
import { IController, IControllerConstructor } from "./controller";
import ControllerRegistry from "./controllerRegistry";
import getBundledAssets from "../utils/getBundledAssets";
import createEngine from "./reactEngine";

@injectable()
export default class TravelAgentServer implements ITravelAgentServer {
  public app: express.Application;
  public container: Container;
  public controllerFactory: IControllerFactory;
  public middlewareResolver: IMiddlewareProvider;
  public routes: IRoute[];
  private defaultRouter: express.Router;

  constructor(
    @inject(TYPES.express) express: express.Application,
    @inject(TYPES.IMiddlewareProvider) middlewareResolver: IMiddlewareProvider,
    @inject(TYPES.IControllerFactory) controllerFactory: IControllerFactory,
  ) {
    this.app = express;
    this.middlewareResolver = middlewareResolver;
    this.controllerFactory = controllerFactory;
    this.container = container;

    this.handler = this.handler.bind(this);
    this.createDefaultRoute = this.createDefaultRoute.bind(this);
  }

  public setup() {
    this.middlewareResolver.middleware(this.app);
    this.createViewEngine();
  }

  public postSetup() {
    this.addDefaultRoute();
    this.middlewareResolver.postMiddleware(this.app);
  }

  public bind<T = {}>(...args) {
    return container.bind.apply(container, args);
  }

  public addModules() {
    const registry = new ControllerRegistry();
    const controllers = registry.register();
    this.routes = [];
    controllers.forEach((controller) => {
      injectable()(controller);
      container.bind(controller.name).to(controller);

      Object.keys(controller.routes)
      .reduce<IRoute[]>((memo, key) => {
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
      }, this.routes);
    });
  }

  private addDefaultRoute() {
    const router = express.Router();
    this.defaultRouter = router;

    router.get("*", this.createDefaultRoute("get"));
    router.post("*", this.createDefaultRoute("post"));
    router.patch("*", this.createDefaultRoute("patch"));
    router.delete("*", this.createDefaultRoute("delete"));

    this.app.use(router);
  }

  private createDefaultRoute(method) {
    return (req, res, next) => {
      const matched = this.routes
      .filter((r) => r.method.toLowerCase() === method.toLowerCase())
      .some((route) => {
        const match = matchPath(req.path, { path: route.url, exact: true });

        if (match) {
          res.locals.assets = getBundledAssets(res);
          this.handler(req, res, next, route.controller.name, route.handler);
        }

        return !!match;
      });

      if (!matched) {
        return next();
      }
    };
  }

  private createViewEngine() {
    if (process.env.NODE_ENV === "production") {
      this.app.engine("js", createEngine({
        layout: "dist/layout",
      }));
      this.app.set("views", [
        "dist/modules",
        "dist",
      ].map((p) => path.join(process.cwd(), p))); // specify the views directory
      this.app.set("view engine", "js"); // register the template engine
    } else {
      this.app.engine("tsx", createEngine());
      this.app.set("views", [
        "app/modules",
        "app",
      ].map((p) => path.join(process.cwd(), p))); // specify the views directory
      this.app.set("view engine", "tsx"); // register the template engine
    }
  }

  private handler(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
    controller: string,
    handler: string,
  ) {
    const instance = this.controllerFactory.create(req, res, next, controller, handler);
    return instance;
  }
}
