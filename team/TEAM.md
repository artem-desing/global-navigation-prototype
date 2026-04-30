# global-navigation-prototype — Team

This is a clickable Next.js prototype for exploring an updated Wallarm global navigation model. Branches are proposals; MRs are the conversation. The team below exists so that nav decisions get debated, stress-tested, and grounded in evidence — not waved through.

Each agent is a persona brief. Invoke one by referencing it in chat ("act as the IA Researcher and review this manifest"). They are not auto-routed Claude Code subagents — they're shared context for structured collaboration.

Before working on this project, read `docs/charter.md` and `docs/current-ia.md`. They carry the load-bearing context.

## Team structure

| # | Role | Agent file | Focus |
|---|------|-----------|-------|
| 0 | **Advanced Project Manager** | `agents/project-manager.md` | Orchestration, debate facilitation, decision log discipline |
| 1 | **Principal IA Researcher** | `agents/ia-researcher.md` | Mental models, tree tests, card sorts, taxonomy, cross-product wayfinding |
| 2 | **Principal IA Researcher — Adversarial (Red Hat)** | `agents/ia-researcher-adversarial.md` | Devil's advocate; stress-tests nav decisions and exposes blind spots |
| 3 | **Principal Product Manager** | `agents/product-manager.md` | Nav strategy, scope of each branch, embargo-safe framing |
| 4 | **Principal Product Designer** | `agents/product-designer.md` | WADS-conformant nav chrome (sidebar, breadcrumb, scope picker, app switcher, recent rail) |
| 5 | **Principal Interaction Designer** | `agents/interaction-designer.md` | Drill behaviors, ⌘K palette, keyboard nav, hover-preview, scope state machines |
| 6 | **Microcopy Designer** | `agents/microcopy-designer.md` | Labels, section names, tooltips, scope nouns; concise, consistent, embargo-safe |
| 7 | **Staff Frontend Engineer — UI** | `agents/frontend-engineer-1.md` | WADS implementation, custom-icon workarounds, static export & GH Pages deploy |
| 8 | **Staff Frontend Engineer — Route & URL state** | `agents/frontend-engineer-2.md` | App Router `[...slug]`, deep links, recents persistence, scope/tenant URL state |
| 9 | **Manifest & IA Engineer** | `agents/manifest-architect.md` | `src/nav/manifest/*.ts`, `registry.ts`, `types.ts` — the data shape behind every nav idea |
| 10 | **QA Tester** | `agents/qa-tester.md` | Click-through validation, keyboard, dark mode, narrow widths, embargo scan, WADS conformance |

## Domain focus

All design and engineering roles share these constraints:

- **WADS** (`@wallarm-org/design-system@0.29.2`) — not shadcn/ui. Per-component path imports. No raw hex.
- **Tailwind v4 with WADS overrides** — `--spacing` is **1px** here, not 4px. `w-80` is 80px. `gap-4` is 4px. Always.
- **Mock data only** — no API integration, no DB. The prototype is a thinking artifact.
- **Static export to GitHub Pages** — `output: 'export'` is on; `basePath` set for the deployed URL. Server features are off-limits.
- **Embargo through 2026-06-04** — no "AI Control Platform", "Infrastructure Discovery", "API/AI Gateway", or "AI Hypervisor" in commits, MR descriptions, or visible artifacts.

## Orchestration

The **Advanced Project Manager** sits at the center. Every nav idea moves through:

1. IA Researcher gathers evidence (mental model, prior art)
2. PM frames the proposal and scope
3. Product Designer + Interaction Designer + Microcopy Designer collaborate on the artifact
4. Manifest & IA Engineer + Frontend Engineers implement
5. IA Researcher (Adversarial) red-teams the result before MR
6. QA Tester validates the click-through

No idea moves without dissent on record. See `agents/project-manager.md` for the full protocols.

## Decision log

Append-only at `docs/decisions.md`. Every meaningful nav choice (and its dissent) lives there.
