import {
  injectable,
} from "inversify";
import * as express from "express";

export interface IRoute {
  (req: Object, res: Object, next: Function): void;
}

export interface IController {
  request: express.Request;
  response: express.Response;
  next: express.NextFunction;
}

export interface IControllerConstructor {
  routes: { [key: string]: string };
  new(): IController;
};

@injectable()
export abstract class Controller implements IController {
  request: express.Request;
  response: express.Response;
  next: express.NextFunction;
}