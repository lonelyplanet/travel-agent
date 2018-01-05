import * as glob from "glob";

export default function getFilePaths(matchingPath) {
  return glob.sync(matchingPath);
}
