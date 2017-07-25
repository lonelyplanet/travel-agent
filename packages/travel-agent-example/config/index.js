module.exports = {
  middleware: {
    forceJsonContentType: (req, res, next) => {
      if (req.originalUrl.indexOf(".json") > -1) {
        req.headers["content-type"] = "application/json";
      }

      next();
    },
  }
}
