# Variants — global-navigation prototype

Each variant is a separate navigation idea, sharing the same manifests, mock
data, and route shape but differing in how the nav chrome renders and how
users move through it. Variants live under `/v/<slug>/...` and are registered
in `src/nav/variants/registry.ts`.

The picker at `/` lists them. The Wallarm wordmark inside any variant returns
to the picker (deliberate hidden door for the prototype phase).

## At a glance

| Slug | Label | Model | Files |
|---|---|---|---|
| v0 | Always-open sidebar | Wide left sidebar + persistent second column with drill, ⌘K palette, Recents rail, AI assistant push panel | `src/nav/variants/v0/` |
| v2 | Hover to expand | 64px icon rail collapses by default; hover or pin to reveal labels | `src/nav/variants/v2/` |
| v3 | Icons only, with tooltips | Permanent 64px icon strip; labels appear as tooltips on hover (no expanding column) | `src/nav/variants/v3/` |
| v4 | Pop-out menus, expand on demand | Apollo-style hover menus on each product icon; ⌘B toggles to a Cloudflare-style merged sidebar; Settings + drilled scopes get a v0-style second column | `src/nav/variants/v4/` |
| v5 | Workbench with tabs | IDE-style: 48px activity bar + 264px explorer (full manifest tree) + tabbed main pane + bottom-docked AI assistant; tab state persisted | `src/nav/variants/v5/` |
| v7 | v0 with a wide-labels toggle | v0 chrome, but products navigate on click — no hover flyout. ⌘B toggle swaps the rail between 96px stacked icon+label and 192px horizontal icon+label (harvested from v6 `expanded`). Persisted per browser. Recent and User open as click dropdowns. | `src/nav/variants/v7/` |

---

## v0 — Always-open sidebar

**Slug:** `v0`. **Reference:** classic enterprise console layout.

The baseline. A wide left sidebar lists every product, and clicking one opens
a second column with that product's tree. Drilling into a gated scope (e.g. a
specific data plane in Edge) re-headers the second column with a back link.
Includes ⌘K command palette, a Recents rail, and the AI assistant as a
right-side push panel.

**Surfaces.** `top-bar.tsx`, `sidebar.tsx`, `second-column.tsx`,
`sidebar-tree.tsx`, `breadcrumb.tsx`. The `SidebarTree` component is reused
later by v4's expanded mode (and was the inspiration for v5's explorer tree).

**Trade-off.** Maximum discoverability — nothing is hidden. Costs the most
horizontal space.

---

## v2 — Hover to expand

**Slug:** `v2`. **Reference:** Intercom, Sentry's hover-to-peek+pin.

Same data as v0, lighter chrome. Rail sits at 64px showing icons only. Hover
expands to 240px with labels; click the pin to keep it open. Recent stays as
a one-click dropdown rather than expanding inline. Same drill behavior as v0
once the rail is expanded.

**Locked constants** (in `rail.tsx`): widths 64 → 192, `ICON_COL_WIDTH = 28`,
`ICON_COL_LEFT = 10`. Three non-obvious interaction fixes are intentional and
shouldn't be undone:

- `onNavigate` chain — collapses the rail after a navigation click so the user
  immediately sees the second column.
- Focus suppression — Radix dropdowns restore focus to their trigger, which
  would re-trigger expand on the rail's focus-in handler. A 150ms suppression
  flag handles this.
- Unpin blur — clicking unpin without blurring leaves focus on the pin button,
  which keeps `focusOpen` true and prevents collapse. The unpin handler
  explicitly blurs the active element.

**Surfaces.** `shell.tsx`, `rail.tsx`. Reuses v0's TopBar, SecondColumn,
Breadcrumb.

---

## v3 — Icons only, with tooltips

**Slug:** `v3`. **Reference:** Amplitude.

Like v2 minus the expand. The rail stays at 64px at all times; labels surface
as tooltips on hover instead of by expanding. Maximum space-efficiency. Same
drill behavior as v2.

**Critical gotcha.** WADS ships a `Tooltip` primitive (Ark UI under the hood),
but nesting `TooltipTrigger asChild` *inside* `DropdownMenuTrigger asChild`
breaks Ark's positioning anchor — the dropdown lands at viewport (0,0). v3
uses a local hover-label component (`RailTooltip` in `rail.tsx`) — a flat
`<div className="relative flex w-full">` with an absolutely-positioned label
sibling, mimicking WADS Tooltip's `--color-component-tooltip-bg` /
`--color-text-primary-alt-fixed` styling. Don't migrate v3's tooltips back to
WADS Tooltip.

**Surfaces.** `shell.tsx`, `rail.tsx`. Reuses v0's TopBar, SecondColumn,
Breadcrumb.

---

## v4 — Pop-out menus, expand on demand

**Slug:** `v4`. **References:** Apollo.io (collapsed pop-out menus), Cloudflare
2025 dashboard (expanded merged sidebar).

A two-state variant. Collapsed shows a 64px icon rail like v3, but hovering
any product icon reveals its sections as a floating menu — no fixed second
column. Pressing **⌘B** swaps the rail for a 256px merged sidebar that lists
every product's top-level features inline, Cloudflare-style.

