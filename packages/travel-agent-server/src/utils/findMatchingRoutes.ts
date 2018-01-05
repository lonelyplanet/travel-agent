import { matchPath } from "react-router-dom";
import { IRoute } from "../interfaces";

export default function findMatchingRoutes(path: string, method: string, availableRoutes: IRoute[]) {
  return availableRoutes
    .filter((route) => route.method.toLowerCase() === method.toLowerCase())
    .map((route) => {
      const match = matchPath(path, { path: route.url, exact: true });
      if (match) {
        return {
          controllerName: route.controller.name,
          handler: route.handler,
          params: { ...match.params },
        };
      }
    })
    .filter((route) => route);
}
