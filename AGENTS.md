<!-- BEGIN swamp managed section - DO NOT EDIT -->
# Project

This repository is managed with [swamp](https://github.com/swamp-club/swamp).

## Rules

1. **Search before you build.** When automating AWS, APIs, or any external service: (a) search community extensions with `swamp extension search <query>` — prefer `@swamp/*` official extensions first, (b) search local/installed types with `swamp model type search <query>`, (c) if a community extension exists, install it with `swamp extension pull <package>` instead of building from scratch, (d) extend an existing type if it covers the domain but lacks the method you need, (e) only create a custom extension model in `extensions/models/` as a last resort. Use the `swamp` skill for guidance. The `command/shell` model is ONLY for ad-hoc one-off shell commands, NEVER for wrapping CLI tools or building integrations.
2. **Extend, don't be clever.** When a model covers the domain but lacks the method you need, extend it with `export const extension` — don't bypass it with shell scripts, CLI tools, or multi-step hacks. One method, one purpose. Use `swamp model type describe <type> --json` to check available methods.
3. **Use the data model.** Once data exists in a model (via `lookup`, `start`, `sync`, etc.), reference it with CEL expressions. Don't re-fetch data that's already available.
4. **CEL expressions everywhere.** Wire models together with CEL expressions. Always prefer `data.latest("<name>", "<dataName>").attributes.<field>` over the deprecated `model.<name>.resource.<spec>.<instance>.attributes.<field>` pattern.
5. **Verify before destructive operations.** Always `swamp model get <name> --json` and verify resource IDs before running delete/stop/destroy methods.
6. **Prefer fan-out methods over loops.** When operating on multiple targets, use a single method that handles all targets internally (factory pattern) rather than looping N separate `swamp model method run` calls against the same model. Multiple parallel calls against the same model contend on the per-model lock, causing timeouts. A single fan-out method acquires the lock once and produces all outputs in one execution. Check `swamp model type describe` for methods that accept filters or produce multiple outputs.
7. **Extension npm deps are bundled, not lockfile-tracked.** Swamp's bundler inlines all npm packages (except zod) into extension bundles at bundle time. `deno.lock` and `package.json` do NOT cover extension model dependencies — this is by design. Always pin explicit versions in `npm:` import specifiers (e.g., `npm:lodash-es@4.17.21`).
8. **Reports for reusable data pipelines.** When the task involves building a repeatable pipeline to transform, aggregate, or analyze model output (security reports, cost analysis, compliance checks, summaries), create a report extension. Use the `swamp` skill for guidance.
9. **"Workflow" means a swamp workflow.** In this repository the word "workflow" (and "create/run/execute/validate/debug workflow", "automate", "orchestrate", "automated/nightly job") refers to a swamp workflow — a declarative YAML DAG of model-method steps authored via `swamp workflow create`. Load and follow the `swamp` skill for these requests. Do NOT interpret these as a request to build an agent task list, spin up worktrees, or schedule a cron/remote agent. Only use those orchestration mechanisms when the user explicitly names one (e.g. "task list", "subagent", "worktree", "cron", "remote agent") or explicitly asks you to do the work yourself step by step rather than author a swamp workflow.
10. **Use swamp, don't bypass it.** Always work through swamp commands — don't go around them with raw shell tools. Use `swamp data query` to find data, not `grep`/`find` on `.swamp/` files. Use model methods to interact with resources, not `curl`/`aws`/`gcloud`/`kubectl` when a model type already wraps that API — check with `swamp model type search`. Use `swamp help` for CLI discovery, not guesswork. Composing with swamp output is fine (e.g. piping `--json` through `jq`) — the anti-pattern is bypassing swamp entirely.
11. **Inspect reports after failures.** When a model method or workflow run fails, inspect its generated reports before retrying or changing definitions. Reports run even on failure and capture structured diagnostics — error messages, execution status, arguments, and data output pointers. Use `swamp report get @swamp/method-summary --model <model> --json` for method failures or `swamp report get @swamp/workflow-summary --workflow <workflow> --json` for workflow failures. Run `swamp help report get` to confirm current retrieval syntax.

## Skills

**IMPORTANT:** Always load swamp skills, even when in plan mode. The skills provide
essential context for working with this repository.

- `swamp` - Swamp CLI — models, workflows, data, vaults, extensions, publishing, repos, reports, issues, and troubleshooting
- `swamp-getting-started` - Interactive onboarding for new swamp users

## Getting Started

**IMPORTANT:** At the start of every conversation, run
`swamp model search --json`. If no models are returned (empty result), you MUST
immediately invoke the `swamp-getting-started` skill before doing anything else.
This walks new users through an interactive onboarding tutorial.

If models already exist, start by using the `swamp` skill to work with
swamp models.

## Commands

Use `swamp --help` to see available commands. For a machine-readable JSON
schema of the CLI (commands, options, arguments) intended for agent
consumption, run `swamp help [<command>...]` — e.g. `swamp help` returns
the full tree, and `swamp help model method run` scopes to a subtree.
<!-- END swamp managed section -->

# s11a.com

TanStack Start blog. React 19, Vite 8, Tailwind v4, Oxfmt/Oxlint. Hosted on Vercel via Nitro.

## Commands

Run from the repository root:

```bash
npm ci
npm run dev          # :3001
npm run check        # generate-routes + format + lint + typecheck
npm run build        # prerender → .output
```

Do not use prettier or eslint. Format with `oxfmt`, lint with `oxlint`.

## Layout

- `src/routes/` — file-based routes (`__root`, `index`, `about`, `articles/$slug`)
- `src/content/articles/` — MDX. Frontmatter `slug` is the URL, not the filename.
- `src/lib/article-metadata.ts` — Zod-validated registry
- `src/lib/seo.ts` — `head` helpers
- `src/lib/site.ts` — `SITE_ORIGIN`

There is no Gatsby app in this tree. Historical SOURCE lives in git history.

## Dependabot Review

When asked to review or merge a Dependabot PR:

1. Use `dependabot-prs` to discover candidates. The agent chooses one PR at a time.
2. Verify GitHub Actions passed for the current PR head SHA. Never reuse evidence from an older SHA.
3. Inspect the dependency diff and release notes. Reject unrelated or unsafe changes.
4. Create the isolated worktree at `.worktrees/dependabot-review` on branch `review/pr-<number>`, merge `origin/master` into it, then run `npm ci`, `npm run check`, and `npm run build`. Commit and push any resulting merge before collecting final evidence.
5. Start the app and use Playwright at desktop and mobile widths. Verify `/`, `/articles`, `/about`, and the newest article linked from `/articles`; fail on console errors, failed requests, broken navigation, overflow, or rendering defects.
6. If CI, build, or browser review fails because of the dependency update, diagnose and make the smallest fix on the PR branch, push it, wait for CI on the new SHA, and repeat all checks. Stop and report after two failed fix attempts or when the fix would broaden scope beyond compatibility with the update.
7. Only after all checks pass and the review worktree is clean, run `dependabot-review` with `pullRequest`, the exact `reviewedHeadSha`, and `worktreePath=.worktrees/dependabot-review`. The workflow uses `s11a-npm` to rerun inspect, lifecycle-denied ci, check, and build at that SHA before merge. Invoking it is the approval to merge and removes the matching worktree after success. Never call GitHub merge model methods directly.
8. If the PR head changes at any point, discard the prior evidence and restart from step 2.

Browser review may ignore the known TanStack query-stream console error containing `Cannot read properties of undefined (reading 'mutations')` while this site does not use TanStack Query. All other console errors remain failures. Remove this exception when TanStack Query is used.

## Content

Add an article by dropping an `.mdx` file in `src/content/articles/` with the frontmatter schema in `article-metadata.ts`. Prerender discovers linked routes via `crawlLinks`.
