const loggerWarn = jest.fn();
jest.mock("../utils/logger", () => ({
  default: { debug: jest.fn(), warn: loggerWarn },
}));
import logger from "../utils/logger";

const createEngineDefault = jest.fn();
jest.mock("../classes/reactEngine", () => ({ default: createEngineDefault }));
import createEngine from "../classes/reactEngine";

const controllerRegistryRegister = jest.fn();
jest.mock("../classes/controllerRegistry", () => ({
  default: () => ({ register: controllerRegistryRegister, controllers: [] }),
}));
import ControllerRegistry from "../classes/controllerRegistry";

const controllerFactoryCreate = jest.fn();
jest.mock("../classes/controllerFactory", () => ({
  default: () => ({ create: controllerFactoryCreate }),
}));
import ControllerFactory from "../classes/controllerFactory";

const middlewareResolverMiddleware = jest.fn();
jest.mock("../middleware/middlewareProvider", () => ({
  default: () => ({ middleware: middlewareResolverMiddleware }),
}));
import MiddlewareResolver from "../middleware/middlewareProvider";

import * as express from "express";
import * as mocks from "node-mocks-http";
import { IMiddlewareProvider } from "../middleware/middlewareProvider";
import { IControllerFactory, IControllerRegistry, IRoute } from "../interfaces";
import { IControllerConstructor } from "../classes/controller";
import TravelAgentServer from "../classes/server";

