# Outline: Building a Personal Development Cloud on Tailscale

Planning document for a blog post. Not the published article.

The [reference architecture gist](https://gist.github.com/funsaized/43d6f7bf40d52113616880ed85663560) is the cookbook. This post is the *why*: the constraints, the mental model, and the method that produced that architecture.

---

## Intent

Write a first-person methodology piece about turning a Mac mini into the always-on hub of a private development cloud, with a Linux GPU workstation and a Linux laptop as peripheral compute, all over Tailscale.

The reader should leave with a transferable approach, not a pile of hostnames. After the post they should be able to answer:

1. What problem does a "personal development cloud" actually solve?
2. Why Tailscale is the substrate, not just a VPN.
3. How public DNS, private routing, and loopback apps fit together without opening the internet.
4. How the same pattern repeats when a second host joins.
5. Where the gist takes over if they want to build it.

**This post is not** a Caddyfile tutorial, an ACL dump, or a copy of the gist in prose.

---

## Working title and frontmatter

**Title options** (pick one before drafting):

1. **A Private Development Cloud on Tailscale** — plain, searchable. Preferred if the post should rank for the setup.
2. **Private by Routing** — sharper, more thesis-led. Preferred if the post should feel like the Zed-config piece.
3. **How I Turned a Mac mini Into a Private Development Cloud** — matches the gist. Fine, but it undersells the methodology.

Recommendation: **Private by Routing: How I Built a Personal Development Cloud**.

```yaml
title: "Private by Routing: How I Built a Personal Development Cloud"
slug: private-development-cloud-tailscale
excerpt: >-
  I wanted always-on agents, real HTTPS, and remote development that felt
  like the internet — without putting any of it on the internet. Here's the
  method, not the Caddyfile.
date: "2026-08-28"
category: Cloud
tags:
  - Tailscale
  - Homelab
  - Caddy
  - DevOps
  - Privacy
readingTime: 10 min read
featured: true
author: Sai Nimmagadda
```

Tone: first person, conversational, problem-first. Same register as the Zed config post and the productivity post: systems thinking, then the setup that fell out of it. Short sentences. One new idea per section. Concrete diagrams, not command dumps.

Audience: a developer who already SSHs into things, has maybe tried ngrok / Cloudflare Tunnel / a homelab, and is uneasy about exposing personal services. They do not need Tailscale internals. They do need a mental model they can steal.

Length target: 1,800–2,400 words. Longer than the Zed post, shorter than a full architecture doc. Link the gist at the end of the architecture section and again at the close.

---

## Thesis

A personal development cloud is not a mini public cloud in the house. It is an always-on private network that *feels* like the internet — real hostnames, browser-trusted HTTPS, persistent agents, remote editors — while remaining unreachable from it.

The method is to split three jobs that people usually smash together:

| Job | Layer |
| --- | --- |
| Who is this device, and may it talk? | Tailscale (identity, WireGuard, policy) |
| What is this app called? | Public DNS pointing at a Tailscale address |
| How does a browser reach it? | Caddy on the Tailscale IP, proxying to loopback |

Everything else — Mosh, Herdr, remote editing, the GPU box, nested DNS for a second host — is a consequence of that split.

The unintuitive move: **public DNS records for private addresses**. The name is public metadata. The route is not. That is "private by routing." Host policy (firewalls, key-only SSH, app auth, ACLs) comes after, because routing privacy is not the same as host privacy.

---

## What this post covers vs. what the gist covers

| This post | The gist |
| --- | --- |
| Why a hub exists | Exact machine roles and ASCII topology |
| Why public DNS to `100.64.0.0/10` is safe enough to use | Address model, MagicDNS, request flow |
| Why Caddy + DNS-01, not Funnel or HTTP-01 | Site blocks, `xcaddy`, LaunchDaemon vs systemd |
| Why apps bind loopback | Port lists, compose stacks, exporters |
| Why a second host gets a *nested* wildcard | RFC 4592 recipe, `conf.d/*.caddy` |
| Persistence as a stack | Mosh bootstrap, Herdr, `~/.ssh/config` |
| Hardening as part of the method | sshd fragments, UFW, sample ACL JSON |
| What I refused | Recovery runbooks |

Do not paste Caddyfiles, ACL JSON, or `sshd_config` into the post. One short illustrative snippet is enough (the two-bind Caddy block). Send the rest to the gist.

Do not publish: real tailnet names, device names, Tailscale IPs, usernames, filesystem paths, tokens, or live security gaps. Keep the same sanitization discipline as the gist (`example.com`, `<MINI_IP>`, `mini`).

---

## Suggested diagrams

ASCII is enough. Match the gist's style so the two documents feel like a pair. Three diagrams max in the post; the gist can keep the rest.

1. **Machine roles** — client laptop, Mac mini hub, GPU workstation, Linux laptop. Caption: the mini is the operational center, not a network router. Tailscale is still a mesh.
2. **Name → address → route → proxy → loopback** — the one request-flow the reader must remember.
3. **Nested DNS** — `*.dev.example.com` vs `*.host1.dev.example.com`. Only if the multi-host section stays; drop it if the draft runs long.

Optional callout box: "Two encryption layers, two questions" (Tailscale vs HTTPS). Four lines, not a diagram.

---

## Section-by-section outline

### 0. Dek / opening (~150–200 words)

**Job:** Name the itch in a way a laptop-bound developer recognizes.

**Hook options:**

- Agents and dev servers die when the laptop lid closes.
- A homelab that requires port-forwarding is a public cloud with extra steps.
- I wanted `app.dev.example.com` in a real browser, from any of my machines, and I did not want the rest of the internet to have an opinion about that.

**Land on:** I built a small private cloud around a Mac mini. Tailscale is how devices find each other. Public DNS is how *I* find the apps. Nothing is forwarded through the router. Funnel stays off.

**Do not:** start with a tool list. Tools come after constraints.

---

### 1. The actual problem (~200 words)

**Job:** Separate "I want a homelab" from the real requirements.

**Requirements that drove the design:**

- Always-on hub for AI agents, long-running terminals, tests, and local web apps.
- Work from a laptop that sleeps, changes networks, and is not the source of truth.
- Native Linux when macOS is the wrong kernel, without turning the mini into a hypervisor.
- Local GPU inference that does not live on a public API.
- Browser-trusted HTTPS and readable hostnames, because insecure-origin browsers are a tax.
- Zero public ingress. No port forwarding. No Funnel unless a hostname is *intentionally* public.

**What I tried or considered and rejected** (one tight paragraph, not a history dump):

- Router port forwarding / Dynamic DNS — the house becomes an origin server.
- Tailscale Funnel / Cloudflare Tunnel / ngrok — great for a demo, wrong default for a private cloud. They punch outbound so the internet can punch back.
- Split-horizon / LAN-only DNS — fine at the desk, useless on a phone using LTE or a cafe network.
- "Just SSH and port-forward" — works for me, fails the moment a browser, a cookie, or a teammate-shaped future shows up.

**Close:** The shape that survived is hub-and-spoke for *work*, mesh for *packets*.

---

### 2. Constraints before tools (~150 words)

**Job:** State the method. This is the Zed-config "thinking behind," not the settings.

**Method:** write the constraints first, then pick the thinnest layer that satisfies each one.

| Constraint | Consequence |
| --- | --- |
| No public listeners | Bind apps to `127.0.0.1`. Bind the proxy to the Tailscale IP only. |
| Always-on work | One quiet machine that never sleeps. Everything else is a client or a specialist. |
| Real names, real certs | Public DNS + ACME DNS-01. HTTP-01 is disqualified because there is no public `:80`. |
| Multiple machines, one namespace | One wildcard for the hub; nested wildcards for extra hosts. |
| Laptops sleep, networks flip | Mosh for the pipe, Herdr for the session. SSH is identity, not the workspace. |
| GPU is a different shape of machine | A compute *tier*, not a second hub. Same ingress pattern, different workload. |

**Punchline:** I did not "set up Tailscale, then Caddy, then DNS." I assigned each constraint to a layer so the layers would not leak into each other.

---

### 3. The three-layer mental model (~350 words) — spine of the post

**Job:** Teach the architecture as a sentence, not a topology.

Open with the table from the thesis (identity / naming / ingress). Then walk each layer.

#### 3a. Tailscale is identity, not "the VPN"

- Every device gets a keypair, a `100.64.0.0/10` address, and a MagicDNS name.
- The control plane does identity, keys, discovery, and policy. Application bytes travel on WireGuard, peer to peer. DERP only relays ciphertext when NAT wins.
- MagicDNS is for `mosh sai@mini`. It is not how I want to type application URLs into a browser, and it is not how certificates work.
- The mini is **not** a subnet router in this design. Clients talk to the mini, the GPU box, or the Linux laptop directly. Hub is an operational idea, not a packet idea.

#### 3b. Public DNS for private addresses

This is the section people will argue with. Lean into it.

- A wildcard `*.dev.example.com` returns the mini's Tailscale IPv4.
- DNS only answers names. It does not proxy traffic.
- A stranger can look up the name and learn a CGNAT address they cannot route to.
- Names and certs are public metadata (Certificate Transparency will log the hostname). The *service* is not public.

One diagram: DNS question vs application traffic.

#### 3c. Caddy as the only intended ingress

- Apps listen on loopback. Caddy listens on `<TAILSCALE_IPV4>:443` and reverse-proxies.
- Those two binds are the network boundary. If something is reachable on the LAN IP or on `0.0.0.0`, the design is wrong.
- HTTPS is not redundant with WireGuard. Tailscale answers "are these devices allowed to talk?" TLS answers "is this process allowed to call itself `app.dev.example.com`?" Browsers, cookies, and secure-context APIs care about the second question.

**Illustrative snippet only:**

```caddy
app.dev.example.com {
    bind <TAILSCALE_IPV4>
    reverse_proxy 127.0.0.1:8000

    tls {
        dns <DNS_PROVIDER> {env.DNS_API_TOKEN}
    }
}
```

Then: DNS-01 in four beats (request cert → CA asks for TXT → Caddy writes it via the DNS API → cert lands). No `xcaddy` lecture. One sentence that stock Caddy may not include your provider, so the running binary has to be the one you built.

---

### 4. Machine roles: hub, specialist, client (~250 words)

**Job:** Explain why there are four machines instead of one beefy box.

```
Client laptop     — editor, browser, mosh. Sleeps. Never the source of truth.
Mac mini          — always-on hub. Agents, Herdr, app routing for *.dev.example.com.
GPU workstation   — local models, Open WebUI, Grafana/Prometheus. Nested DNS.
Linux laptop      — native Linux when the mini's kernel is the wrong one.
```

**Points:**

- The mini is the coordination and application hub because it is quiet, low-power, and always on. It is not where a 14B model lives.
- The GPU box is a bounded compute tier: quantized 7B–14B, one loaded model at a time, observability next to the thing it observes. Disk is a first-class constraint (weights + volumes + metrics).
- The Linux laptop exists so "I need Linux" does not become "I need to virtualize Linux on the hub." Every Linux machine is a native tailnet peer with its own keypair. No WSL, no guest resolver pinning, no pretending the outer host's MagicDNS is the inner one's.
- Adding a machine does not add a new *kind* of networking. It adds a role and, if it exposes apps, a nested DNS subtree.

**Avoid:** hardware shopping, exact SKUs, real hostnames.

---

### 5. Persistent work, not persistent SSH (~200 words)

**Job:** Persistence is a stack. People collapse it into "I use tmux."

Four layers, one sentence each:

| Layer | Job |
| --- | --- |
| SSH | Who are you. Key distribution, `authorized_keys`, `IdentitiesOnly`. |
| Mosh | The pipe survives sleep and network changes. UDP, so the host firewall has to allow it on the tailnet. |
| Herdr | The workspace survives disconnect. Agents, servers, tests, logs keep running on the hub. |
| Remote editor | Files and builds stay on the mini; the UI stays on the laptop. Narrow filesystem permissions. |

**Anecdote to write:** closing the laptop used to kill the agent. The fix was not "don't close the laptop." The fix was: the agent never lived on the laptop.

**SSH key distribution, lightly:** a new tailnet member is not automatically an SSH peer. Identity on the overlay ≠ identity on the shell. Point at the gist for the four-machine keychain and the wipe-and-reinstall dance. Mention `IdentitiesOnly yes` as the one config line that earns its place in a methodology post (it prevents "Too many authentication failures" from a stuffed agent).

---

### 6. Growing the cloud: loopback, then a nested name (~250 words)

**Job:** Show that the design is additive.

**New app on the hub:**

1. Bind it to `127.0.0.1`.
2. Add a Caddy site on the Tailscale IP.
3. Reload. The wildcard already points here.

No new DNS record per app. That is the point of the wildcard.

**New host with its own ingress:** do not add a second *flat* wildcard. Nest it.

```
*.dev.example.com            → mini
*.host1.dev.example.com      → GPU box
*.host2.dev.example.com      → Linux laptop
```

Closer-match wins (RFC 4592). Two Caddy processes, two binds, two firewalls. Same trio, new subtree.

**Loopback-first for the GPU stack, in particular:** Ollama, Open WebUI, Grafana, Prometheus, Dozzle start on `127.0.0.1`. Tailscale membership is not permission to hit an unauthenticated model API. Vanity URLs come after application auth.

One sentence on Caddy modularity: a hub-stack host outgrows a single Caddyfile; `import conf.d/*.caddy` with the Tailscale IP as an argument keeps every site on the same narrow bind. Details in the gist.

---

### 7. Private by routing is not private by policy (~250 words)

**Job:** Prevent the reader from copying the topology and skipping the boring parts.

Opening line: *this architecture is private by routing, not private by host policy.* A tailnet member who can reach a host still hits whatever SSH, the firewall, and the app will allow.

Treat these as part of the method, not a later hardening pass. Five beats, no command blocks:

1. **Key-only SSH** on every host, after verifying a second machine can still get in. Do not bind sshd to Tailscale-only until there is a LAN recovery path.
2. **Host firewalls on.** A green `tailscale ping` is not application reachability; WireGuard can bypass what you think the firewall is doing. Know the difference on each OS.
3. **Explicit Tailscale ACLs** before a second person or a less-trusted device joins. Default allow-all is a single-user convenience.
4. **Authenticate anything that leaves loopback.** Open WebUI gets a real admin. Grafana loses anonymous admin. Raw Ollama stays loopback until it sits behind an authenticated ingress.
5. **Recovery is part of the design.** Stolen laptop → disable the node, rotate SSH keys. Leaked DNS token → revoke, replace, re-issue. Accidental `bind 0.0.0.0` → restore the Tailscale bind and prove the LAN IP refuses the connection.

**Public metadata vs secrets:** names, CT-logged hostnames, and this blog post are public. Tokens, tailnet names, usernames, and "here is the hole I have not closed" are not.

---

### 8. What I refused (~120 words)

**Job:** Negative space makes the method clearer.

- No Funnel.
- No router port forwarding.
- No app bound to `0.0.0.0` "just for now."
- No unauthenticated dashboard on a tailnet IP.
- No second flat wildcard when a second host showed up.
- No turning the mini into a VM host so Linux could be a guest. Linux is a peer.
- No pretending MagicDNS names are application names.

Each refusal maps back to a constraint in section 2. If a refusal does not, cut it.

---

### 9. Close (~120 words)

**Job:** Restate the one-way flow and hand off to the gist.

```
Readable name
  → public DNS
  → Tailscale address
  → private WireGuard route
  → Caddy on that address
  → loopback app
```

The result is a small cloud I control: agents that survive a closed lid, HTTPS that browsers trust, a GPU that is not an API vendor, and a Linux box that is just another peer.

If you want the sanitized cookbook — Caddyfiles, nested DNS records, sshd fragments, the ACL skeleton — it lives in the gist. This post is the method that made that cookbook inevitable.

---

## Argument flow (read this before drafting)

1. Lid-close / public-homelab itch.
2. Requirements, not tools.
3. Constraints assigned to layers.
4. Three layers explained; DNS-to-CGNAT is the load-bearing trick.
5. Machines as roles on a mesh.
6. Persistence as SSH + Mosh + Herdr + editor.
7. Growth rule: loopback, then name; nest on a new host.
8. Routing privacy is insufficient; policy is in-scope.
9. Refusals.
10. Gist.

If a paragraph does not advance that sequence, it belongs in the gist or it belongs in the trash.

---

## Voice notes (steal from existing posts)

- Open in the problem, not the stack. *Stop Wasting Time* starts with the couch, not the energy-state-machine. Do the same: start with the closed laptop.
- "Here's the thinking behind," not "here's my Caddyfile." Same move as the Zed post.
- Problem first, solution second. Do not write "use DNS-01." Write "HTTP-01 needs a public `:80`, which I refused to have."
- One idea per heading. Nested wildcards do not live inside the Caddy section.
- Emoji: sparse. The productivity post can get away with 💪. This one should not.
- No "as an AI" hedging. No tutorial padding ("first, install Tailscale"). Assume the reader can install things; teach them what to *want*.

---

## Assets to make when drafting the MDX

- One architecture diagram (section 4). Prefer a simple SVG or a well-typeset ASCII block in a fenced code block.
- Optional: a browser screenshot of a vanity URL with a valid lock icon, faces and hostnames cropped. Only if it earns the HTTPS section.
- Do not screenshot the Tailscale admin console, DNS records with real names, or Grafana with real metrics.

Link set:

- Gist (primary): `https://gist.github.com/funsaized/43d6f7bf40d52113616880ed85663560`
- Tailscale MagicDNS / ACLs docs, as needed
- Caddy DNS-01 + the relevant `caddy-dns` module
- [Herdr](https://github.com/herdrdev/herdr)
- Maybe `herdr-mise` if the persistence section wants a personal hook; easy to cut

---

## Open questions for the draft

Answer these before writing prose. They change emphasis, not architecture.

1. **Title:** searchable ("personal development cloud") vs thesis ("private by routing")?
2. **How much journey vs how much method?** Current outline is ~20% itch, ~80% method. If the post should feel more like a build log, add a short "what I built first" beat (mini + Caddy + one app) before the GPU box.
3. **Name the GPU role in public?** The gist already says NVIDIA + Ollama + Open WebUI. Keep that level; skip VRAM numbers if they feel like a flex.
4. **Featured?** This is the strongest Cloud post since the AWS/Netlify era. Default to `featured: true` unless it should sit quietly next to the gist.
5. **Series?** A follow-up could be "adding a host" or "the GPU workhorse" as a deep dive. This outline assumes a single post plus gist. Do not tease a series unless you will write it.

---

## Drafting checklist

When this outline becomes an MDX file under `src/content/articles/`:

- [ ] Frontmatter matches `article-metadata.ts` (Cloud category, ISO date, slug unique)
- [ ] No real tailnet names, IPs, usernames, or paths
- [ ] At most one Caddy snippet
- [ ] Gist linked at least twice
- [ ] Diagrams use example.com placeholders
- [ ] Desktop + mobile pass on `/articles/<slug>` and `/articles`
- [ ] `npm run check` after the file lands
