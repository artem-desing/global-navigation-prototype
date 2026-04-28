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

## 2026-04-27 — Starting nav direction from Platform-jam: top-bar product switcher + per-product sidebar

**Decision:** v0 prototype starts from a two-tier model — a top-bar product switcher above a per-product sidebar — based on the direction in the Figma `Platform-jam` board and design canvas.

**Context:** The jam already explored alternatives (left rail of products, top tabs) against references from Vercel, GCP, Sentry, GitLab, PostHog, Databricks, etc. and converged on top-bar switcher + product sidebar. Settings sits as a cross-cutting cluster above product scope, not inside the sidebar. Sidebar interaction model: expand/collapse with cmd+B, hover-to-peek, hover+pin (Sentry-style). Global cmd+K search across products plus scoped resource search inside a product.

**Not locked:** This is the *starting* model for v0 to make flows testable, not a final pick. Alternative arrangements still welcome via PR — that's the whole point of the prototype.

**Owner:** Artem
