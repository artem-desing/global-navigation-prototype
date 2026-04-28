# Global Navigation Prototype — Wireframes flow analysis

Analysis of the navigation flow Artem wireframed in Figma `1GJb0riOtfuLA8MMqrDdCo`, canvas `77:5101` ("Jam"). Captured 2026-04-28. Wireframes use placeholder labels ("Section", "Sub-Section"); this doc reads them as the structural primitives they're standing in for, mapped where possible to known content from [product-features.md](product-features.md) and [current-ia.md](current-ia.md).

The wireframes show the **"Russian doll" flow** Artem described: each drill-down level **replaces** the previous sub-nav rather than stacking columns. This validates several positions taken in [glossary.md](glossary.md) and [references.md](references.md), and refines a few others.

---

## Anatomy of the chrome (the LEGO bricks composed)

Three persistent regions plus a swap-in second column. From the wireframes:

| Region | What's there | Persistent? |
|---|---|---|
| **Top bar** (pink accent) | Brand mark (left), `Global search cmd+k` (center), `tenant ⌄` picker (right), `limits` indicator (far right) | Always visible |
| **Left rail** ("global root navigation") | **Top stack**: Home + Products (Edge, AI-H, Infra, Testing) — all with folder icons + label.<br>**Bottom stack**: Platform utilities (DOCS, Settings, USER) | Always visible |
| **Second column** (Product / Scope sub-nav) | Appears when a Product *or* a Platform utility is selected. Header (Product or Scope name) + sections + collapsible groups + footer items | Conditional; **replaces itself** at each drill-down |
| **Main canvas** | Page content | Always visible |
| **Breadcrumb strip** | Top of main canvas. Format: `PRODUCT > [scope chip ×] > Feature > sub-Feature ...` | Visible whenever scope/feature path > 1 |

Things explicitly **NOT** in the chrome:
- No tile / waffle launcher (matches our reference research — absent from every reference vendor).
- No third nav column at any depth — drill-downs always swap the second column.
- No global breadcrumb above the top bar — the breadcrumb lives **inside** the main canvas, scoped to the active Product.

---

## The Russian-doll flow — frame by frame

### Frame 77:5102 — Home (entry state)

- Left rail: **Home** is the active entry (highlighted). Products listed underneath: Edge, AI-H, Infra, Testing.
- Bottom of rail: DOCS, Settings, USER — Artem's annotation calls out *"global 'root' navigation"* twice (once for the Products stack, once for the Platform utilities stack), confirming the entire rail is one navigational level even though it's visually split.
- Main canvas: `Home — hi artem` heading + 4 widget placeholders (3 across the top, 1 wide below). These are personal widgets — matches your existing Vercel annotation that *"widgets must not be static — optimize for combinations of enabled products."*
- No second column shown. Home is its own destination, not a drill-down trigger.

**Open question:** does Home behave like a Product (with its own level-2 sidebar), or is it always a single-page widget surface? Frame shows the latter.

### Frame 77:5148 — Edge selected, Data planes Feature selected (gating Feature with picker)

- Left rail: **EDGE** highlighted; Home no longer active.
- **Second column appears** with `EDGE` header. Items (placeholder labels in the wireframe; mapping to known content where applicable):
  - **Overview** — unscoped landing
  - **Data planes** (selected, red highlight) — the gating Feature
  - Section, Section, Section — placeholders. From `current-ia.md` these would map to ungrouped items like Attacks Library, Welcome, etc. when relevant flags are on.
  - **Group name** ⌄ (collapsible) → 4 child Sections — placeholders. Maps to existing Console groups: e.g. **API Security** (API Attack Surface, API Discovery, API Abuse Prevention, API Specifications) or **Security controls** (5 items including Triggers, Rules, etc.)
  - 3 more bottom Sections — placeholders for additional groups or ungrouped Features
- Breadcrumb: `EDGE > Data planes`.
- Main canvas: `All data planes` heading + `+ ADD new` button + table of data planes. **Plane ABC** row highlighted in red (mid-selection state). A "SELECT A DATA PLANE" popover floats at bottom-right with five sample planes:
  - **Production** — Live customer traffic
  - **Staging** — Pre-prod environment
  - **Development** — Developer sandbox
  - **Edge — EU** — European edge nodes
  - **Edge — US** — North American edge nodes (selected, red dot)

These five planes are the **example axes** for the Edge Scope. They're tied to environment + region — both deployment-stage *and* geographic. Worth noting: the Scope picker isn't just "pick one of three environments" — it's a richer list mixing environment names with regional Edge deployments.

