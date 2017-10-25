/* tslint:disable: no-var-requires */
import * as path from "path";

let userConfig;
try {
  const userConfigPath = path.join(process.cwd(), "config");
  userConfig = require(userConfigPath).webpack;
} catch (e) {
  throw new Error("Missing webpack property in config");
}

export default userConfig;
