import "reflect-metadata";
import start from "travel-agent-server";
import * as home from "./modules/home";
import FooService from "./services/fooService";

const app = start({
  modules: [home],
});

app.bind("FooService").to(FooService);
