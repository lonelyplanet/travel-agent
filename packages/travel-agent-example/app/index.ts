import "reflect-metadata";
import start from "@lonelyplanet/travel-agent";
import * as home from "./modules/home";
import FooService from "./services/fooService";

const server = start();

server.bind("FooService").to(FooService);

export const app = server.app;
