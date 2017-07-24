import "reflect-metadata";
import {
  injectable,
  Container,
} from "inversify";
import start from "travel-agent-server";
import * as home from "./modules/home";

const app = start({
  modules: [home],
});

@injectable()
class FooService {

}

const container = new Container();
container.bind<FooService>("FooService").to(FooService);