**Special second column.** Two cases keep v0's persistent second column:
1. Settings — the rail item is a single tooltip-only icon; clicking lands on
   `/settings/profile/` where the v0 `SecondColumn` renders the settings tree.
2. A drilled scope (e.g. inside a specific data plane) — when
   `resolveShellContext`'s `ctx.backHref !== null`, the second column appears
   with the scope's inner nav. The hover menu / inline tree never duplicates
   the scoped tree.

**Surfaces** (in `src/nav/variants/v4/`):
- `shell.tsx` — chooses when to render the v0 SecondColumn.
- `rail.tsx` — collapsed icon rail with hover-menus per product.
- `expanded-rail.tsx` — the 256px merged sidebar with v4-tuned tree
  (`V4Tree`, `V4FeatureRow`, `V4GroupRow`) — taller rows than v0's
  `SidebarTree`, indent-with-border for nested groups, top-level icons only.
- `expand-state.ts` — `useExpandedRail(slug)` hook, persists to
  `nav:v:<slug>:rail-expanded` localStorage.

**Pinned utilities.** In the expanded rail, Docs / Settings / User are pinned
to the bottom of the sidebar (border-divided footer container) instead of
scrolling with products — Cloudflare pattern.

**Layout gotchas.**
- `<button>` user-agent text-align is `center`, which propagates to `<Text>`
  via `inherit`. All button rows in the expanded rail explicitly set
  `text-left`. The `<a>`-based rows (Home, etc.) don't need it.
- Surface stacking: `--color-bg-light-primary` (slate-50) is the load-bearing
  hover token in light mode. surface-1 → surface-1 hover paints invisibly.

---

## v5 — Workbench with tabs

**Slug:** `v5`. **References:** Postman desktop console, VS Code, Chrome
DevTools.

The most structurally different variant. Replaces "page" as the unit of
navigation with a **tab**: clicking a leaf in the explorer opens it as a tab
in the main pane; subsequent clicks reuse the existing tab; users keep
several pages open in parallel and switch between them.

**Surfaces** (in `src/nav/variants/v5/`):
- `shell.tsx` — assembles the four panes, owns search + workbench state,
  syncs `pathname → workbench`, wires keyboard shortcuts, renders empty
  state.
- `activity-bar.tsx` — 48px icon column. Top: Wallarm monogram (escape to
  picker), Home, Search, Recent. Middle: products. Bottom: Docs / Settings /
  User. Active item carries a 2px brand accent on the left edge.
- `explorer.tsx` — 264px resizable pane (200–480) with the full manifest
  tree, each product collapsible. Drag the right edge to resize.
- `tab-strip.tsx` — 36px tab bar at the top of the main pane. Active tab
  uses `--color-bg-page-bg` so it visually merges with the content beneath;
  inactive tabs use `--color-bg-surface-2` divided by a 1px border. Close ×
  on hover/active. Middle-click to close.
- `ai-dock.tsx` — bottom-docked AI assistant. 32px peek, click to expand to
  320px with transcript + context columns. Replaces the right-side
  `AIAssistantPanel` for v5 specifically.
- `tab-store.ts` — `useWorkbench(slug)` hook with localStorage. Operations:
  `openTab`, `closeTab`, `focusTab`, `cycleTab`, `reorderTab`,
  `syncToPathname`, `setExplorerWidth`, `toggleExplorer`. Persists
  `{tabs, activeId, explorerWidth, explorerCollapsed}` under
  `nav:v:v5:workbench`.

**Tab identity.** Dedupe by exact URL — clicking the same explorer leaf
twice focuses the existing tab. Drilling deeper from inside a tab via an
in-page link mutates the active tab's URL (IDE pattern), it doesn't open a
new tab. Cross-scope links (would warrant a new tab) are not yet special-
cased; can be added later via ⌘-click or middle-click force-new.

**Tabs are URL bookmarks, not React state.** This Next.js shell re-renders
content based on the URL; tabs are a list of URLs we keep visible in the
strip. Switching tabs means navigating. State preservation across tab
switches is *not* in scope for v5 (would require keeping all routes mounted,
significantly more complex). Accept it for the prototype.

**Keyboard.**
- `⌘K` — global search palette (lifted to controlled mode in `GlobalSearch`
  via the `hideTrigger` + `open`/`onOpenChange` props; v5 owns the state).
- `⌘B` — toggle Explorer (collapse to 0, not to 48px).
- `⌘W` — close active tab; focus moves to right neighbor, then left, then
  empty state.
- `⌘⇧]` / `⌘⇧[` — cycle tabs.

**Deferred** (out of v5 MVP, easy follow-ups):
- Drag-to-reorder tabs (state + reorderTab API are wired; UI is not).
- `⌘1..⌘9` jump-to-tab.
- Auto-scroll + auto-expand the explorer to the active tab's leaf.
- "Open elsewhere" indicator dot on a leaf already open in another tab.
- Tab strip overflow menu (currently scrolls horizontally).
- Real AI panel internals (placeholder content for now).

