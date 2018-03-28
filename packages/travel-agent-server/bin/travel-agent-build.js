require("reflect-metadata");
const path = require("path");
const copyfiles = require("copyfiles");
const program = require("commander");
const webpack = require("webpack");
const merge = require("webpack-merge");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const { exec } = require("child_process");
let container = require("../dist/config/container").default;
const TYPES = require("../dist/types");

program.version("0.1.0");

program
  .option("--analyze", "run the webpack analyzer")
  .option("-p, --production", "production build")
  .option("--config [config]", "TypeScript config file")
  .description("run a webpack build")
  .parse(process.argv);

if (program.production) {
  process.env.NODE_ENV = "production";
}

require("ts-node").register({
  project: program.config,
});

const userConfigResolver = container.get(TYPES.default.IUserConfigResolver);
const userConfig = userConfigResolver.resolve();

let config = null;
if (userConfig.webpack) {
  config = require("../dist/webpack/config").default;

  if (program.production) {
    config = merge(
      require("../dist/webpack/production").default,
      (userConfig.production && userConfig.production.webpack) || {},
    );
  }

  if (program.analyze) {
    config.plugins = config.plugins || [];
    config.plugins.push(new BundleAnalyzerPlugin());
  }
}

const now = new Date();
const tsProject = program.config || null;
const command = `tsc${tsProject ? ` -p ${tsProject}` : ""}`;

exec(command, (err, stdout, stderr) => {
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
        copyfiles(["app/**/*.css", "dist"], { up: 1 }, () => {
          console.log(`Built in ${new Date() - now}ms.`);
          console.log(`webpack production build done in ${info.time}ms.`);
        });
      }
    });
  } else {
    console.log(`Built in ${new Date() - now}ms.`);
    process.exit(0);
  }
});
