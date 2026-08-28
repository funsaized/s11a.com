/// <reference lib="deno.ns" />
import { extension } from "./dependabot_merge.ts";

const method = extension.methods.find((entry) => entry.mergeDependabotPr)
  ?.mergeDependabotPr;
const inspectMethod = extension.methods.find((entry) =>
  entry.inspectDependabotPrs
)?.inspectDependabotPrs;
const batchMethod = extension.methods.find((entry) => entry.mergeDependabotPrs)
  ?.mergeDependabotPrs;
const validateMethod = extension.methods.find((entry) =>
  entry.validateDependabotPrs
)?.validateDependabotPrs;
const rerunMethod = extension.methods.find((entry) =>
  entry.rerunFailedWorkflowJobs
)?.rerunFailedWorkflowJobs;
const closeMethod = extension.methods.find((entry) => entry.closeDependabotPrs)
  ?.closeDependabotPrs;
if (
  !inspectMethod || !method || !batchMethod || !validateMethod ||
  !rerunMethod ||
  !closeMethod
) {
  throw new Error("Dependabot methods are missing");
}
const inspect = inspectMethod;
const mergeMethod = method;
const mergeBatchMethod = batchMethod;
const validate = validateMethod;
const rerun = rerunMethod;
const close = closeMethod;
const sha = "a".repeat(40);
const baseSha = "d".repeat(40);
const pull = {
  number: 1,
  state: "open",
  draft: false,
  user: { login: "dependabot[bot]" },
  base: { ref: "master", sha: baseSha },
  head: { sha },
  mergeable: true,
  mergeable_state: "clean",
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
    return await mergeMethod.execute(
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

Deno.test("inspects exact Dependabot heads into one queue", async () => {
  const originalFetch = globalThis.fetch;
  let queue: Record<string, unknown> | undefined;
  globalThis.fetch =
    (() => Promise.resolve(new Response(JSON.stringify(pull)))) as typeof fetch;

  try {
    await inspect.execute(
      { repo: "s11a.com", pullNumbers: [1] },
      {
        globalArgs: { token: "test", defaultOwner: "funsaized" },
        writeResource: (_spec, _name, data) => {
          queue = data;
          return Promise.resolve({ name: "dependabot-queue" });
        },
      },
    );
    if (!JSON.stringify(queue).includes(`"head":"${sha}"`)) {
      throw new Error("Queue is missing the exact inspected head");
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("reruns only failed workflow jobs", async () => {
  const originalFetch = globalThis.fetch;
  let request: { url: string; method?: string } | undefined;
  globalThis.fetch = ((url: string | URL | Request, init?: RequestInit) => {
    request = { url: String(url), method: init?.method };
    return Promise.resolve(new Response(null, { status: 201 }));
  }) as typeof fetch;
  try {
    await rerun.execute(
      { repo: "s11a.com", runId: 123 },
      {
        globalArgs: { token: "test", defaultOwner: "funsaized" },
        writeResource: () => Promise.resolve({ name: "unused" }),
      },
    );
    if (
      request?.method !== "POST" ||
      !request.url.endsWith("/actions/runs/123/rerun-failed-jobs")
    ) {
      throw new Error(
        "Failed jobs were not rerun through the guarded endpoint",
      );
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("closing Dependabot PRs is idempotent", async () => {
  const originalFetch = globalThis.fetch;
  const secondHead = "b".repeat(40);
  const responses = [
    { ...pull, state: "closed" },
    { ...pull, number: 2, head: { sha: secondHead } },
    { state: "closed" },
  ];
  let patches = 0;
  globalThis.fetch = ((_url: string | URL | Request, init?: RequestInit) => {
    if (init?.method === "PATCH") patches++;
    return Promise.resolve(new Response(JSON.stringify(responses.shift())));
  }) as typeof fetch;
  try {
    await close.execute(
      {
        repo: "s11a.com",
        pullRequests: [
          { number: 1, head: sha },
          { number: 2, head: secondHead },
        ],
      },
      {
        globalArgs: { token: "test", defaultOwner: "funsaized" },
        writeResource: () => Promise.resolve({ name: "unused" }),
      },
    );
    if (patches !== 1) throw new Error(`Expected one close, got ${patches}`);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("refuses a changed PR head before checking or merging", async () => {
  let message = "";
  try {
    await executeWith([{ ...pull, head: { sha: "b".repeat(40) } }]);
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  if (!message.includes("PR #1 head changed")) {
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
  if (
    !message.includes(
      "Required GitHub check 'validate' is missing or unsuccessful",
    )
  ) {
    throw new Error(`Unexpected result: ${message}`);
  }
});

Deno.test("allows neutral auxiliary checks but rejects failures", async () => {
  await executeWith([
    pull,
    {
      total_count: 2,
      check_runs: [
        { name: "validate", status: "completed", conclusion: "success" },
        { name: "preview", status: "completed", conclusion: "neutral" },
      ],
    },
    { state: "success", statuses: [] },
    { sha, merged: true, message: "merged" },
  ]);

  let message = "";
  try {
    await executeWith([
      pull,
      {
        total_count: 2,
        check_runs: [
          { name: "validate", status: "completed", conclusion: "success" },
          { name: "preview", status: "completed", conclusion: "failure" },
        ],
      },
    ]);
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  if (!message.includes("GitHub check 'preview' concluded failure")) {
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

Deno.test("validates every PR before starting a batch merge", async () => {
  const originalFetch = globalThis.fetch;
  const responses = [
    { object: { sha: baseSha } },
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
    { ...pull, number: 2, head: { sha: "c".repeat(40) } },
  ];
  let mergeRequested = false;
  globalThis.fetch = ((url: string | URL | Request) => {
    if (String(url).endsWith("/merge")) mergeRequested = true;
    return Promise.resolve(new Response(JSON.stringify(responses.shift())));
  }) as typeof fetch;

  try {
    let message = "";
    try {
      await mergeBatchMethod.execute(
        {
          repo: "s11a.com",
          baseSha,
          pullRequests: [
            { number: 1, head: sha, tree: "1".repeat(40) },
            { number: 2, head: "b".repeat(40), tree: "2".repeat(40) },
          ],
        },
        {
          globalArgs: { token: "test", defaultOwner: "funsaized" },
          writeResource: () => Promise.resolve({ name: "merge" }),
        },
      );
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    if (!message.includes("PR #2 head changed") || mergeRequested) {
      throw new Error(`Unexpected result: ${message}`);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("validates an aggregate queue without mutating GitHub", async () => {
  const originalFetch = globalThis.fetch;
  const methods: string[] = [];
  const responses = [
    { object: { sha: baseSha } },
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
  ];
  globalThis.fetch = ((_url: string | URL | Request, init?: RequestInit) => {
    methods.push(init?.method ?? "GET");
    return Promise.resolve(new Response(JSON.stringify(responses.shift())));
  }) as typeof fetch;
  try {
    await validate.execute(
      { repo: "s11a.com", baseSha, pullRequests: [{ number: 1, head: sha }] },
      {
        globalArgs: { token: "test", defaultOwner: "funsaized" },
        writeResource: () => Promise.resolve({ name: "unused" }),
      },
    );
    if (methods.some((method) => method !== "GET")) {
      throw new Error("Validation mutated GitHub");
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("batch merges only onto the tested base and tree sequence", async () => {
  const originalFetch = globalThis.fetch;
  const secondHead = "b".repeat(40);
  const firstMerge = "e".repeat(40);
  const secondMerge = "f".repeat(40);
  const firstTree = "1".repeat(40);
  const secondTree = "2".repeat(40);
  const successfulChecks = {
    total_count: 1,
    check_runs: [{
      name: "validate",
      status: "completed",
      conclusion: "success",
    }],
  };
  const responses = [
    { object: { sha: baseSha } },
    pull,
    successfulChecks,
    { state: "success", statuses: [] },
    { ...pull, number: 2, head: { sha: secondHead } },
    successfulChecks,
    { state: "success", statuses: [] },
    { object: { sha: baseSha } },
    { sha: firstMerge, merged: true, message: "merged" },
    { tree: { sha: firstTree } },
    { object: { sha: firstMerge } },
    { sha: secondMerge, merged: true, message: "merged" },
    { tree: { sha: secondTree } },
  ];
  const writes: string[] = [];
  globalThis.fetch = (() =>
    Promise.resolve(
      new Response(JSON.stringify(responses.shift())),
    )) as typeof fetch;

  try {
    await mergeBatchMethod.execute(
      {
        repo: "s11a.com",
        baseSha,
        pullRequests: [
          { number: 1, head: sha, tree: firstTree },
          { number: 2, head: secondHead, tree: secondTree },
        ],
      },
      {
        globalArgs: { token: "test", defaultOwner: "funsaized" },
        writeResource: (_spec, name) => {
          writes.push(name);
          return Promise.resolve({ name });
        },
      },
    );
    if (responses.length !== 0 || writes.join(",") !== "1,2") {
      throw new Error("Batch did not verify and record both squash trees");
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("stops when GitHub produces an unexpected squash tree", async () => {
  const originalFetch = globalThis.fetch;
  const expectedTree = "1".repeat(40);
  const responses = [
    { object: { sha: baseSha } },
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
    { object: { sha: baseSha } },
    { sha: "e".repeat(40), merged: true, message: "merged" },
    { tree: { sha: "2".repeat(40) } },
  ];
  globalThis.fetch = (() =>
    Promise.resolve(
      new Response(JSON.stringify(responses.shift())),
    )) as typeof fetch;

  try {
    let message = "";
    try {
      await mergeBatchMethod.execute(
        {
          repo: "s11a.com",
          baseSha,
          pullRequests: [{ number: 1, head: sha, tree: expectedTree }],
        },
        {
          globalArgs: { token: "test", defaultOwner: "funsaized" },
          writeResource: () => Promise.resolve({ name: "merge" }),
        },
      );
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    if (!message.includes(`expected ${expectedTree}`)) {
      throw new Error(`Unexpected result: ${message}`);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});
