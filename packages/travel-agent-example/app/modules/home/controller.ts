import {
  Controller,
  inject,
} from "travel-agent-server";
import {
  IFooService,
} from "../../services/fooService";

export default class HomeController extends Controller {
  static routes = {
    "GET /": "show",
    "GET /omg": "omg",
    "GET /html": "html",
    "GET /html.json": "json",
  };

  foo: IFooService;

  constructor(@inject("FooService") foo?: IFooService) {
    super();

    this.foo = foo;
  }

  async show() {
    const foo = await this.foo.fetch();

    this.response.render("home", {
      message: `hell effin yea ${foo[0].name}!`,
    });
  }
  omg() {
    this.response.json({
      home: "OMG",
    });
  }
  html() {
    this.response.set("content-type", "text/html");
    this.response.send(`<!DOCTYPE html>
    <html>
    <body>
    Hello world
    </body>
    </html>
    `);
  }
  json() {
    this.response.send({
      json: "json",
    });
  }
}
