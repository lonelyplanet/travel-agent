import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as helmet from "helmet";
import * as path from "path";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as bunyan from "express-bunyan-logger";
import * as compression from "compression";

const health = express.Router();
health.get("/health-check", (req, res) => {
  res.json({
    success: true,
  });
});

export const defaultMiddleware = () => ({
  health,
  cookieParser: cookieParser(),
  cors: cors(),
  jsonParser: bodyParser.json(),
  bodyParserUrl: bodyParser.urlencoded({ extended: false }),
  static: express.static(path.join(process.cwd(), "public")),
});

export const defaultProductionMiddleware = () => {
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
    bunyan: bunyan({
      name: process.env.LP_SERVICE_ID || "travel-agent-server",
      parseUA: false, // Leave user-agent as raw string
      excludes,
    }),
    compression: compression(),
  }
};
