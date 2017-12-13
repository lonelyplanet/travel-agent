import * as React from "react";

export default ({
  message,
  error,
}) => (
  <div>
    <div>{message}</div>
    <pre>{error.stack}</pre>
  </div>
)
