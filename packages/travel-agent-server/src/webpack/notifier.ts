import * as path from "path";
import * as webpack from "webpack";

export default class Notifier implements webpack.Plugin {
  public apply(compiler: webpack.Compiler) {
    compiler.plugin("done", (stats) => {
      const pkg = require(path.join(process.cwd(), "package.json"));
      const notifier = require("node-notifier");
      const time = ((stats.endTime - stats.startTime) / 1000).toFixed(2);

      notifier.notify({
        contentImage: "https://pbs.twimg.com/profile_images/777128477937893376/WKi8WarP_400x400.jpg",
        message: `WebPack is done!\n${stats.compilation.errors.length} errors in ${time}s`,
        title: pkg.name,
      });
    });
  }
}
