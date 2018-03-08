export default {
  prometheus: {},
  middleware: [
    (req, res, next) => {
      if (req.originalUrl.indexOf(".json") > -1) {
        req.headers["content-type"] = "application/json";
      }

      next();
    },
  ],
  webpack: {
    entry: {
      app: "./app/shared/client",
    },
  },
  sendProductionErrors: true,
};
