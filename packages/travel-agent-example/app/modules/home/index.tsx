import * as React from "react";
import { Helmet } from "@lonelyplanet/travel-agent/helmet";
import Home from "./components/index";

export default ({
  message,
}) => (
  <div>
    <Helmet>
      <title>Home Page!!!</title>
      <meta name="description" content="I'm a home page" />
    </Helmet>
    <Home />
    {message}
    <div>But wait there's more!!!</div>
  </div>
);
