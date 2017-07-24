import {
  Controller,
} from "travel-agent-server";
import {
  inject,
} from "inversify";

export default class HomeController extends Controller {
  static routes = {
    "GET /": "show",
    "GET /omg": "omg",
  };

  @inject("FooService") foo;

  async show() {
    this.response.json({
      home: "hell effin yea",
    });
  }
  omg() {
    this.response.json({
      home: "OMG",
    });
  }
}