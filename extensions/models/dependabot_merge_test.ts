/// <reference lib="deno.ns" />
import { extension } from "./dependabot_merge.ts";

const method = extension.methods[0].mergeDependabotPr;
const sha = "a".repeat(40);
const pull = {
  state: "open",
  draft: false,
  user: { login: "dependabot[bot]" },
  base: { ref: "master" },
  head: { sha },
};

async function executeWith(
  responses: unknown[],
  onRequest?: (url: string, init?: RequestInit) => void,
) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = ((url: string | URL | Request, init?: RequestInit) => {
    onRequest?.(String(url), init);
    return Promise.resolve(new Response(JSON.stringify(responses.shift())));
  }) as typeof fetch;

  try {
    return await method.execute(
      { repo: "s11a.com", pullNumber: 1, expectedHeadSha: sha },
      {
        globalArgs: { token: "test", defaultOwner: "funsaized" },
        writeResource: () => Promise.resolve({ name: "merge" }),
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
}

Deno.test("refuses a changed PR head before checking or merging", async () => {
  let message = "";
  try {
    await executeWith([{ ...pull, head: { sha: "b".repeat(40) } }]);
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  if (!message.includes("PR head changed")) {
    throw new Error(`Unexpected result: ${message}`);
  }
});

Deno.test("requires the validate check", async () => {
  let message = "";
  try {
    await executeWith([
      pull,
      {
        total_count: 1,
        check_runs: [{
          name: "unrelated",
          status: "completed",
          conclusion: "success",
        }],
      },
    ]);
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  if (!message.includes("Required GitHub check 'validate' is missing")) {
    throw new Error(`Unexpected result: ${message}`);
  }
});

Deno.test("merges only after successful checks and status", async () => {
  let mergeRequest: RequestInit | undefined;
  await executeWith(
    [
      pull,
      {
        total_count: 1,
        check_runs: [{
          name: "validate",
          status: "completed",
          conclusion: "success",
        }],
      },
      { state: "success", statuses: [] },
      { sha, merged: true, message: "merged" },
    ],
    (url, init) => {
      if (url.endsWith("/merge")) mergeRequest = init;
    },
  );

  if (mergeRequest?.method !== "PUT") {
    throw new Error("Merge request was not a PUT");
  }
  if (mergeRequest.body !== JSON.stringify({ sha, merge_method: "squash" })) {
    throw new Error("Merge request was not SHA-guarded squash");
  }
});
