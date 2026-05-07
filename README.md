# Global Navigation Prototype

Internal Wallarm prototype for designing the global navigation. A clickable Next.js app where design + product + engineering can propose changes via branch and see the result running, instead of trading static screenshots.

## The shape of the prototype

The prototype hosts several navigation variants side-by-side under `/v/<slug>/`. Each variant is a different idea about how the chrome should behave; they all share the same manifests, mock data, and route map.

**v8 ("Auto-collapsing rail") is the canonical prototype.** It's the variant we count as the artifact going forward — every contribution lands here. Older variants (v0–v7) remain in the picker as a frozen archive for reference, but new product, design, and PM work targets v8.

Live deploy: <https://artem-desing.github.io/global-navigation-prototype/>

## Run it locally

Prerequisites:

- Node.js 20+
- pnpm 9+ (`npm i -g pnpm`)

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>. The picker page lists every variant; v8 is on top with a green "Final" tag.

| Command | What it does |
|---|---|
| `pnpm dev` | Start the dev server on :3000 |
| `pnpm build` | Production build (used by the GitHub Pages deploy) |
| `pnpm start` | Run the production build locally |
| `pnpm lint` | ESLint check |

## How to contribute

Read [CONTRIBUTING.md](CONTRIBUTING.md). The short version:

1. Branch off `main` with a name like `pm/<initials>/<topic>`
2. Edit the manifest + add page stubs for the section you own
3. Run `pnpm dev` to verify it renders inside v8 (`/v/v8/...`)
4. Open a pull request — Artem reviews and merges

Every contribution should render correctly inside v8. v0–v7 are frozen, so you don't have to verify they still look right after manifest edits — but no one should be designing for them either.

## What lives where

| Area | Path | When you touch it |
|---|---|---|
| Variants (chrome) | `src/nav/variants/v0..v8/` | Rarely. v8 is canonical; others are frozen |
| Manifests (nav structure) | `src/nav/manifest/*.manifest.ts` | When adding/removing/renaming a section |
| Settings pages | `src/nav/shell/feature-pages/settings/` | Most PM work goes here |
| Other product pages | `src/nav/shell/feature-pages/` | Edge / Hypervisor / Discovery / Testing |
| Mock data | `src/lib/fixtures/`, `src/lib/mock-data/` | When a page needs example rows / records |
| Routing | `src/app/v/[variant]/[...slug]/catch-all-client.tsx` | Rarely — only when a section needs a non-default page renderer |
| Project context | `docs/` | Charter, decisions, IA notes, principles |
| Operating manual | `CLAUDE.md`, `AGENTS.md` | Conventions, embargo rules, stack notes |

## Stack

- Next.js 16 (App Router) + Turbopack, statically exported (`output: 'export'`)
- React 19, TypeScript strict
- Tailwind CSS v4 — tokens come from WADS, no hardcoded hex
- `@wallarm-org/design-system` (WADS) — the design system; import each component from its own path

## Discussion artifact, not production

This is a prototype. Mock data only, no real API integration, no auth. The point is to make the navigation playable so we can argue about it with our hands on a real surface.
