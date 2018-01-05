import * as React from "react";

const TestLayout = ({ body, assets, initialState }) => (
  <html>
    <body>
      <div id="app" dangerouslySetInnerHTML={{ __html: body }}></div>
      <script
        type="application/json"
        id="initialState"
        dangerouslySetInnerHTML={{ __html: initialState }}
      />
      <script src={assets["vendor.js"]} />
    </body>
  </html>
)

export default TestLayout;
