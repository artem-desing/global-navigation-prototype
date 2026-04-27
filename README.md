# Global Navigation Prototype

Internal Wallarm prototype for exploring an updated global navigation model. Built as a clickable Next.js app so design, PM, and teammates can run it locally and propose alternatives via PR.

## Stack

- Next.js 16 (App Router) + Turbopack
- React 19, TypeScript
- Tailwind CSS v4
- `@wallarm-org/design-system` (WADS)

## Getting started

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm lint` | ESLint check |

## How to contribute

The prototype is a discussion artifact. To propose a navigation variation:

1. Branch off `main`
2. Edit the nav components / mock data to represent your model
3. Open a merge request — the PR is the proposal

Keep proposals focused: one navigation idea per branch.

## Project memory

Charter, brief, decisions, IA audit live in the `head-of-design` workspace at `cross-team-projects/global-navigation-prototype/`.
