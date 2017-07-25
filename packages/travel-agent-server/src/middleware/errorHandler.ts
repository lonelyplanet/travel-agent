export default (env) => (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500);
  console.log(err);

  const locals = env === "production" ? {
    message: "An error has occurred",
    error: {},
  } : {
    message: err.message,
    error: err
  };

  if (req.headers["content-type"] === "application/json") {
    return res.json(locals);
  }

  return res.render("error", locals);
};
