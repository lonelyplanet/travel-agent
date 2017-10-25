import {
  ITravelAgentServer,
} from "./src/interfaces";

export default function start(options?: {
  startWithoutHttp: boolean,
}): ITravelAgentServer;

export { inject, injectable } from "inversify";

export * from "./src";
