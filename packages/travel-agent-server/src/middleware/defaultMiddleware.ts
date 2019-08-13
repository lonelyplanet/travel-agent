/* tslint:disable: object-literal-sort-keys */
import * as express from "express";
import { Handler } from "express-serve-static-core";
import * as path from "path";
import * as AirbrakeClient from "airbrake-js";
import * as makeErrorHandler from "airbrake-js/dist/instrumentation/express";
import errorHandler from "./errorHandler";
import catchAll from "./catchAll";
import { IUserConfig } from "../classes/userConfigResolver";
import AirbrakeCreds from "../classes/airbrakeCreds";
import setLocation from "./setLocation";
import handleFavicon from "./handleFavicon";
import { ITravelAgentServer } from "../interfaces/index";

const health = express.Router();
health.get("/health-check", (req, res) => {
  res.json({
    success: true,
  });
});

const shouldEnableDefaultLoggers = (options: IUserConfig) => {
  return !options.disableDefaultLoggingMiddleware;
};

export const defaultMiddleware = (
  options?: IUserConfig,
  req: NodeRequire = require,
) => [
  req("helmet")(),
  req("body-parser").urlencoded({ extended: false }),
  req("cookie-parser")(),
  req("cors")(),
  req("body-parser").json(),
  setLocation,
  handleFavicon,
  health,
];

export const defaultDevMiddleware = (
  options?: IUserConfig,
  req: NodeRequire = require,
) => {
  const middleware = [express.static(path.join(process.cwd(), "public"))];

  if (shouldEnableDefaultLoggers(options)) {
    middleware.push(req("morgan")("dev"));
  }

  if (options.webpack) {
    const webpack = req("webpack");
    const config = req("../webpack/config").default;
    const compiler = webpack(config);

    middleware.push(
      req("webpack-hot-middleware")(compiler),
      req("webpack-dev-middleware")(compiler, {
        noInfo: true,
        publicPath: "/assets/",
        serverSideRender: true,
      }),
    );
  }

  return middleware;
};

export const defaultTestMiddleware = (
  options?: IUserConfig,
  req: NodeRequire = require,
) => {
  const middleware = [];
  return middleware;
};

export const defaultProductionMiddleware = (
  options?: IUserConfig,
  name: string = process.env.LP_SERVICE_ID,
  req: NodeRequire = require,
) => {
  const middleware = [];

  if (shouldEnableDefaultLoggers(options)) {
    const excludes = [
      "body",
      "short-body",
      "req-headers",
      "res-headers",
      "req",
      "res",
      "incoming",
      "response-hrtime",
    ];

    middleware.push(
      req("express-bunyan-logger")({
        name: name || "travel-agent-server",
        parseUA: false, // Leave user-agent as raw string
        includesFn: (req, res) => ({ 'x-trace-token': req.header('x-trace-token') }), // log x-trace-token set on Fastly
        excludes,
      }),
    );
  }

  if (options.serveAssets) {
    middleware.push(express.static(path.join(process.cwd(), "public")));
  }

  return middleware;
};

const getAirbrakeCreds = (options: IUserConfig) => {
  if (options.airbrakeId && options.airbrakeKey) {
    return new AirbrakeCreds(options.airbrakeId, options.airbrakeKey);
  } else if (
    options.production &&
    (options.production.airbrakeId || options.production.airbrakeKey)
  ) {
    return new AirbrakeCreds(
      options.production.airbrakeId,
      options.production.airbrakeKey,
    );
  }

  return new AirbrakeCreds();
};

export const defaultPostMiddleware = (
  isProdEnv: boolean,
  options?: IUserConfig,
  app?: ITravelAgentServer,
) => {
  const middleware = [];
  const airbrakeCreds = getAirbrakeCreds(options);

  if (isProdEnv && airbrakeCreds.airbrakeId && airbrakeCreds.airbrakeKey) {
    const airbrake = new AirbrakeClient({
      projectId: airbrakeCreds.airbrakeId,
      projectKey: airbrakeCreds.airbrakeKey,
    });

    middleware.push(makeErrorHandler(airbrake));
  }

  middleware.push(
    catchAll,
    errorHandler(isProdEnv, {
      sendProductionErrors: options.sendProductionErrors,
    }),
  );

  return middleware;
};
