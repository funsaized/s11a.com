/// <reference lib="deno.ns" />
import { extension } from "./git_worktree.ts";

const prepareMethod = extension.methods.find((entry) =>
  entry.prepareDependabotWorktree
)?.prepareDependabotWorktree;
const method = extension.methods.find((entry) => entry.removeWorktree)
  ?.removeWorktree;
if (!prepareMethod || !method) throw new Error("Worktree methods are missing");
const prepare = prepareMethod;
const remove = method;

async function git(cwd: string, ...args: string[]) {
  const output = await new Deno.Command("git", {
    args,
    cwd,
    stdout: "piped",
    stderr: "piped",
  }).output();
  if (!output.success) {
    throw new Error(new TextDecoder().decode(output.stderr));
  }
  return new TextDecoder().decode(output.stdout).trim();
}

async function fixture() {
  const root = await Deno.makeTempDir();
  const repo = `${root}/repo`;
  const worktree = `${root}/review`;
  await Deno.mkdir(repo);
  await git(repo, "init", "-b", "master");
  await git(repo, "config", "user.name", "Test");
  await git(repo, "config", "user.email", "test@example.com");
  await Deno.writeTextFile(`${repo}/README.md`, "test\n");
  await git(repo, "add", "README.md");
  await git(repo, "commit", "-m", "initial");
  await git(repo, "worktree", "add", "-b", "cleanup-review", worktree);
  return { root, repo, worktree };
}

function execute(
  repo: string,
  worktreePath: string,
  expectedBranch = "cleanup-review",
) {
  return remove.execute(
    { worktreePath, expectedBranch },
    {
      signal: new AbortController().signal,
      globalArgs: { repoPath: repo },
      writeResource: () => Promise.resolve({ name: "removal" }),
    },
  );
}

Deno.test("removes a clean registered secondary worktree", async () => {
  const { root, repo, worktree } = await fixture();
  try {
    await execute(repo, worktree);
    try {
      await Deno.stat(worktree);
      throw new Error("Worktree still exists");
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) throw error;
    }
    await execute(repo, worktree);
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});

Deno.test("refuses to remove the primary worktree", async () => {
  const { root, repo } = await fixture();
  try {
    let message = "";
    try {
      await execute(repo, repo, "master");
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    if (!message.includes("primary repository worktree")) {
      throw new Error(`Unexpected result: ${message}`);
    }
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});

Deno.test("refuses to remove a dirty worktree", async () => {
  const { root, repo, worktree } = await fixture();
  try {
    await Deno.writeTextFile(`${worktree}/dirty.txt`, "keep\n");
    let message = "";
    try {
      await execute(repo, worktree);
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    if (!message.includes("Worktree is dirty")) {
      throw new Error(`Unexpected result: ${message}`);
    }
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});

Deno.test("reports a registered detached worktree", async () => {
  const { root, repo, worktree } = await fixture();
  try {
    await git(worktree, "checkout", "--detach");
    let message = "";
    try {
      await execute(repo, worktree);
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    if (!message.includes("detached HEAD")) {
      throw new Error(`Unexpected result: ${message}`);
    }
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});

Deno.test("prepares an aggregate worktree from an exact PR head", async () => {
  const { root, repo } = await fixture();
  const remote = `${root}/remote.git`;
  const worktree = `${repo}/.worktrees/dependabot-review`;
  let aggregate: Record<string, unknown> | undefined;
  try {
    await git(root, "init", "--bare", remote);
    await git(repo, "remote", "add", "origin", remote);
    await git(repo, "push", "origin", "master");
    await git(repo, "checkout", "-b", "dependency-update");
    await Deno.writeTextFile(`${repo}/dependency.txt`, "updated\n");
    await git(repo, "add", "dependency.txt");
    await git(repo, "commit", "-m", "dependency update");
    const head = await git(repo, "rev-parse", "HEAD");
    await git(repo, "push", "origin", "HEAD:refs/pull/1/head");
    await git(repo, "checkout", "master");

    await prepare.execute(
      { pullNumbers: [1], expectedHeadShas: [head] },
      {
        signal: new AbortController().signal,
        globalArgs: { repoPath: repo },
        writeResource: (_spec, _name, data) => {
          aggregate = data;
          return Promise.resolve({ name: "aggregate" });
        },
      },
    );

    if (
      (await git(worktree, "branch", "--show-current")) !== "review/dependabot"
    ) {
      throw new Error("Aggregate worktree uses the wrong branch");
    }
    if (
      (await Deno.readTextFile(`${worktree}/dependency.txt`)) !== "updated\n"
    ) {
      throw new Error("Aggregate worktree is missing the PR change");
    }
    const tree = await git(worktree, "rev-parse", "HEAD^{tree}");
    if (!JSON.stringify(aggregate).includes(`"tree":"${tree}"`)) {
      throw new Error("Aggregate resource is missing the tested squash tree");
    }
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});
