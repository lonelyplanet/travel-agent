import * as path from "path";
import * as fs from "fs";

export default function getBundledAssets() {
  const manifest = require(path.join(process.cwd(), "public", "assets", "manifest.json"));

  return manifest;
}
