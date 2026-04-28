# Global Navigation Prototype — v0 plan

Single source of truth for what we're building, why, and in what order. Distilled from [glossary.md](glossary.md), [references.md](references.md), [wireframes-flow.md](wireframes-flow.md), and [product-features.md](product-features.md). All decisions through 2026-04-28 are captured here; expect updates as more answers come from the team.

> **Status:** v0 working spec. Opinionated baseline meant to be reviewed and fine-tuned via PR before implementation starts. Nothing is locked. Implementation has **not** started — by Artem's instruction.

---

## What this doc is (and isn't)

**Is:**
- A spec describing what the v0 prototype must do.
- A sequenced milestone plan for building it.
- The authority for design decisions that have been made (everything else stays exploratory in `open-items.md`).

**Isn't:**
- Code. No component implementations live here.
- A backlog. The milestone plan is *what to build in what order*, not *every ticket the team will write*.
- Final. v0 is the first attempt — explicitly designed to be revised. Update the doc when decisions change; don't pretend the doc is immutable.

---

## Goals

The v0 prototype must demonstrate, end-to-end:

1. **A persistent platform shell** — left rail + top bar + main canvas — that hosts multiple Products under one chrome.
2. **The Russian-doll drill flow** — a Feature can be unscoped (terminal) or gated by a Scope; selecting a Scope replaces the second column with the next level's sub-nav, and the same primitive recurses to 4+ levels.
3. **Manifest-driven Products** — at least four Products (Edge, AI Hypervisor, Infra Discovery, Testing) declare their structure via a Manifest. The shell renders the chrome from the Manifest; teams don't write chrome code.
4. **Switcher hover-preview** — hovering a Product peeks its level-2 sub-nav as an overlay on the current second column.
5. **Platform utilities** — Settings (with the existing Console items), Docs, User account — sharing the second-column primitive but living *outside* any Product.
6. **Lock-and-show entitlement gating** — at least one Feature rendered as visible-but-disabled with a lock icon (matches the existing Console behavior on "Security Edge").
7. **A coherent mock world** — enough mock data that clicking through the prototype feels like exploring a real product, not a wireframe.

The shell must look, feel, and behave like something the team can react to with strong opinions — that's the entire point of this prototype.

## Non-goals (explicitly out of scope for v0)

- Real API integration of any kind.
- Real authentication / authorization. Mock the user as Artem.
- Per-Product state preservation across switches (Option C from Q4). Click resets — Option A.
- Multiple `dataplane-id`s open in parallel via tabs. One scope at a time.
- ⌘K / Palette implementation. The top bar shows a static `Global search cmd+k` indicator only.
- Pin / Favorites. Defer to post-v0.
- Editor-swap (Vercel deployment / Postman workbench style). Defer.
- Filter strip (per-page time / env / region selectors). Defer; sidebar handles all in-scope state.
- Mobile / responsive behavior. v0 targets desktop only.
- Analytics, telemetry, real performance benchmarks.
- The 2026-06-04 embargo scrub. Tracked separately in [open-items.md](open-items.md).

---

## Design principles (the load-bearing rules)

These are the rules every component decision should respect. If something contradicts them, push back.

1. **URL is the source of truth.** Every navigable state — selected Product, selected Scope, selected Feature, deeper drill — is encoded in the URL. The shell renders from URL, never from in-memory state alone. Browser back/forward must work.
2. **Two-level chrome ceiling.** The chrome surfaces at most two columns at any time: the rail (level 1) plus one sub-nav column. Depth past level 2 is achieved by *replacing* the sub-nav column's contents, not by adding a third rail.
3. **Replace, don't stack.** Drilling into a Scope or a drillable Feature swaps the current second column for the next level's contents. `< back` and breadcrumb chip-`×` are the affordances that walk the path.
4. **Manifest-driven.** Products and Platform utilities declare their structure (sections, items, scope requirements, route patterns) via a Manifest object. The shell consumes Manifests; it has no hardcoded knowledge of Edge, AI Hypervisor, etc.
5. **One scope at a time.** A user is in one Product, in one Scope (or none), at one Feature. No tabs across scopes. No parallel contexts.
6. **Click commits, hover previews.** Clicking a Product in the rail commits to it (and resets prior Product state). Hovering peeks via the Switcher hover-preview overlay.
7. **Mock data only.** No fetch calls to real services. All data is fixtures in `lib/mock-data/`.
8. **WADS first, raw Tailwind last.** Use `@wallarm-org/design-system` components for chrome and content. If something isn't in WADS, build a minimal local component in `src/nav/` rather than composing from utility classes. Match the platform's import style (per-component imports, no barrels).

