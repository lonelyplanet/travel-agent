"use strict";

const path = require("path");
const assert = require("yeoman-assert");
const helpers = require("yeoman-test");

describe("generator-travel-agent:app", () => {
  beforeAll(() =>
    helpers
      .run(path.join(__dirname, "../generators/app"))
      .withPrompts({ name: "dotcom-foo" }),
  );

  it("creates files", () => {
    assert.file([
      "app/index.ts",
      "package.json",
      ".gitignore",
      ".prettierrc",
      ".eslintrc",
      "tsconfig.json",
    ]);
    assert.fileContent("package.json", "dotcom-foo");
  });
});
