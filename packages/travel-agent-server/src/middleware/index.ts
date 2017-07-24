import * as cookieParser from "cookie-parser";
import * as express from "express";
import logger from "../utils/logger";

const health = express.Router();
health.get("/diagnostics", (req, res) => {
  res.json({
    success: true,
  });
});

export const applyMiddleware = (app, middleware) => Object.keys(middleware)
.forEach((key) => { 
  logger.debug(`initializing middleware: ${key}`);
  app.use(middleware[key]());
});

export default (app) => applyMiddleware(app, {
  cookieParser,
  health: () => health,
});