---

## Decisions log (locked through 2026-04-28)

| # | Decision | Rationale source |
|---|---|---|
| D1 | **Vocab**: top-level bucket = **Product**; child of Product or Scope = **Feature** (recursive); the gate is a **Scope**; leaf is a **Resource** | [glossary.md](glossary.md) |
| D2 | **Two-level chrome ceiling**, replace-don't-stack | [references.md](references.md), wireframe Frames 77:5341 / 77:5522 |
| D3 | Both `< back` and breadcrumb chip-`×` exist; both work | Q1 answer 2026-04-28 |
| D4 | Second column is **one consistent color** at all depths (no depth-coded color) | Q2 answer 2026-04-28 |
| D5 | **Home is a special shell type**, not a Product Manifest. Renders only the main canvas with cross-Product summary widgets | Q3 answer 2026-04-28 |
| D6 | **Click on a Product = Option A reset.** No per-Product state preservation in v0 | Q4 answer 2026-04-28 |
| D7 | **Switcher hover-preview**: hovering a rail Product overlays its level-2 sub-nav on top of the current second column. Clicking inside the overlay commits | Q4 answer 2026-04-28 |
| D8 | **No "Main menu" item** in Settings sub-nav (carry-over from previous-platform screenshot, not part of the new model) | Q5 answer 2026-04-28 |
| D9 | **Scope picker = table only, for data planes only** in v0. Other Products may add their own pickers later. The popover in Frame 77:5148 was sample data, not a recurring component | Q6 answer 2026-04-28 |
| D10 | **One scope at a time.** No parallel `dataplane-id` tabs | Q7 answer 2026-04-28 |
| D11 | **Sub-nav at every level scales to many Features**, with scrolling when long. v0 mock for `dataplane-id` uses FigJam's 4 + extras pulled from `current-ia.md` | Q8 answer 2026-04-28 |
| D12 | Tile / waffle launcher off the table; left-rail peer-product pattern is the default | [references.md](references.md) |
| D13 | **Distributed Settings**: Tool-specific (Feature-specific) settings live with the Feature; only cross-cutting goes in the Settings Platform utility | [glossary.md](glossary.md), Cloudflare / Supabase precedent |

Cross-link: detailed reasoning per decision lives in `wireframes-flow.md` (the Open Questions section, now resolved) and `glossary.md` (terms).

---

## Anatomy specification

The chrome has four regions plus a swap-in second column. Each region's job is bounded.

### Top bar (height ~40-48px, full width)

Persistent. Does not change as the user navigates within a Product. Contents (left → right):

- **Brand mark** (Wallarm logo) — clickable, returns to Home.
- **Spacer / center region** — `Global search cmd+k` indicator. Static for v0 (not interactive).
- **Tenant chip** — `tenant ⌄` dropdown. Decorative for v0; clicking does nothing (or opens an empty popover noting "tenant switcher TBD").
- **Limits indicator** — `limits` icon + label. Decorative. Could show static "1.2k / 5k events" in mock.

Visual: pink/coral accent strip per the wireframes. WADS theme variables; no hardcoded color.

### Left rail (width ~64-88px, full height)

The "global root navigation" per Artem's annotation. Persistent. Two stacked sections separated by space:

**Top stack (Products):**
- **Home** — first item, special (clicking lands on the Home canvas; no second column).
- **Edge** (folder icon)
- **AI-H** (folder icon) — short label for AI Hypervisor
- **Infra** (folder icon) — short label for Infra Discovery
- **Testing** (folder icon)

