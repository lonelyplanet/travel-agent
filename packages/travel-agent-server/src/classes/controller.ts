import * as express from "express";
import {
  injectable,
} from "inversify";

export type IRoute = (req: object, res: object, next: () => void) => void;

export interface IController {
  request: express.Request;
  response: express.Response;
  next: express.NextFunction;
}

export interface IControllerConstructor {
  routes: { [key: string]: string };
  new(): IController;
}

@injectable()
export abstract class Controller implements IController {
  public request: express.Request;
  public response: express.Response;
  public next: express.NextFunction;
}
