import * as ChunkManifestPlugin from "chunk-manifest-webpack-plugin";
import * as ExtractTextPlugin from "extract-text-webpack-plugin";
import * as path from "path";
import * as webpack from "webpack";
import { Configuration } from "webpack";
import * as WebpackChunkHash from "webpack-chunk-hash";
import * as webpackMerge from "webpack-merge";
import { commonPlugins } from "./common";
import config from "./config";
import { getLoaders } from "./loaders";
import { userConfig } from "./userConfig";
import userConfigProduction from "./userProductionConfig";

const productionConfig: Configuration = {
  entry: {},
  bail: true,
  stats: "errors-only",
  output: {
    chunkFilename: "[name]-chunk-[chunkhash].js",
    filename: "[name].[chunkhash].js",
    path: path.join(process.cwd(), "public", "assets"),
    publicPath: "/assets/",
  },
  module: {
    rules: [...getLoaders("prod")],
  },
  plugins: [
    ...commonPlugins,
    new ChunkManifestPlugin({
      filename: "webpackChunkManifest.json",
      inlineManifest: false,
      manifestVariable: "webpackManifest",
    }),
    new WebpackChunkHash(),
    new webpack.HashedModuleIdsPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: userConfigProduction.devtool,
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
    new ExtractTextPlugin("[name].[chunkhash].css", {
      disable: false,
      allChunks: true,
    }),
  ],
  resolve: { ...config.resolve },
  resolveLoader: { ...config.resolveLoader },
};

export default webpackMerge(productionConfig, userConfig, userConfigProduction);
