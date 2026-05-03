#!/usr/bin/env node

/**
 * @file      versioned.ts
 * @author    Gage Sorrell <gage@sorrell.sh>
 * @copyright (c) 2026 Gage Sorrell
 * @license   MIT
 */

import { resolve } from "node:path";
import { RunVersionedTypeDoc } from "../versioning/VersionedTypeDoc.js";

function GetOptionValue(Arguments: string[], Name: string): string | undefined
{
    const Index = Arguments.indexOf(Name);

    if (Index === -1)
    {
        return undefined;
    }

    return Arguments[Index + 1];
}

const Arguments = process.argv.slice(2);
const OptionsPath = GetOptionValue(Arguments, "--options") ?? "typedoc.json";

await RunVersionedTypeDoc({
    OptionsPath: resolve(process.cwd(), OptionsPath),
    CurrentWorkingDirectory: process.cwd()
});
