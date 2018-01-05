const loggerDebug = jest.fn();
jest.mock("../utils/logger", () => ({
  default: { debug: loggerDebug, warn: jest.fn() },
}));
import logger from "../utils/logger";

import UserConfigResolver from "../classes/userConfigResolver";

describe("userConfigResolver", () => {
  describe("resolve", () => {
    let req;
    let resolve;
    let testUserConfig;

    beforeEach(() => {
      testUserConfig = {
        middleware: [],
        webpack: {
          entry: {
            app: "./app/shared/client"
          }
        }
      };
      resolve = jest.fn(() => "/dev/my-app/config/index.js");
      req = jest.fn<NodeRequire>(() => testUserConfig);
      req.resolve = resolve;
    });

    afterEach(() => {
      resolve.mockReset();
      loggerDebug.mockReset();
    });

    it("should return the user's config file", () => {
      const configResolver = new UserConfigResolver(req, "/dev/my-app");
      const userConfig = configResolver.resolve();

      expect(resolve).toHaveBeenCalledWith("/dev/my-app/config");
      expect(userConfig).toEqual(testUserConfig);
    });

    it("should log errors when accessing the config file", () => {
      const error = new Error("oh snap");
      req.resolve = jest.fn(() => { throw error });
      const configResolver = new UserConfigResolver(req, "/dev/my-app");
      const userConfig = configResolver.resolve();

      expect(loggerDebug).toHaveBeenCalledWith("Error loading user configuration");
      expect(loggerDebug).toHaveBeenCalledWith(error);
    });
  });
});
