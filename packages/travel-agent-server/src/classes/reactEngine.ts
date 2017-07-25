import * as path from "path";
import * as React from "react";
import { renderToStaticMarkup, renderToString } from "react-dom/server";

export interface IReactEngineOptions {
  layout?: string
}

export default (engineOptions: IReactEngineOptions = {
    layout: "app/layouts/main"
  }) => {
  function ReactEngine(filePath: string, options, callback) {
    try {
      const Component = require(`${filePath}`).default;

      if (options.layout === false) {
        const markup = renderToString(
          React.createElement(Component, options, null)
        );
        return callback(null, `<!DOCTYPE html>\
        ${markup}`);
      }

      const Layout = require(path.join(process.cwd(), options.layout || engineOptions.layout)).default;
      const markup = renderToString(React.createElement(Component, options, null));

      const staticMarkup = renderToStaticMarkup(
        React.createElement(Layout, {
          ...options,
          body: markup,
        }),
      );

      return callback(null, `<!DOCTYPE html>\
      ${staticMarkup}`);
    } catch(e) {
      return callback(e);
    }
  }

  return ReactEngine;
}
