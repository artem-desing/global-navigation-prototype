# Project docs

Team-facing context for the global navigation prototype. Read in this order:

| File | What it is | When to read |
|---|---|---|
| [charter.md](charter.md) | Problem, scope, non-goals, success criteria, ownership | Always first |
| [brief.md](brief.md) | One-pager: what / why / users / scope / timeline | Sharing with PM and stakeholders |
| [current-ia.md](current-ia.md) | Baseline audit of today's Wallarm Console navigation | Before proposing a model — this is what we're redesigning *from* |
| [decisions.md](decisions.md) | Append-only decisions log | When a decision is made; consult before re-litigating |
| [open-items.md](open-items.md) | Live list of open design questions and blockers | When picking what to work on next |
| [glossary.md](glossary.md) | Working vocabulary — Product, Feature, Scope, etc. | When writing about the model; before naming anything new |
| [references.md](references.md) | Field research on 14 reference platforms (Cloudflare, Intercom, GCP, Vercel, Kong, Neon, Supabase, Postman, Zapier, Databricks, Amplitude, Sentry, PostHog, GitLab) + LEGO-bricks synthesis | Before proposing chrome / picker / palette behavior; for vendor evidence behind glossary terms |
| [product-features.md](product-features.md) | Per-Product Feature inventory (Edge, AI Hypervisor, Infra Discovery, Testing) — names captured verbatim from FigJam / screenshots / design files | Before naming anything in a prototype that touches a specific Product's sidebar |
| [wireframes-flow.md](wireframes-flow.md) | Frame-by-frame analysis of Artem's nav-flow wireframes (Figma `1GJb0riOtfuLA8MMqrDdCo` canvas `77:5101`) — chrome anatomy, the Russian-doll click flow, glossary validation, open questions | Before proposing chrome behavior or implementing the column-swap mechanic |
| [v0-plan.md](v0-plan.md) | The v0 spec + sequenced implementation plan: goals, non-goals, anatomy, Manifest contract, mock data plan, milestones M1–M9, file layout | Before starting implementation, and any time scope shifts |
| [assets/cloudflare/](assets/cloudflare/) | Visual fallback reference: 4 Cloudflare dashboard screenshots + [notes.md](assets/cloudflare/notes.md) extracting which patterns we borrow vs. skip | When a chrome / packing / transition decision is unclear and the prose in `references.md` isn't enough |

## How these docs evolve

- **charter.md** — stable after kickoff; only edit if scope materially changes
- **brief.md** — evolves as audience or scope sharpens
- **current-ia.md** — snapshot of the existing Wallarm Console nav at 2026-04-27. Re-audit if `wallarm-cloud/my` ships major nav changes
- **decisions.md** — append-only. New entries go to the bottom with the date as the heading
- **open-items.md** — live. Move items to `decisions.md` when resolved, or to MR/issue when actionable
- **glossary.md** — live. Promote draft terms to **agreed** as the team locks them in; add new terms whenever a structural concept needs a name
- **references.md** — append-only per research wave. Re-run when the FigJam evolves significantly or when a referenced vendor ships a major nav redesign
- **product-features.md** — live. Add a new section per Product as Feature lists become known; mark each entry **Confirmed**, **Speculation**, or **TBD** with a source citation
- **wireframes-flow.md** — live. Re-run the analysis when Artem updates the Figma wireframes; promote open questions out of this doc and into `open-items.md` when they become decisions
- **v0-plan.md** — the implementation contract for the first prototype attempt. Update when goals, non-goals, milestones, or the Manifest schema change. Once v0 ships and the team reviews, fork into `v1-plan.md` rather than mutating this in place

## Where the design lead's workspace lives

Status, stakeholders, and recurring updates live in Artem's design-lead workspace, outside this repo, at:

`/Users/artem/Documents/work-projects/head-of-design/cross-team-projects/global-navigation-prototype/`

That folder is Artem-facing. This `docs/` folder is team-facing.
