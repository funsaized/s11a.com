/// <reference lib="deno.ns" />
import { extension } from "./npm_playwright.ts";

Deno.test("registers one bounded Playwright method", () => {
  const method = extension.methods[0]?.runPlaywrightE2e;
  if (!method) throw new Error("runPlaywrightE2e is missing");
  method.arguments.parse({ expectedGitHead: "a".repeat(40) });
});

Deno.test("removes browser cache and test artifacts after E2E", async () => {
  const root = await Deno.makeTempDir();
  const project = `${root}/project`;
  const bin = `${root}/bin`;
  const cacheRecord = `${root}/cache-path`;
  const secretRecord = `${root}/secret`;
  await Deno.mkdir(project);
  await Deno.mkdir(bin);
  try {
    const git = async (...args: string[]) => {
      const output = await new Deno.Command("git", {
        args,
        cwd: project,
        stdout: "null",
        stderr: "piped",
      }).output();
      if (!output.success) {
        throw new Error(new TextDecoder().decode(output.stderr));
      }
    };
    await git("init", "-b", "master");
    await git("config", "user.name", "Test");
    await git("config", "user.email", "test@example.com");
    await Deno.writeTextFile(`${project}/package.json`, "{}\n");
    await git("add", "package.json");
    await git("commit", "-m", "initial");
    const headOutput = await new Deno.Command("git", {
      args: ["rev-parse", "HEAD"],
      cwd: project,
      stdout: "piped",
    }).output();
    const head = new TextDecoder().decode(headOutput.stdout).trim();

    const npm = `${bin}/npm`;
    await Deno.writeTextFile(
      npm,
      `#!/bin/sh\nprintf '%s' "$PLAYWRIGHT_BROWSERS_PATH" > "${cacheRecord}"\nprintf '%s' "$SWAMP_TEST_SECRET" > "${secretRecord}"\nmkdir -p "${project}/test-results"\nprintf trace > "${project}/test-results/trace.zip"\n`,
    );
    await Deno.chmod(npm, 0o755);
    const outputs: Array<{ spec: string; text: string }> = [];
    const method = extension.methods[0]!.runPlaywrightE2e;
    Deno.env.set("SWAMP_TEST_SECRET", "must-not-leak");
    await method.execute(
      { expectedGitHead: head },
      {
        signal: new AbortController().signal,
        repoDir: root,
        globalArgs: {
          projectDir: "project",
          environment: { PATH: `${bin}:${Deno.env.get("PATH") ?? ""}` },
        },
        writeResource: (spec, name, data) => {
          outputs.push({ spec, text: JSON.stringify(data) });
          return Promise.resolve({ name });
        },
      },
    );
    Deno.env.delete("SWAMP_TEST_SECRET");

    const cache = await Deno.readTextFile(cacheRecord);
    try {
      await Deno.stat(cache);
      throw new Error("Browser cache was not removed");
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) throw error;
    }
    if (
      await Array.fromAsync(Deno.readDir(project)).then((entries) =>
        entries.some((entry) => entry.name === "test-results")
      )
    ) {
      throw new Error("Test artifacts were not removed");
    }
    if (
      !outputs.some(({ spec, text }) =>
        spec === "playwrightArtifacts" && text.includes("trace.zip")
      )
    ) {
      throw new Error("Test artifacts were not preserved");
    }
    if (await Deno.readTextFile(secretRecord)) {
      throw new Error("Host environment leaked into Playwright");
    }
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});
