import * as React from "react";
import Home from "./components/index";

export default ({
  message,
}) => (
  <div>
    <Home />
    {message}
    <div>But wait there's more!!</div>
  </div>
)
