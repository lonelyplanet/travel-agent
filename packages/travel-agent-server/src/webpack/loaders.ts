import * as path from "path";
import * as ExtractTextPlugin from "extract-text-webpack-plugin";
import * as autoprefixer from "autoprefixer";
import * as gridSpan from "postcss-grid-span";
import * as map from "postcss-map";
import * as nested from "postcss-nested";
import {
  colors,
  dimensions,
  fonts,
  mq,
  spacing,
  timing,
  typography,
  zIndex,
} from "backpack-ui/dist/styles";

const styleLoaders = {
  css: {
    loader: "typings-for-css-modules-loader",
    options: {
      namedExport: true,
      modules: true,
      minimize: false,
      localIdentName: "[name]__[local]___[hash:base64:5]",
      context: path.resolve(process.cwd(), "app"),
    },
  },
  postcss: {
    loader: "postcss-loader",
    options: {
      plugins: () => [
        map({
          maps: [
            { colors },
            { dimensions },
            {
              fonts: {
                benton: fonts.benton.join(", "),
                miller: fonts.miller.join(", "),
              },
            },
            { mq },
            { spacing },
            { timing },
            { typography },
            { zIndex },
          ],
        }),
        gridSpan({
          appendUnit: true,
          columns: 12,
          gap: 30,
          maxWidth: 1290,
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
  use: ["style-loader", styleLoaders.css, styleLoaders.postcss],
};

const extractCssLoader = {
  test: /\.css$/,
  include: /app/,
  loader: ExtractTextPlugin.extract({
    fallback: "style-loader",
    use: [styleLoaders.css, styleLoaders.postcss],
  }),
};

const loaders = {
  dev: [tsLoader, cssLoader],
  prod: [tsLoader, extractCssLoader],
};

export const getLoaders = (env: "dev" | "prod") => loaders[env];
