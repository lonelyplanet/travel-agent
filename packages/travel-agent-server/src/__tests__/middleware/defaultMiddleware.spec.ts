const staticMock = jest.fn();
const routerMock = jest.fn(() => ({ get: jest.fn() }));
jest.mock("express", () => ({
  static: staticMock,
  Router: routerMock
}));
import * as express from "express";;

const AirbrakeClientMock = jest.fn();
jest.mock("airbrake-js", () => AirbrakeClientMock);
import AirbrakeClient from "airbrake-js";

const AirbrakeCredsMock = jest.fn();
jest.mock("../../classes/airbrakeCreds", () => ({ default: AirbrakeCredsMock }));
import AirbrakeCreds from "../../classes/airbrakeCreds";

const makeErrorHandlerMock = jest.fn();
jest.mock("airbrake-js/dist/instrumentation/express", () => makeErrorHandlerMock);
import * as makeErrorHandler from "airbrake-js/dist/instrumentation/express";

const errorHandlerMock = jest.fn();
jest.mock("../../middleware/errorHandler", () => ({ default: errorHandlerMock }));
import errorHandler from "../../middleware/errorHandler";

const catchAllMock = jest.fn();
jest.mock("../../middleware/catchAll", () => ({ default: catchAllMock }));
import catchAll from "../../middleware/catchAll";

const setLocationMock = jest.fn();
jest.mock("../../middleware/setLocation", () => ({ default: setLocationMock }));
import setLocation from "../../middleware/setLocation";

const handleFaviconMock = jest.fn();
jest.mock("../../middleware/handleFavicon", () => ({ default: handleFaviconMock }));
import handleFavicon from "../../middleware/handleFavicon";

import {
  defaultMiddleware,
  defaultDevMiddleware,
  defaultProductionMiddleware,
  defaultPostMiddleware,
} from "../../middleware/defaultMiddleware";

