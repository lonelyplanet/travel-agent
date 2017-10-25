/* tslint:disable: no-console */
import * as dotenv from "dotenv";
import * as http from "http";
import { inject, injectable } from "inversify";
import * as path from "path";
import {
  IController,
} from "./classes/controller";
import container from "./config/container";
import {
  ITravelAgentServer,
} from "./interfaces";
import TYPES from "./types";

export { inject, injectable } from "inversify";
export { Controller } from "./classes/controller";

export * from "./classes/decorators";

function normalizePort(val: number|string): number|string|boolean {
  const port: number = (typeof val === "string") ? parseInt(val, 10) : val;
  if (isNaN(port)) {
    return val;
  } else if (port >= 0) {
    return port;
  } else {
    return false;
  }
}

dotenv.config({
  path: (process.env.ENV_PATH || path.join(process.cwd(), ".env")),
  silent: true,
});

const start = (options: {
  startWithoutHttp?: boolean,
} = {
  startWithoutHttp: false,
}) => {
  const port = normalizePort(process.env.PORT || 3000);

  const travelAgent = container.get<ITravelAgentServer>(TYPES.ITravelAgentServer);

  travelAgent.setup();
  travelAgent.addModules();
  travelAgent.postSetup();

  if (!options.startWithoutHttp) {
    const server = http.createServer(travelAgent.app);

    server.listen(port);
    server.on("error", onError);
    server.on("listening", createOnListening(server));
  }

  function onError(error) {
    if (error.syscall !== "listen") {
      throw error;
    }
    const bind = (typeof port === "string") ? "Pipe " + port : "Port " + port;
    switch (error.code) {
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

  function createOnListening(server) {
    return () => {
      const addr = server.address();
      const bind = (typeof addr === "string") ? `pipe ${addr}` : `port ${addr.port}`;
      console.log(`Listening on ${bind}`);
    }
  }

  return travelAgent;
};

export default start;
