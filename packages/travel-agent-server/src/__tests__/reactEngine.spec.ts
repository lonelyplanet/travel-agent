const getBundledAssetsDefault = jest.fn();
jest.mock("../utils/getBundledAssets", () => ({ default: getBundledAssetsDefault }));
import getBundledAssets from "../utils/getBundledAssets";

const isProdEnvDefault = jest.fn();
jest.mock("../utils/isProdEnv", () => ({ default: isProdEnvDefault }));
import isProdEnv from "../utils/isProdEnv";

import reactEngine, { getInitialState, generateMarkup, getMarkupWithDoctype } from "../classes/reactEngine";

const TestComponent = require("./fixtures/component");
const TestLayout = require("./fixtures/layout");

describe("reactEngine", () => {
  const filePath = "app/modules/home/components";
  const options = {
    message: "This is my message",
    webpackStats: "stats",
    settings: {},
    _locals: "",
    cache: {},
  };
  const requireCache = {
    "ts-file.ts": { filename: "ts-file.ts" },
    "view-file.tsx": { filename: "view-file.tsx" }
  };
  let callback;
  let req;

  beforeEach(() => {
    getBundledAssetsDefault.mockReturnValue({ "vendor.js": "/assets/vendor.js" });
    isProdEnvDefault.mockReturnValue(false);
    callback = jest.fn();
    req = jest.fn<NodeRequire>(() => ({ cache: "stuff" }))
      .mockImplementationOnce((id: string) => TestComponent)
      .mockImplementationOnce((id: string) => TestLayout);
    req.cache = requireCache;
  });

  afterEach(() => {
    getBundledAssetsDefault.mockReset();
    callback.mockReset();
    req.mockReset();
  });

  describe("getInitialState", () => {
    it("should handle an empty object", () => {
      const result = getInitialState({});
      expect(result).toEqual("{}");
    });

    it("should return the JSON string of the correct object", () => {
      const result = getInitialState(options);
      expect(result).toEqual("{\"message\":\"This is my message\"}");
    });
  });

  describe("getMarkupWithDoctype", () => {
    it("should add the doctype to the html string", () => {
      const markup = getMarkupWithDoctype("<html><body>Hello</body></html>");
      expect(markup).toMatchSnapshot();
    });
  });

  describe("generateMarkup", () => {
    it("should generate the correct markup", () => {
      const markup = generateMarkup(req, filePath, options, "app/layout");
      expect(markup).toMatchSnapshot();
    });

    it("should generate the correct markup if the layout is false", () => {
      const extendedOptions = { ...options, layout: false };
      const markup = generateMarkup(req, filePath, extendedOptions, "app/layout");
      expect(markup).toMatchSnapshot();
    });
  });

  describe("reactEngine default", () => {
    it("should call the callback with the correct markup", () => {
      reactEngine({ layout: "app/layout" }, req)(filePath, options, callback);

      expect(callback).toHaveBeenCalled();
      expect(callback.mock.calls[0]).toMatchSnapshot();
      expect(req.cache).toEqual(requireCache);
    });

    it("should hande errors when trying to generate markup", () => {
      const error = new Error("oh snap");
      getBundledAssetsDefault.mockImplementation(() => {throw error});
      reactEngine({ layout: "app/layout" }, req)(filePath, options, callback);

      expect(callback).toHaveBeenCalledWith(error);
    });

    it("should remove cached views from require in a prod environment", () => {
      isProdEnvDefault.mockReturnValue(true);
      reactEngine({ layout: "app/layout" }, req)(filePath, options, callback);

      expect(callback).toHaveBeenCalled();
      expect(req.cache).toEqual({ "ts-file.ts": { filename: "ts-file.ts" } });
    });
  });
});
