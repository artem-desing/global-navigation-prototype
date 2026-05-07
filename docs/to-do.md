# To do — Global Navigation Prototype

Living backlog for this project. Edit in place — this is meant to be a working doc, not a frozen list.

Source: Artem's notes in the Platform-jam FigJam (node 197:336). Two clusters: **A — Core nav & IA**, **B — Auxiliary surfaces**.

How statuses work: **To do** (scoped, not started), **In progress** (active branch or active design work), **Shipped** (in `main`, logged in `docs/decisions.md`), **Partial** (some pieces shipped, more to do).

---

## Group A — Core nav & IA

### A1. Audit & compare v0 vs v6, write verdict

**Status:** Shipped (2026-05-05). See `docs/proposals/v0-vs-v6/00-synthesis.md`. Verdict: v6 is a superset of v0; the synthesis recommended folding into a single variant with v0 chrome + a single ⌘B wide-labels toggle, which became v7. v8 (the canonical prototype) is the route-driven evolution of v7.

**What:** Compare the two main shipped variants and produce a written summary with a recommended next move. v0 = manifest-driven full-rail with hover-preview. v6 = user-controlled rail with three modes (expanded / collapsed / hover) + leader-key shortcuts.

**Why:** v0 was the original shipped baseline; v6 gives users agency over rail mode. We need a verdict on whether v6 supersedes v0, folds into it as a mode, or stays as a separate variant. Without a written call, the next branch starts ambiguous.

**Done when:**
- One-page side-by-side: what each does, who it's for, where each wins, where each loses
- Score against the three principles (`docs/nav-principles.md` — calm chrome / supportive nav / open foundation)
- Recommended next move (ship one as the canonical, fold, keep both for testing) with reasoning
- Logged in `docs/decisions.md` (or a separate `docs/v0-vs-v6.md` if it gets long)

**Pointers:** `src/nav/variants/v0/`, `src/nav/variants/v6/`. Methodology candidate: 7-lane parallel stress test (used 2026-04-30 for v0/v2/v3/v4).

---

### A2. Define the common home page

**Status:** To do

**What:** Specify what `/` (the umbrella root) shows when a user isn't inside a specific product. Today it's a placeholder.

**Why:** The umbrella story needs a coherent landing surface. Without a defined home, every variant is winging it, and the experience of "the platform" never lands.

**Done when:**
- IA spec for `/home`: what blocks appear (recents? scope summary? cross-product alerts? getting-started? a dashboard?), in what order
- Variants by user type: new vs. returning, free vs. paid, single-tenant vs. multi-tenant
- Wireframe or Figma frame
- Each of the three principles can point at one concrete thing on the home page

**Pointers:** `src/app/(with-nav)/page.tsx`, `docs/current-ia.md` (tier/role conditional logic).

---

### A3. Limits — logic + UI

**Status:** To do

**What:** Define how plan/tier/usage limits surface in the nav and inside products. Locked features, upsell prompts, tier badges, paywall states, AASM-only / free-only / super-admin-only treatments.

**Why:** The nav already shapeshifts by tier (`isAASMOnly`, `isFreeTier`, `isSuperAdmin` per `docs/current-ia.md`), but today gated items just *disappear* — users don't know what they're missing or how to upgrade. Implicit gating works against both transparency and revenue.

**Done when:**
- Locked-feature pattern in the nav (tooltip? lock icon? secondary state?) — agreed visual + interaction
- Upsell prompt pattern (where it appears, how it dismisses, copy)
- Tier indicator placement (user menu? scope picker? both?)
- Per-state spec: free → paid gating, AASM-only, super-admin-only, embargoed-by-flag
- Locked-feature treatment in ⌘K results (deferred from search v1 — see `docs/decisions.md` 2026-04-29)

**Pointers:** `docs/current-ia.md` § conditional logic, `src/nav/manifest/types.ts` for existing flags.

---

### A4. Global search v2 — logic, actions, interactions

**Status:** Partial (v1 shipped 2026-04-29; deferred items remain)

**What:** Take ⌘K from "ranked palette over manifest" (v1) to a richer surface — sigils, palette-registered actions, per-product scope, locked-feature treatment, interaction polish.

**Why:** v1 was deliberately minimal to validate the basic shape. Cross-vendor research called for sigil-bucketed results (`:` Products, `@` entities, `>` actions) and palette-registered commands. Power-user expectations are clear; v1 deferred to test the floor first.

**Done when:**
- Sigil grammar shipped: `:` (products), `@` (entities by Resource ID), `>` (actions) — with discoverable empty states
- Palette-registered actions actually do things: switch tenant, toggle theme, jump to settings, open assistant
- Recent integration confirmed in empty state (already implemented — verify)
- Locked-feature treatment in results (cross-references A3)
- Per-product scope (optional `/` prefix scopes to current product)
- Interaction polish: keyboard, focus management, empty/no-results/error states

**Pointers:** `src/nav/search/global-search.tsx`, `docs/decisions.md` § 2026-04-29 (full deferred list), memory `project_globalsearch_controlled_mode.md`.

---

### A5. Tenant switching + review the tenant model

**Status:** Stub shipped, UX needs design

