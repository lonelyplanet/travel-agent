import { IRoute } from "../interfaces";
import { IControllerConstructor } from "../classes/controller";
import findMatchingRoutes from "../utils/findMatchingRoutes";

describe("findMatchingRoutes", () => {
  it("should match all the correct `get` routes", () => {
    let ControllerConstructor = jest.fn<IControllerConstructor>((name) => ({ name }));
    const routes: IRoute[] = [
      {
        handler: "omg",
        method: "get",
        url: "/omg",
        middleware: [],
        routes: {},
        controller: new ControllerConstructor("omgController"),
      }, {
        handler: "fetch",
        method: "GET",
        url: "/",
        middleware: [],
        routes: {},
        controller: new ControllerConstructor("fetchController"),
      }, {
        handler: "remove",
        method: "DELETE",
        url: "/:id",
        middleware: [],
        routes: {},
        controller: new ControllerConstructor("deleteController"),
      }, {
        handler: "getItem",
        method: "get",
        url: "/:id?",
        middleware: [],
        routes: {},
        controller: new ControllerConstructor("getItemController"),
      },
    ];
    const results = findMatchingRoutes("/", "GET", routes);

    expect(results).toEqual([
      {
        controllerName: "fetchController",
        handler: "fetch",
        params: {},
      }, {
        controllerName: "getItemController",
        handler: "getItem",
        params: { id: undefined },
      }
    ]);
  });

  it("should match all the correct `post` routes", () => {
    let ControllerConstructor = jest.fn<IControllerConstructor>((name) => ({ name }));
    const routes: IRoute[] = [
      {
        handler: "save",
        method: "POST",
        url: "/",
        middleware: [],
        routes: {},
        controller: new ControllerConstructor("saveController"),
      }, {
        handler: "saveItem",
        method: "post",
        url: "/:id",
        middleware: [],
        routes: {},
        controller: new ControllerConstructor("saveItemController"),
      }, {
        handler: "optionalItem",
        method: "post",
        url: "/:optionalId?",
        middleware: [],
        routes: {},
        controller: new ControllerConstructor("optionalItemController"),
      },
    ];
    const results = findMatchingRoutes("/123", "post", routes);

    expect(results).toEqual([
      {
        controllerName: "saveItemController",
        handler: "saveItem",
        params: {
          id: "123",
        },
      }, {
        controllerName: "optionalItemController",
        handler: "optionalItem",
        params: {
          optionalId: "123",
        },
      }
    ]);
  });

  it("should return an empty array when no paths match", () => {
    let ControllerConstructor = jest.fn<IControllerConstructor>((name) => ({ name }));
    const routes: IRoute[] = [
      {
        handler: "save",
        method: "POST",
        url: "/",
        middleware: [],
        routes: {},
        controller: new ControllerConstructor("saveController"),
      }
    ];
    const results = findMatchingRoutes("/123", "post", routes);

    expect(results).toEqual([]);
  });
});
