import * as React from "react";
import { hydrate } from "react-dom";
import App from "./app";

const initialState = JSON.parse(document.getElementById("initialState").textContent);

hydrate(<App
  {...initialState}
/>, document.getElementById("app"));

if (module.hot) {
  module.hot.accept("./app", () => {
    const NewApp = require("./app").default;
    hydrate(
      <NewApp
        {...initialState}
      />,
      document.getElementById("app"),
    );
  });
}
