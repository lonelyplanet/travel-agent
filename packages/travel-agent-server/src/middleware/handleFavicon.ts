import * as express from "express";

export default (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (req.url.search(/favicon.ico$/) > -1) {
    res.writeHead(200, { "Content-Type": "image/x-icon" });
    res.end();
    return;
  }

  next();
};
