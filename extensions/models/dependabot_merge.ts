/** Safely merge an already-reviewed Dependabot pull request. @module */
import { z } from "npm:zod@4";

const PullSchema = z.object({
  state: z.literal("open"),
  draft: z.literal(false),
  user: z.object({ login: z.literal("dependabot[bot]") }),
  base: z.object({ ref: z.literal("master") }),
  head: z.object({ sha: z.string() }),
});

const ChecksSchema = z.object({
  total_count: z.number().int(),
  check_runs: z.array(z.object({
    name: z.string(),
    status: z.literal("completed"),
    conclusion: z.literal("success"),
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

/** Adds an exact-SHA, CI-gated Dependabot merge method. */
export const extension = {
  type: "@hivemq/github/merge",
  methods: [{
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
        context: {
          globalArgs: { token?: string; defaultOwner?: string };
          writeResource: (
            specName: string,
            name: string,
            data: Record<string, unknown>,
          ) => Promise<{ name: string }>;
        },
      ) => {
        const { token, defaultOwner: owner } = context.globalArgs;
        if (!token || !owner) {
          throw new Error("GitHub token and defaultOwner are required");
        }

        const root = `/repos/${encodeURIComponent(owner)}/${
          encodeURIComponent(args.repo)
        }`;
        const pull = await github(
          `${root}/pulls/${args.pullNumber}`,
          token,
          PullSchema,
        );
        if (pull.head.sha !== args.expectedHeadSha) {
          throw new Error(
            `PR head changed: expected ${args.expectedHeadSha}, got ${pull.head.sha}`,
          );
        }

        const checks = await github(
          `${root}/commits/${pull.head.sha}/check-runs?per_page=100`,
          token,
          ChecksSchema,
        );
        if (checks.total_count === 0) {
          throw new Error("PR has no GitHub check runs");
        }
        if (checks.total_count !== checks.check_runs.length) {
          throw new Error("Not all GitHub check runs were inspected");
        }
        if (!checks.check_runs.some((check) => check.name === "validate")) {
          throw new Error("Required GitHub check 'validate' is missing");
        }

        const status = await github(
          `${root}/commits/${pull.head.sha}/status`,
          token,
          StatusSchema,
        );
        if (status.statuses.length > 0 && status.state !== "success") {
          throw new Error(`Combined commit status is ${status.state}`);
        }

        const merged = await github(
          `${root}/pulls/${args.pullNumber}/merge`,
          token,
          MergeSchema,
          {
            method: "PUT",
            body: JSON.stringify({
              sha: pull.head.sha,
              merge_method: "squash",
            }),
          },
        );
        if (!merged.merged) throw new Error(merged.message);

        const handle = await context.writeResource(
          "merge",
          String(args.pullNumber),
          {
            ...merged,
            owner,
            repo: args.repo,
            base: "master",
            head: pull.head.sha,
            mergedAt: new Date().toISOString(),
          },
        );
        return { dataHandles: [handle] };
      },
    },
  }],
};
