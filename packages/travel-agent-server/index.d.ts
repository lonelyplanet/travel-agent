import {
  ITravelAgentServer,
  ITravelAgentServerOptions,
} from "./src/interfaces";
import * as express from "express";


export default function start(options?: ITravelAgentServerOptions): ITravelAgentServer;

export { inject, injectable } from "inversify";
export { Controller } from "./src";
