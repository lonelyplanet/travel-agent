import CustomMiddlewareResolver, { ICustomMiddlewareResolver } from "../src/middleware/customMiddlewareResolver";
import MiddlewareProvider from "../src/middleware/middlewareProvider";

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
})
