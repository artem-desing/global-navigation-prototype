# Global Navigation Prototype — Brief

## What

A clickable, interactive Next.js prototype of an updated Wallarm global navigation. Lives as a GitLab repo so design, PM, and teammates can clone, run, and submit PRs as proposals.

## Why

Wallarm is becoming a platform with multiple products. The existing single-sidebar nav in `my` was built for one product. We need a navigation model that scales to multiple products, gives each one a clear surface, and holds together as a single platform — without locking ourselves into engineering decisions that haven't been made yet (MFE shell, etc.).

The prototype is a tool for finding the right model by feel — not for shipping code. PRs from teammates with alternative arrangements are the input we want.

## Users / audience

- Design team — owns the model
- Lead PM and product team — co-drive scope and validate against product roadmap
- Engineering — observers until a model is chosen, then takes over for production
- Internal stakeholders only — embargo on AI Control Platform framing until 2026-06-04

## Scope

- App switcher / top bar pattern for cross-product nav
- Within-product sidebar pattern (mapped to today's sections in `my`)
- Mock data flowing through screens enough to feel the flow (counts, badges, loading states)
- Settings as a separate cluster (distinct visual treatment, like today)
- Admin zone gated behind a toggle for super-admin view

## Non-goals

- Real APIs or auth
- Full visual fidelity beyond what WADS gives us out of the box
- IA for products that don't have screens yet (Hypervisor, Gateway interiors — only stub them)
- MFE architecture decisions

## Success criteria

- Prototype runs locally with one command after clone (`pnpm install && pnpm dev`)
- Click-through flow feels real enough to pick a model from
- At least 2 alternative models proposed via PR
- Design + PM aligned on a model before 2026-06-10

## Timeline

- 2026-04-27: kick off, scaffold, audit existing IA
- 2026-04-28 → 2026-05-09 (target): v0 prototype playable, baseline IA imported
- 2026-05-09 → 2026-06-06: alternatives explored via PRs, model picked
- 2026-06-10: model ready to inform production work
