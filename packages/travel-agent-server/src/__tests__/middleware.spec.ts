import UserConfigResolver, {
  IUserConfigResolver,
} from "../classes/userConfigResolver";
import errorHandler from "../middleware/errorHandler";
import MiddlewareProvider from "../middleware/middlewareProvider";
import { ITravelAgentServer } from "../interfaces/index";

interface IF {
  (name: string): any;
  resolve(name: string): string;
}

describe("middleware", () => {
  it("should provide default middleware", () => {
    const AppMock = jest.fn<ITravelAgentServer>(() => ({
      use: jest.fn(),
    }));
    class MockCustomProvider implements IUserConfigResolver {
      public resolve() {
        return {
          middleware: [(req, res, next) => void 0],
        };
      }
    }
    const provider = new MiddlewareProvider(new MockCustomProvider());
    provider.defaultMiddleware = () => [(req, res, next) => void 0];
    provider.defaultProductionMiddleware = () => [(req, res, next) => void 0];
    provider.defaultDevMiddleware = () => [(req, res, next) => void 0];

    const middleware = provider.middleware(
      new AppMock(),
      "development",
    );
    expect(middleware.length).toEqual(3);

    const production = provider.middleware(
      new AppMock(),
      "production",
    );
    expect(production.length).toEqual(3);
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

    errorHandler("test")(
      new Error("Foobar error"),
      {
        headers: {},
      },
      {
        json: jsonMock,
        render: renderMock,
        status: statusMock,
      },
      {},
    );

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(renderMock).toHaveBeenCalled();
  });

  it("should have a default error handler for production", () => {
    const renderMock = jest.fn();
    const jsonMock = jest.fn();
    const statusMock = jest.fn();

    errorHandler("production")(
      new Error("Foobar error"),
      {
        headers: {},
      },
      {
        json: jsonMock,
        render: renderMock,
        status: statusMock,
      },
      {},
    );

    expect(renderMock).toHaveBeenCalled();
    expect(renderMock).toHaveBeenCalledWith("error", {
      error: {},
      message: "An error has occurred",
    });
  });

  it("should call next if headers are already sent", () => {
    const nextMock = jest.fn();

    errorHandler("production")(
      new Error("Foobar error"),
      {
        headers: {},
      },
      {
        headersSent: true,
      },
      nextMock,
    );

    expect(nextMock).toHaveBeenCalled();
  });
});
