import * as path from "path";
import * as ExtractTextPlugin from "extract-text-webpack-plugin";

export const tsLoader = {
  exclude: /node_modules/,
  test: /\.ts(x?)$/,
  use: [
    {
      loader: "ts-loader",
      options: {
        configFile: path.join(process.cwd(), "tsconfig.json"),
      },
    },
  ],
};

export const cssLoader = {
  test: /\.css$/,
  exclude: /node_modules/,
  use: [
    "style-loader",
    {
      loader:
        "typings-for-css-modules-loader?namedExport&modules&localIdentName=[name]__[local]___[hash:base64:5]",
    },
  ],
};

const extractCssLoader = {
  test: /\.css$/,
  include: /app/,
  loader: ExtractTextPlugin.extract({
    fallback: "style-loader",
    use:
      "typings-for-css-modules-loader?namedExport&modules&localIdentName=[name]__[local]___[hash:base64:5]",
  }),
};

const loaders = {
  dev: [tsLoader, cssLoader],
  prod: [tsLoader, extractCssLoader],
};

export const getLoaders = (env: "dev" | "prod") => loaders[env];
