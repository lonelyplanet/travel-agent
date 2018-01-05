import * as path from "path";
import * as React from "react";
// import * as pretty from "pretty";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import getBundledAssets from "../utils/getBundledAssets";
import Helmet, { HelmetData } from "react-helmet";

export interface ILayoutOptions {
  [key: string]: any;
  assets: { [key: string]: string },
  body: string,
  initialState: string,
  head: HelmetData;
}

export interface IReactEngineOptions {
  layout?: string;
  isProdEnv?: boolean;
}

export function getInitialState(options): string {
  const locals = { ...options };
  delete locals.webpackStats;
  delete locals.settings;
  delete locals._locals;
  delete locals.cache;

  return JSON.stringify(locals);
}

export function getMarkupWithDoctype(markup: string): string {
  return `<!DOCTYPE html>\
  ${markup}`;
};

export function generateMarkup(req: NodeRequire, filePath: string, options, defaultLayout: string): string {
  const Component = req(`${filePath}`).default;
  const markup = renderToString(React.createElement(Component, options, null));

  if (options.layout === false || filePath.indexOf("error") > -1) {
    return markup;
  }

  const Layout = req(path.join(process.cwd(), options.layout || defaultLayout)).default;
  const assets = getBundledAssets();
  const initialState = getInitialState(options);
  const head = Helmet.renderStatic();

  // pretty(markup) for prod?
  return renderToStaticMarkup(
    React.createElement(Layout, {
      ...options,
      assets,
      body: markup,
      initialState,
      head,
    }),
  );
};

export default (
  engineOptions: IReactEngineOptions = { layout: "app/layout", isProdEnv: false },
  req = require
) => {
  function ReactEngine(filePath: string, options, callback) {
    try {
      const markup = getMarkupWithDoctype(generateMarkup(req, filePath, options, engineOptions.layout));
      return callback(null, markup);

    } catch (e) {
      return callback(e);

    } finally {
      // For prod, remove all files from the module cache that are in the view folder.
      if (engineOptions.isProdEnv) {
        const moduleDetectRegEx = /.*\.tsx$/;
        Object.keys(req.cache).forEach((module) => {
          if (moduleDetectRegEx.test(req.cache[module].filename)) {
            delete req.cache[module];
          }
        });
      }
    }
  }

  return ReactEngine;
};
