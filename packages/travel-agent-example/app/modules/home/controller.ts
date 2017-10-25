import {
  Controller,
  inject,
  get,
  post,
} from "@lonelyplanet/travel-agent";
import {
  IFooService,
} from "../../services/fooService";

export default class HomeController extends Controller {
  foo: IFooService;

  constructor(@inject("FooService") foo?: IFooService) {
    super();

    this.foo = foo;
  }

  @get("/")
  async show() {
    const foo = await this.foo.fetch();

    this.response.render("home", {
      message: `hell effin yea ${foo[0].name}!`,
    });
  }

  @get("/omg")
  omg() {
    this.response.json({
      home: "OMG",
    });
  }

  @get("/html/:id?")
  html() {
    this.response.set("content-type", "text/html");
    this.response.send(`<!DOCTYPE html>
    <html>
    <body>
    Hello world ${this.request.params.id}
    </body>
    </html>
    `);
  }

  @post("/postypost/:id?")
  json() {
    this.response.send({
      json: this.request.body,
      id: this.request.params.id,
      qs: this.request.query,
    });
  }
}
