import * as React from "react";
import { ILayoutOptions } from "@lonelyplanet/travel-agent";

export default ({ body, assets, initialState, head }: ILayoutOptions) => (
  <html>
    <head>
      {head.meta.toComponent()}
      {head.title.toComponent()}
      {head.script.toComponent()}
      {head.style.toComponent()}
      {assets["app.css"] && <link rel="stylesheet" href={assets["app.css"]} />}
    </head>
    <body>
      <div id="app" dangerouslySetInnerHTML={{ __html: body }} />

      <script
        type="application/json"
        id="initialState"
        dangerouslySetInnerHTML={{ __html: initialState }}
      />
      <script src={assets["manifest.js"]} />
      <script src={assets["vendor.js"]} />
      <script src={assets["common.js"]} />
      <script src={assets["app.js"]} />
    </body>
  </html>
);
