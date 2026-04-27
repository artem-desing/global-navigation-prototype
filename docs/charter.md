# Global Navigation Prototype — Charter

## Problem

Wallarm is repositioning from a single product (Wallarm Console) to a multi-product platform: existing console functionality plus three AI Control Platform pillars (Infrastructure Discovery, API/AI Gateway, AI Hypervisor). Today everything lives in one sidebar inside `my`. That model doesn't scale to a platform-of-products narrative — and the platform launch needs the surface to *feel* like one control plane by 2026-06-10 (AWS Summit LA reveal).

We need a navigation model that:
- Lets users sense the platform as one coherent surface
- Gives each product/pillar room to breathe
- Maps cleanly onto today's section structure (Events, API Security, Security Controls, Security Testing, Configuration, Settings)
- Holds up as Hypervisor + Gateway light up over the next quarters

## Scope

- Interactive clickable prototype with mock data — Next.js 15, React 19, Tailwind v4, `@wallarm-org/design-system`
- Hosted as a GitLab repo so PM and teammates can clone, run locally, and submit PRs as proposals
- Captures the new global nav model (app switcher, sidebar, top bar) plus how each existing section maps in

## Non-goals

- Production code or migration to the real `my` codebase
- Pixel-perfect visual fidelity in v0 (WADS components yes; bespoke styling no)
- Final IA decisions for not-yet-existing products (Hypervisor, Gateway internal screens)
- Settling MFE shell architecture (separate track)

## Success criteria

- Design + PM aligned on a navigation model before 2026-06-10
- Prototype demonstrates the click-through flow naturally enough that stakeholders pick a model from feel, not slides
- At least 2 alternative models proposed via PR before alignment

## Timeline

- Kicked off: 2026-04-27
- Target alignment: before 2026-06-10 (public reveal at AWS Summit LA)
- Embargo: project name and any external-facing artifact must avoid "AI Control Platform" / pillar names until 2026-06-04

## Ownership

- Design lead: Artem Miskevich
- PM / strategy: TBD (lead PM kicking off with Artem)
- Engineering lead: not assigned (this is design-driven; engineering joins post-alignment)
