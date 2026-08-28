/** Safe Git worktree preparation and cleanup for review workflows. @module */
import { z } from "npm:zod@4";

const PullRequestSchema = z.object({
  number: z.number().int().positive(),
  head: z.string().regex(/^[0-9a-f]{40}$/),
  tree: z.string().regex(/^[0-9a-f]{40}$/),
});

const WorktreeSchema = z.object({
  path: z.string(),
  branch: z.string(),
  baseSha: z.string(),
  headSha: z.string(),
  pullRequests: z.array(PullRequestSchema),
  preparedAt: z.string(),
});

const RemovalSchema = z.object({
  path: z.string(),
  branch: z.string(),
  removed: z.boolean(),
  removedAt: z.string(),
});

const PublishSchema = z.object({
  baseSha: z.string().regex(/^[0-9a-f]{40}$/),
  headSha: z.string().regex(/^[0-9a-f]{40}$/),
  publishedAt: z.string(),
});

const PrepareArgsSchema = z.object({
  pullNumbers: z.array(z.number().int().positive()).min(1),
  expectedHeadShas: z.array(z.string().regex(/^[0-9a-f]{40}$/)).min(1),
});

const RemovalArgsSchema = z.object({
  worktreePath: z.string().min(1),
  expectedBranch: z.string().min(1),
});

const PublishArgsSchema = z.object({
  expectedBaseSha: z.string().regex(/^[0-9a-f]{40}$/),
  expectedHeadSha: z.string().regex(/^[0-9a-f]{40}$/),
});

type Context = {
  signal: AbortSignal;
  globalArgs: { repoPath?: string };
  writeResource: (
    specName: string,
    name: string,
    data: Record<string, unknown>,
  ) => Promise<{ name: string }>;
};

async function git(cwd: string, args: string[], signal: AbortSignal) {
  return await command(cwd, "git", args, signal);
}

async function command(
  cwd: string,
  executable: string,
  args: string[],
  signal: AbortSignal,
) {
  const output = await new Deno.Command(executable, {
    args,
    cwd,
    signal,
    stdout: "piped",
    stderr: "piped",
  }).output();
  const text = new TextDecoder().decode(
    output.success ? output.stdout : output.stderr,
  ).trim();
  if (!output.success) {
    throw new Error(text || `${executable} exited ${output.code}`);
  }
  return text;
}

const dependencySections = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
] as const;

async function resolveNpmConflict(
  worktreePath: string,
  baseRef: string,
  pullRef: string,
  signal: AbortSignal,
) {
  const conflicts = (await git(
    worktreePath,
    ["diff", "--name-only", "--diff-filter=U"],
    signal,
  )).split("\n").filter(Boolean);
  const staged = (await git(
    worktreePath,
    ["diff", "--cached", "--name-only"],
    signal,
  )).split("\n").filter(Boolean);
  const changed = conflicts.length > 0 ? conflicts : staged;
  if (
    changed.length === 0 ||
    changed.some((path) =>
      path !== "package.json" && path !== "package-lock.json"
    )
  ) {
    throw new Error(`Unsupported merge conflicts: ${changed.join(", ")}`);
  }

  const mergeBase = await git(
    worktreePath,
    ["merge-base", baseRef, pullRef],
    signal,
  );
  const [basePackageText, pullPackageText, aggregatePackageText] = await Promise
    .all([
      git(worktreePath, ["show", `${mergeBase}:package.json`], signal),
      git(worktreePath, ["show", `${pullRef}:package.json`], signal),
      git(worktreePath, ["show", "HEAD:package.json"], signal),
    ]);
  const basePackage = JSON.parse(basePackageText);
  const pullPackage = JSON.parse(pullPackageText);
  const aggregatePackage = JSON.parse(aggregatePackageText);
  const indent = aggregatePackageText.match(/^([\t ]+)"/m)?.[1] ?? "  ";

  for (const section of dependencySections) {
    const baseDependencies = basePackage[section] ?? {};
    const pullDependencies = pullPackage[section] ?? {};
    const names = new Set([
      ...Object.keys(baseDependencies),
      ...Object.keys(pullDependencies),
    ]);
    for (const name of names) {
      if (baseDependencies[name] === pullDependencies[name]) continue;
      if (pullDependencies[name] === undefined) {
        delete aggregatePackage[section]?.[name];
      } else {
        aggregatePackage[section] ??= {};
        aggregatePackage[section][name] = pullDependencies[name];
      }
    }
  }

  await Deno.writeTextFile(
    `${worktreePath}/package.json`,
    `${JSON.stringify(aggregatePackage, null, indent)}\n`,
  );
  await command(
    worktreePath,
    "npm",
    ["install", "--package-lock-only", "--ignore-scripts"],
    signal,
  );
  await git(
    worktreePath,
    ["add", "--", "package.json", "package-lock.json"],
    signal,
  );
}

async function exists(path: string) {
  try {
    await Deno.stat(path);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) return false;
    throw error;
  }
}

