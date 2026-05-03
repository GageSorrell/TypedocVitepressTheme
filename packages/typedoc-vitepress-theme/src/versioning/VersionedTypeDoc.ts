/**
 * @file      VersionTypeDoc.ts
 * @author    Gage Sorrell <gage@sorrell.sh>
 * @copyright (c) 2026 Gage Sorrell
 * @license   MIT
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { Application, TypeDocOptions } from "typedoc";

export type VersionTagSelector = string | string[];

export type VersionedTypeDocOptions = {
    tags: VersionTagSelector;
    worktreeDirectory?: string;
    manifestPath?: string;
};

type VersionManifestEntry = {
    text: string;
    link: string;
};

function RunCommand(Command: string, Arguments: string[], WorkingDirectory: string): string
{
    const Result = spawnSync(Command, Arguments, {
        cwd: WorkingDirectory,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"]
    });

    if (Result.status !== 0)
    {
        throw new Error(
            [
                `Command failed: ${Command} ${Arguments.join(" ")}`,
                Result.stdout,
                Result.stderr
            ]
                .filter(Boolean)
                .join("\n")
        );
    }

    return Result.stdout;
}

function GetRepositoryRoot(WorkingDirectory: string): string
{
    return RunCommand("git", ["rev-parse", "--show-toplevel"], WorkingDirectory).trim();
}

function GetTags(RepositoryRoot: string, Tags: VersionTagSelector): string[]
{
    if (Array.isArray(Tags))
    {
        return Tags;
    }

    const TagRegex = new RegExp(Tags);

    return RunCommand("git", ["tag", "--list", "--sort=-v:refname"], RepositoryRoot)
        .split(/\r?\n/)
        .map((TagName) => TagName.trim())
        .filter((TagName) => TagName.length > 0)
        .filter((TagName) => TagRegex.test(TagName));
}

function AssertSafeTagName(TagName: string): void
{
    if (TagName.includes("/") || TagName.includes("\\"))
    {
        throw new Error(
            `The tag "${TagName}" cannot be used as a single output directory name because it contains a slash.`
        );
    }
}

function AddWorktree(RepositoryRoot: string, WorktreePath: string, TagName: string): void
{
    rmSync(WorktreePath, {
        recursive: true,
        force: true
    });

    mkdirSync(dirname(WorktreePath), {
        recursive: true
    });

    RunCommand("git", ["worktree", "add", "--detach", WorktreePath, TagName], RepositoryRoot);
}

function RemoveWorktree(RepositoryRoot: string, WorktreePath: string): void
{
    RunCommand("git", ["worktree", "remove", "--force", WorktreePath], RepositoryRoot);
}

async function GenerateDocumentationForTag(Input: {
    RepositoryRoot: string;
    WorktreePath: string;
    TypeDocConfigPath: string;
    OutputDirectory: string;
    DocsRoot: string;
    TagName: string;
}): Promise<void>
{
    const ApplicationInstance = await Application.bootstrapWithPlugins({
        options: Input.TypeDocConfigPath,
        out: Input.OutputDirectory,
        docsRoot: Input.DocsRoot,
        gitRevision: Input.TagName,
        cleanOutputDir: true
    } as Partial<TypeDocOptions>);

    const Project = await ApplicationInstance.convert();

    if (Project === undefined)
    {
        throw new Error(`TypeDoc failed to convert project for tag "${Input.TagName}".`);
    }

    await ApplicationInstance.generateDocs(Project, Input.OutputDirectory);
}

export async function RunVersionedTypeDoc(Input: {
    OptionsPath: string;
    CurrentWorkingDirectory: string;
}): Promise<void>
{
    const RepositoryRoot = GetRepositoryRoot(Input.CurrentWorkingDirectory);

    const BootstrapApplication = await Application.bootstrapWithPlugins({
        options: Input.OptionsPath
    } as Partial<TypeDocOptions>);

    const Versions = BootstrapApplication.options.getValue("versions") as
        | VersionedTypeDocOptions
        | undefined;

    if (Versions === undefined)
    {
        throw new Error("The TypeDoc config does not contain a `versions` option.");
    }

    const BaseOutputDirectory = resolve(
        RepositoryRoot,
        BootstrapApplication.options.getValue("out")
    );

    const DocsRoot = resolve(
        RepositoryRoot,
        BootstrapApplication.options.getValue("docsRoot")
    );

    const Tags = GetTags(RepositoryRoot, Versions.tags);

    if (Tags.length === 0)
    {
        throw new Error("No git tags matched the configured TypeDoc version selector.");
    }

    const WorktreeRoot = resolve(
        RepositoryRoot,
        Versions.worktreeDirectory ?? ".typedoc-vitepress-version-worktrees"
    );

    const Manifest: VersionManifestEntry[] = [];

    for (const TagName of Tags)
    {
        AssertSafeTagName(TagName);

        const WorktreePath = resolve(WorktreeRoot, TagName);
        const VersionOutputDirectory = resolve(BaseOutputDirectory, TagName);
        const VersionTypeDocConfigPath = resolve(WorktreePath, Input.OptionsPath);

        AddWorktree(RepositoryRoot, WorktreePath, TagName);

        try
        {
            await GenerateDocumentationForTag({
                RepositoryRoot,
                WorktreePath,
                TypeDocConfigPath: VersionTypeDocConfigPath,
                OutputDirectory: VersionOutputDirectory,
                DocsRoot,
                TagName
            });

            Manifest.push({
                text: TagName,
                link: `/api/${TagName}/`
            });
        }
        finally
        {
            RemoveWorktree(RepositoryRoot, WorktreePath);
        }
    }

    const ManifestPath = resolve(
        RepositoryRoot,
        Versions.manifestPath ?? "docs/.vitepress/typedoc-versions.json"
    );

    mkdirSync(dirname(ManifestPath), {
        recursive: true
    });

    writeFileSync(ManifestPath, `${JSON.stringify(Manifest, undefined, 4)}\n`);
}
