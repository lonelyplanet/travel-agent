import * as express from "express";
import {
  Container,
} from "inversify";
import {
  IController,
  IControllerConstructor,
} from "../classes/controller";

export interface ITravelAgentModule {
  controller: IControllerConstructor;
}

export interface ITravelAgentServer {
  app: express.Application;
  container: Container;
  bind: (name: string) => { to: (name: any) => void };
  addModules(): void;
  postSetup(): void;
  setup(): void;
}

export interface IControllerFactory {
  create(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
    controller: string,
    handler: string): IController;
}

export interface IRoute {
  handler: string;
  method: string;
  url: string;
  middleware: object[];
  routes: object;
  controller: IControllerConstructor;
}
