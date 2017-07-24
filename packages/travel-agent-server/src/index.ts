import * as http from "http";
import {
  ITravelAgentServer,
  ITravelAgentServerOptions,
} from "./interfaces";
import TYPES from "./types";
import container from "./config/container";
import {
  IController,
} from "./classes/controller";
import { inject, injectable } from "inversify";

export { Controller } from "./classes/controller";

// export const {
//   decorators: {
//     get,
//   }
// };

const start = (options: ITravelAgentServerOptions) => {
  const port = normalizePort(process.env.PORT || 3000);

  const travelAgent = container.get<ITravelAgentServer>(TYPES.ITravelAgentServer);
  
  travelAgent.addModules(options.modules);

  const server = http.createServer(travelAgent.app);

  server.listen(port);
  server.on("error", onError);
  server.on("listening", onListening);

  function normalizePort(val: number|string): number|string|boolean {
    const port: number = (typeof val === "string") ? parseInt(val, 10) : val;
    if (isNaN(port)) return val;
    else if (port >= 0) return port;
    else return false;
  }

  function onError(error) {
    if (error.syscall !== "listen") throw error;
    let bind = (typeof port === "string") ? 'Pipe ' + port : 'Port ' + port;
    switch(error.code) {
      case "EACCES":
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case "EADDRINUSE":
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  function onListening() {
    const addr = server.address();
    const bind = (typeof addr === "string") ? `pipe ${addr}` : `port ${addr.port}`;
    console.log(`Listening on ${bind}`);
  }

  return travelAgent;
}

export default start;