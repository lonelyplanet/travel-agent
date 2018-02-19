const promBundleMock = jest.fn();
const setDefaultLabelsMock = jest.fn();
const collectDefaultMetricsMock = jest.fn();
jest.mock("express-prom-bundle", () => promBundleMock);

import * as promBundle from "express-prom-bundle";
promBundle.promClient = {
  register: {
    setDefaultLabels: setDefaultLabelsMock,
  },
  collectDefaultMetrics: collectDefaultMetricsMock,
};

import createPrometheusMiddleware, { customNormalize } from "../../middleware/prometheus";

describe("prometheusMiddleware", () => {
  describe("customNormalize", () => {
    it("should return the name of the first matching route", () => {
      const url = "usa/nashville/restaurants/bastion/a/poi-eat/1534928/362228";
      const routes = [
        { route: "(.*)/news/:date/:slug", name: "News#show" },
        { route: "(.*)/a/:type-:kind/:id/:placeId", name: "Poi#show" },
      ];

      const path = customNormalize(url, routes);

      expect(path).toBe("Poi#show");
    });
  });

  it("should return the provided default path if the url doesn't match a route", () => {
    const defaultPath = "news/";
    const url = "usa/nashville/restaurants/bastion/a/poi-eat/1534928/362228";
    const routes = [
      { route: "(.*)/news/:date/:slug", name: "News#show" },
    ];

    const path = customNormalize(url, routes, { defaultPath });

    expect(path).toBe(defaultPath);
  });

  it("should return the provided url if the url doesn't match a route", () => {
    const defaultPath = "news/";
    const url = "usa/nashville/restaurants/bastion/a/poi-eat/1534928/362228";
    const routes = [
      { route: "(.*)/news/:date/:slug", name: "News#show" },
    ];

    const path = customNormalize(url, routes, {});

    expect(path).toBe(url);
  });

  describe("createPrometheusMiddleware", () => {
    it("should return the name of the first matching route", () => {
      const url = "usa/nashville/restaurants/bastion/a/poi-eat/1534928/362228";
      const routes = [
        { route: "(.*)/a/:type-:kind/:id/:placeId", name: "Poi#show" },
      ];

      const bundle = createPrometheusMiddleware({ routes, defaultPath: "test/" });

      expect(setDefaultLabelsMock).toHaveBeenCalledWith({ direction: "inbound" });
      expect(collectDefaultMetricsMock).toHaveBeenCalledTimes(1);
      expect(promBundle.normalizePath({ url })).toBe("Poi#show");
      expect(promBundleMock.mock.calls[0]).toMatchSnapshot();
    });
  });
});
