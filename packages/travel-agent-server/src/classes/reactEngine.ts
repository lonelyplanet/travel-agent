import * as path from "path";
import * as React from "react";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import getBundledAssets from "../utils/getBundledAssets";

export interface IReactEngineOptions {
  layout?: string;
}

export default (engineOptions: IReactEngineOptions = {
    layout: "app/layout",
  }) => {
  function ReactEngine(filePath: string, options, callback) {
    const moduleDetectRegEx = /.*\.tsx$/;

    try {
      const Component = require(`${filePath}`).default;

      if (options.layout === false || filePath.indexOf("error") > -1) {
        const markup = renderToString(
          React.createElement(Component, options, null),
        );
        return callback(null, `<!DOCTYPE html>\
        ${markup}`);
      }

      const Layout = require(path.join(process.cwd(), options.layout || engineOptions.layout)).default;
      const assets = getBundledAssets();
      const markup = renderToString(React.createElement(Component, options, null));
      const locals = {
        ...options,
      };

      delete locals.webpackStats;
      delete locals.settings;
      delete locals._locals;
      delete locals.cache;

      const initialState = JSON.stringify(locals);

      const staticMarkup = renderToStaticMarkup(
        React.createElement(Layout, {
          ...options,
          assets,
          body: markup,
          initialState,
        }),
      );

      return callback(null, `<!DOCTYPE html>\
      ${staticMarkup}`);
    } catch (e) {
      return callback(e);
    } finally {
      if (process.env.NODE_ENV !== "production") {
        // Remove all files from the module cache that are in the view folder.
        Object.keys(require.cache).forEach((module) => {
          if (moduleDetectRegEx.test(require.cache[module].filename)) {
            delete require.cache[module];
          }
        });
      }
    }
  }

  return ReactEngine;
};