describe("TravelAgentServer", () => {
  let mockControllerFactory;
  let mockControllerRegistry;
  let mockMiddlewareResolver;
  let mockExpress;
  let mockExpressRouter;
  const mockCwd = "/dev/my-app";
  let mockIsProdEnv;

  beforeEach(() => {
    mockControllerFactory = jest.fn<IControllerFactory>();
    mockControllerRegistry = jest.fn<IControllerRegistry>();
    mockMiddlewareResolver = jest.fn<IMiddlewareProvider>();
    mockExpress = jest.fn<express.Application>();
    mockExpressRouter = jest.fn<express.Router>();
    mockIsProdEnv = false;
  });

  afterEach(() => {
    mockControllerFactory.mockReset();
    mockControllerRegistry.mockReset();
    mockMiddlewareResolver.mockReset();
    mockExpress.mockReset();
    mockExpressRouter.mockReset();
  });

  describe("setup", () => {
    let engine;
    let set;

    beforeEach(() => {
      createEngineDefault.mockReturnValue("createEngine called");
      engine = jest.fn();
      set = jest.fn();
    });

    afterEach(() => {
      createEngineDefault.mockReset();
      engine.mockReset();
      set.mockReset();
      middlewareResolverMiddleware.mockReset();
    });

    it("should set up the middleware in the dev environment", () => {
      const setupTestExpress = jest.fn<express.Application>(() => ({ engine, set }));
      const server = new TravelAgentServer(
        new setupTestExpress(),
        new mockExpressRouter(),
        new MiddlewareResolver(),
        new mockControllerFactory(),
        new mockControllerRegistry(),
        mockCwd,
        mockIsProdEnv,
      );
      const results = server.setup();

      expect(middlewareResolverMiddleware).toHaveBeenCalled();
      expect(engine).toHaveBeenCalledWith("tsx", "createEngine called");
      expect(set.mock.calls[0][0]).toEqual("views");
      expect(set.mock.calls[0][1][0]).toContain("/dev/my-app/app/modules");
      expect(set.mock.calls[0][1][1]).toContain("/dev/my-app/app");
      expect(set.mock.calls[1]).toEqual(["view engine", "tsx"]);
    });

    it("should set up the middleware in the prod environment", () => {
      const setupTestExpress = jest.fn<express.Application>(() => ({ engine, set }));
      const server = new TravelAgentServer(
        new setupTestExpress(),
        new mockExpressRouter(),
        new MiddlewareResolver(),
        new mockControllerFactory(),
        new mockControllerRegistry(),
        mockCwd,
        true,
      );
      const results = server.setup();

      expect(middlewareResolverMiddleware).toHaveBeenCalled();
      expect(engine).toHaveBeenCalledWith("js", "createEngine called");
      expect(createEngineDefault).toHaveBeenCalledWith({ layout: "dist/layout", isProdEnv: true });
      expect(set.mock.calls[0][0]).toEqual("views");
      expect(set.mock.calls[0][1][0]).toContain("/dev/my-app/dist/modules");
      expect(set.mock.calls[0][1][1]).toContain("/dev/my-app/dist");
      expect(set.mock.calls[1]).toEqual(["view engine", "js"]);
    });
  });

  describe("postSetup", () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
      req = mocks.createRequest({ path: "/" });
      res = mocks.createResponse();
      next = jest.fn();
    });

    afterEach(() => {
      next.mockReset();
      controllerFactoryCreate.mockReset();
      loggerWarn.mockReset();
    });

    it("should handle middleware and routes", () => {
      const use = jest.fn();
      const routerDelete = jest.fn();
      const patch = jest.fn(() => ({ delete: routerDelete }));
      const post = jest.fn(() => ({ patch }));
      const get = jest.fn(() => ({ post }));
      const route = jest.fn(() => ({ get }));
      const beforeRoutesMiddleware = jest.fn();
      const postMiddleware = jest.fn();
      const postSetupTestExpress = jest.fn<express.Application>(() => ({ use }));
      const postSetupTestExpressRouter = jest.fn<express.Router>(() => ({ route }));
      const postSetupTestMiddlewareResolver = jest.fn<IMiddlewareProvider>(() => ({
        beforeRoutesMiddleware,
        postMiddleware
      }));
      let controllerConstructor = jest.fn<IControllerConstructor>((name) => ({ name }));
      const routes: IRoute[] = [
        {
          handler: "omg",
          method: "get",
          url: "/omg",
          middleware: [],
          routes: {},
          controller: new controllerConstructor("omgController"),
        }, {
          handler: "fetch",
          method: "GET",
          url: "/",
          middleware: [],
          routes: {},
          controller: new controllerConstructor("fetchController"),
        }, {
          handler: "remove",
          method: "DELETE",
          url: "/:id",
          middleware: [],
          routes: {},
          controller: new controllerConstructor("deleteController"),
        }, {
          handler: "save",
          method: "post",
          url: "/:id?",
          middleware: [],
          routes: {},
          controller: new controllerConstructor("saveController"),
        }, {
          handler: "optionalUpdate",
          method: "patch",
          url: "/:id?",
          middleware: [],
          routes: {},
          controller: new controllerConstructor("optionalUpdateController"),
        }, {
          handler: "update",
          method: "patch",
          url: "/:id",
          middleware: [],
          routes: {},
          controller: new controllerConstructor("updateController"),
        }
      ];
      const server = new TravelAgentServer(
        new postSetupTestExpress(),
        new postSetupTestExpressRouter(),
        new postSetupTestMiddlewareResolver(),
        new ControllerFactory(jest.fn()),
        new mockControllerRegistry(),
        mockCwd,
        mockIsProdEnv,
      );
      server.routes = routes;
      const results = server.postSetup();

      expect(beforeRoutesMiddleware).toHaveBeenCalled();
      expect(postMiddleware).toHaveBeenCalled();

      expect(route).toHaveBeenCalledWith("*");

      const getCreateDefaultRoute = get.mock.calls[0][0];
      getCreateDefaultRoute(req, res, next);
      expect(controllerFactoryCreate.mock.calls[0]).toEqual([req, res, next, "fetchController", "fetch"]);

      let reqWithPath = mocks.createRequest({ path: "/omg" })
      getCreateDefaultRoute(reqWithPath, res, next);
      expect(controllerFactoryCreate.mock.calls[1]).toEqual([reqWithPath, res, next, "omgController", "omg"]);

      const postCreateDefaultRoute = post.mock.calls[0][0];
      postCreateDefaultRoute(req, res, next);
      expect(controllerFactoryCreate.mock.calls[2]).toEqual([req, res, next, "saveController", "save"]);

      const patchCreateDefaultRoute = patch.mock.calls[0][0];
      reqWithPath = mocks.createRequest({ path: "/123" })
      patchCreateDefaultRoute(reqWithPath, res, next);
      expect(controllerFactoryCreate.mock.calls[3]).toEqual([reqWithPath, res, next, "optionalUpdateController", "optionalUpdate"]);
      expect(loggerWarn).toHaveBeenCalledTimes(1);

      const deleteCreateDefaultRoute = routerDelete.mock.calls[0][0];
      deleteCreateDefaultRoute(req, res, next);
      expect(controllerFactoryCreate).toHaveBeenCalledTimes(4);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe("addModules", () => {
    beforeEach(() => {
      controllerRegistryRegister.mockReturnValue([
        {
          default: jest.fn(),
          routes: { "GET /show-stuff": "show" },
          name: "TestController",
        }, {
          default: jest.fn(),
          routes: { "GET /data": "fetchData", "POST /data": "saveData" },
          name: "AnotherController",
        }
      ]);
    });

    afterEach(() => {
      controllerRegistryRegister.mockReset();
    });

    it("should add the controller routes to the server's routes", () => {
      const server = new TravelAgentServer(
        new mockExpress(),
        new mockExpressRouter(),
        new mockMiddlewareResolver(),
        new mockControllerFactory(),
        new ControllerRegistry(jest.fn<NodeRequire>(), mockCwd, mockIsProdEnv),
        mockCwd,
        mockIsProdEnv,
      );
      const results = server.addModules();
      expect(server.routes).toMatchSnapshot();
    });
  });

  describe("use", () => {
    it("should invoke this.app.use with the provided arguments", () => {
      const use = jest.fn();
      const useTestExpress = jest.fn<express.Application>(() => ({ use }));
      const server = new TravelAgentServer(
        new useTestExpress(),
        new mockExpressRouter(),
        new mockMiddlewareResolver(),
        new mockControllerFactory(),
        new mockControllerRegistry(),
        mockCwd,
        mockIsProdEnv,
      );
      const results = server.use("a", 2, ["three"]);
      expect(use).toHaveBeenCalledWith("a", 2, ["three"]);
    });
  });

  describe("bind", () => {
    it("should bind the args to the container", () => {
      const server = new TravelAgentServer(
        new mockExpress(),
        new mockExpressRouter(),
        new mockMiddlewareResolver(),
        new mockControllerFactory(),
        new mockControllerRegistry(),
        mockCwd,
        mockIsProdEnv,
      );
      const results = server.bind("FooService");
      expect(server.container.isBound("FooService")).toBeTruthy();
    });
  });
});
