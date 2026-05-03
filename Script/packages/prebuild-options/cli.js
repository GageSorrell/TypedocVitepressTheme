#!/usr/bin/env node

import { spawn } from "child_process";
import { resolve } from "path";

try
{
  spawn("ts-node", [ "-P", resolve(import.meta.dirname, "tsconfig.json"), resolve(import.meta.dirname, "cli.ts") ]);
}
catch (Error)
{
  console.log(Error);
}