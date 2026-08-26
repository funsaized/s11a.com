/** Safe Git worktree cleanup for completed review workflows. @module */
import { z } from "npm:zod@4";

const RemovalSchema = z.object({
  path: z.string(),
  branch: z.string(),
  removed: z.boolean(),
  removedAt: z.string(),
});

const ArgsSchema = z.object({
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

export const extension = {
  type: "@swamp/git",
  resources: {
    worktreeRemoval: {
      description: "Result of safely removing a Git worktree",
      schema: RemovalSchema,
      lifetime: "infinite" as const,
      garbageCollection: 200,
    },
  },
  methods: [{
    removeWorktree: {
      description:
        "Remove a registered clean secondary worktree, or record a no-op when it is already absent",
      arguments: ArgsSchema,
      execute: async (args: z.infer<typeof ArgsSchema>, context: Context) => {
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

        const entries = (await git(
          repoPath,
          ["worktree", "list", "--porcelain"],
          context.signal,
        )).split("\n\n");
        const entry = entries.find((item) =>
          item.split("\n").includes(`worktree ${worktreePath}`)
        );
        const branch = entry?.split("\n").find((line) =>
          line.startsWith("branch ")
        )?.slice(7) ?? "";

        if (!entry && pathExists) {
          throw new Error(`${worktreePath} is not a registered Git worktree`);
        }
        if (entry && !pathExists) {
          throw new Error(`${worktreePath} is registered but missing on disk`);
        }
        if (entry) {
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
            removed: Boolean(entry),
            removedAt: new Date().toISOString(),
          },
        );
        return { dataHandles: [handle] };
      },
    },
  }],
};
