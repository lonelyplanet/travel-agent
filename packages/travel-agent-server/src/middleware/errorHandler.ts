import logger from "../utils/logger";

interface IErrorHandlerOptions {
  sendProductionErrors: boolean;
}

export default (env, options: IErrorHandlerOptions = {
  sendProductionErrors: false,
}) => (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500);
  logger.debug(err);

  const locals = env === "production" ? {
    error: options.sendProductionErrors ? err: {},
    message: options.sendProductionErrors ? err.message : "An error has occurred",
  } : {
    error: err,
    message: err.message,
  };

  if (req.headers["content-type"] === "application/json") {
    return res.json(locals);
  }

  return res.render("error", locals);
};
