import CustomMiddlewareResolver, { ICustomMiddlewareResolver } from "../src/middleware/customMiddlewareResolver";
import MiddlewareProvider from "../src/middleware/middlewareProvider";
import errorHandler from "../src/middleware/errorHandler";

interface F { (name: string): any; resolve(name: string): string; }

describe("middleware", () => {
  it("should provide default middleware", () => {
    class MockCustomProvider implements ICustomMiddlewareResolver {
      resolve() {
        return {
          bar: (req, res, next) => {},
        };
      }
    }
    const provider = new MiddlewareProvider({
      foo: (req, res, next) => {},
    }, new MockCustomProvider());

    const middleware = provider.middleware({
      use: jest.fn(),
    });
    expect(middleware.foo).toBeTruthy();
    expect(middleware.bar).toBeTruthy();
  });

  it("should resolve custom middleware", () => {
    const requireMock = <F>function(name: string) {
      return {
        middleware: {
          foo: () => {}
        }
      };
    }
    requireMock.resolve = function(name: string) { return name; };

    const resolver = new CustomMiddlewareResolver(requireMock);
    const middleware = resolver.resolve();

    expect(middleware.foo).toBeTruthy();
  });

  it("should have a default error handler for dev", () => {
    const renderMock = jest.fn();
    const jsonMock = jest.fn();
    const statusMock = jest.fn();

    errorHandler("development")(new Error("Foobar error"), {
      headers: {}
    }, {
      render: renderMock,
      json: jsonMock,
      status: statusMock,
    }, {});

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(renderMock).toHaveBeenCalled();
    expect(renderMock).toHaveBeenCalledWith("error", {"error": new Error("Foobar error"), "message": "Foobar error"});
  });

  it("should have a default error handler for production", () => {
    const renderMock = jest.fn();
    const jsonMock = jest.fn();
    const statusMock = jest.fn();

    errorHandler("production")(new Error("Foobar error"), {
      headers: {}
    }, {
      render: renderMock,
      json: jsonMock,
      status: statusMock,
    }, {});

    expect(renderMock).toHaveBeenCalled();
    expect(renderMock).toHaveBeenCalledWith("error", {"error": {}, "message": "An error has occurred"});
  });

    it("should call next if headers are already sent", () => {
    const nextMock = jest.fn();

    errorHandler("production")(new Error("Foobar error"), {
      headers: {}
    }, {
      headersSent: true,
    }, nextMock);

    expect(nextMock).toHaveBeenCalled();
  });
})
