@AGENTS.md

# Global Navigation Prototype — Claude Code operating manual

## Project at a glance

Clickable Next.js prototype for exploring an updated Wallarm global navigation model. v0 baseline scaffolded 2026-04-27 by Artem Miskevich (Head of Design, `amiskevich@wallarm.com`). The prototype is a discussion artifact — each branch represents a navigation idea, and MRs back to `main` are the conversation between design, PM, and teammates.

Will be pushed to internal GitLab once destination is confirmed by DevOps.

Full project context is in `docs/`:

- `docs/charter.md` — why this exists, scope, success criteria, ownership
- `docs/brief.md` — one-pager for sharing
- `docs/current-ia.md` — baseline of today's Wallarm Console nav (the redesign starts here)
- `docs/decisions.md` — append-only decisions log
- `docs/open-items.md` — open design questions and blockers

Read `docs/charter.md` and `docs/current-ia.md` first when starting a session — they carry the load-bearing context.

## Stack

- Next.js 16 (App Router) + Turbopack
- React 19 + TypeScript strict
- Tailwind CSS v4 (tokens come from WADS — do not redefine)
- `@wallarm-org/design-system@0.29.2` (WADS) plus peers: `tw-animate-css`, `non.geist`, `@internationalized/date`
- `pnpm` only — never npm or yarn

## WADS imports

Each component from its own path. NO barrel imports. Match the platform's pattern:

```ts
import { Button } from '@wallarm-org/design-system/Button';
import { Drawer, DrawerBody, DrawerContent } from '@wallarm-org/design-system/Drawer';
import { Eye, Search } from '@wallarm-org/design-system/icons';
```

Theme is imported once in `src/app/globals.css`. Don't duplicate token imports elsewhere.

If a needed nav component isn't in WADS (e.g. an app switcher pattern), build a minimal local one in `src/nav/`. Don't compose nav chrome from raw Tailwind utility classes — use WADS primitives where possible to keep the look consistent.

WADS is in active development (1.0.0 in RC at time of writing). Stay on stable (no `-rc` versions) unless Artem confirms.

## Conventions

- TypeScript strict — no `any`, no `@ts-ignore`
- File naming: kebab-case; component naming: PascalCase
- Functional components + hooks only
- Use WADS theme variables for colors / spacing / typography — no hardcoded hex
- Mock data only — no real API integration in this prototype

## Suggested file layout for nav work

```
src/
├── app/
│   ├── (with-nav)/             # Route group sharing the prototype shell
│   │   ├── layout.tsx          # Sidebar + top bar shell
│   │   ├── page.tsx            # Default landing inside the shell
│   │   └── <section>/page.tsx  # Each section gets its own route
│   ├── globals.css
│   └── layout.tsx              # Root layout (no nav)
├── nav/
│   ├── app-switcher.tsx        # Top-bar app/product switcher
│   ├── sidebar.tsx             # Per-product sidebar
│   ├── top-bar.tsx             # Brand mark, search, account
│   ├── data.ts                 # Nav structure mock data (see docs/current-ia.md)
│   └── flags.ts                # Mock feature-flag panel for shapeshift demo
└── lib/                        # Helpers, fixtures, utils
```

This is a starting suggestion — adjust as the model crystallizes. A teammate's MR may rearrange this entirely; that's fine.

## Embargo

Wallarm's "AI Control Platform" launch is embargoed externally until 2026-06-04 (public reveal 2026-06-10 at AWS Summit LA). For this repo:

- Do NOT use "The AI Control Platform", "Infrastructure Discovery", "API/AI Gateway", or "AI Hypervisor" in commits, MR descriptions, or visible README copy
- Internal context inside `docs/` and `CLAUDE.md` is fine
- Before pushing to GitLab: scrub commit history and visible artifacts for embargo-safe language

## Collaboration model

Branches/MRs are the proposals. Each branch = one navigation idea. Keep them focused. The MR body is where the rationale lives.

## Design lead's working space

The design lead's living workspace for this project (status, stakeholders, recurring updates) is OUTSIDE this repo at:

`/Users/artem/Documents/work-projects/head-of-design/cross-team-projects/global-navigation-prototype/`

That's Artem's design-lead workspace, not the team-facing repo. This repo is the prototype + the team-facing context (`docs/`).

## What not to do

- Don't commit secrets, real customer data, or production screenshots
- Don't add real API integration — this is a click-through prototype with mock data only
- Don't introduce another package manager (pnpm only)
- Don't add `// eslint-disable` or `// @ts-ignore` to silence warnings — fix the underlying issue
- Don't update WADS to a `-rc` version without Artem's confirmation
- Don't push to GitLab without first setting `git config user.name` and `user.email` to the Wallarm identity (current commits used the macOS default — fix before push)
- Don't reference the AI Control Platform pillars by name in visible artifacts pre-2026-06-04
- Don't auto-send Slack messages, create Jira tickets, or post to external services on Artem's behalf — drafts only
