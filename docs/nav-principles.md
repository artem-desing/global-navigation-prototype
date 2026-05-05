# Navigation principles

Three things we believe about the global nav. Reading time: under a minute.

## 1. Calm chrome

The nav is the frame, not the picture. It helps you find your way, then gets out of the way of the work.

## 2. Supportive nav

Every screen should be one click, one keystroke, one search, or one shortcut away. Whether you live in the product daily or visit once a quarter, the nav meets you where you are.

## 3. Open foundation

The shell outlives the products inside it. Future Wallarm products slot in without rebuilding the chrome.

## Reviewing a nav proposal? Ask three questions.

1. **Calm?** Does it stay out of the way of the work?
2. **Supportive?** Can people get there by mouse, keyboard, name, *and* memory?
3. **Open?** Could a future product fit without a chrome redesign?

If a proposal trades a principle for something concrete, name the trade in the MR description and log it in `docs/decisions.md`.

---

# Context for AI agents

*Everything below this line is for AI assistants and subagents working in this repo. Humans can stop reading at the line above.*

These principles are *directional choices* — the things we'd argue for over plausible alternatives. Things that aren't directional choices (use WADS tokens, ship accessible chrome, write embargo-safe copy) are baselines, not principles. They live in `CLAUDE.md` and the WADS contract — don't promote them to principles.

## Principle 1 — Calm chrome (technical articulation)

**Claim:** The nav must not compete with the page it frames. Pixels, motion, and reflow all cost the operator attention.

**In-prototype evidence:**
- `src/nav/variants/v6/rail.tsx` — three modes (`expanded` 192px / `collapsed` 64px / `hover` overlay). The `hover` mode keeps the rail at 64px and flies a 192px overlay on top, so the workspace never reflows on collapse/expand.
- `src/nav/variants/v0/breadcrumb.tsx` rendered inside `top-bar.tsx` — inline breadcrumb with vertical divider, saves a row vs. the conventional padded-above-content pattern.
- `src/nav/variants/v0/hover-preview.tsx` — peek at another product's tree without committing to a route. Defer-close pattern documented in memory (`project_v0_flyout_defer_close.md`) — flyout waits for `productSlot` to match before unmounting.
- SecondColumn drift-back (`project_second_column_drift_back.md` in memory) — `<` rewinds the column tree without changing URL; only feature clicks commit.

**Counter-examples (violates this if):**
- Rail collapse reflows main content (table relayouts on toggle)
- Hover preview dims the page like a modal
- A third banner row stacks above the work

## Principle 2 — Supportive nav (technical articulation)

**Claim:** Every nav destination must be reachable by *all four* paths: pointer, keyboard (Tab), name (search), and memory (shortcut). No path is the "slow path."

**In-prototype evidence:**
- `src/nav/search/global-search.tsx` — ⌘K palette, controlled-mode + `hideTrigger` so any chrome can fire it (memory: `project_globalsearch_controlled_mode.md`). ARIA combobox with `aria-controls` + `aria-activedescendant`.
- Leader keys in `src/nav/variants/v0/rail.tsx` and `src/nav/variants/v6/rail.tsx`: `G` then `E / A / I / T / H / R / S`. Registered on the **capture phase** so they fire before Ark portal listeners (memory: `project_leader_key_capture_phase.md`).
- `src/nav/recents/store.ts` + `recents-preview.tsx` — recents tracker, surfaces in rail dropdown and as empty-state ⌘K results.
- Esc semantics — every menu, picker, and palette dismisses on Esc and returns focus to its trigger.

**Acceptance test (must pass all five):**
1. **Reachable without a mouse** — Tab from wordmark to first feature link without losing the focus ring
2. **Reachable by name** — three letters of any feature in ⌘K returns it in the top three results, Enter commits
3. **Reachable by memory** — a documented shortcut lands on the destination from anywhere, *including inside open drawers and menus*
4. **Reachable by recency** — visit three features, open empty ⌘K, those three rank top in last-visited order
5. **Always escapable** — Esc backs out cleanly, returns focus to trigger, respects `prefers-reduced-motion`

**On "suggestions":** Today the system surfaces *recency*, not prediction. Don't claim scope-aware ranking, inline tips, or proactive callouts — they aren't built. Recency-as-suggestion via empty-state ⌘K and `G R` recents menu is the honest claim.

**Counter-examples:**
- ⌘K only opens from the top-bar trigger (no controlled mode)
- No keyboard path between products
- Hover preview commits navigation on hover instead of click
- A new menu swallows Esc (Ark gotcha — capture-phase the leader key, see memory)

## Principle 3 — Open foundation (technical articulation)

**Claim:** The chrome is rendered *entirely* from manifests in `src/nav/manifest/`. Adding a product = one new `*.manifest.ts` + one line in `registry.ts`. Chrome code never imports a specific manifest by name.

**In-prototype evidence:**
- `src/nav/manifest/registry.ts` — `getProductManifests()` / `getPlatformUtilityManifests()`; `flattenFeatures` handles arbitrary nesting depth.
- `src/nav/manifest/types.ts` — discriminated union of `ProductManifest` (full sidebar tree) and `PlatformUtilityManifest` (with `externalUrl`, `previewMode: 'dropdown'` for Docs / User).
- `src/nav/manifest/edge.manifest.ts` — sidebar nests 6+ levels deep (dataplane → service → route → policies → flow / pre-route) without per-level handwriting.

**Honest scoping — current gap:**
- **Scope pickers are NOT yet manifest-driven.** `src/nav/shell/scope-pickers/` has hand-written components per scope noun (`data-planes.tsx`, `services.tsx`, `routes.tsx`, `policies.tsx`). A new product introducing a new scope still needs a new picker file. This is known unfinished work — log it as such, don't paper over it.

**Counter-examples:**
- A new product needs a hand-edited switch in `rail.tsx`
- A chrome component does `import { edgeManifest }` outside its own file
- Scope pickers hardcode product IDs instead of reading `scopeRequirement` from the manifest
- A feature gates on a hardcoded slug instead of manifest data

## Boundaries (what this doc is NOT)

- **Not a visual style guide.** WADS owns tokens, components, density. See `CLAUDE.md` § WADS imports.
- **Not a feature backlog.** Principles filter proposals; they don't enumerate them.
- **Not a final IA.** Section names, scope nouns, product groupings still move (see `docs/current-ia.md`, `docs/open-items.md`).
- **Not a baseline list.** Accessibility, embargo discipline, WADS conformance are *baselines* enforced elsewhere. Promoting them to principles dilutes the directional calls.

## Load-bearing files for agents

When asked to evaluate a nav proposal against these principles, walk:
- `src/nav/manifest/registry.ts` and one `*.manifest.ts` (Principle 3 evidence)
- `src/nav/variants/v6/rail.tsx` (Principle 1 + 2 evidence — leader keys, modes)
- `src/nav/search/global-search.tsx` (Principle 2 evidence — ⌘K, ARIA)
- `src/nav/recents/store.ts` and `recents-preview.tsx` (Principle 2 — recency)
- `src/nav/shell/scope-pickers/` (Principle 3 honest gap)

Cross-reference with memory entries: `project_nav_direction.md`, `project_v6_user_controlled_rail.md`, `project_globalsearch_controlled_mode.md`, `project_leader_key_capture_phase.md`, `project_second_column_drift_back.md`, `project_v0_flyout_defer_close.md`.
