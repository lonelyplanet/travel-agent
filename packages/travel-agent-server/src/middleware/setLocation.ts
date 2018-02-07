import * as express from "express";

export default (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  res.locals.location = req.url;
  next();
};
