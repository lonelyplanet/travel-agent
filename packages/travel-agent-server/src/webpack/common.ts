import * as webpack from "webpack";
import { userConfig } from "./userConfig";
import { isVendor } from "./utils";
import * as ManifestPlugin from "webpack-manifest-plugin";

export const commonPlugins = [
  new ManifestPlugin({
    writeToFileEmit: true,
  }),
  new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-gb|en-eu|eu/),
  new webpack.optimize.CommonsChunkPlugin({
    // chunks: ["webpack-hot-middleware/client"],
    minChunks: (module, count) => isVendor(module),
    names: ["vendor"],
  }),
  new webpack.optimize.CommonsChunkPlugin({
    chunks: Object.keys(userConfig.entry),
    minChunks: (module, count) => !isVendor(module) && count > 5,
    name: "common",
  }),
  new webpack.optimize.CommonsChunkPlugin({
    minChunks: Infinity,
    name: "manifest",
  }),
];
