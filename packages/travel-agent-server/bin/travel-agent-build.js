require("ts-node/register")
require("reflect-metadata");
const path = require("path");
const program = require("commander");
const webpack = require("webpack");
const merge = require("webpack-merge");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const { exec } = require("child_process");
let container = require("../dist/config/container").default;
const TYPES = require("../dist/types");

const userConfigResolver = container.get(TYPES.default.IUserConfigResolver);
const userConfig = userConfigResolver.resolve();

program
  .version("0.1.0")

program
  .option("--analyze", "run the webpack analyzer")
  .option("-p, --production", "production build")
  .description("run a webpack build")
  .parse(process.argv);

if (program.analyze) {
  config.plugins = config.plugins || [];
  config.plugins.push(new BundleAnalyzerPlugin());
}

if (program.production) {
  process.env.NODE_ENV = "production";
}

let config = null;
if (userConfig.webpack) {
  config = merge(
    require("../dist/webpack/config").default,
    userConfig.webpack,
  );

  if (program.production) {
    config = merge(
      require("../dist/webpack/production").default,
      userConfig.production.webpack || {},
    );
  }
}

const now = new Date();
exec("tsc", (err, stdout, stderr) => {
  if (err || stderr) {
    console.error(stdout);
    process.exit(1);
    return;
  }

  if (userConfig.webpack) {
    webpack(config, (err, stats) => {
      if (err) {
        console.error(err.stack || err);
        if (err.details) {
          console.error(err.details);
        }

        process.exit(1);
        return;
      }

      const info = stats.toJson();

      if (stats.hasErrors()) {
        console.error(info.errors);
        return;
      }

      if (!program.production) {
        if (stats.hasWarnings()) {
          console.warn(info.warnings);
        }
        console.log(stats.toString());
      } else {
        console.log(`Built in ${new Date() - now}ms.`);
        console.log(`webpack production build done in ${info.time}ms.`);
      }
    });
  } else {
    console.log(`Built in ${new Date() - now}ms.`);
    process.exit(0);
  }
});
