const isProdEnvDefault = jest.fn();
jest.mock("../utils/isProdEnv", () => ({ default: isProdEnvDefault }));
import isProdEnv from "../utils/isProdEnv";

jest.mock("../utils/getFilePaths", () => ({ default: jest.fn(() => ["app/modules/home/controller.ts"]) }));
import getFilePaths from "../utils/getFilePaths";

jest.mock("path", () => ({ join: jest.fn(() => "/dev/travel-agent/packages/travel-agent-server") }));
import * as path from "path";

import ControllerRegistry from "../classes/controllerRegistry";
let TestController = require("./fixtures/controller");

describe("controller registry", () => {
  let req;

  beforeEach(() => {
    req = jest.fn<NodeRequire>(() => TestController);
  });

  afterEach(() => {
    req.mockReset();
    isProdEnvDefault.mockReset();
  });

  it("should register controllers in dev environment", () => {
    isProdEnvDefault.mockReturnValue(false);
    const registry = new ControllerRegistry(req);
    const controllers = registry.register();
    expect(controllers.length).toBeTruthy();
    expect(getFilePaths).toHaveBeenCalledWith(`app/modules/**/*controller*(.js|.ts)`);
    expect(controllers[0].routes["GET /show-stuff"]).toBe("show");
  });

  it("should register controllers in production environment", () => {
    isProdEnvDefault.mockReturnValue(true);
    const registry = new ControllerRegistry(req);
    const controllers = registry.register();

    expect(getFilePaths).toHaveBeenCalledWith(`dist/modules/**/*controller*(.js|.ts)`);
  });
});
