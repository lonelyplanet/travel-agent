/* tslint:disable: no-var-requires */
import * as path from "path";
import * as webpack from "webpack";
import { commonPlugins } from "./common";
import Notifier from "./notifier";
import userConfig from "./userConfig";

console.log(path.join(process.cwd(), "tsconfig.json"));

const config: webpack.Configuration = {
  // context: path.join(process.cwd(), "app"),
  entry: {
    common: ["webpack-hot-middleware/client"],
    ...userConfig.entry,
  },
  module: {
    rules: [{
      exclude: /node_modules/,
      test: /\.ts(x?)$/,
      use: [{
        loader: "ts-loader",
        options: {
          configFile: path.join(process.cwd(), "tsconfig.json"),
        },
      }],
    }],
  },
  output: {
    chunkFilename: "[name]-chunk.js",
    filename: "[name].js",
    path: path.join(process.cwd(), "public", "assets"),
    publicPath: process.env.ASSET_PATH || "/assets/",
  },
  plugins: [
    ...commonPlugins,
    new webpack.HotModuleReplacementPlugin(),
    new Notifier(),
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    modules: [
      "node_modules",
      path.join(__dirname, "..", "..", "node_modules"),
    ],
  },
  resolveLoader: {
    extensions: [".tsx", ".ts", ".js"],
    modules: [
      path.join(__dirname, "..", "..", "node_modules"),
    ],
  },
};

export default config;