describe("defaultMiddleware", () => {
  describe("defaultMiddleware", () => {
    let urlencodedMock;
    let jsonMock;
    let req;

    beforeEach(() => {
      urlencodedMock = jest.fn();
      jsonMock = jest.fn();
      req = jest.fn<NodeRequire>()
        .mockImplementationOnce((pkg: string) => () => "helmet")
        .mockImplementationOnce((pkg: string) => ({ urlencoded: urlencodedMock }))
        .mockImplementationOnce((pkg: string) => () => "cookie-parser")
        .mockImplementationOnce((pkg: string) => () => "cors")
        .mockImplementationOnce((pkg: string) => ({ json: jsonMock }));
    });

    afterEach(() => {
      urlencodedMock.mockReset();
      jsonMock.mockReset();
      req.mockReset();
      setLocationMock.mockReset();
      handleFaviconMock.mockReset();
      routerMock.mockReset();
    });

    it("should return the default middleware", () => {
      const middleware = defaultMiddleware({}, req);

      expect(middleware.length).toBe(8);
      expect(middleware[5]).toEqual(setLocationMock);
      expect(middleware[6]).toEqual(handleFaviconMock);

      expect(req).toHaveBeenCalledWith("helmet")
      expect(req).toHaveBeenCalledWith("body-parser")
      expect(req).toHaveBeenCalledWith("cookie-parser");
      expect(req).toHaveBeenCalledWith("cors");

      expect(urlencodedMock).toHaveBeenCalledTimes(1);
      expect(urlencodedMock).toHaveBeenCalledWith({ extended: false });
      expect(jsonMock).toHaveBeenCalledTimes(1);

    });
  });

  describe("defaultDevMiddleware", () => {
    let config;
    let compiler;
    let webpack;
    let webpackHotMiddleware;
    let webpackDevMiddleware;
    let req;

    beforeEach(() => {
      config = { entry: "path/index.js" };
      compiler = { compiler: true };
      webpack = jest.fn((config: object) => compiler);
      webpackHotMiddleware = jest.fn((compiler) => "webpack-hot-middleware middleware");
      webpackDevMiddleware = jest.fn((compiler, options) => "webpack-dev-middleware middleware");
      req = jest.fn<NodeRequire>()
        .mockImplementationOnce((pkg: string) => (env: string) => `${pkg}-${env} middleware`)
        .mockImplementationOnce((pkg: string) => webpack)
        .mockImplementationOnce((path: string) => ({ default: config }))
        .mockImplementationOnce((pkg: string) => webpackHotMiddleware)
        .mockImplementationOnce((pkg: string) => webpackDevMiddleware);
      staticMock.mockImplementation((pkg: string) => "express static middleware");
    });

    afterEach(() => {
      webpack.mockReset();
      webpackHotMiddleware.mockReset();
      webpackDevMiddleware.mockReset();
      req.mockReset();
      staticMock.mockReset();
    });

    it("should return the dev middleware (without webpack)", () => {
      const middleware = defaultDevMiddleware({}, req);
      expect(middleware).toEqual([
        "morgan-dev middleware",
        "express static middleware",
      ]);
    });

    it("should return the dev middleware (with webpack)", () => {
      const middleware = defaultDevMiddleware({ webpack: true }, req);

      expect(webpack).toHaveBeenCalledWith(config);
      expect(webpackHotMiddleware).toHaveBeenCalledWith(compiler);
      expect(webpackDevMiddleware).toHaveBeenCalledWith(compiler, {
        noInfo: true,
        publicPath: "/assets/",
        serverSideRender: true,
      });
      expect(middleware).toEqual([
        "morgan-dev middleware",
        "express static middleware",
        "webpack-hot-middleware middleware",
        "webpack-dev-middleware middleware",
      ]);
    });
  });

  describe("defaultProductionMiddleware", () => {
    let expressBunyanLoggerMock;
    let req;

    beforeEach(() => {
      expressBunyanLoggerMock = jest.fn(() => "express-bunyan-logger middleware")
      req = jest.fn<NodeRequire>()
        .mockImplementationOnce((pkg: string) => expressBunyanLoggerMock)
        .mockImplementationOnce((pkg: string) => () => "compression middleware");
      staticMock.mockImplementation((path: string) => "express static middleware");
    });

    afterEach(() => {
      expressBunyanLoggerMock.mockReset();
      req.mockReset();
      staticMock.mockReset();
    });

    it("should return the production middleware (without options or name)", () => {
      const middleware = defaultProductionMiddleware({}, null, req);

      expect(expressBunyanLoggerMock.mock.calls[0]).toMatchSnapshot();
      expect(middleware.length).toBe(2);
      expect(middleware).toEqual([
        "express-bunyan-logger middleware",
        "compression middleware",
      ]);
    });

    it("should return the production middleware (with options and name)", () => {
      const middleware = defaultProductionMiddleware({ serveAssets: true }, "lp-service-id", req);

      expect(expressBunyanLoggerMock.mock.calls[0][0].name).toBe("lp-service-id");
      expect(middleware.length).toBe(3);
      expect(middleware).toEqual([
        "express-bunyan-logger middleware",
        "compression middleware",
        "express static middleware",
      ]);
    });
  });

  describe("defaultPostMiddleware", () => {
    beforeEach(() => {
      AirbrakeCredsMock.mockImplementation((airbrakeId, airbrakeKey) => ({ airbrakeId, airbrakeKey }));
      errorHandlerMock.mockImplementation(() => "errorHandler middleware");
      makeErrorHandlerMock.mockImplementation(() => "makeErrorHandler middleware");
    });

    afterEach(() => {
      AirbrakeClientMock.mockReset();
      AirbrakeCredsMock.mockReset();
      errorHandlerMock.mockReset();
      makeErrorHandlerMock.mockReset();
    });

    it("should return the middleware for the dev environment", () => {
      const options = { sendProductionErrors: false };

      const middleware = defaultPostMiddleware(false, options);

      expect(errorHandlerMock).toHaveBeenCalledWith(false, options);
      expect(middleware).toEqual([
        catchAllMock,
        "errorHandler middleware"
      ]);
    });

    it("should return the middleware for the prod environment", () => {
      const options = {
        sendProductionErrors: false,
        airbrakeId: "abc",
        airbrakeKey: "xyz",
      };

      const middleware = defaultPostMiddleware(true, options);

      expect(AirbrakeCredsMock).toHaveBeenCalledWith("abc", "xyz");
      expect(AirbrakeClientMock).toHaveBeenCalledWith({ projectId: "abc", projectKey: "xyz" });
      expect(makeErrorHandlerMock).toHaveBeenCalledTimes(1);
      expect(errorHandlerMock).toHaveBeenCalledWith(true, { sendProductionErrors: false });
      expect(middleware).toEqual([
        "makeErrorHandler middleware",
        catchAllMock,
        "errorHandler middleware"
      ]);
    });

    it("should return the middleware for the prod environment (with `production` key)", () => {
      const options = {
        sendProductionErrors: false,
        production: {
          airbrakeId: "abc",
          airbrakeKey: "xyz",
        },
      };

      const middleware = defaultPostMiddleware(true, options);

      expect(AirbrakeCredsMock).toHaveBeenCalledWith("abc", "xyz");
      expect(AirbrakeClientMock).toHaveBeenCalledWith({ projectId: "abc", projectKey: "xyz" });
      expect(makeErrorHandlerMock).toHaveBeenCalledTimes(1);
      expect(errorHandlerMock).toHaveBeenCalledWith(true, { sendProductionErrors: false });
      expect(middleware).toEqual([
        "makeErrorHandler middleware",
        catchAllMock,
        "errorHandler middleware"
      ]);
    });

    it("should return the middleware for the prod environment (with `production` key that only has the id)", () => {
      const options = {
        sendProductionErrors: false,
        production: {
          airbrakeId: "abc",
        },
      };

      const middleware = defaultPostMiddleware(true, options);

      expect(AirbrakeCredsMock).toHaveBeenCalledWith("abc", undefined);
      expect(AirbrakeClientMock).toHaveBeenCalledTimes(0);
      expect(makeErrorHandlerMock).toHaveBeenCalledTimes(0);
      expect(errorHandlerMock).toHaveBeenCalledWith(true, { sendProductionErrors: false });
      expect(middleware).toEqual([
        catchAllMock,
        "errorHandler middleware"
      ]);
    });

    it("should return the middleware for the prod environment (without airbrake data)", () => {
      const options = {
        sendProductionErrors: false,
      };

      const middleware = defaultPostMiddleware(true, options);

      expect(AirbrakeCredsMock).toHaveBeenCalledTimes(1);
      expect(AirbrakeClientMock).toHaveBeenCalledTimes(0);
      expect(makeErrorHandlerMock).toHaveBeenCalledTimes(0);
      expect(errorHandlerMock).toHaveBeenCalledWith(true, { sendProductionErrors: false });
      expect(middleware).toEqual([
        catchAllMock,
        "errorHandler middleware"
      ]);
    });
  });
});
