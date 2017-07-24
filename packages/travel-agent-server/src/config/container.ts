import { Container } from "inversify";
import TravelAgentServer from "../classes/server";
import {
  ITravelAgentServer,
} from "../interfaces";
import TYPES from "../types";
import * as express from "express";

const container = new Container();

// container.bind<IAuthOptionsDefaults>(TYPES.IAuthConfigDefaults).toConstantValue({
//   host: "https://connect.lonelyplanet.com",
//   clientId: "foymu5r6sscxe",
//   scope: [
//     "openid",
//   ],
// });

container.bind<express.Application>(TYPES.express).toFactory(() => {
  return express();
});

container.bind<ITravelAgentServer>(TYPES.ITravelAgentServer).to(TravelAgentServer);

export default container;