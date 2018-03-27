import * as e from "express";

const middleware: e.Handler[] = [
  (req, res, next) => {
    if (req.originalUrl.indexOf(".json") > -1) {
      req.headers["accept"] = "application/json";
    }

    next();
  },
  (req, res, next) => {
    res.setHeader("X-Awesome", "oh yea");

    next();
  },
];

export default {
  prometheus: {},
  middleware,
  webpack: {
    entry: {
      app: "./app/shared/client",
    },
  },
  sendProductionErrors: true,
};
