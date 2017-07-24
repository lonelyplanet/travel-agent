/* global process,__dirname */
import {
  inject,
  injectable,
  Container,
} from "inversify";
import {
  ITravelAgentServer,
  ITravelAgentModule,
} from "../interfaces";
import {
  IControllerConstructor,
  IController,
} from "./controller";
import TYPES from "../types";
import * as express from "express";
import middleware from "../middleware";
import container from "../config/container";

@injectable()
export default class TravelAgentServer implements ITravelAgentServer {
  app: express.Application;
  container: Container;

  constructor(@inject(TYPES.express) express: express.Application) {
    this.app = express;
    this.middleware();

    this.handler = this.handler.bind(this);
    this.container = container;
  }

  middleware() {
    middleware(this.app);
  }

  bind(...args) {
    return container.bind.apply(container, args);
  }

  addModules(modules: ITravelAgentModule[]) {
    modules.forEach((module) => {
      injectable()(module.controller);
      container.bind(module.controller.name).to(module.controller);

      const routes = Object.keys(module.controller.routes)
      .reduce<Array<IRoute>>((memo, key) => {
        const split = key.split(" ");
        const method = split[0].toLocaleLowerCase();
        const url = split[1];
        const handler = module.controller.routes[key];

        memo.push({
          handler,
          method,
          url,
          middleware: [],
          routes: module.controller.routes,
          controller: module.controller,
        });

        return memo;
      }, []);

      routes.forEach((route) => {
        this.app[route.method](route.url, ...route.middleware, (req, res, next) => {
          this.handler(req, res, next, module.controller.name, route.handler);
        });
      });
    });
  }

  private handler(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
    controller: string,
    handler: string
  ) {
    console.log();
    const instance = container.get<IController>(controller);
    instance.request = req;
    instance.response = res;
    instance.next = next;
    instance[handler]();
  }
}
interface IRoute {
  handler: string;
  method: string;
  url: string;
  middleware: Object[];
  routes: Object;
  controller: IControllerConstructor;
  // handler(request: express.Request, response: express.Response, next: express.NextFunction): void;
}
/*
const env = process.env.NODE_ENV || "development";

const express = require("express");
const helmet = require('helmet');
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const utilityRoutes = require("./routes/utility");
const Promise = require("bluebird");
const Helmet = require("react-helmet");

require("babel-polyfill");

global.Promise = Promise;

const app = express();

const exphbs = require("express-handlebars");
const helpers = require("./lib/helpers");
const hbs = exphbs.create({
  helpers,
  defaultLayout: "main",
  layoutsDir: "app/layouts",
  partialsDir: [
    "node_modules/rizzo-next/src",
    "app",
  ],
  extname: ".hbs",
});

app.set("views", "app");

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "node_modules/rizzo-next/dist")));
app.use(cors());

const data = require("rizzo-next/lib/data/default.json");

data.components.header.type = "normal";
data.components.header.navigation.splice(1, 0, {
  title: "Video",
  slug: "/video/v",
});

app.use((req, res, next) => {
  const head = Helmet.rewind();

  Object.assign(res.locals, {
    footer: data.components.footer,
    show_header: true,
    header: data.components.header,
    asset_root: process.env.ASSET_HOST,
    head: {
      title: head.title.toString(),
      meta: head.meta.toString(),
      script: head.script.toString(),
      link: head.link.toString(),
    },
  });
  next();
});

app.use((req, res, next) => {
  if (req.originalUrl.indexOf(".json") > -1) {
    req.headers["content-type"] = "application/json";
  }

  next();
});

if (env === "production") {
  require("./boot/production")(app);
} else if (env === "test") {
  require("./boot/test")(app);
} else {
  require("./boot/development")(app);
}

// adds "/error" and "/server-status" endpoints
app.use("/", utilityRoutes);

// Catch all route
app.use((req, res, next) => {
  req.statsdKey = ["pois", "errors", 404].join(".");

  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

module.exports = app;
*/