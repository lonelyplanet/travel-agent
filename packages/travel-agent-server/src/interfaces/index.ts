import * as express from "express";
import * as inversify from "inversify/dts/interfaces/interfaces";
import { Container } from "inversify";
import { IController, IControllerConstructor } from "../classes/controller";
import { IMiddlewareProvider } from "../middleware/middlewareProvider";

export interface ITravelAgentModule {
  controller: IControllerConstructor;
}

export interface ITravelAgentServer {
  app: express.Application;
  routes: IRoute[];
  container: Container;
  bind: inversify.interfaces.Bind;
  controllerFactory: IControllerFactory;
  middlewareResolver: IMiddlewareProvider;
  addModules(): void;
  postSetup(): void;
  setup(): void;
  use(): express.Application;
}

export interface IControllerFactory {
  create(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
    controller: string,
    handler: string,
  ): IController;
}

export interface IRoute {
  handler: string;
  method: string;
  url: string;
  middleware: object[];
  routes: object;
  controller: IControllerConstructor;
}
