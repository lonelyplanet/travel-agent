import * as express from "express";
import { Container } from "inversify";
import ControllerFactory from "../classes/controllerFactory";
import ControllerRegistry from "../classes/controllerRegistry";
import TravelAgentServer from "../classes/server";
import {
  IControllerFactory,
  IControllerRegistry,
  ITravelAgentServer,
} from "../interfaces";
import UserConfigResolver, {
  IUserConfigResolver,
} from "../classes/userConfigResolver";
import {
  defaultDevMiddleware,
  defaultMiddleware,
  defaultProductionMiddleware,
  defaultPostMiddleware,
  defaultTestMiddleware,
} from "../middleware/defaultMiddleware";
import MiddlewareProvider, {
  IMiddlewareProvider,
} from "../middleware/middlewareProvider";
import TYPES from "../types";

const container = new Container();

container.bind<express.Application>(TYPES.express).toFactory(() => {
  return express();
});

container.bind<express.Router>(TYPES.expressRouter).toFactory(() => {
  return express.Router();
});

container
  .bind<IControllerFactory>(TYPES.IControllerFactory)
  .to(ControllerFactory);
container
  .bind<IControllerRegistry>(TYPES.IControllerRegistry)
  .to(ControllerRegistry);
container
  .bind<ITravelAgentServer>(TYPES.ITravelAgentServer)
  .to(TravelAgentServer);
container
  .bind<IMiddlewareProvider>(TYPES.IMiddlewareProvider)
  .to(MiddlewareProvider);
container
  .bind<IUserConfigResolver>(TYPES.IUserConfigResolver)
  .to(UserConfigResolver);

container.bind(TYPES.IRequireConstructor).toConstantValue(require);
container.bind(TYPES.DefaultMiddleware).toFactory(() => defaultMiddleware);
container
  .bind(TYPES.DefaultProductionMiddleware)
  .toFactory(() => defaultProductionMiddleware);
container
  .bind(TYPES.DefaultDevMiddleware)
  .toFactory(() => defaultDevMiddleware);
container
  .bind(TYPES.DefaultPostMiddleware)
  .toFactory(() => defaultPostMiddleware);
container
  .bind(TYPES.DefaultTestMiddleware)
  .toFactory(() => defaultTestMiddleware);

container.bind("container").toConstantValue(container);
container.bind(TYPES.ICwd).toConstantValue(process.cwd());
container
  .bind(TYPES.IIsProdEnv)
  .toConstantValue(process.env.NODE_ENV === "production");
container.bind(TYPES.NodeEnv).toConstantValue(process.env.NODE_ENV);

export default container;
