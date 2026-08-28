/** Safely merge an already-reviewed Dependabot pull request. @module */
import { z } from "npm:zod@4";

const PullSchema = z.object({
  number: z.number().int().positive(),
  state: z.literal("open"),
  draft: z.literal(false),
  user: z.object({ login: z.literal("dependabot[bot]") }),
  base: z.object({
    ref: z.literal("master"),
    sha: z.string().regex(/^[0-9a-f]{40}$/),
  }),
  head: z.object({ sha: z.string().regex(/^[0-9a-f]{40}$/) }),
  mergeable: z.boolean().nullable(),
  mergeable_state: z.string(),
});
const ClosablePullSchema = PullSchema.extend({
  state: z.enum(["open", "closed"]),
});

const ChecksSchema = z.object({
  total_count: z.number().int(),
  check_runs: z.array(z.object({
    name: z.string(),
    status: z.literal("completed"),
    conclusion: z.enum([
      "success",
      "failure",
      "neutral",
      "cancelled",
      "skipped",
      "timed_out",
      "action_required",
      "stale",
    ]),
  })),
});

const StatusSchema = z.object({
  state: z.enum(["success", "pending", "failure", "error"]),
  statuses: z.array(z.unknown()),
});

const MergeSchema = z.object({
  sha: z.string(),
  merged: z.boolean(),
  message: z.string(),
});

const PullRequestInputSchema = z.object({
  number: z.number().int().positive(),
  head: z.string().regex(/^[0-9a-f]{40}$/),
});

const BatchPullRequestInputSchema = PullRequestInputSchema.extend({
  tree: z.string().regex(/^[0-9a-f]{40}$/),
});

const RefSchema = z.object({
  object: z.object({ sha: z.string().regex(/^[0-9a-f]{40}$/) }),
});

const CommitSchema = z.object({
  tree: z.object({ sha: z.string().regex(/^[0-9a-f]{40}$/) }),
});

const QueueSchema = z.object({
  repo: z.string(),
  pullRequests: z.array(PullRequestInputSchema),
  inspectedAt: z.string(),
});

type Context = {
  globalArgs: { token?: string; defaultOwner?: string };
  writeResource: (
    specName: string,
    name: string,
    data: Record<string, unknown>,
  ) => Promise<{ name: string }>;
};

async function github<T>(
  path: string,
  token: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...init?.headers,
    },
  });
  const body: unknown = await response.json();
  if (!response.ok) {
    const message = z.object({ message: z.string() }).safeParse(body);
    throw new Error(
      message.success
        ? message.data.message
        : `GitHub returned ${response.status}`,
    );
  }
  return schema.parse(body);
}

async function githubEmpty(path: string, token: string, init: RequestInit) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...init.headers,
    },
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => ({}));
    const message = z.object({ message: z.string() }).safeParse(body);
    throw new Error(
      message.success
        ? message.data.message
        : `GitHub returned ${response.status}`,
    );
  }
}

