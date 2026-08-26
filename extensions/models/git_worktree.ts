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

const PrepareArgsSchema = z.object({
  pullNumbers: z.array(z.number().int().positive()).min(1),
  expectedHeadShas: z.array(z.string().regex(/^[0-9a-f]{40}$/)).min(1),
});

const RemovalArgsSchema = z.object({
  worktreePath: z.string().min(1),
  expectedBranch: z.string().min(1),
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
  const output = await new Deno.Command("git", {
    args,
    cwd,
    signal,
    stdout: "piped",
    stderr: "piped",
  }).output();
  const text = new TextDecoder().decode(
    output.success ? output.stdout : output.stderr,
  ).trim();
  if (!output.success) throw new Error(text || `git exited ${output.code}`);
  return text;
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
          if (
            await git(worktreePath, ["status", "--porcelain"], context.signal)
          ) {
            throw new Error(`Worktree is dirty: ${worktreePath}`);
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
          await git(
            worktreePath,
            [
              "merge",
              "--squash",
              `refs/swamp/dependabot/${pullRequest.number}`,
            ],
            context.signal,
          );
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
