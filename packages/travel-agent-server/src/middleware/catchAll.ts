import * as express from "express";

export default (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const err = new Error("Not Found");
  (err as any).status = 404;

  res.status(404);

  next(err);
};
