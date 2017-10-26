import "reflect-metadata";
import start from "@lonelyplanet/travel-agent";
import * as home from "./modules/home";
import FooService from "./services/fooService";

const app = start();

app.bind("FooService").to(FooService);
