/// <reference lib="deno.ns" />
import { extension } from "./git_worktree.ts";

const method = extension.methods[0].removeWorktree;

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
  await git(repo, "worktree", "add", "-b", "review", worktree);
  return { root, repo, worktree };
}

function execute(
  repo: string,
  worktreePath: string,
  expectedBranch = "review",
) {
  return method.execute(
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
