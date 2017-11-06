/* tslint:disable: object-literal-sort-keys */
import * as express from "express";
import * as path from "path";
import * as webpack from "webpack";
import { IUserConfig } from "../classes/userConfigResolver";

const health = express.Router();
health.get("/health-check", (req, res) => {
  res.json({
    success: true,
  });
});

export const defaultMiddleware = (options?: IUserConfig) => ({
  bodyParserUrl: require("body-parser").urlencoded({ extended: false }),
  cookieParser: require("cookie-parser")(),
  cors: require("cors")(),
  health,
  jsonParser: require("body-parser").json(),
  location: (req, res, next) => {
    res.locals.location = req.url;
    next();
  },
});

export const defaultDevMiddelware = (options?: IUserConfig) => {
  const middleware: { [key: string]: any } = {
    morgan: require("morgan")("dev"),
    static: express.static(path.join(process.cwd(), "public")),
  };

  if (options.webpack) {
    const config = require("../webpack/config").default;
    const compiler = webpack(config);

    middleware.hot = require("webpack-hot-middleware")(compiler),
    middleware.webpackDevMiddleware = require("webpack-dev-middleware")(compiler, {
      noInfo: true,
      publicPath: "/assets",
      serverSideRender: true,
    });
  }

  return middleware;
};

export const defaultProductionMiddleware = (options?: IUserConfig) => {
  const excludes = [
    "body",
    "short-body",
    "req-headers",
    "res-headers",
    "req", "res",
    "incoming",
    "response-hrtime",
  ];

  return {
    bunyan: require("express-bunyan-logger")({
      name: process.env.LP_SERVICE_ID || "travel-agent-server",
      parseUA: false, // Leave user-agent as raw string
      excludes,
    }),
    compression: require("compression")(),
    static: express.static(path.join(process.cwd(), "public")),
  };
};
