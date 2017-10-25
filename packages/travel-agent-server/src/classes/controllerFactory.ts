import * as express from "express";
import { Container, inject, injectable } from "inversify";
import { IControllerFactory } from "../interfaces";
import TYPES from "../types";
import { IController } from "./controller";

@injectable()
export default class ControllerFactory implements IControllerFactory {
  public container: Container;

  constructor(@inject("container") container) {
    this.container = container;
  }

  public create(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
    controller: string,
    handler: string,
  ): IController {
    const instance = this.container.get<IController>(controller);
    instance.request = req;
    instance.response = res;
    instance.next = next;

    try {
      const result = instance[handler]();

      if (result && result.then) {
        result.catch((e) => {
          next(e)
        });
      }
    } catch (e) {
      next(e);
    }

    return instance;
  }
}
