import * as express from "express";
import {
  IControllerConstructor,
} from "../classes/controller";
import {
  Container,
} from "inversify";

export interface IHttpServer {

}

export interface ITravelAgentModule {
  controller: IControllerConstructor;
}

export interface ITravelAgentServerOptions {
  modules: ITravelAgentModule[];
}

export interface ITravelAgentServer {
  app: express.Application;
  container: Container;
  bind: Function;
  addModules(modules: ITravelAgentModule[]): void;
  postSetup(): void;
  setup(): void;
}
