/* tslint:disable: no-console */
import * as dotenv from "dotenv";
import * as http from "http";
import { inject, injectable } from "inversify";
import * as path from "path";
import { IController } from "./classes/controller";
import container from "./config/container";
import { ITravelAgentServer } from "./interfaces";
import TYPES from "./types";
import * as hook from "css-modules-require-hook";
import * as chokidar from "chokidar";

if (process.env.NODE_ENV === "development") {
  chokidar
    .watch(path.join(process.cwd(), "app"), {
      ignored: /(^|[\/\\])\../,
    })
    .on("change", path => {
      Object.keys(require.cache).forEach(function(id) {
        if (/\/app\//.test(id)) {
          delete require.cache[id];
        }
      });
    });
}

hook({
  generateScopedName: "[name]__[local]___[hash:base64:5]",
  rootDir: path.resolve(
    process.cwd(),
    process.env.NODE_ENV === "production" ? "dist" : "app",
  ),
});

export { inject, injectable } from "inversify";
export { Controller } from "./classes/controller";
export { ILayoutOptions } from "./classes/reactEngine";

export * from "./classes/decorators";

function normalizePort(val: number | string): number | string | boolean {
  const port: number = typeof val === "string" ? parseInt(val, 10) : val;
  if (isNaN(port)) {
    return val;
  } else if (port >= 0) {
    return port;
  } else {
    return false;
  }
}

dotenv.config({
  path: process.env.ENV_PATH || path.join(process.cwd(), ".env"),
  silent: true,
});

const start = (
  options: {
    startWithoutHttp?: boolean;
  } = {
    startWithoutHttp: false,
  },
) => {
  const port = normalizePort(process.env.PORT || 3000);

  const travelAgent = container.get<ITravelAgentServer>(
    TYPES.ITravelAgentServer,
  );

  try {
    travelAgent.setup();
    travelAgent.addModules();
    travelAgent.postSetup();
  } catch (e) {
    console.log("An error occured starting the server...");
    console.log(e);
    process.exit(1);
  }

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
    const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
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
      const bind =
        typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
      console.log(`Listening on ${bind}`);
    };
  }

  return travelAgent;
};

export default start;