async function mergeDependabotPrs(
  repo: string,
  pullRequests: Array<
    z.infer<typeof PullRequestInputSchema> & { tree?: string }
  >,
  context: Context,
  expectedBaseSha?: string,
  validateOnly = false,
) {
  const { token, defaultOwner: owner } = context.globalArgs;
  if (!token || !owner) {
    throw new Error("GitHub token and defaultOwner are required");
  }

  if (
    new Set(pullRequests.map(({ number }) => number)).size !==
      pullRequests.length
  ) {
    throw new Error("Duplicate pull request numbers are not allowed");
  }

  const root = `/repos/${encodeURIComponent(owner)}/${
    encodeURIComponent(repo)
  }`;
  let expectedBranchHead = expectedBaseSha;
  if (expectedBranchHead) {
    const ref = await github(
      `${root}/git/ref/heads/master`,
      token,
      RefSchema,
    );
    if (ref.object.sha !== expectedBranchHead) {
      throw new Error(
        `Base branch changed: expected ${expectedBranchHead}, got ${ref.object.sha}`,
      );
    }
  }

  for (const pullRequest of pullRequests) {
    const pull = await github(
      `${root}/pulls/${pullRequest.number}`,
      token,
      PullSchema,
    );
    if (pull.head.sha !== pullRequest.head) {
      throw new Error(
        `PR #${pullRequest.number} head changed: expected ${pullRequest.head}, got ${pull.head.sha}`,
      );
    }
    if (expectedBaseSha && pull.base.sha !== expectedBaseSha) {
      throw new Error(
        `PR #${pullRequest.number} base changed: expected ${expectedBaseSha}, got ${pull.base.sha}`,
      );
    }
    if (pull.mergeable !== true) {
      throw new Error(
        `PR #${pullRequest.number} is not currently mergeable (${pull.mergeable_state})`,
      );
    }

    const checks = await github(
      `${root}/commits/${pull.head.sha}/check-runs?per_page=100`,
      token,
      ChecksSchema,
    );
    if (checks.total_count === 0) {
      throw new Error(`PR #${pullRequest.number} has no GitHub check runs`);
    }
    if (checks.total_count !== checks.check_runs.length) {
      throw new Error(
        `Not all GitHub check runs for PR #${pullRequest.number} were inspected`,
      );
    }
    if (
      !checks.check_runs.some((check) =>
        check.name === "validate" && check.conclusion === "success"
      )
    ) {
      throw new Error(
        `Required GitHub check 'validate' is missing or unsuccessful for PR #${pullRequest.number}`,
      );
    }
    const failedCheck = checks.check_runs.find((check) =>
      !["success", "neutral", "skipped"].includes(check.conclusion)
    );
    if (failedCheck) {
      throw new Error(
        `GitHub check '${failedCheck.name}' concluded ${failedCheck.conclusion} for PR #${pullRequest.number}`,
      );
    }

    const status = await github(
      `${root}/commits/${pull.head.sha}/status`,
      token,
      StatusSchema,
    );
    if (status.statuses.length > 0 && status.state !== "success") {
      throw new Error(
        `Combined commit status for PR #${pullRequest.number} is ${status.state}`,
      );
    }
  }

  if (validateOnly) return { dataHandles: [] };

  const dataHandles = [];
  for (const pullRequest of pullRequests) {
    if (expectedBranchHead) {
      const ref = await github(
        `${root}/git/ref/heads/master`,
        token,
        RefSchema,
      );
      if (ref.object.sha !== expectedBranchHead) {
        throw new Error(
          `Base branch changed before PR #${pullRequest.number}: expected ${expectedBranchHead}, got ${ref.object.sha}`,
        );
      }
    }

    const merged = await github(
      `${root}/pulls/${pullRequest.number}/merge`,
      token,
      MergeSchema,
      {
        method: "PUT",
        body: JSON.stringify({
          sha: pullRequest.head,
          merge_method: "squash",
        }),
      },
    );
    if (!merged.merged) throw new Error(merged.message);
    if (pullRequest.tree) {
      const commit = await github(
        `${root}/git/commits/${merged.sha}`,
        token,
        CommitSchema,
      );
      if (commit.tree.sha !== pullRequest.tree) {
        throw new Error(
          `PR #${pullRequest.number} produced tree ${commit.tree.sha}, expected ${pullRequest.tree}`,
        );
      }
    }
    expectedBranchHead = merged.sha;

    dataHandles.push(
      await context.writeResource(
        "merge",
        String(pullRequest.number),
        {
          ...merged,
          owner,
          repo,
          base: "master",
          head: pullRequest.head,
          mergedAt: new Date().toISOString(),
        },
      ),
    );
  }
  return { dataHandles };
}

