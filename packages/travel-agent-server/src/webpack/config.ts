/* tslint:disable: no-var-requires */
import * as path from "path";
import * as webpack from "webpack";
import { commonPlugins } from "./common";
import Notifier from "./notifier";
import userConfig from "./userConfig";
import * as webpackMerge from "webpack-merge";
import { getLoaders } from "./loaders";

const config: webpack.Configuration = {
  entry: {
    common: ["webpack-hot-middleware/client"],
  },
  module: {
    rules: [...getLoaders("dev")],
  },
  output: {
    chunkFilename: "[name]-chunk.js",
    filename: "[name].js",
    path: path.join(process.cwd(), "public", "assets"),
    publicPath: "/assets/",
  },
  plugins: [
    ...commonPlugins,
    new webpack.HotModuleReplacementPlugin(),
    new Notifier(),
    new webpack.WatchIgnorePlugin([/\.d\.ts$/]),
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    modules: ["node_modules", path.join(__dirname, "..", "..", "node_modules")],
  },
  resolveLoader: {
    extensions: [".tsx", ".ts", ".js"],
    modules: ["node_modules", path.join(__dirname, "..", "..", "node_modules")],
  },
};

export default webpackMerge(config, userConfig);
