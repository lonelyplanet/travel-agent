import {
  ITravelAgentServer,
  ITravelAgentServerOptions,
} from "./src/interfaces";
import * as express from "express";

export default function start(options: ITravelAgentServerOptions): ITravelAgentServer;

export { Controller } from "./src";