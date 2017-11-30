export default (req, res, next) => {
  const err = new Error("Not Found");
  (err as any).status = 404;

  res.status(404);

  next(err);
};
