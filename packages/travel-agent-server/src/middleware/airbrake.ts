export default function airbrakeMiddleware(airbrake) {
  return function errorHandler(err, req, res, next) {
    const error = err instanceof Error ? err : new Error(err);
    const requestObj = req;
    const responseObj = res;

    if (responseObj.statusCode < 400) responseObj.statusCode = 500;

    // error.url = requestObj.url;
    // error.action = requestObj.action || requestObj.url;
    // error.component = requestObj.controller || "express";
    // error.httpMethod = requestObj.method;
    // error.params = requestObj.body;
    // error.session = requestObj.session;
    // error.ua = requestObj.get("User-Agent");

    airbrake.log("Airbrake: Uncaught exception, sending notification for:");
    airbrake.log(error.stack || error);

    airbrake.notify(error, (notifyErr, notifyUrl, devMode) => {
      if (notifyErr) {
        airbrake.log("Airbrake: Could not notify service.");
        airbrake.log(notifyErr.stack);
      } else if (devMode) {
        airbrake.log("Airbrake: Dev mode, did not send.");
      } else {
        airbrake.log(`Airbrake: Notified service: ${notifyUrl}`);
      }
    });
    next(err);
  };
}