**Annotations:** *"app navigation — 2nd and x-level (dynamic as product goes)"* — confirms levels 2+ are per-Product, declared via Manifest. *"planes examples"* — the popover content is illustrative, not exhaustive.

### Frame 77:5248 — Edge terminal Feature selected (no drill into data plane)

- Same Edge level-2 sub-nav as Frame 77:5148.
- A Section (placeholder) is selected (red highlight) — but this Section is ungated.
- Breadcrumb stays at: `EDGE > Section`.
- Main canvas: simple page header + content area.
- Annotation: *"section that don't require plane selection → we see final section page"* and *"2nd level → final destination → as selected sections has no drill down."*

**The unscoped path is short-circuited.** No level swap, no Scope picker, no 3rd-level sidebar — just navigate to the page. This confirms the dual-mode behavior we wrote up in [open-items.md](open-items.md): within Edge, some Features are *unscoped* (Overview, Attacks, WAF rules) and resolve directly; others are *scoped* (Data planes) and trigger the level-swap flow.

### Frame 77:5341 — Data plane selected, inner navigation (3rd level)

This is the central pattern. After picking a plane in the popover from Frame 77:5148:

- Left rail unchanged (EDGE still highlighted).
- **Second column REPLACED**, not stacked:
  - `< back` affordance at top (annotation: *"go back to the prior 2nd level navigation"*) — explicit way to return to the Edge Features list.
  - Header: **`Plane ABC`** — the column title is now the selected plane's name.
  - Items: Overview, Section x4, collapsible **Group name** with 3 child Sections, more Sections, **"Section with 4th level"** (flagged as drillable), more Sections.
- Breadcrumb: `EDGE > [plane A ×] > Section`. The `×` on the plane chip lets you **clear the scope without using the back button** (annotation: *"click to change plane without going back (just in the breadcrumbs)"*).

**Annotations:** *"data plane is selected and now we see 3rd level nav (instead of 2nd level, prior one)"* — confirms the column has been replaced. *"3rd level (after plane selection) was swapped with 2nd level navigation"* — same point, restated.

What this validates from the glossary:
- **Replace, don't stack** — universal pattern from references research; now confirmed in our own wireframes.
- **Stable structure, dynamic binding** — the 3rd-level sidebar has its own structure (different from level 2), and items inside it bind to the chosen plane.
- **Breadcrumb segments as scope chips** — Plane chip with `×` is a per-segment dismiss/swap affordance.
- **Two render states for every gated Feature** — Frame 77:5148 = "no scope selected" (picker), Frame 77:5341 = "scope selected" (contextual sub-nav).

What this **refines** from the glossary:
- The `< back` button is **explicit** in the wireframe — alongside the breadcrumb chip `×`. Two ways to back out: chip-`×` clears just the scope, `< back` returns to the previous level. Worth deciding whether both are needed or if one is redundant.

### Frame 77:5522 — 4th level drill-down (recursion demo)

After clicking "Section with 4th level" in Frame 77:5341:

- Left rail unchanged.
- **Second column REPLACED AGAIN**:
  - `< back`
  - Header: **"Section with 4th level"** (the parent we drilled into)
  - Items: Sub-Section x3
- Breadcrumb: `EDGE > [plane A ×] > Section > Sub-Section`.
- Annotation: *"4th level (case to present 'nesting') was swapped with 3rd level navigation."*

This is the **recursion proof**: the replace pattern is the same primitive at every level. Level 2 → level 3 → level 4 → ... — each click on a drillable Feature swaps the current sub-nav for the next level's sub-nav, with `< back` and breadcrumb chips growing accordingly.

**Critical observation for the Manifest contract:** plug-in teams don't declare "level 2 vs level 3 vs level 4" — they declare a tree of Features where each Feature can either resolve (terminal page) or drill (its own list of children). The shell's job is to swap the second column based on the deepest selected node.

This corresponds to the FigJam path from `product-features.md`: `Edge → Dataplane → dataplane-id → Services → service-id → Routes → route-id → flow → policies → policy-id`. 5+ levels deep. The wireframes show how the **chrome** stays at exactly two columns (rail + one sub-nav column) regardless of how deep the *content tree* goes — exactly the "two-level chrome ceiling" from `references.md`.

### Frame 97:1548 — Settings selected (Platform utility)

Clicking **Settings** at the bottom of the rail:

- Left rail: **Settings** highlighted (active state).
- **Second column appears** — same visual pattern as Edge's level-2 sub-nav:
  - Header: **Settings** (gear icon)
  - **"Main menu"** entry at top with a back-arrow icon — annotation reads as a way to return to whichever Product was previously active. Worth confirming with Artem whether this is "back to last context" or "back to Home" or both.
  - Profile (selected), General, Subscriptions, Applications, Users, API Tokens, Activity Log
  - **ADMIN ZONE** sub-section header → Customer Settings, System Configuration, BOLA Triggers, Experiments

