/** Run Playwright with isolated browser provisioning and cleanup. @module */
import { z } from "npm:zod@4";

const ArgsSchema = z.object({
  expectedGitHead: z.string().regex(/^[0-9a-f]{40}$/),
});
const MAX_ARTIFACT_BYTES = 64 * 1024 * 1024;

type Handle = { name: string };
type Context = {
  signal: AbortSignal;
  repoDir: string;
  globalArgs: {
    projectDir: string;
    environment: Record<string, string>;
  };
  writeResource: (
    specName: string,
    name: string,
    data: Record<string, unknown>,
  ) => Promise<Handle>;
};

async function run(
  cwd: string,
  executable: string,
  args: string[],
  env: Record<string, string>,
  signal: AbortSignal,
) {
  const output = await new Deno.Command(executable, {
    args,
    cwd,
    env,
    clearEnv: true,
    signal,
    stdout: "piped",
    stderr: "piped",
  }).output();
  return {
    success: output.success,
    code: output.code,
    stdout: new TextDecoder().decode(output.stdout),
    stderr: new TextDecoder().decode(output.stderr),
  };
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

async function collectArtifacts(root: string, total = { bytes: 0 }) {
  const artifacts: Record<string, string> = {};
  if (!(await exists(root))) return artifacts;
  for await (const entry of Deno.readDir(root)) {
    const path = `${root}/${entry.name}`;
    if (entry.isDirectory) {
      const nested = await collectArtifacts(path, total);
      for (const [name, content] of Object.entries(nested)) {
        artifacts[`${entry.name}/${name}`] = content;
      }
    } else if (entry.isFile) {
      const file = await Deno.readFile(path);
      total.bytes += file.byteLength;
      if (total.bytes > MAX_ARTIFACT_BYTES) {
        throw new Error("Playwright artifacts exceed 64 MiB");
      }
      artifacts[entry.name] = file.toBase64();
    }
  }
  return artifacts;
}

export const extension = {
  type: "@funsaized/npm/project",
  resources: {
    playwrightLog: {
      description: "Playwright browser installation and test output",
      schema: z.object({
        output: z.string(),
        expectedGitHead: z.string(),
        gitHeadBefore: z.string(),
        gitHeadAfter: z.string(),
        cleanWorktreeAfter: z.boolean(),
        executionStatus: z.enum(["succeeded", "failed"]),
        recordedAt: z.string(),
      }),
      lifetime: "infinite" as const,
      garbageCollection: 200,
    },
    playwrightArtifacts: {
      description: "Base64-encoded Playwright failure artifacts keyed by path",
      schema: z.object({
        files: z.record(z.string(), z.string()),
        recordedAt: z.string(),
      }),
      lifetime: "infinite" as const,
      garbageCollection: 50,
    },
  },
  methods: [{
    runPlaywrightE2e: {
      description:
        "Install Chromium in a temporary cache, run E2E, preserve failures, and clean up",
      arguments: ArgsSchema,
      execute: async (args: z.infer<typeof ArgsSchema>, context: Context) => {
        const projectDir = await Deno.realPath(
          `${context.repoDir}/${context.globalArgs.projectDir}`,
        );
        const path = context.globalArgs.environment.PATH ??
          Deno.env.get("PATH");
        if (!path) throw new Error("PATH is required");
        const commandEnv = { PATH: path };
        const headBefore = await run(
          projectDir,
          "git",
          ["rev-parse", "HEAD"],
          commandEnv,
          context.signal,
        );
        if (!headBefore.success) throw new Error("Unable to read Git head");
        const gitHead = headBefore.stdout.trim();
        if (gitHead !== args.expectedGitHead) {
          throw new Error(
            `Git head changed: expected ${args.expectedGitHead}, got ${gitHead}`,
          );
        }
        const statusBefore = await run(
          projectDir,
          "git",
          ["status", "--porcelain"],
          commandEnv,
          context.signal,
        );
        if (!statusBefore.success) throw new Error("Unable to read Git status");
        if (statusBefore.stdout.trim()) throw new Error("Worktree is dirty");

        const cacheDir = await Deno.makeTempDir({
          prefix: "swamp-playwright-",
        });
        const env = {
          ...commandEnv,
          CI: "true",
          HOME: cacheDir,
          NPM_CONFIG_CACHE: `${cacheDir}/npm`,
          NPM_CONFIG_IGNORE_SCRIPTS: "true",
          PLAYWRIGHT_BROWSERS_PATH: cacheDir,
        };
        let output = "";
        let failure: Error | undefined;
        const handles: Handle[] = [];
        const artifactRoots = ["test-results", "playwright-report"];
        try {
          const install = await run(
            projectDir,
            "npm",
            ["exec", "--", "playwright", "install", "chromium"],
            env,
            context.signal,
          );
          output +=
            `$ npm exec -- playwright install chromium\n${install.stdout}${install.stderr}`;
          if (!install.success) {
            throw new Error(
              `Playwright browser install exited ${install.code}`,
            );
          }
          const test = await run(
            projectDir,
            "npm",
            ["run", "test:e2e"],
            env,
            context.signal,
          );
          output += `$ npm run test:e2e\n${test.stdout}${test.stderr}`;
          if (!test.success) throw new Error(`Playwright exited ${test.code}`);
        } catch (error) {
          failure = error instanceof Error ? error : new Error(String(error));
        } finally {
          try {
            const artifacts: Record<string, string> = {};
            for (const root of artifactRoots) {
              const collected = await collectArtifacts(`${projectDir}/${root}`);
              for (const [name, content] of Object.entries(collected)) {
                artifacts[`${root}/${name}`] = content;
              }
            }
            if (Object.keys(artifacts).length > 0) {
              handles.push(
                await context.writeResource(
                  "playwrightArtifacts",
                  `playwright-artifacts-${Date.now()}`,
                  { files: artifacts, recordedAt: new Date().toISOString() },
                ),
              );
            }
          } catch (error) {
            failure ??= error instanceof Error ? error : new Error(String(error));
          }
          for (const root of artifactRoots) {
            await Deno.remove(`${projectDir}/${root}`, { recursive: true })
              .catch(
                (error) => {
                  if (!(error instanceof Deno.errors.NotFound)) throw error;
                },
              );
          }
          const headAfter = await run(
            projectDir,
            "git",
            ["rev-parse", "HEAD"],
            commandEnv,
            context.signal,
          );
          const statusAfter = await run(
            projectDir,
            "git",
            ["status", "--porcelain"],
            commandEnv,
            context.signal,
          );
          const gitHeadAfter = headAfter.stdout.trim();
          const cleanWorktreeAfter = statusAfter.success &&
            !statusAfter.stdout.trim();
          if ((!headAfter.success || !statusAfter.success) && !failure) {
            failure = new Error("Unable to verify Git state after E2E");
          }
          if (gitHeadAfter !== gitHead && !failure) {
            failure = new Error(`Git head changed during E2E: ${gitHeadAfter}`);
          }
          if (!cleanWorktreeAfter && !failure) {
            failure = new Error("Worktree became dirty during E2E");
          }
          handles.push(
            await context.writeResource(
              "playwrightLog",
              `playwright-${Date.now()}`,
              {
                output,
                expectedGitHead: args.expectedGitHead,
                gitHeadBefore: gitHead,
                gitHeadAfter,
                cleanWorktreeAfter,
                executionStatus: failure ? "failed" : "succeeded",
                recordedAt: new Date().toISOString(),
              },
            ),
          );
          await Deno.remove(cacheDir, { recursive: true }).catch((error) => {
            if (!(error instanceof Deno.errors.NotFound)) throw error;
          });
        }
        if (failure) throw failure;
        return { dataHandles: handles };
      },
    },
  }],
};
