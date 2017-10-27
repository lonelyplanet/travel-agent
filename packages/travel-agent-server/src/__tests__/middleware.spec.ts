import UserConfigResolver, { IUserConfigResolver } from "../classes/userConfigResolver";
import errorHandler from "../middleware/errorHandler";
import MiddlewareProvider from "../middleware/middlewareProvider";

interface IF { (name: string): any; resolve(name: string): string; }

describe("middleware", () => {
  it("should provide default middleware", () => {
    class MockCustomProvider implements IUserConfigResolver {
      public resolve() {
        return {
          middleware: {
            bar: (req, res, next) => void 0,
          }
        };
      }
    }
    const provider = new MiddlewareProvider(new MockCustomProvider());
    provider.defaultMiddleware = () => ({
      foo: (req, res, next) => void 0,
    });
    provider.defaultProductionMiddleware = () => ({
      baz: (req, res, next) => void 0,
    });
    provider.defaultDevMiddleware = () => ({
      bazinga: (req, res, next) => void 0,
    });

    const middleware = provider.middleware({
      use: jest.fn(),
    }, "development");
    expect(middleware.foo).toBeTruthy();
    expect(middleware.bar).toBeTruthy();
    expect(middleware.baz).toBeFalsy();
    expect(middleware.bazinga).toBeTruthy();

    const production = provider.middleware({
      use: jest.fn(),
    }, "production");
    expect(production.baz).toBeTruthy();
  });

  // it("should resolve custom middleware", () => {
  //   const requireMock = <IF>(name: string) => {
  //     return {
  //       middleware: {
  //         foo: () => void 0,
  //       },
  //     };
  //   };

  //   requireMock.resolve = (name: string) => name;

  //   const resolver = new CustomMiddlewareResolver(requireMock);
  //   const middleware = resolver.resolve();

  //   expect(middleware.foo).toBeTruthy();
  // });

  it("should have a default error handler for dev", () => {
    const renderMock = jest.fn();
    const jsonMock = jest.fn();
    const statusMock = jest.fn();

    errorHandler("development")(new Error("Foobar error"), {
      headers: {},
    }, {
      json: jsonMock,
      render: renderMock,
      status: statusMock,
    }, {});

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(renderMock).toHaveBeenCalled();
    expect(renderMock).toHaveBeenCalledWith("error", {error: new Error("Foobar error"), message: "Foobar error"});
  });

  it("should have a default error handler for production", () => {
    const renderMock = jest.fn();
    const jsonMock = jest.fn();
    const statusMock = jest.fn();

    errorHandler("production")(new Error("Foobar error"), {
      headers: {},
    }, {
      json: jsonMock,
      render: renderMock,
      status: statusMock,
    }, {});

    expect(renderMock).toHaveBeenCalled();
    expect(renderMock).toHaveBeenCalledWith("error", {error: {}, message: "An error has occurred"});
  });

  it("should call next if headers are already sent", () => {
    const nextMock = jest.fn();

    errorHandler("production")(new Error("Foobar error"), {
      headers: {},
    }, {
      headersSent: true,
    }, nextMock);

    expect(nextMock).toHaveBeenCalled();
  });
});
