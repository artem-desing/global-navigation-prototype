# Global Navigation Prototype — Decisions log

## 2026-04-27 — Kick off as a separate project, decoupled from MFE shell track

**Decision:** Spin up a standalone project for the navigation prototype, separate from Ilya Pashkov's MFE shell pilot work.

**Context:** Earlier memory flagged that nav design was "on Artem and Ilya" (DM 2026-04-16). Artem confirmed in conversation he's already aligned with Ilya and the two tracks can run independently.

**Alternatives considered:** Combine into Ilya's MFE shell repo — rejected to keep design exploration unconstrained by architecture decisions still in motion.

**Owner:** Artem

## 2026-04-27 — Stack: Next.js 15 + React 19 + Tailwind v4 + `@wallarm-org/design-system`

**Decision:** Build the prototype as a Next.js 15 (App Router) app, React 19, Tailwind v4, with `@wallarm-org/design-system` installed from npm.

**Context:** WADS peer deps lock React 19 + Tailwind v4 + `tw-animate-css` + `non.geist`. Next 15 supports React 19 natively and gives App Router URLs for free, which makes the click-through prototype feel real.

**Alternatives considered:**
- Vite + React Router: works, but Next App Router routing is cleaner for prototyping URL-driven flows
- Rsbuild (matching the platform): unnecessary for a prototype, slower on tooling familiarity

**Owner:** Artem

## 2026-04-27 — Repo home: local first, push to GitLab when v0 is ready

**Decision:** Scaffold the prototype at `/Users/artem/Documents/work-projects/global-navigation-prototype/`. Push to `gl.wallarm.com` once v0 is playable and the README is embargo-scrubbed.

**Context:** GitLab is internal-only, but commit history is visible to everyone in the group. Want clean commits + an embargo-safe README before publishing.

**Alternatives considered:** Push immediately on init — rejected to avoid leaking project naming or AI Control Platform language into early commits.

**Owner:** Artem

## 2026-04-27 — Project name: `global-navigation-prototype`

**Decision:** Use `global-navigation-prototype` as folder and repo name.

**Context:** Embargo-safe (no pillar names), descriptive of the artifact, matches `head-of-design` kebab-case pattern.

**Alternatives considered:** `wallarm-nav-redesign`, `platform-shell-prototype` — rejected as either too vague or too close to MFE shell terminology.

**Owner:** Artem

## 2026-04-29 — Global ⌘K search v1: basic, no sigils

**Decision:** Ship global search as a flat ranked palette over the manifest. Free-text input, products + features as results, "Suggested" empty state listing product roots, ↑↓/Enter/Esc keyboard nav. Triggered by ⌘K from anywhere or the top-bar pill.

**Context:** The cross-vendor research (`references.md`) calls ⌘K "non-optional at our depth/breadth" with sigil-prefixed bucketed results (`:` Products, `@` entities by Resource ID, `>` actions). v1 deliberately skips that — plain text, no sigils, no per-bucket grouping. Goal is to get a working search surface in front of teammates fast; the dialog's empty state is also the planned home for the Recent list.

**Alternatives considered:**
- Sigil bucketing on day one — rejected as over-engineering for v1; users won't have learned the prefix grammar yet, and we don't have entity-level resources searchable across all products to make `@` meaningful.
- Per-Product (scoped) search alongside global — rejected for v1; one global surface is enough to validate the pattern.

**Deferred:** Sigil grammar, Recent integration, locked-feature treatment in results, per-Product scope, palette-registered actions/commands. All natural v2 extensions when there's user signal that they're needed.

**Owner:** Artem

## 2026-04-27 — Starting nav direction from Platform-jam: top-bar product switcher + per-product sidebar

**Decision:** v0 prototype starts from a two-tier model — a top-bar product switcher above a per-product sidebar — based on the direction in the Figma `Platform-jam` board and design canvas.

**Context:** The jam already explored alternatives (left rail of products, top tabs) against references from Vercel, GCP, Sentry, GitLab, PostHog, Databricks, etc. and converged on top-bar switcher + product sidebar. Settings sits as a cross-cutting cluster above product scope, not inside the sidebar. Sidebar interaction model: expand/collapse with cmd+B, hover-to-peek, hover+pin (Sentry-style). Global cmd+K search across products plus scoped resource search inside a product.

**Not locked:** This is the *starting* model for v0 to make flows testable, not a final pick. Alternative arrangements still welcome via PR — that's the whole point of the prototype.

**Owner:** Artem

## Decision: v5 direction — Workbench (split-pane with tabs)
**Date**: 2026-04-30
**Branch / MR**: main (single-branch session)
**Decided by**: Principal PM
**Context**: IA Researcher surfaced six structurally-different next-variant directions and recommended two: (A) Workbench / split-pane with tabs, (B) Scope-as-context with a top-of-page scope selector. v0–v4 have all explored the left-rail shape; we need a variant that challenges a deeper axis.
**Options considered**:
  1. Workbench / split-pane (A) — pros: changes the unit of navigation from page to tab, only direction on the table that does so; clear vendor prior art (Postman, VS Code); fits today's manifest with no schema change. Cons: AI push-panel collision on the right; risk of tab pollution; mental-model shift heavier for low-frequency users.
  2. Scope-as-context (B) — pros: directly tests a scope-first mental model that vendor traction (Datadog, Honeycomb) suggests is real for SREs; would surface whether product-first is actually the wrong axis. Cons: requires a second manifest axis (scope as first-class), which is a real schema lift; the hypothesis is testable later by instrumenting v0 without building chrome for it now.
**Decision**: Build Option A as v5. Tabs change the unit of navigation, which is the highest-information move available; manifest stays untouched; AI assistant docks to the bottom for this variant to resolve the right-pane collision.
**Dissent**: The IA Researcher's framing implied B has higher strategic value because it challenges the product-first axis baked into every variant so far. Recorded: if v5 lands without surfacing comparison/cross-reference behavior in testing, B becomes the next bet, not a sixth left-rail variant.
**Revisit if**: (a) v5 testing shows users don't open multiple tabs unprompted — workbench hypothesis fails, fall back to refining v0–v4; (b) teammates testing v5 spontaneously ask "can I switch the whole page to a different cluster/data plane?" — that's the scope-first signal and we promote B; (c) the bottom-docked AI panel proves unworkable in click-through — revisit AI placement before shipping more variants.