/** Adds an exact-SHA, CI-gated Dependabot merge method. */
export const extension = {
  type: "@hivemq/github/merge",
  resources: {
    dependabotQueue: {
      description: "Exact heads for eligible open Dependabot pull requests",
      schema: QueueSchema,
      lifetime: "infinite" as const,
      garbageCollection: 200,
    },
  },
  methods: [{
    inspectDependabotPrs: {
      description:
        "Resolve open Dependabot pull request numbers to their exact head SHAs",
      arguments: z.object({
        repo: z.string().min(1),
        pullNumbers: z.array(z.number().int().positive()),
      }),
      execute: async (
        args: { repo: string; pullNumbers: number[] },
        context: Context,
      ) => {
        const { token, defaultOwner: owner } = context.globalArgs;
        if (!token || !owner) {
          throw new Error("GitHub token and defaultOwner are required");
        }
        if (new Set(args.pullNumbers).size !== args.pullNumbers.length) {
          throw new Error("Duplicate pull request numbers are not allowed");
        }

        const root = `/repos/${encodeURIComponent(owner)}/${
          encodeURIComponent(args.repo)
        }`;
        const pullRequests = [];
        for (const number of args.pullNumbers.toSorted((a, b) => a - b)) {
          const pull = await github(
            `${root}/pulls/${number}`,
            token,
            PullSchema,
          );
          if (pull.number !== number) {
            throw new Error(
              `GitHub returned PR #${pull.number} for requested #${number}`,
            );
          }
          pullRequests.push({ number, head: pull.head.sha });
        }

        const handle = await context.writeResource(
          "dependabotQueue",
          "dependabot-queue",
          {
            repo: args.repo,
            pullRequests,
            inspectedAt: new Date().toISOString(),
          },
        );
        return { dataHandles: [handle] };
      },
    },
  }, {
    rerunFailedWorkflowJobs: {
      description: "Rerun only failed jobs in one GitHub Actions workflow run",
      arguments: z.object({
        repo: z.string().min(1),
        runId: z.number().int().positive(),
      }),
      execute: async (
        args: { repo: string; runId: number },
        context: Context,
      ) => {
        const { token, defaultOwner: owner } = context.globalArgs;
        if (!token || !owner) {
          throw new Error("GitHub token and defaultOwner are required");
        }
        await githubEmpty(
          `/repos/${encodeURIComponent(owner)}/${
            encodeURIComponent(args.repo)
          }/actions/runs/${args.runId}/rerun-failed-jobs`,
          token,
          { method: "POST" },
        );
        return { dataHandles: [] };
      },
    },
  }, {
    validateDependabotPrs: {
      description:
        "Validate every exact Dependabot head, base, and required GitHub check without mutation",
      arguments: z.object({
        repo: z.string().min(1),
        baseSha: z.string().regex(/^[0-9a-f]{40}$/),
        pullRequests: z.array(PullRequestInputSchema).min(1),
      }),
      execute: async (
        args: {
          repo: string;
          baseSha: string;
          pullRequests: z.infer<typeof PullRequestInputSchema>[];
        },
        context: Context,
      ) =>
        mergeDependabotPrs(
          args.repo,
          args.pullRequests,
          context,
          args.baseSha,
          true,
        ),
    },
  }, {
    closeDependabotPrs: {
      description: "Close Dependabot PRs superseded by the published aggregate",
      arguments: z.object({
        repo: z.string().min(1),
        pullRequests: z.array(PullRequestInputSchema).min(1),
      }),
      execute: async (
        args: {
          repo: string;
          pullRequests: z.infer<typeof PullRequestInputSchema>[];
        },
        context: Context,
      ) => {
        const { token, defaultOwner: owner } = context.globalArgs;
        if (!token || !owner) {
          throw new Error("GitHub token and defaultOwner are required");
        }
        const root = `/repos/${encodeURIComponent(owner)}/${
          encodeURIComponent(args.repo)
        }`;
        const openPullRequests = [];
        for (const candidate of args.pullRequests) {
          const pull = await github(
            `${root}/pulls/${candidate.number}`,
            token,
            ClosablePullSchema,
          );
          if (pull.head.sha !== candidate.head) {
            throw new Error(
              `PR #${candidate.number} head changed before close`,
            );
          }
          if (pull.state === "open") openPullRequests.push(candidate);
        }
        for (const candidate of openPullRequests) {
          await github(
            `${root}/pulls/${candidate.number}`,
            token,
            z.object({ state: z.literal("closed") }),
            { method: "PATCH", body: JSON.stringify({ state: "closed" }) },
          );
        }
        return { dataHandles: [] };
      },
    },
  }, {
    mergeDependabotPr: {
      description:
        "Squash a reviewed Dependabot PR only if its exact head SHA still has passing checks",
      arguments: z.object({
        repo: z.string().min(1),
        pullNumber: z.number().int().positive(),
        expectedHeadSha: z.string().regex(/^[0-9a-f]{40}$/),
      }),
      execute: async (
        args: { repo: string; pullNumber: number; expectedHeadSha: string },
        context: Context,
      ) =>
        mergeDependabotPrs(args.repo, [{
          number: args.pullNumber,
          head: args.expectedHeadSha,
        }], context),
    },
  }, {
    mergeDependabotPrs: {
      description:
        "Squash all reviewed Dependabot PRs after validating every exact head and check run",
      arguments: z.object({
        repo: z.string().min(1),
        baseSha: z.string().regex(/^[0-9a-f]{40}$/),
        pullRequests: z.array(BatchPullRequestInputSchema).min(1),
      }),
      execute: async (
        args: {
          repo: string;
          baseSha: string;
          pullRequests: z.infer<typeof BatchPullRequestInputSchema>[];
        },
        context: Context,
      ) =>
        mergeDependabotPrs(
          args.repo,
          args.pullRequests,
          context,
          args.baseSha,
        ),
    },
  }],
};
