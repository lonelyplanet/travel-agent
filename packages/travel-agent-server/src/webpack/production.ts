import * as ChunkManifestPlugin from "chunk-manifest-webpack-plugin";
import * as path from "path";
import * as webpack from "webpack";
import * as WebpackChunkHash from "webpack-chunk-hash";
import { commonPlugins } from "./common";
import config from "./config";
import userConfig from "./userConfig";
import { isVendor } from "./utils";

const productionConfig = {
  bail: true,
  stats: "errors-only",
  ...config,
};

productionConfig.entry = {
  ...userConfig.entry,
};

productionConfig.plugins = [
  ...commonPlugins,
  new ChunkManifestPlugin({
    filename: "webpackChunkManifest.json",
    inlineManifest: false,
    manifestVariable: "webpackManifest",
  }),
  new WebpackChunkHash(),
  new webpack.HashedModuleIdsPlugin(),
  new webpack.optimize.UglifyJsPlugin({
    beautify: false,
    comments: false,
    compress: {
      screw_ie8: true,
    },
    mangle: {
      keep_fnames: true,
      screw_ie8: true,
    },
  }),
  new webpack.DefinePlugin({
    "process.env": {
      NODE_ENV: JSON.stringify("production"),
    },
  }),
];

productionConfig.output = {
  chunkFilename: "[name]-chunk-[chunkhash].js",
  filename: "[name].[chunkhash].js",
  path: path.join(process.cwd(), "public", "assets"),
  publicPath: "/assets/",
};

export default productionConfig;
