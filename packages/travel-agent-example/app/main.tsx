import * as React from "react";

export default ({ body }) => (
  <html>
    <body>
      <div id="app" dangerouslySetInnerHTML={{ __html: body }}></div>
    </body>
  </html>
)
