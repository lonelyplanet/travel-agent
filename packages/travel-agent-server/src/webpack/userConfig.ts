/* tslint:disable: no-var-requires */
import * as path from "path";

let config: { default?: { webpack: any }; webpack: any } = {
  webpack: {},
};

try {
  const userConfigPath = path.join(process.cwd(), "config");
  config = require(userConfigPath);

  if (config.default) {
    config = config.default;
  }
} catch (e) {
  throw new Error("Missing webpack property in config");
}

export const userConfig = config.webpack;
