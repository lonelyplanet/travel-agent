import * as promBundle from "express-prom-bundle";
import * as pathToRegexp from "path-to-regexp";
import { IPrometheusConfigurationOptions } from "../classes/userConfigResolver";

const prometheusHttpRequestBuckets = [
  0.01,
  0.05,
  0.1,
  0.2,
  0.3,
  0.4,
  0.5,
  0.6,
  0.7,
  0.8,
  0.9,
  1.0,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
];

export function customNormalize(url: string, routes: string[], options?) {
  // count all docs (no matter which file) as a single url
  for (const route of routes) {
    const routeRegex = pathToRegexp(route);
    const [path] = url.split("?");

    if (routeRegex.exec(path)) {
      return route;
    }
  }

  return options.defaultPath || url;
}

export default function createPrometheusMiddleware({
  routes = [],
  defaultPath,
}: IPrometheusConfigurationOptions) {

  promBundle.normalizePath = req => {
    const { url } = req;

    const normalized = customNormalize(url, routes, {
      defaultPath,
    });

    return normalized;
  };

  promBundle.promClient.register.setDefaultLabels({ direction: "inbound" });
  promBundle.promClient.collectDefaultMetrics();

  const prometheus = promBundle({
    includePath: true,
    includeMethod: true,
    excludeRoutes: [/assets/],
    buckets: prometheusHttpRequestBuckets,
  });

  return prometheus;
};