**Three things this confirms:**
1. **Platform utilities reuse the second-column primitive** — same shape as a Product's level-2 sidebar, just sourced from a Platform-utility Manifest instead of a Product Manifest.
2. **Distributed Settings vs. central Settings** — this Settings utility hosts cross-cutting concerns (members, billing, audit, identity). Tool-specific settings inside Edge Features still co-locate per `glossary.md`'s Distributed Settings rule.
3. **Settings inventory matches the existing Console** — the items here (Profile, General, Subscriptions, Applications, Users, API Tokens, Activity Log + Admin Zone) are exactly the existing Settings cluster from [current-ia.md](current-ia.md) lines 80-101. One-to-one carry-over.

---

## State transitions — the click-by-click flow

The full Russian doll, click by click, starting from Home:

1. **Home** → click `EDGE` in rail → second column appears with Edge's level-2 Features. Breadcrumb empty / says `EDGE`.
2. Click an **unscoped Feature** (e.g., "Section" placeholder) → main canvas shows the page. Breadcrumb: `EDGE > Section`. Sidebar unchanged.
3. **OR** click a **gated Feature** (e.g., "Data planes") → main canvas shows the picker (table of planes + popover with examples). Breadcrumb: `EDGE > Data planes`. Sidebar still shows level-2 with Data planes highlighted.
4. **Pick a plane** → second column **swaps** to the level-3 sub-nav for that plane. Header changes to "Plane ABC". `< back` appears at top of column. Breadcrumb: `EDGE > [Plane ABC ×] > <first auto-selected feature or empty>`.
5. Click a level-3 **terminal Feature** → main canvas shows the page. Breadcrumb extends. Sidebar unchanged.
6. **OR** click a level-3 **drillable Feature** (the wireframe's "Section with 4th level") → second column **swaps** to level-4. Breadcrumb extends. `< back` returns to level-3.
7. ... recurse as deep as the Product's Manifest declares.

**Two backout affordances at every drill level:**
- `< back` at the top of the second column → return to the previous level.
- `×` on a breadcrumb chip → clear that level's scope without traversing up. Useful for "swap to a different plane without losing where I was" flows.

**Switching to a Platform utility** (e.g., Settings):
- Click **Settings** at the bottom of the rail → second column swaps to the Settings sub-nav.
- The previous Product context is preserved (per the `Main menu` back-arrow at top of Settings — clicking it returns to the prior Product). This is Vercel's "scope-preserving slot" applied to Platform utilities.

**Switching between Products:**
- Click another Product (e.g., AI-H) in the rail → second column swaps to that Product's level-2 sub-nav. Open question: does the new Product land you on its Home / Overview, or on the *same Feature slot* if the target Product has it (Vercel rule)? Wireframes don't show this transition explicitly.

---

## How this maps back to the glossary and references

**Confirmed:**
- **Two-level chrome ceiling** (rail + one sub-nav column) — Frames 77:5341 and 77:5522 explicitly demonstrate that even at 4+ levels of content depth, the chrome stays at two columns.
- **Replace, don't stack** — explicit in wireframe annotations (*"swapped with 2nd level navigation"*, *"swapped with 3rd level navigation"*).
- **Stable structure, dynamic binding** — the level-3 sub-nav has its own structure (not Edge's level-2 with extras); items bind to the active plane.
- **Two render states for every gated Feature** — Frames 77:5148 (no scope) and 77:5341 (scope selected) are the canonical "before/after" pair.
- **Breadcrumb scoped to active Product** — never includes tenant or Home; starts at `EDGE`. Matches your earlier annotation on Vercel.
- **Breadcrumb segments as scope chips** with per-segment dismiss (`×`) — Neon / Supabase / Kong precedent confirmed.
- **No tile / waffle launcher** — Products live in the persistent left rail.
- **Platform utilities live at the bottom of the rail** — distinct visual section from Products, but same level-1 primitive.
- **Distributed Settings** — Settings as a Platform utility hosts only cross-cutting items; consistent with Cloudflare/Supabase trend.

**Refined / new observations:**
- **The `< back` affordance** at the top of each replaced sub-nav is **explicit** alongside the breadcrumb chip `×`. The glossary Context strip entry only mentioned breadcrumb-with-pickers; we should decide whether `< back` is redundant (URL back-button does the same) or an essential UX safety net for users who don't want to interact with the breadcrumb.
- **The breadcrumb chip's `×` is a *clear scope*, not *navigate up*.** Clicking `×` on `[plane A ×]` returns you to "Edge level 2 with Data planes pre-selected" — letting you pick a different plane *without losing your place in the level-3 tree path*. That's a stronger UX promise than just "go up." Worth capturing as a separate primitive in the glossary.
- **Platform utilities have a "Main menu" return affordance** at the top of their sub-nav — analogous to `< back` for the Russian-doll case but shaped for "return to Product context" rather than "up one level."
- **Home is its own first-class rail entry** (not just a brand mark), and renders as a personal-widgets dashboard. The Manifest model needs to accommodate Home as a Product-shaped entity even though it has no level-2 tree (or has a different one).
- **The Scope picker at level 2** uses a **table + popover** combo, not a dropdown: the main canvas shows all planes in a list ("All data planes" + `+ ADD new`), and the popover offers a quick-select of common planes. This is richer than a single dropdown and supports both the casual-browser ("show me the planes") and the power-user ("just give me the picker") paths simultaneously.
- **Color cue for depth (?)** — the wireframe's second-column background color shifts as you go deeper (purple at L2, green at L3, pink at L4). Could be intentional depth signaling, or could just be Artem distinguishing frames in the FigJam. Worth confirming before treating as a design rule.

---

## Mock fulfillment — substituting real names into placeholders

Reading the wireframes through known content. Useful as a sanity check that the structure can host real data.

### Edge level-2 sub-nav (Frame 77:5148)

Wireframe shows: Overview, Data planes, Section x3, Group name (4 children), Section x3.

Mapped to the existing Console nav (per `current-ia.md`), Edge level-2 could host:
- **Overview** — unscoped (placeholder for a future Threat Prevention dashboard or similar)
- **Data planes** — gating Feature (corresponds to the FigJam's `Dataplane` Feature)
- **Dashboards** — unscoped (current Console group)
- **Events** group → Attacks, Incidents, Security Issues, API Sessions
- **API Security** group → API Attack Surface, API Discovery, API Abuse Prevention, API Specifications
- **Security controls** group → IP & Session Lists, Triggers, Rules, Mitigation Controls, Credential Stuffing
- **Security Testing** group → Threat Replay, Schema-Based
- **Configuration** group → Nodes, Security Edge (locked), Integrations

The wireframe's "Group name (4 children)" maps cleanly onto, e.g., the **API Security** group with its 4 Features. The 3 ungrouped Sections at the top map to candidates like Dashboards, plus standalone Features. The 3 at the bottom map to additional groups like Configuration.

This is a structural sanity check, not a final IA proposal. Artem flagged that the existing grouping will be reshuffled; the redesign IA is captured in the FigJam exploration in `product-features.md`.

### Edge level-3 sub-nav (inside a `dataplane-id`, Frame 77:5341)

Wireframe shows: Overview, Section x4, Group name (3 children), more sections, "Section with 4th level", more sections.

Mapped to FigJam content from `product-features.md`:
- **Overview** (dataplane-scoped)
- **Nodes**
- **Services** ← this is the Feature whose `service-id` resources have a 4th-level drill — likely the wireframe's "Section with 4th level"
- **Govern**

The wireframe shows more items than the FigJam's four Features. Either the wireframe is illustrative of the *capacity* (sub-nav can hold many Features), or the actual `dataplane-id` sub-nav will grow beyond Nodes/Services/Overview/Govern. Worth confirming with Artem.

### Edge level-4 sub-nav (inside a `service-id`, Frame 77:5522)

Wireframe shows: Sub-Section x3.

Mapped to FigJam: Routes, Flows, Setting (3 children of `service-id`). Direct match.

### AI Hypervisor level-2 (extrapolated; not wireframed yet)

Substituting the AI Hypervisor screenshot (`product-features.md`):
- Heatmap, Registry, Topology, Data Tracks, User Tracks, Supply Chain, Enforcement, Integrations, Red Team (β), Debugger

This list would slot directly into the second-column primitive. AI Hypervisor doesn't appear to have a Scope-gated drill (the screenshot showed Heatmap as a default landing with sub-tabs Risk Matrix / Full Stack — those would be page-level tabs in the main canvas, not a level-3 sub-nav per `references.md`'s rule). Worth confirming.

### Infra Discovery / Testing — artificial Feature names

Per Artem's guidance ("for some other like products use some artificial names for their features"). Plausible level-2 sub-navs to make the prototype feel real:

- **Infra Discovery** — Overview, Inventory, Topology, Findings, Risks, Integrations, Settings
- **Testing** — Overview, Test Suites, Schedules, Results, Coverage, Settings

Both are speculation, marked as such. Substitute with real names when shared.

---

## Open questions surfaced by the wireframes

These are net-new questions or refinements to existing ones; will roll into [open-items.md](open-items.md) when Artem signals to.

1. ~~**`< back` vs breadcrumb chip `×` — both, or one?**~~ → **DECIDED 2026-04-28: both.** Both affordances exist. `< back` returns to the previous level; `×` clears just that segment's scope.
2. ~~**Color cue for depth.**~~ → **DECIDED 2026-04-28: same color across all levels.** The varied second-column colors in the FigJam wireframes (purple / green / pink) were frame-distinguishers in the FigJam workspace, not a design signal. The prototype should use one consistent treatment for the second column at every depth.
3. ~~**Home Manifest shape.**~~ → **DECIDED 2026-04-28: Home is a special "no-Features" shell type, not a Product.** Home renders only the main canvas with summary / high-level information aggregated across enabled Products. The shell does not allocate a second column when Home is selected. Home is owned by the shell itself — not declared via a Product Manifest. This means the Manifest contract has at least three types: **Product** (with Features), **Platform utility** (with Settings-like sub-nav), and **(implicit) Home** (shell-rendered, no Features).
4. ~~**Cross-Product teleport on switch.**~~ → **DECIDED 2026-04-28: Option A (click resets) + new Switcher hover-preview pattern.**
   - **Click** on a Product in the rail → navigate to that Product's default landing (Edge → Overview, AI-H → Heatmap, etc.). The previous Product's deep state is **not** preserved across switches; clicking back to the original Product also lands on its default. (Per-Product state preservation, Option C, was considered but explicitly declined for v0.)
   - **Hover** on a Product in the rail → that Product's level-2 sub-nav appears as an **overlay on top of the current second column**, while the user is hovering. When the cursor leaves, the overlay disappears and the original second column is restored. Lets users peek what's in another Product without committing.
   - **Sub-question (defaulted, confirm):** clicking a Feature *inside* the hover overlay drills straight into the target Product at that Feature (resetting current Product state). Default behavior is clickable / interactive overlay; preview-only (read-only) was considered but feels less useful. Worth confirming with Artem.
5. ~~**"Main menu" affordance in Settings.**~~ → **DECIDED 2026-04-28: drop the Main menu item.** It's a carry-over from a screenshot of the previous platform; not part of the new model. Settings sub-nav starts directly at Profile.
6. ~~**Scope picker UI: table + popover combo, or popover only?**~~ → **DECIDED 2026-04-28: table only, for data planes only (for now).** The data-plane Scope picker is a table with `+ ADD new` (the wireframe's "All data planes" page). The floating popover in Frame 77:5148 was sample data showing what to populate the table with — it's *not* a recurring component. Other Products can introduce their own Scope pickers later if/when they need them; the table is the precedent shape.
7. ~~**Multiple `dataplane-id`s open in parallel?**~~ → **DECIDED 2026-04-28: no.** Single scope at a time, single breadcrumb path. No tabs across planes. Switching planes happens via the breadcrumb chip `×` or by going back to the Data planes Feature and picking another.
8. ~~**Level-3 sub-nav capacity.**~~ → **DECIDED 2026-04-28: scalable, with scrolling.** Sub-navs at every level must hold an unknown number of Features (could be far more than 4). The wireframe's ~10 Features was illustrative of *capacity*, not a literal target. The second column should support scrolling when content overflows. **For the v0 mock**: use the FigJam's 4 Features for `dataplane-id` (Nodes / Services / Overview / Govern) plus additional Features to stress-test the column — either unnamed placeholders or names borrowed from [current-ia.md](current-ia.md) so the prototype feels real.

---

## What this means for the prototype (when implementation starts)

Not implementing yet — per Artem's instruction. But for when we do, the wireframes give us a clear primitive list:

- A persistent **left rail** with two stacks (Products / Platform utilities).
- A **second column** that takes one of three states: hidden (Home), Product-level, Scope-level (any depth via the same primitive).
- A **column-swap mechanic**: when a drillable Feature is selected, the second column's contents are replaced; `< back` and breadcrumb chips manage the path.
- A **breadcrumb-with-pickers** in the main canvas, scoped to the active Product, with per-segment `×` for scope dismiss.
- A **Manifest** that declares Features as a tree, where each Feature is either terminal (renders a page) or drillable (declares its own children + Scope picker).

The FigJam structure (`product-features.md`) and the Manifest contract (`glossary.md`) already line up with this. No changes needed — just implementation when ready.
