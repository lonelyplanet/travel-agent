require("ts-node/register")
const path = require("path");
const program = require("commander");
const webpack = require("webpack");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const { exec } = require("child_process");
let config = require("../src/webpack/config").default;

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
  config = require("../src/webpack/production").default;
}

exec("tsc", (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }

  webpack(config, (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
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
      console.log(`webpack production build done in ${info.time}ms.`);
    }
  });
});
