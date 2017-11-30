/* tslint:disable: object-literal-sort-keys */
import * as express from "express";
import * as path from "path";
import * as webpack from "webpack";
import * as AirbrakeClient from "airbrake-js";
import * as makeErrorHandler from "airbrake-js/dist/instrumentation/express";
import errorHandler from "./errorHandler";
import catchAll from "./catchAll";
import { IUserConfig } from "../classes/userConfigResolver";

const health = express.Router();
health.get("/health-check", (req, res) => {
  res.json({
    success: true,
  });
});

export const defaultMiddleware = (options?: IUserConfig) => [
  require("body-parser").urlencoded({ extended: false }),
  require("cookie-parser")(),
  require("cors")(),
  require("body-parser").json(),
  (req, res, next) => {
    res.locals.location = req.url;
    next();
  },
  (req, res, next) => {
    if (req.url.indexOf(/favicon.ico$/) > -1) {
      res.writeHead(200, { "Content-Type": "image/x-icon" });
      res.end();
      return;
    }

    next();
  },
];

export const defaultDevMiddelware = (options?: IUserConfig) => {
  const middleware = [
    require("morgan")("dev"),
    express.static(path.join(process.cwd(), "public")),
  ];

  if (options.webpack) {
    const config = require("../webpack/config").default;
    const compiler = webpack(config);

    middleware.push(require("webpack-hot-middleware")(compiler));
    middleware.push(
      require("webpack-dev-middleware")(compiler, {
        noInfo: true,
        publicPath: "/assets",
        serverSideRender: true,
      }),
    );
  }

  return middleware;
};

export const defaultProductionMiddleware = (options?: IUserConfig) => {
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

  const config = [
    require("express-bunyan-logger")({
      name: process.env.LP_SERVICE_ID || "travel-agent-server",
      parseUA: false, // Leave user-agent as raw string
      excludes,
    }),
    require("compression")(),
    express.static(path.join(process.cwd(), "public")),
  ];

  return config;
};

export const defaultPostMiddleware = (env, options?: IUserConfig) => {
  const config = [];

  if (env === "production" && options.airbrakeId && options.airbrakeKey) {
    const airbrake = new AirbrakeClient({
      projectId: options.airbrakeId,
      projectKey: options.airbrakeKey,
    });

    config.push(makeErrorHandler(airbrake));
  }

  config.push(catchAll);

  config.push(
    errorHandler(env, {
      sendProductionErrors: options.sendProductionErrors,
    }),
  );

  return config;
};