**What:** Design the tenant switcher (where it lives, how it behaves, what it switches), then validate against the actual Wallarm multi-tenant model.

**Why:** Multi-tenancy is real — users belong to tenant accounts, can have multiple, can be granted access across them. The nav has a tenant slot but no designed UX. Risk: shipping a switcher that contradicts how tenants actually work, then having to tear it out.

**Done when:**
- Tenant model summarized in our own words (1 paragraph) — what is a tenant, what is a tenant account, how do they nest, who sees multiple
- Switcher UX: location (top bar? scope picker? user menu?), interaction pattern (modal? dropdown? full-page picker?), state persistence
- Edge cases: single-tenant user (does it hide?), multi-tenant user, super-admin viewing tenants, switching mid-flow (preserve route or reset to home?)
- Validated against the official multi-tenant docs

**Pointers:**
- Reference doc: <https://docs.wallarm.com/installation/multi-tenant/overview/#tenant-accounts>
- Existing tenant stub in v0
- Memory: `project_kong_konnect_ia.md` (Konnect tenant/region picker precedent from competitor research)

---

## Group B — Auxiliary surfaces

### B1. Splash screen

**Status:** To do

**What:** First surface a user sees while the umbrella is loading (initial app boot, not route transitions).

**Why:** Today there's no defined splash — it's whatever Next happens to render. A coherent loading surface establishes brand presence and absorbs perceived slowness.

**Done when:**
- Visual spec (logo, motion, brand surface) within WADS
- Timing rules: when it shows, when it fades, what triggers it
- Reduced-motion variant

---

### B2. Login flow

**Status:** To do

**What:** Sign-in surface plus the post-login routing rule (where do you land — home? last-visited? a scope/tenant picker?).

**Why:** Login is the front door to the umbrella. Today the prototype has no auth surfaces. Once added, it constrains onboarding, tenant selection, 2FA placement, and the post-login redirect strategy.

**Done when:**
- Login form (email/password, SSO buttons where applicable)
- Post-login routing rule (last-visited > home, fall back to home for new users)
- Error states (wrong password, locked account, SSO redirect, 2FA challenge)
- Tie-in to A5: if a user has multiple tenants, when do they pick? At login, or after?

---

### B3. Sign-up flow

**Status:** To do

**What:** Account creation flow — likely tied to free-tier provisioning, tenant creation, and first-run onboarding.

**Why:** Product strategy includes tier expansion (free → paid). Sign-up is the conversion surface. Gap if launch ships without a defined sign-up.

**Done when:**
- Sign-up form (required vs. optional fields)
- First-run experience post-sign-up: where they land, what they see, whether they pick a scope/tenant
- Free-tier indicators visible from the start (cross-references A3)
- Edge cases: existing user trying to sign up, invitation-based sign-up (multi-tenant invite flow)

---

### B4. 404 + other error surfaces

**Status:** To do

**What:** 404 (route not found), 403 (forbidden / gated), 500 (server error), offline indicator, empty-state pattern.

**Why:** Error surfaces are where users currently bail. A coherent set of error states reinforces trust. Today's 404 is whatever Next ships.

**Done when:**
- 404 page: shows the route the user tried, suggested destinations (recents, home, search), an escape hatch
- 403 page: explains why (tier, role, feature flag), offers an upsell or "ask admin" CTA, lets the user back out
- 500 page: friendly copy, support contact, retry
- Offline indicator (sticky banner or inline?)
- Empty-state pattern consistent across products

---

## Delegated to PMs (2026-05-07)

The Settings cluster is now delegated to product managers. They contribute via branches off `main`, editing `src/nav/manifest/settings.manifest.ts` + adding/removing pages under `src/nav/shell/feature-pages/settings/`. v8 is the canonical prototype — every PM contribution must render correctly there. Ground rules and the 3-step recipe live in `CONTRIBUTING.md`.

Items that PMs will likely shape: subscription / billing UX, audit log filters, integrations catalog, customer admin-zone surfaces, experiments rollout pattern. None of these require core-nav decisions — they ride on the existing manifest model.

## Open candidates — for Artem to accept or reject

Tasks I'd suggest adding to the backlog. Not yet committed.

- **Notifications surface.** No slot exists today for system messages, billing alerts, tenant invites, or security events. Touches all three principles. *Verdict pending.*
- **User-menu refinement.** Currently a stub. Decision logged 2026-05-05 keeps the v6 sidebar-mode toggle on the rail (not in the user menu) — but what *should* be in the user menu? Profile, theme, sign-out, tenant switcher (cross-references A5)? *Verdict pending.*
- **Dark-mode parity audit.** WADS supports dark; the prototype is light-first. Light-mode surface-stacking gotchas are documented (memory: `project_wads_color_tokens.md`); dark needs its own pass before any visible artifact ships dark. *Verdict pending.*

---

## How this doc works

- **Edit freely** — this is your working backlog. Reorder, expand, split, kill.
- **Marking done:** flip status to **Shipped** and add a one-line link to the `docs/decisions.md` entry. Don't delete shipped items — history is useful.
- **New items:** add to the bottom of the relevant group, or to *Open candidates* if uncertain.
- **Audience:** primarily Artem; secondarily anyone observing the project (PM, eng lead, exec). Technical detail is fine.