async function worktreeRegistration(
  repoPath: string,
  worktreePath: string,
  signal: AbortSignal,
) {
  const entries = (await git(
    repoPath,
    ["worktree", "list", "--porcelain"],
    signal,
  )).split("\n\n");
  const entry = entries.find((item) =>
    item.split("\n").includes(`worktree ${worktreePath}`)
  );
  return {
    registered: Boolean(entry),
    branch: entry?.split("\n").find((line) => line.startsWith("branch "))
      ?.slice(7) ?? "",
  };
}

export const extension = {
  type: "@swamp/git",
  resources: {
    dependabotWorktree: {
      description: "Aggregate worktree containing exact Dependabot PR heads",
      schema: WorktreeSchema,
      lifetime: "infinite" as const,
      garbageCollection: 200,
    },
    worktreeRemoval: {
      description: "Result of safely removing a Git worktree",
      schema: RemovalSchema,
      lifetime: "infinite" as const,
      garbageCollection: 200,
    },
    dependabotPublish: {
      description: "Exact tested aggregate commit published to master",
      schema: PublishSchema,
      lifetime: "infinite" as const,
      garbageCollection: 200,
    },
  },
  methods: [{
    prepareDependabotWorktree: {
      description:
        "Create one clean review worktree containing all supplied Dependabot PR heads",
      arguments: PrepareArgsSchema,
      execute: async (
        args: z.infer<typeof PrepareArgsSchema>,
        context: Context,
      ) => {
        if (args.pullNumbers.length !== args.expectedHeadShas.length) {
          throw new Error(
            "pullNumbers and expectedHeadShas must have equal length",
          );
        }

        const expectedPullRequests = args.pullNumbers.map((number, index) => ({
          number,
          head: args.expectedHeadShas[index]!,
        })).toSorted((a, b) => a.number - b.number);
        if (
          new Set(expectedPullRequests.map(({ number }) => number)).size !==
            expectedPullRequests.length
        ) {
          throw new Error("Duplicate pull request numbers are not allowed");
        }

        const repoPath = await Deno.realPath(
          context.globalArgs.repoPath ?? ".",
        );
        const worktreePath = `${repoPath}/.worktrees/dependabot-review`;
        const branch = "review/dependabot";
        const registration = await worktreeRegistration(
          repoPath,
          worktreePath,
          context.signal,
        );
        const pathExists = await exists(worktreePath);

        if (registration.registered) {
          if (registration.branch !== `refs/heads/${branch}`) {
            throw new Error(
              `Review worktree uses ${
                registration.branch || "detached HEAD"
              }, expected refs/heads/${branch}`,
            );
          }
          const status = await git(
            worktreePath,
            ["status", "--porcelain"],
            context.signal,
          );
          if (status) {
            const conflicts = await git(
              worktreePath,
              ["diff", "--name-only", "--diff-filter=U"],
              context.signal,
            );
            if (!conflicts) {
              throw new Error(`Worktree is dirty: ${worktreePath}`);
            }
            await git(
              worktreePath,
              ["reset", "--hard", "HEAD"],
              context.signal,
            );
          }
          await git(
            repoPath,
            ["worktree", "remove", "--", worktreePath],
            context.signal,
          );
        } else if (pathExists) {
          throw new Error(
            `${worktreePath} exists but is not a registered worktree`,
          );
        }

        if (await git(repoPath, ["branch", "--list", branch], context.signal)) {
          await git(repoPath, ["branch", "-D", branch], context.signal);
        }

        const refspecs = expectedPullRequests.map(({ number }) =>
          `+refs/pull/${number}/head:refs/swamp/dependabot/${number}`
        );
        await git(
          repoPath,
          [
            "fetch",
            "--prune",
            "origin",
            "+refs/heads/master:refs/remotes/origin/master",
            ...refspecs,
          ],
          context.signal,
        );

        for (const pullRequest of expectedPullRequests) {
          const actual = await git(
            repoPath,
            ["rev-parse", `refs/swamp/dependabot/${pullRequest.number}`],
            context.signal,
          );
          if (actual !== pullRequest.head) {
            throw new Error(
              `PR #${pullRequest.number} head changed: expected ${pullRequest.head}, got ${actual}`,
            );
          }
        }

        const baseSha = await git(
          repoPath,
          ["rev-parse", "refs/remotes/origin/master"],
          context.signal,
        );
        await Deno.mkdir(`${repoPath}/.worktrees`, { recursive: true });
        await git(
          repoPath,
          ["worktree", "add", "-b", branch, "--", worktreePath, baseSha],
          context.signal,
        );

        const pullRequests = [];
        for (const pullRequest of expectedPullRequests) {
          const pullRef = `refs/swamp/dependabot/${pullRequest.number}`;
          try {
            await git(
              worktreePath,
              ["merge", "--squash", pullRef],
              context.signal,
            );
          } catch (error) {
            try {
              await resolveNpmConflict(
                worktreePath,
                baseSha,
                pullRef,
                context.signal,
              );
            } catch (conflictError) {
              await git(
                worktreePath,
                ["reset", "--hard", "HEAD"],
                context.signal,
              );
              throw new Error(
                `PR #${pullRequest.number} could not be aggregated: ${
                  conflictError instanceof Error
                    ? conflictError.message
                    : String(conflictError)
                }`,
                { cause: error },
              );
            }
          }
          await git(
            worktreePath,
            [
              "-c",
              "user.name=swamp",
              "-c",
              "user.email=swamp@localhost",
              "commit",
              "-m",
              `Aggregate Dependabot PR #${pullRequest.number}`,
            ],
            context.signal,
          );
          pullRequests.push({
            ...pullRequest,
            tree: await git(
              worktreePath,
              ["rev-parse", "HEAD^{tree}"],
              context.signal,
            ),
          });
        }

        await git(worktreePath, ["reset", "--soft", baseSha], context.signal);
        await git(
          worktreePath,
          [
            "-c",
            "user.name=swamp",
            "-c",
            "user.email=swamp@localhost",
            "commit",
            "-m",
            "chore: aggregate Dependabot updates",
          ],
          context.signal,
        );

        if (
          await git(worktreePath, ["status", "--porcelain"], context.signal)
        ) {
          throw new Error(`Prepared worktree is dirty: ${worktreePath}`);
        }
        const headSha = await git(
          worktreePath,
          ["rev-parse", "HEAD"],
          context.signal,
        );
        const handle = await context.writeResource(
          "dependabotWorktree",
          "dependabot-aggregate",
          {
            path: worktreePath,
            branch,
            baseSha,
            headSha,
            pullRequests,
            preparedAt: new Date().toISOString(),
          },
        );
        return { dataHandles: [handle] };
      },
    },
  }, {
    publishDependabotAggregate: {
      description:
        "Fast-forward master to the exact clean aggregate commit after approval",
      arguments: PublishArgsSchema,
      execute: async (
        args: z.infer<typeof PublishArgsSchema>,
        context: Context,
      ) => {
        const repoPath = await Deno.realPath(
          context.globalArgs.repoPath ?? ".",
        );
        const worktreePath = `${repoPath}/.worktrees/dependabot-review`;
        const registration = await worktreeRegistration(
          repoPath,
          worktreePath,
          context.signal,
        );
        if (registration.branch !== "refs/heads/review/dependabot") {
          throw new Error("Dependabot review worktree is not registered");
        }
        if (
          await git(worktreePath, ["status", "--porcelain"], context.signal)
        ) {
          throw new Error(`Worktree is dirty: ${worktreePath}`);
        }
        const head = await git(
          worktreePath,
          ["rev-parse", "HEAD"],
          context.signal,
        );
        if (head !== args.expectedHeadSha) {
          throw new Error(
            `Aggregate changed: expected ${args.expectedHeadSha}, got ${head}`,
          );
        }
        const remote = (await git(
          repoPath,
          ["ls-remote", "origin", "refs/heads/master"],
          context.signal,
        )).split(/\s+/)[0];
        if (remote !== args.expectedBaseSha) {
          throw new Error(
            `Base changed: expected ${args.expectedBaseSha}, got ${remote}`,
          );
        }
        await git(
          worktreePath,
          ["merge-base", "--is-ancestor", args.expectedBaseSha, head],
          context.signal,
        );
        await git(
          repoPath,
          [
            "push",
            `--force-with-lease=refs/heads/master:${args.expectedBaseSha}`,
            "origin",
            `${head}:refs/heads/master`,
          ],
          context.signal,
        );
        const handle = await context.writeResource(
          "dependabotPublish",
          "dependabot-publish",
          {
            baseSha: args.expectedBaseSha,
            headSha: head,
            publishedAt: new Date().toISOString(),
          },
        );
        return { dataHandles: [handle] };
      },
    },
  }, {
    removeWorktree: {
      description:
        "Remove a registered clean secondary worktree, or record a no-op when it is already absent",
      arguments: RemovalArgsSchema,
      execute: async (
        args: z.infer<typeof RemovalArgsSchema>,
        context: Context,
      ) => {
        const repoPath = await Deno.realPath(
          context.globalArgs.repoPath ?? ".",
        );
        const pathExists = await exists(args.worktreePath);
        const worktreePath = pathExists
          ? await Deno.realPath(args.worktreePath)
          : args.worktreePath.replace(/\/+$/, "");
        if (worktreePath === repoPath) {
          throw new Error("Refusing to remove the primary repository worktree");
        }

        const registration = await worktreeRegistration(
          repoPath,
          worktreePath,
          context.signal,
        );
        const branch = registration.branch;

        if (!registration.registered && pathExists) {
          throw new Error(`${worktreePath} is not a registered Git worktree`);
        }
        if (registration.registered && !pathExists) {
          throw new Error(`${worktreePath} is registered but missing on disk`);
        }
        if (registration.registered) {
          if (branch !== `refs/heads/${args.expectedBranch}`) {
            throw new Error(
              `Worktree branch changed: expected ${args.expectedBranch}, got ${
                branch || "detached HEAD"
              }`,
            );
          }
          const status = await git(
            worktreePath,
            ["status", "--porcelain"],
            context.signal,
          );
          if (status) {
            throw new Error(`Worktree is dirty: ${worktreePath}`);
          }
          await git(
            repoPath,
            ["worktree", "remove", "--", worktreePath],
            context.signal,
          );
        }

        const handle = await context.writeResource(
          "worktreeRemoval",
          `worktree-${
            (args.worktreePath.split("/").filter(Boolean).at(-1) ?? "unknown")
              .replace(/[^a-zA-Z0-9._-]/g, "-")
          }`,
          {
            path: worktreePath,
            branch,
            removed: registration.registered,
            removedAt: new Date().toISOString(),
          },
        );
        return { dataHandles: [handle] };
      },
    },
  }],
};
