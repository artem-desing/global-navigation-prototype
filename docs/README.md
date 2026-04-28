# Project docs

Team-facing context for the global navigation prototype. Read in this order:

| File | What it is | When to read |
|---|---|---|
| [charter.md](charter.md) | Problem, scope, non-goals, success criteria, ownership | Always first |
| [brief.md](brief.md) | One-pager: what / why / users / scope / timeline | Sharing with PM and stakeholders |
| [current-ia.md](current-ia.md) | Baseline audit of today's Wallarm Console navigation | Before proposing a model — this is what we're redesigning *from* |
| [decisions.md](decisions.md) | Append-only decisions log | When a decision is made; consult before re-litigating |
| [open-items.md](open-items.md) | Live list of open design questions and blockers | When picking what to work on next |
| [glossary.md](glossary.md) | Working vocabulary — Service, Tool, Scope, etc. | When writing about the model; before naming anything new |
| [references.md](references.md) | Field research on 14 reference platforms (Cloudflare, Intercom, GCP, Vercel, Kong, Neon, Supabase, Postman, Zapier, Databricks, Amplitude, Sentry, PostHog, GitLab) + LEGO-bricks synthesis | Before proposing chrome / picker / palette behavior; for vendor evidence behind glossary terms |

## How these docs evolve

- **charter.md** — stable after kickoff; only edit if scope materially changes
- **brief.md** — evolves as audience or scope sharpens
- **current-ia.md** — snapshot of the existing Wallarm Console nav at 2026-04-27. Re-audit if `wallarm-cloud/my` ships major nav changes
- **decisions.md** — append-only. New entries go to the bottom with the date as the heading
- **open-items.md** — live. Move items to `decisions.md` when resolved, or to MR/issue when actionable
- **glossary.md** — live. Promote draft terms to **agreed** as the team locks them in; add new terms whenever a structural concept needs a name
- **references.md** — append-only per research wave. Re-run when the FigJam evolves significantly or when a referenced vendor ships a major nav redesign

## Where the design lead's workspace lives

Status, stakeholders, and recurring updates live in Artem's design-lead workspace, outside this repo, at:

`/Users/artem/Documents/work-projects/head-of-design/cross-team-projects/global-navigation-prototype/`

That folder is Artem-facing. This `docs/` folder is team-facing.
