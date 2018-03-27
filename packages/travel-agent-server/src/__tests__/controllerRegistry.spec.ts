jest.mock("../utils/getFilePaths", () => ({
  default: jest.fn(() => ["app/modules/home/controller.ts"]),
}));
import getFilePaths from "../utils/getFilePaths";

import ControllerRegistry from "../classes/controllerRegistry";
let TestController = require("./fixtures/controller");

describe("controller registry", () => {
  let req;

  beforeEach(() => {
    req = jest.fn<NodeRequire>(() => TestController);
  });

  afterEach(() => {
    req.mockReset();
  });

  it("should register controllers in dev environment", () => {
    const registry = new ControllerRegistry(req, "/dev/my-app", false);
    const controllers = registry.register();
    expect(controllers.length).toBeTruthy();
    expect(getFilePaths).toHaveBeenCalledWith(
      `app/modules/**/*controller*(.js|.ts)`,
    );
    expect(controllers[0].constructor.routes["GET /show-stuff"]).toBe("show");
  });

  it("should register controllers in production environment", () => {
    const registry = new ControllerRegistry(req, "/dev/my-app", true);
    const controllers = registry.register();

    expect(getFilePaths).toHaveBeenCalledWith(
      `dist/modules/**/*controller*(.js|.ts)`,
    );
  });
});
