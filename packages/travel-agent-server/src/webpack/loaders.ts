import * as path from "path";
import * as ExtractTextPlugin from "extract-text-webpack-plugin";
import * as autoprefixer from "autoprefixer";
import * as map from "postcss-map";
import * as nested from "postcss-nested";
import backpackStyles from "backpack-ui/dist/styles";

const styleLoaders = {
  css: {
    loader: "typings-for-css-modules-loader",
    options: {
      namedExport: true,
      modules: true,
      minimize: false,
      localIdentName: "[name]__[local]___[hash:base64:5]",
    },
  },
  postcss: {
    loader: "postcss-loader",
    options: {
      plugins: () => [
        map({
          maps: [backpackStyles],
        }),
        nested(),
        autoprefixer(),
      ],
    },
  },
};

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
    styleLoaders.css,
    styleLoaders.postcss,
  ],
};

const extractCssLoader = {
  test: /\.css$/,
  include: /app/,
  loader: ExtractTextPlugin.extract({
    fallback: "style-loader",
    use: [
      styleLoaders.css,
      styleLoaders.postcss,
    ],
  }),
};

const loaders = {
  dev: [tsLoader, cssLoader],
  prod: [tsLoader, extractCssLoader],
};

export const getLoaders = (env: "dev" | "prod") => loaders[env];
