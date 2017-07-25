import { Container } from "inversify";
import * as express from "express";
import TravelAgentServer from "../classes/server";
import {
  ITravelAgentServer,
} from "../interfaces";
import MiddlewareProvider, { IMiddlewareProvider } from "../middleware/middlewareProvider";
import CustomMiddlewareResolver, { ICustomMiddlewareResolver } from "../middleware/customMiddlewareResolver";
import TYPES from "../types";
import { defaultMiddleware, defaultProductionMiddleware } from "../middleware/default";

const container = new Container();

container.bind<express.Application>(TYPES.express).toFactory(() => {
  return express();
});

container.bind<ITravelAgentServer>(TYPES.ITravelAgentServer).to(TravelAgentServer);
container.bind<IMiddlewareProvider>(TYPES.IMiddlewareProvider).to(MiddlewareProvider);
container.bind<ICustomMiddlewareResolver>(TYPES.ICustomMiddlewareResolver).to(CustomMiddlewareResolver);

container.bind(TYPES.IRequireConstructor).toConstantValue(require);
container.bind(TYPES.DefaultMiddleware).toFactory(() => defaultMiddleware);
container.bind(TYPES.DefaultProductionMiddleware).toFactory(() => defaultProductionMiddleware);

export default container;