(Order matches the wireframes' rail order.)

**Bottom stack (Platform utilities):**
- **Docs** (help icon)
- **Settings** (gear icon)
- **User** (person icon)

Each item: icon (24px) + short label below. Active-item gets a highlight (matches wireframes' selected state). Hover triggers Switcher hover-preview (see *State management* below) for the Products stack only — Platform utilities do not hover-preview unless we explicitly extend the pattern.

### Second column (width ~240-280px, full height minus top bar)

Conditional. **Hidden when Home is active.** Renders when any Product or Platform utility is active.

Structure:
- Optional `< back` link at top (level 3+ only; the `< back` is *not* shown on the level-2 sub-nav since there's nothing to go back to that the rail doesn't already provide).
- Header showing the current Product / Scope / parent name.
- Body: scrollable list of Features and collapsible Group sections.
  - **Items**: single Features, optionally drillable, optionally locked.
  - **Groups**: titled collapsible containers (Group name ⌄) holding child items.
- Optional footer slot (not used in v0 except as Manifest extension point).

When the user drills into a Scope or a drillable Feature, **the entire body content is replaced** with the next level's items. The rail and top bar do not change.

### Main canvas (remaining width, full height minus top bar)

Where the actual content lives. Three modes:

- **Home mode**: Summary widgets aggregating cross-Product info. Shell-rendered, no Manifest.
- **Feature page mode**: Whatever the active Feature renders. For v0, mostly placeholder content with the Feature's name as a heading.
- **Scope picker mode**: When the user is on a gated Feature without a Scope selected, the canvas shows the picker — for v0 that's the data-plane table with `+ ADD new`.

A **breadcrumb / context strip** sits at the very top of the canvas (above the Feature heading). Format:

```
PRODUCT > [Scope chip ×] > Feature > sub-Feature > ...
```

- Each segment after `PRODUCT` is clickable to navigate up.
- The Scope chip uniquely renders as a pill with `×` — clicking `×` clears that scope without traversing up the rest of the path. (e.g., from `EDGE > [Plane ABC ×] > Services > svc-123 > Routes`, clicking `×` returns to `EDGE > Data planes` with the picker re-shown.)
- No tenant or Home segment in the breadcrumb. Always starts at the Product.

### Switcher hover-preview overlay

Floats on top of the second column when the user hovers a Product in the rail. Width matches the second column. Shows the *target* Product's level-2 sub-nav — sourced from that Product's Manifest. Disappears when the cursor leaves.

Click semantics inside the overlay:
- Click a Feature → commit. Navigate to that Feature in the target Product (which means: switch Products, reset prior state, land on the Feature).

This is the only place where the second column's *visual contents* change without a URL change happening first — the overlay is purely visual until the user clicks. URL changes only on click.

---

## Manifest contract

Every Product and Platform utility declares a Manifest. The shell consumes Manifests; teams own their Manifest content.

### TypeScript shape (v0 working spec)

```ts
type FeatureNode = {
  id: string;                 // unique within the Manifest
  label: string;              // display label
  icon?: string;              // WADS icon name
  href?: string;              // route — required if terminal (no children)
  children?: FeatureNode[];   // recursive — present if drillable
  scopeRequirement?: string;  // e.g. "dataplane-id" — required to render children
  locked?: boolean;           // entitlement-gated; renders disabled with lock icon
  pinnable?: boolean;         // future: user can pin (not in v0)
};

type GroupNode = {
  type: "group";
  id: string;
  label: string;              // displayed as collapsible group header
  collapsed?: boolean;        // initial state; defaults to expanded
  children: FeatureNode[];
};

type SidebarNode = FeatureNode | GroupNode;

type ProductManifest = {
  type: "product";
  id: string;                 // e.g. "edge", "ai-hypervisor"
  label: string;              // display label in the rail
  shortLabel?: string;        // e.g. "AI-H" for narrow rail label; defaults to label
  icon: string;               // WADS icon name, used in the rail
  defaultLandingId: string;   // FeatureNode id to land on when Product is clicked
  sidebar: SidebarNode[];     // level-2 sidebar contents
};

type PlatformUtilityManifest = {
  type: "platform-utility";
  id: string;                 // e.g. "settings"
  label: string;
  icon: string;
  defaultLandingId: string;
  sidebar: SidebarNode[];
};

type Manifest = ProductManifest | PlatformUtilityManifest;
```

Home has **no Manifest** — it's shell-rendered. The shell knows about Home as a hardcoded entry.

### Where Manifests live

`src/nav/manifest/<id>.manifest.ts` exports a default `Manifest`. A central registry `src/nav/manifest/registry.ts` aggregates them and the shell reads from the registry to render the rail and the second column.

### Recursion semantics

A `FeatureNode` with `children` is drillable. When the user navigates to it, the second column replaces its contents with that node's children. This is recursive — a child can itself have children.

A `FeatureNode` with `scopeRequirement` is gated. The user must select a Scope (typically by interacting with the canvas — e.g., the data-planes table) before children are reachable. Mechanics:
- If no Scope is selected, the canvas shows the Scope picker UI; the second column shows the level-2 sidebar with this Feature highlighted.
- After Scope selection, the URL gains a scope segment (e.g., `/edge/data-planes/plane-abc/...`); the second column swaps to the Feature's children, scoped to the selected resource.

A `FeatureNode` with `href` is terminal. Clicking it navigates and the canvas renders the Feature's page. The sidebar does not swap.

### Manifest types in v0

- `edge` — Product, full Manifest with Scope-gated `data-planes` Feature
- `ai-hypervisor` — Product, with the 10 Features from the screenshot (no Scope gate in v0; Heatmap as default landing)
- `infra-discovery` — Product, artificial Features
- `testing` — Product, artificial Features
- `settings` — Platform utility, mirroring `current-ia.md` Settings + Admin Zone structure
- `docs` — Platform utility, stub (single page or external link)
- `user` — Platform utility, stub

---

## State management

### URL is canonical

Path schema:

```
/                                                    → Home
/<product-id>                                        → Product default landing
/<product-id>/<feature-id>                           → Unscoped Feature page
/<product-id>/<scope-feature-id>                     → Gated Feature picker (no scope yet)
/<product-id>/<scope-feature-id>/<scope-resource>    → Scoped, level-3 default landing
/<product-id>/<scope-feature-id>/<scope-resource>/<feature-id>             → level-3 Feature
/<product-id>/<scope-feature-id>/<scope-resource>/<feature-id>/<resource> → level-4 (drilled)
... and so on, recursively.

/<utility-id>                                        → Platform utility default landing
/<utility-id>/<feature-id>                           → Platform utility Feature page
```

Examples:
- `/` → Home
- `/edge` → Edge → Overview (its default landing)
- `/edge/attacks` → Edge → Attacks (terminal, unscoped)
- `/edge/data-planes` → Edge → Data planes picker (table view, no scope yet)
- `/edge/data-planes/plane-abc` → Edge inside Plane ABC, level-3 default landing
- `/edge/data-planes/plane-abc/services` → Plane ABC → Services
- `/edge/data-planes/plane-abc/services/svc-123` → drilled into a service (level 4)
- `/edge/data-planes/plane-abc/services/svc-123/routes` → level 5
- `/settings` → Settings → Profile (default)
- `/settings/users` → Settings → Users

The shell renders the rail, second column, breadcrumb, and canvas purely from URL parsing + the relevant Manifest. **No URL = no state**: refreshing the page restores exactly what the user saw.

### Cross-Product teleport (Option A)

When the user clicks a Product in the rail:
- URL replaces to `/<new-product-id>` (the default landing).
- Prior Product's URL state is **not** preserved.
- The second column re-renders from the new Product's Manifest.

When the user *hovers* a Product:
- No URL change.
- The Switcher hover-preview overlay renders the target Product's level-2 sidebar on top of the current second column.
- Releasing hover removes the overlay.

When the user clicks inside the overlay:
- URL replaces to `/<new-product-id>/<feature-id>` (the clicked Feature in the target Product).
- This is a commit — same effect as if the user clicked the Product rail item and then clicked the Feature in the new sidebar.

### Single scope at a time

The URL only ever encodes one Scope per gated Feature. Switching to a different `dataplane-id` is achieved by:
- Clicking `×` on the breadcrumb chip → returns to `/edge/data-planes` (picker), preserving any deeper path is impossible because deeper paths are bound to the dismissed scope.
- Clicking `< back` → returns to the previous level (one step up).
- Picking a different plane from the data-planes table → URL replaces to `/edge/data-planes/<new-plane>/...` with the level-3 default landing.

### Active state derivation

The rail's active item = first segment of URL path (or "home" if empty).
The second column's active item = the deepest Feature segment matching a node in the active Manifest.
The breadcrumb = each URL segment mapped to its Manifest label, with the Scope segment rendered as a chip.

---

## Entitlement / Lock-and-show

In v0, entitlement is mocked via a `locked: boolean` flag on `FeatureNode`. The shell renders locked Features:
- Same position in the sub-nav as unlocked Features.
- Lock icon next to the label (orange or dim color, per existing Console).
- Disabled cursor on hover; click does nothing or shows a tooltip ("This Feature requires an upgrade").
- Tooltip text comes from a sibling field if needed.

For v0, apply `locked: true` to **Edge → Configuration → Security Edge** to match the existing Console (per the screenshot Artem shared 2026-04-28). Mock other locked Features as needed to demonstrate the pattern.

A simple **flag panel** in dev (per CLAUDE.md's `nav/flags.ts` suggestion) lets us toggle key states (e.g. `securityEdgeUnlocked: true`) and watch the lock icon disappear. Not user-visible in production-equivalent view; accessible via a hidden keyboard shortcut or `?debug=1` URL param in dev.

---

## Mock data plan

All mock data lives in `src/lib/mock-data/`. Goal: enough realism that clicking through feels like exploring a product.

### Edge Manifest (mock)

Use the existing-Console grouping (per `current-ia.md`) as the v0 baseline. Expected to be reshuffled in a future redesign — that's fine; the prototype is the place to play.

```
Edge
├── Overview                                  (terminal, unscoped)
├── Dashboards                                (terminal, unscoped — link or stub)
├── Group: Events
│   ├── Attacks
│   ├── Incidents
│   ├── Security Issues
│   └── API Sessions
├── Group: API Security
│   ├── API Attack Surface
│   ├── API Discovery
│   ├── API Abuse Prevention
│   └── API Specifications
├── Group: Security controls
│   ├── IP & Session Lists
│   ├── Triggers
│   ├── Rules
│   ├── Mitigation Controls
│   └── Credential Stuffing
├── Group: Security Testing
│   ├── Threat Replay
│   └── Schema-Based
├── Group: Configuration
│   ├── Nodes
│   ├── Security Edge          (locked: true)
│   └── Integrations
└── Data planes                               (gated; scopeRequirement: "dataplane-id")
    └── (children rendered when a plane is selected — see below)
```

### Edge → Data plane Scope picker

Mock 5 planes (matching Frame 77:5148):
- `production` — Live customer traffic
- `staging` — Pre-prod environment
- `development` — Developer sandbox
- `edge-eu` — European edge nodes
- `edge-us` — North American edge nodes

Picker UI: a table on the Edge → Data planes canvas with columns (Name, Description, Status, Last update). `+ ADD new` button is decorative (opens a stub modal or no-op).

### Edge → Data planes → `<plane>` (level-3 sidebar)

Per Q8 decision, use FigJam's 4 + extras for capacity. Working draft:

```
[Plane name]
├── < back                                    (chrome affordance)
├── Overview                                  (dataplane-scoped)
├── Nodes                                     (terminal)
├── Services                                  (drillable to level-4)
│   └── (per-service drill, see below)
├── Govern                                    (terminal)
├── Group: Operations
│   ├── Logs
│   ├── Metrics
│   └── Alerts
├── Routing rules                             (terminal)
└── Settings                                  (terminal — dataplane-specific settings)
```

The "Services" Feature is the recursion driver — it drills to a per-service tree.

### Edge → Data planes → `<plane>` → Services → `<service-id>` (level-4)

Mock 3-5 services. Each service drills to:

```
[Service name]
├── < back
├── Routes                                    (drillable to level-5)
├── Flows                                     (drillable to level-5)
└── Setting                                   (terminal)
```

### Edge → ... → Routes → `<route-id>` (level-5)

Mock 2-3 routes. Each route drills to:

```
[Route name]
├── < back
├── flow                                      (terminal — for v0, a placeholder page)
└── policies                                  (drillable to level-6 — proves recursion)
    └── <policy-id>                           (terminal — final leaf)
```

### AI Hypervisor Manifest (mock)

Per the screenshot (`product-features.md`):

```
AI Hypervisor
├── Heatmap                                   (default landing — terminal for v0)
├── Registry                                  (terminal)
├── Topology                                  (terminal)
├── Data Tracks                               (terminal)
├── User Tracks                               (terminal)
├── Supply Chain                              (terminal)
├── Enforcement                               (terminal)
├── Integrations                              (terminal)
├── Red Team                                  (β label; terminal)
└── Debugger                                  ("Ebbers" label; terminal — clarify with team)
```

No Scope gating in v0 unless we learn otherwise. Heatmap page mocks the table from the screenshot (AI Agents / MCP Servers / LLM Providers / APIs / Data Sources rows).

### Infra Discovery Manifest (artificial — placeholder)

```
Infra Discovery
├── Overview                                  (default landing)
├── Inventory                                 (terminal)
├── Topology                                  (terminal)
├── Findings                                  (terminal)
├── Risks                                     (terminal)
├── Integrations                              (terminal)
└── Settings                                  (terminal)
```

### Testing Manifest (artificial — placeholder)

```
Testing
├── Overview                                  (default landing)
├── Test Suites                               (terminal)
├── Schedules                                 (terminal)
├── Results                                   (terminal)
├── Coverage                                  (terminal)
└── Settings                                  (terminal)
```

### Settings Manifest (Platform utility)

Per `current-ia.md` lines 80-101, minus the "Main menu" item per D8:

```
Settings
├── Profile                                   (default landing)
├── General
├── Subscriptions
├── Applications
├── Users
├── API Tokens
├── Activity Log
└── Group: Admin Zone
    ├── Customer Settings
    ├── System Configuration
    ├── BOLA Triggers
    └── Experiments
```

### Docs / User Manifests

For v0:
- **Docs**: opens an external doc page in a new tab (per FigJam annotation: "new tab → doc center"), or stubs a single in-shell page.
- **User**: a stub Platform utility with Profile, Sign out, Theme toggle (placeholder).

---

## Implementation milestones

Sequenced. Each milestone is a small, reviewable chunk that produces visible progress. A milestone is "done" when the v0 plan's behaviors for that scope work in the browser.

### M1 — Foundations

- Scaffold Next.js App Router structure: `(with-nav)` route group with layout + page.
- Build the **shell skeleton**: top bar (brand, search indicator, tenant chip, limits), left rail with empty stacks, empty main canvas.
- Hook up WADS provider, theme imports in `globals.css`.
- Verify routes resolve and the shell renders at `/`.

**Deliverable**: A blank shell at `localhost:3000/` with no Products yet, no second column.

### M2 — Manifest contract & Edge static

- Define the Manifest TypeScript types in `src/nav/manifest/types.ts` (matching the spec above).
- Build the registry in `src/nav/manifest/registry.ts`.
- Author the Edge Manifest with **unscoped Features only** (Overview, Dashboards, Events group, etc., but skip the Data planes Feature for now).
- Render the rail from the registry (Home + Edge + Home placeholder for AI-H/Infra/Testing).
- Render the second column from Edge's Manifest when `/edge` is active. Collapsible Group sections work.
- Click an unscoped Feature → URL updates → main canvas renders a placeholder page with the Feature's label as heading.
- Breadcrumb shows `EDGE > <Feature>`.
- Click Home in the rail → second column hides, main canvas shows the Home stub.

**Deliverable**: User can navigate Edge's level-2 unscoped Features. Breadcrumb works. URL is canonical.

### M3 — Scope picker & level-3 swap

- Add the `Data planes` gated Feature to the Edge Manifest with `scopeRequirement: "dataplane-id"`.
- When `/edge/data-planes` is active and no scope is selected: canvas renders the data-planes table with 5 mock planes (Production / Staging / Development / Edge-EU / Edge-US) + `+ ADD new` (decorative).
- Click a plane row → URL becomes `/edge/data-planes/<plane-id>` → level-3 sidebar swaps in (header = plane name, items = Nodes / Services / Overview / Govern + extras).
- `< back` link at top of level-3 sidebar returns to `/edge/data-planes`.
- Breadcrumb gains the `[plane-name ×]` chip. Clicking `×` returns to `/edge/data-planes`.

**Deliverable**: User can pick a data plane and see the level-3 sub-nav. Both backout affordances work.

### M4 — Recursive drill

- Add `Services` as a drillable Feature in the level-3 sub-nav. Mock 3 services.
- Click `Services` → level-3 sidebar swaps to a list of services (or `Services` is itself a list page; design choice — favor list-page-with-deeper-sidebar). Clicking a service drills to level-4.
- Level-4 sidebar shows Routes / Flows / Setting per the FigJam.
- Drill `Routes` → level-5 (mock 2 routes). Drill a route → level-6 placeholder (`flow` terminal, `policies` further drillable).
- Verify the same primitive handles every level — no special-casing per depth.
- Breadcrumb extends correctly: `EDGE > [plane ×] > Services > svc-1 > Routes > route-1`.
- `< back` walks up one level at a time. Breadcrumb segment clicks navigate up to that segment.

**Deliverable**: Recursion proven. The Edge → ... → policy-id path is reachable end to end.

### M5 — Other Products

- Author Manifests for AI Hypervisor, Infra Discovery, Testing.
- AI Hypervisor: 10 Features per the screenshot. Heatmap as default landing — render a placeholder of the heatmap table rows.
- Infra and Testing: artificial Feature sets per this doc.
- Click a Product in the rail → URL replaces to `/<product-id>` → second column swaps to that Product's Manifest. Default landing renders.
- Verify Option A behavior: switching Products does **not** preserve the prior Product's deep state. Going back to Edge lands at `/edge` (default), not the previously visited route.

**Deliverable**: All four Products are navigable. Click-resets work as specified.

### M6 — Switcher hover-preview

- Implement the hover overlay component in `src/nav/shell/hover-preview.tsx`.
- When the user hovers a Product in the rail, render the target Product's level-2 sub-nav as a positioned overlay on top of the current second column. Same width as the second column.
- Overlay is read-only-looking but interactive: clicking a Feature in the overlay commits (URL replaces to `/<target-product>/<feature-id>`).
- Releasing hover (cursor leaves both the rail item and the overlay) removes the overlay.
- Add a small hover delay (~150ms) to avoid flicker on accidental hovers.

**Deliverable**: User can peek another Product's contents without committing. Click commits.

### M7 — Platform utilities

- Author Settings Manifest per `current-ia.md` (no Main menu item per D8; include Admin Zone group).
- Author stub Manifests for Docs and User.
- Render the bottom of the rail with these three utilities.
- Click Settings → second column shows the Settings sub-nav. URL becomes `/settings` → defaults to `/settings/profile`.
- Verify Distributed Settings: Edge's per-Feature settings (e.g. Data plane → Settings) live inside Edge's tree, *not* duplicated in the global Settings.
- Docs: opens external link in new tab (use `<a target="_blank">` with mock URL like `#docs`).
- User: stub Platform utility with Profile / Theme / Sign out items.

**Deliverable**: Platform utilities work. Settings shows the existing Console items.

### M8 — Lock-and-show

- Add `locked` flag handling in the sidebar render code.
- Locked items render: same position, dimmed label, lock icon (use WADS icon), `aria-disabled`, `cursor-not-allowed`. Optional tooltip ("Requires upgrade") on hover.
- Apply `locked: true` to Edge → Configuration → Security Edge in the Edge Manifest.
- Add a dev flag panel (`src/nav/flags.ts` per CLAUDE.md) toggleable via `?debug=1` URL param. One toggle: `securityEdgeUnlocked`.
- Verify the lock state is reactive (toggle flag → lock icon appears/disappears without reload).

**Deliverable**: Lock-and-show works. Flag panel proves the entitlement-driven behavior.

### M9 — Polish

- Fill out placeholder Feature pages with realistic-looking mocks (use WADS layout primitives — cards, tables, headers).
- Make Home's summary widgets feel real (mock counts: "5 active data planes," "12 alerts," "3 recent attacks" — pulled from `lib/mock-data/`).
- Verify visual fidelity matches WADS theme variables; no hardcoded colors anywhere.
- Tighten transitions: rail hover animations, second-column swap animations, breadcrumb chip-`×` ergonomics.
- Test the full flow at multiple depths; ensure browser back/forward works at every level.
- Sanity check accessibility basics: focus rings, aria-labels on icon-only items, keyboard nav of the rail and sidebar.

**Deliverable**: A coherent, polished v0 demonstrating the full nav model end to end. Ready for team review.

---

## Suggested file layout (refined from CLAUDE.md)

```
src/
├── app/
│   ├── (with-nav)/
│   │   ├── layout.tsx                          # Renders the shell
│   │   ├── page.tsx                            # Home (rendered by shell, no second column)
│   │   └── [productOrUtility]/[[...path]]/page.tsx   # Catch-all for Products + Platform utilities
│   ├── globals.css                             # WADS theme imports
│   └── layout.tsx                              # Root layout (no shell)
├── nav/
│   ├── shell/                                  # Chrome components
│   │   ├── shell-layout.tsx                    # Composes top-bar + rail + canvas + second-column
│   │   ├── top-bar.tsx
│   │   ├── rail.tsx                            # Left rail (Products + Platform utilities)
│   │   ├── second-column.tsx                   # Replaceable level-2+ sidebar
│   │   ├── breadcrumb.tsx                      # Context strip with chip-×
│   │   ├── hover-preview.tsx                   # Switcher hover-preview overlay
│   │   └── home.tsx                            # Special Home canvas
│   ├── manifest/
│   │   ├── types.ts                            # Manifest TS types (the contract)
│   │   ├── registry.ts                         # Aggregates all Manifests
│   │   ├── edge.manifest.ts
│   │   ├── ai-hypervisor.manifest.ts
│   │   ├── infra-discovery.manifest.ts
│   │   ├── testing.manifest.ts
│   │   ├── settings.manifest.ts
│   │   ├── docs.manifest.ts
│   │   ├── user.manifest.ts
│   │   └── index.ts
│   └── flags.ts                                # Dev flag panel for entitlement toggles
└── lib/
    ├── mock-data/
    │   ├── data-planes.ts                      # 5 mock planes
    │   ├── services.ts                         # Mock services per plane
    │   ├── routes.ts                           # Mock routes per service
    │   ├── policies.ts                         # Mock policies per route
    │   ├── settings.ts                         # Mock account/users
    │   └── home-summary.ts                     # Cross-Product summary widgets data
    └── url.ts                                  # URL parsing / building helpers
```

This is a **suggestion**, expected to evolve in M1 once the actual code lands. Especially the `[productOrUtility]/[[...path]]/page.tsx` catch-all may need refinement based on Next.js 16 routing semantics.

---

## Open / parking lot (not blocking v0)

Items that surfaced during planning but aren't required for v0. Track separately so they don't bloat the milestone scope.

- **Switcher hover-preview — clicks inside overlay**: defaulted to "interactive (commits on click)." Confirm with Artem before M6.
- **Color cue for depth**: defaulted to "no depth-coded color, single second-column treatment." Could re-introduce subtle depth cues in v1 if user testing reveals depth confusion.
- **Tenant chip behavior**: decorative in v0. Decide tenant scoping model post-v0.
- **⌘K Palette**: deferred. Plan in v1 with sigil prefixes per references.md.
- **Per-Product state preservation**: explicitly Option A in v0. Revisit if user testing shows users wanting Option C.
- **Pin / Favorites**: post-v0.
- **Filter strip**: post-v0; not needed in any current Feature.
- **Editor-swap**: post-v0; not needed for v0 scope.
- **Mobile / responsive**: post-v0.
- **Real entitlement model**: v0 mocks via flags. Real model is engineering's call later.
- **Embargo scrub**: deadline 2026-06-04 (per `open-items.md` follow-up). Independent of v0 milestones.

---

## Cross-references

- **Vocabulary**: [glossary.md](glossary.md)
- **Vendor research backing the patterns**: [references.md](references.md)
- **Wireframe analysis with Q&A decisions**: [wireframes-flow.md](wireframes-flow.md)
- **Per-Product Feature inventory**: [product-features.md](product-features.md)
- **Existing Wallarm Console nav audit**: [current-ia.md](current-ia.md)
- **Open structural questions**: [open-items.md](open-items.md)
