const path = require("path");

process.env.NODE_ENV = "production";
const server = require(path.join(process.cwd(), "dist"));
