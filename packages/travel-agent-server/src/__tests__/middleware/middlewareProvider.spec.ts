const createPrometheusMiddlewareDefault = jest.fn();
jest.mock("../../middleware/prometheus", () => ({
  default: createPrometheusMiddlewareDefault,
}));
import createPrometheusMiddleware from "../../middleware/prometheus";

import * as express from "express";
import UserConfigResolver, {
  ICustomMiddleware,
  IUserConfigResolver,
} from "../../classes/userConfigResolver";
import MiddlewareProvider, {
  applyMiddleware,
} from "../../middleware/middlewareProvider";
import { ITravelAgentServer } from "../../interfaces/index";

describe("middlewareProvider", () => {
  let use;
  let app;

  beforeEach(() => {
    use = jest.fn();
    app = { use };
  });

  afterEach(() => {
    use.mockReset();
  });

  describe("applyMiddleware", () => {
    it("should apply the middleware", () => {
      const middlewareA = jest.fn();
      const middlewareB = jest.fn();
      const middlewareC = jest.fn();
      const allMiddleware = applyMiddleware(
        app,
        [middlewareA, middlewareB],
        [middlewareC],
      );

      expect(use).toHaveBeenCalledWith(middlewareA);
      expect(use).toHaveBeenCalledWith(middlewareB);
      expect(use).toHaveBeenCalledWith(middlewareC);
      expect(allMiddleware).toEqual([middlewareA, middlewareB, middlewareC]);
    });

    it("should apply the middleware object (with resolve and route)", () => {
      const middlewareObject = {
        route: "route/to/middleware",
        resolve: jest.fn(() => "resolve called"),
        fn: jest.fn(),
      };
      const allMiddleware = applyMiddleware(app, [middlewareObject]);

      expect(use).toHaveBeenCalledWith("route/to/middleware", "resolve called");
      expect(allMiddleware).toEqual([middlewareObject]);
    });

    it("should apply the middleware object (with resolve, without route)", () => {
      const middlewareObject = {
        resolve: jest.fn(() => "resolve called"),
        fn: jest.fn(),
      };
      const allMiddleware = applyMiddleware(app, [middlewareObject]);

      expect(use).toHaveBeenCalledWith("/", "resolve called");
      expect(allMiddleware).toEqual([middlewareObject]);
    });

    it("should apply the middleware object (without resolve, with route)", () => {
      const foo = jest.fn();
      const middlewareObject = {
        route: "route/to/middleware",
        fn: foo,
      };
      const allMiddleware = applyMiddleware(app, [middlewareObject]);

      expect(use).toHaveBeenCalledWith("route/to/middleware", foo);
      expect(allMiddleware).toEqual([middlewareObject]);
    });

    it("should apply the middleware object (without resolve, without route)", () => {
      const foo = jest.fn();
      const middlewareObject = {
        fn: foo,
      };
      const allMiddleware = applyMiddleware(app, [middlewareObject]);

      expect(use).toHaveBeenCalledWith("/", foo);
      expect(allMiddleware).toEqual([middlewareObject]);
    });

    it("should apply the middleware array", () => {
      const foo = jest.fn<express.RequestHandler>((req, res, next) => void 0);
      const middlewareArray = <[string, express.RequestHandler]>[
        "middleware",
        foo,
      ];
      const allMiddleware = applyMiddleware(app, [middlewareArray]);

      expect(use).toHaveBeenCalledWith("middleware", foo);
      expect(allMiddleware).toEqual([middlewareArray]);
    });
  });

  describe("middleware", () => {
    let AppMock;
    let userConfigMiddleware;
    let MockCustomMiddlewareResolver;
    let mockDefaultMiddleware;
    let mockDefaultProductionMiddleware;
    let mockDefaultDevMiddleware;

    beforeEach(() => {
      AppMock = jest.fn<ITravelAgentServer>(() => ({ use: jest.fn() }));
      userConfigMiddleware = { middleware: jest.fn() };
      MockCustomMiddlewareResolver = jest.fn<IUserConfigResolver>(() => ({
        resolve: () => userConfigMiddleware,
      }));
      mockDefaultMiddleware = jest.fn<ICustomMiddleware[]>(() => [
        (req, res, next) => void 0,
      ]);
      mockDefaultProductionMiddleware = jest.fn<ICustomMiddleware[]>(() => [
        (req, res, next) => void 0,
      ]);
      mockDefaultDevMiddleware = jest.fn<ICustomMiddleware[]>(() => [
        (req, res, next) => void 0,
      ]);
    });

    afterEach(() => {
      AppMock.mockReset();
      userConfigMiddleware.middleware.mockReset();
      MockCustomMiddlewareResolver.mockReset();
      mockDefaultMiddleware.mockReset();
      mockDefaultProductionMiddleware.mockReset();
      mockDefaultDevMiddleware.mockReset();
    });

    it("should provide default middleware in the development environment", () => {
      const isProdEnv = "development";
      const provider = new MiddlewareProvider(
        isProdEnv,
        new MockCustomMiddlewareResolver(),
      );
      provider.defaultMiddleware = mockDefaultMiddleware;
      provider.defaultProductionMiddleware = mockDefaultProductionMiddleware;
      provider.defaultDevMiddleware = mockDefaultDevMiddleware;

      const middleware = provider.middleware(new AppMock());

      expect(middleware.length).toEqual(3);
      expect(mockDefaultMiddleware.mock.calls[0][0]).toEqual(
        userConfigMiddleware,
      );
      expect(mockDefaultMiddleware).toHaveBeenCalledTimes(1);
      expect(mockDefaultDevMiddleware.mock.calls[0][0]).toEqual(
        userConfigMiddleware,
      );
      expect(mockDefaultDevMiddleware).toHaveBeenCalledTimes(1);
      expect(mockDefaultProductionMiddleware).toHaveBeenCalledTimes(0);
    });

    it("should provide default middleware in the production environment", () => {
      const isProdEnv = "production";
      const provider = new MiddlewareProvider(
        isProdEnv,
        new MockCustomMiddlewareResolver(),
      );
      provider.defaultMiddleware = mockDefaultMiddleware;
      provider.defaultProductionMiddleware = mockDefaultProductionMiddleware;
      provider.defaultDevMiddleware = mockDefaultDevMiddleware;

      const middleware = provider.middleware(new AppMock());

      expect(middleware.length).toEqual(3);
      expect(mockDefaultMiddleware.mock.calls[0][0]).toEqual(
        userConfigMiddleware,
      );
      expect(mockDefaultMiddleware).toHaveBeenCalledTimes(1);
      expect(mockDefaultDevMiddleware).toHaveBeenCalledTimes(0);
      expect(mockDefaultProductionMiddleware.mock.calls[0][0]).toEqual(
        userConfigMiddleware,
      );
      expect(mockDefaultProductionMiddleware).toHaveBeenCalledTimes(1);
    });
  });

  describe("postMiddleware", () => {
    let AppMock;
    let userConfigMiddleware;
    let MockCustomMiddlewareResolver;
    let mockDefaultPostMiddleware;

    beforeEach(() => {
      AppMock = jest.fn<ITravelAgentServer>(() => ({ use: jest.fn() }));
      userConfigMiddleware = { middleware: jest.fn() };
      MockCustomMiddlewareResolver = jest.fn<IUserConfigResolver>(() => ({
        resolve: () => userConfigMiddleware,
      }));
      mockDefaultPostMiddleware = jest.fn<ICustomMiddleware[]>(() => [
        (req, res, next) => void 0,
      ]);
    });

    afterEach(() => {
      AppMock.mockReset();
      userConfigMiddleware.middleware.mockReset();
      MockCustomMiddlewareResolver.mockReset();
      mockDefaultPostMiddleware.mockReset();
    });

    it("should provide post middleware (without user specified postMiddleware)", () => {
      const isProdEnv = "development";
      const App = new AppMock();
      const provider = new MiddlewareProvider(
        isProdEnv,
        new MockCustomMiddlewareResolver(),
      );
      provider.defaultPostMiddleware = mockDefaultPostMiddleware;

      const middleware = provider.postMiddleware(App);

      expect(middleware.length).toEqual(1);
      expect(mockDefaultPostMiddleware.mock.calls[0][0]).toEqual(false);
      expect(mockDefaultPostMiddleware.mock.calls[0][1]).toEqual(
        userConfigMiddleware,
      );
      expect(mockDefaultPostMiddleware.mock.calls[0][2]).toEqual(App);
      expect(mockDefaultPostMiddleware).toHaveBeenCalledTimes(1);
    });

    it("should provide post middleware (with user specified postMiddleware)", () => {
      const isProdEnv = "production";
      const App = new AppMock();
      userConfigMiddleware = {
        middleware: jest.fn(),
        postMiddleware: jest.fn(),
      };
      MockCustomMiddlewareResolver = jest.fn<IUserConfigResolver>(() => ({
        resolve: () => userConfigMiddleware,
      }));
      const provider = new MiddlewareProvider(
        isProdEnv,
        new MockCustomMiddlewareResolver(),
      );
      provider.defaultPostMiddleware = mockDefaultPostMiddleware;

      const middleware = provider.postMiddleware(App);

      expect(middleware.length).toEqual(2);
      expect(mockDefaultPostMiddleware.mock.calls[0][0]).toEqual(true);
      expect(mockDefaultPostMiddleware.mock.calls[0][1]).toEqual(
        userConfigMiddleware,
      );
      expect(mockDefaultPostMiddleware.mock.calls[0][2]).toEqual(App);
      expect(mockDefaultPostMiddleware).toHaveBeenCalledTimes(1);
    });
  });

  describe("beforeRoutesMiddleware", () => {
    let AppMock;
    let userConfigMiddleware;
    let MockCustomMiddlewareResolver;

    beforeEach(() => {
      AppMock = jest.fn<ITravelAgentServer>(() => ({
        use: jest.fn(),
        routes: [
          {
            url: "test1",
            controller: { name: "controllerName" },
            handler: "myHandler",
          },
        ],
      }));
      userConfigMiddleware = { middleware: jest.fn() };
      MockCustomMiddlewareResolver = jest.fn<IUserConfigResolver>(() => ({
        resolve: () => userConfigMiddleware,
      }));
    });

    afterEach(() => {
      AppMock.mockReset();
      userConfigMiddleware.middleware.mockReset();
      MockCustomMiddlewareResolver.mockReset();
      createPrometheusMiddlewareDefault.mockReset();
    });

    it("should provide middleware", () => {
      const isProdEnv = "development";
      const provider = new MiddlewareProvider(
        isProdEnv,
        new MockCustomMiddlewareResolver(),
      );
      const middleware = provider.beforeRoutesMiddleware(new AppMock());

      expect(createPrometheusMiddlewareDefault.mock.calls[0][0]).toEqual({
        routes: [
          {
            route: "test1",
            name: "controllerName#myHandler",
          },
        ],
      });
      expect(createPrometheusMiddlewareDefault).toHaveBeenCalledTimes(1);
    });
  });
});