---

## v7 — v0 with a wide-labels toggle

**Slug:** `v7`. **Origin:** the synthesis verdict from the v0-vs-v6 stress
test (`docs/proposals/v0-vs-v6/VERDICT.md`), made clickable.

The 7-lane test concluded that v6 was the superset of v0, not a competing
variant — same shape as the 2026-04-30 v2-is-v0's-collapsed-mode reframe.
The recommended ship list was: v0 chrome + a single ⌘B toggle that widens
the rail with persistent labels. v7 builds exactly that.

**Surfaces** (in `src/nav/variants/v7/`):

- `shell.tsx` — copies v0's shell verbatim, swapping in v7's rail. Reuses
  v0's `TopBar`, `SecondColumn`, breadcrumb (in top bar), and the shared
  `AIAssistantPanel` / `FlagPanel`.
- `rail.tsx` — v0's rail re-thought, NOT a fork:
  - `wide` boolean state, persisted at `nav:v:v7:wide` (default `false` =
    narrow, matching v0).
  - ⌘B chord toggles wide. Same pattern v4 uses for its merged-sidebar
    toggle.
  - Per-mode item layout swap. Narrow: stacked icon-above-label (v0 layout).
    Wide: horizontal icon column + label (v6 expanded layout). Same
    `ICON_COL_WIDTH = 28`, `ICON_COL_LEFT = 10` constants as v6.
  - Width transition at 180ms, gated on `prefers-reduced-motion`.
  - **No HoverPreview.** Products navigate on click, full stop. The user
    sees a product's tree by entering it — the SecondColumn renders the
    tree on the right once the URL settles.
- `WideToggleItem` — single button at the bottom of the rail (under a
  separator, below utilities). Tooltip shows `⌘ B`. Aria-pressed reflects
  state. Deliberately not a 3-way menu — the synthesis explicitly killed
  the `collapsed` and `hover` modes.

**Differences from v0:**

- **No hover flyout for products.** v0's `HoverPreview` cross-product peek
  is gone (Artem 2026-05-05). Click is the only interaction.
- **Recent and User dropdowns open on click**, not hover. Standard
  DropdownMenu trigger semantics; no shared hover state machine.
- **Keyboard ArrowUp/Down roving** across rail items via `itemRefs`,
  harvested from `v6/rail.tsx:330`. One Tab stop into the rail, then
  arrows cycle.
- **No `pendingNavSlot` defer-close, no hover timers, no `hoveredId`
  cross-component state.** v7 carries less state surface than v0.

**What v7 deliberately does NOT do:**

- No three-mode menu (the synthesis adopted the IA / Adversarial /
  Competitive / PM lanes' verdict that the menu itself is the violation).
- No hover-overlay rail. The `hover` mode of v6 was killed in synthesis on
  vendor-precedent grounds.
- No `collapsed` icon-only resting state. v3 wearing different clothes.
- No avatar `bg-light-primary` regression. v7 inherits v0's
  `UtilityDropdownRailItem` avatar treatment, which sidesteps the
  surface-stacking gotcha v6 reintroduced.

**Trade-off.** Wide mode reflows the workspace (the rail isn't
overlay-positioned). The synthesis accepts this on the grounds that wide
is opt-in — the user clicked to commit. If a future iteration wants
no-reflow expand, harvest v6's spacer-plus-absolute pattern; the v7
state machine doesn't preclude it.

---

## Multi-variant infrastructure

- `src/nav/variants/registry.ts` — single source of truth for the variant
  list. `getAllVariants()` feeds the picker; `getVariant(slug)` is used by
  the route resolver.
- `src/app/v/[variant]/[...slug]/page.tsx` — catch-all route that renders
  inside the chosen variant's `<Shell>`.
- `src/nav/variant-context.tsx` — exposes `useVariant()` and
  `withVariantPrefix(slug, path)` so chrome can build correct hrefs without
  hardcoding `/v/<slug>/`.
- Shared, variant-agnostic chrome: `src/nav/recents/`, `src/nav/search/`,
  `src/nav/manifest/`, `src/nav/url.ts` (`resolveShellContext`),
  `src/nav/shell/ai-assistant-panel.tsx`, `src/nav/shell/flag-panel.tsx`.
- `src/nav/variants/v0/wordmark.tsx` — inlined `WallarmWordmark` SVG; reused
  by all variants that render a top bar.

## Adding a new variant

1. Create `src/nav/variants/v<n>/shell.tsx` exporting `Shell({ children })`.
2. Add the entry to `variants` in `src/nav/variants/registry.ts` (slug, label,
   blurb, Shell). The picker auto-includes it.
3. Reuse what you can from existing variants — `v0/top-bar.tsx`,
   `v0/sidebar-tree.tsx`, `v0/second-column.tsx`, `v4/expanded-rail.tsx`'s
   `V4Tree`, `v5/tab-store.ts`, etc.
4. Persist any per-variant prefs under `nav:v:<slug>:<key>` localStorage.
5. Update this file with the new entry.
