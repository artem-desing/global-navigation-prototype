# v2 — Icon rail interaction spec

Prototype-grade. Build directly from this. PM frame in `docs/proposals/v2-icon-rail.md` is the source of truth on locked decisions.

## States

A single state machine on the rail. Composite states stack.

- `collapsed` — icons-only, default rest.
- `expanded:hover` — opened by mouse, will close on `mouseleave` after delay.
- `expanded:focus` — opened by keyboard focus entering rail; closes on focus-out.
- `pinned` — rail stays expanded across navigation; persisted.
- `+menu-open` — composite modifier when a Recent dropdown, scope-chip swap menu, or utility dropdown is open. Suppresses the close timer regardless of pointer position.

Storage key: `nav:v:v2:rail-pinned` (boolean, per-variant per memory `project_multi_variant_model`).

## Triggers + transitions

| Trigger | From | To | Notes |
|---|---|---|---|
| `mouseenter` rail bounds (not Recent item) | `collapsed` | `expanded:hover` | open delay 80 ms |
| `mouseleave` rail bounds | `expanded:hover` | `collapsed` | close delay 200 ms; cancelled if pointer re-enters or focus is inside |
| Tab focus into any rail item | `collapsed` | `expanded:focus` | open immediately (no delay) |
| Tab focus out of rail | `expanded:focus` | `collapsed` | close delay 200 ms |
| Click pin | `expanded:*` | `pinned` | write `localStorage`; cancel any close timer |
| Click unpin | `pinned` | `collapsed` | clear `localStorage`; if cursor still over rail, re-enter `expanded:hover` on next `mousemove` |
| Click product link | any | navigate; collapse if not `pinned` | resolver auto-selects first child via `defaultLandingId` |
| `Esc` while focus in rail | `expanded:focus` or `pinned` | `collapsed` (and unpins if pinned) | one keystroke unpins-and-collapses; matches "single Esc returns to canvas" |
| Hydration with `nav:v:v2:rail-pinned=true` | initial | `pinned` | render expanded on first paint, no animation |

## Timing

- **Open delay 80 ms.** Snappy. Below the 100 ms perception threshold; reads as "instant" while still filtering out cursor-flyovers between top bar and product sidebar.
- **Close delay 200 ms.** Sticky. Matches v0's `HOVER_HIDE_DELAY_MS = 150` (`src/nav/variants/v0/rail.tsx:31`) plus a small cushion because the expand surface is larger and the diagonal exit toward the product sidebar is the dominant escape path.
- **Width transition 180 ms `ease-out`.** Single property (`width`), interruptible. Respect `prefers-reduced-motion` — snap to target width, no transition.
- Reuse v0's `cancelHide`/`scheduleHide` timer pattern (`rail.tsx:55–68`) — do not re-invent.

## Recent exception

Recent is **not** a hover-expand trigger. Hovering Recent opens the v0 dropdown directly via `DropdownMenu` with `placement: 'right-start'` (see `rail.tsx:178–212`). The rail does **not** expand when only Recent is being hovered. If the rail is already expanded for any other reason (other rail item hover, focus, pin), Recent's dropdown still opens normally on click; rail stays expanded. Pin state is irrelevant to Recent — its dropdown is always the affordance. Implementation: in v2 the Recent rail item's `onMouseEnter` calls the dropdown's open handler but **does not** call the rail's `requestExpand()`.

## Pin behavior

- Affordance visible only in `expanded:*`. Location: product designer's call (likely top-right of expanded panel, near rail header).
- Click pin: `pinned`, write `localStorage`, cancel close timer, focus stays on pin button (now labelled "Unpin").
- Click unpin: `collapsed`, remove `localStorage` key.
- Pin survives reload — read `localStorage` on mount, render expanded synchronously to avoid a collapse-flash.
- aria-pressed on the toggle.

## Keyboard

- Tab into rail's first focusable item → rail expands (`expanded:focus`), no delay.
- `ArrowDown`/`ArrowUp` traverse focusable rail items (roving tabindex; same pattern v0 uses for sidebar drill).
- `Enter`/`Space` activates current item: navigates to product, collapses unless `pinned`.
- `Esc` collapses; if `pinned`, unpins-then-collapses in one keystroke; focus returns to the trigger that opened the rail (or top-bar wordmark if no prior trigger).
- Tab out of rail → close after 200 ms (matches mouse close delay; consistent feel).

## Edge cases

- **Cursor exits rail directly into product sidebar.** Overlay collapses on the standard 200 ms timer; sidebar receives focus naturally. No special-case "intent" tracking — the close delay is the buffer.
- **Recent dropdown open + user clicks pin.** Pin wins; rail enters `pinned`, Recent dropdown stays open until user dismisses it (Esc or click-out). Pin and dropdown are independent surfaces.
- **Scope-chip swap menu open in breadcrumb when rail expands.** Rail overlay must `z-index` below the swap menu's popover layer (or share the same Radix portal stacking). Expanding the rail does not dismiss the swap menu. If the rail's overlay would visually overlap the swap menu's anchor, the swap menu wins focus precedence.
- **`⌘K` opens while rail is `expanded:hover`.** Rail collapses immediately (cancel open delay; close timer fires now). ⌘K always wins.
- **Active product visual at rest.** Principle: filled icon background + accent (use `--color-bg-primary` per v0's existing active treatment in `rail.tsx:449–454`). Pixels are product designer's call.
- **Concurrent hover + focus.** `expanded:hover` and `expanded:focus` are non-exclusive — last one out triggers collapse. Close timer only fires when both pointer is outside AND focus is outside.

## Accessibility

- Rail `<nav aria-label="Global root navigation">` (existing).
- Expanded/collapsed state: `aria-expanded` on the rail container; announce label visibility to AT only when expanded (labels are visually hidden but always in DOM as `aria-label` on each link — same as v0).
- Pin toggle: `aria-pressed`, label "Pin navigation" / "Unpin navigation" (microcopy designer to confirm).
- `prefers-reduced-motion`: skip width transition, snap.
- All hover behavior has a focus equivalent (Tab opens what hover opens). No keyboard dead-ends.
