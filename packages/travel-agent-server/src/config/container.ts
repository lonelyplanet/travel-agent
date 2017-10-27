import * as express from "express";
import { Container } from "inversify";
import ControllerFactory from "../classes/controllerFactory";
import TravelAgentServer from "../classes/server";
import {
  IControllerFactory,
  ITravelAgentServer,
} from "../interfaces";
import UserConfigResolver, { IUserConfigResolver } from "../classes/userConfigResolver";
import { defaultDevMiddelware, defaultMiddleware, defaultProductionMiddleware } from "../middleware/default";
import MiddlewareProvider, { IMiddlewareProvider } from "../middleware/middlewareProvider";
import TYPES from "../types";

const container = new Container();

container.bind<express.Application>(TYPES.express).toFactory(() => {
  return express();
});

container.bind<IControllerFactory>(TYPES.IControllerFactory).to(ControllerFactory);
container.bind<ITravelAgentServer>(TYPES.ITravelAgentServer).to(TravelAgentServer);
container.bind<IMiddlewareProvider>(TYPES.IMiddlewareProvider).to(MiddlewareProvider);
container.bind<IUserConfigResolver>(TYPES.IUserConfigResolver).to(UserConfigResolver);

container.bind(TYPES.IRequireConstructor).toConstantValue(require);
container.bind(TYPES.DefaultMiddleware).toFactory(() => defaultMiddleware);
container.bind(TYPES.DefaultProductionMiddleware).toFactory(() => defaultProductionMiddleware);
container.bind(TYPES.DefaultDevMiddleware).toFactory(() => defaultDevMiddelware);
container.bind("container").toConstantValue(container);

export default container;
