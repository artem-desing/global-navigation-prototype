# Interaction review — v0 vs v6

**Author:** Principal Interaction Designer
**Date:** 2026-05-05
**Lane:** state machines, motion, focus, keyboard, pointer behavior. Not IA, not visual hierarchy.

---

## State machine summary

**v0** (`src/nav/variants/v0/rail.tsx`): one rail width (always 96px) × `hoveredId` (`null | RECENT_HOVER_ID | productId | utilityId`) × `pendingNavSlot` (`null | productId`) × ⌘K (`open|closed`) × utility dropdowns (open|closed each). The interesting machine is the hover-preview defer-close: `pendingNavSlot` and the `useEffect` at lines 169–181 hold the flyout open across the URL-change window, then unmount once `productSlot === pendingNavSlot` (or after a 600ms safety net). One axis of motion, one timer family.

**v6** (`src/nav/variants/v6/rail.tsx`): rail mode (3: `expanded | collapsed | hover`) × `hoverOpen` (2) × `focusOpen` (2) × `recentOpen` (2) × `controlOpen` (2) × `suppressFocusInRef` (2) × leader-key state (3: idle / armed / windowed) × ⌘K. Two timer families (`hideTimerRef`, `openTimerRef`) plus `suppressFocusTimerRef` and `leaderTimerRef`. The composite `expanded = mode === 'expanded' || (mode === 'hover' && (hoverOpen || focusOpen))` (line 145) hides eight reachable open/closed combinations behind one boolean.

**Verdict on complexity.** v6 is roughly 4× the surface. Most of it is justified — the three modes are user-facing and can't be collapsed — but `expanded` mode is structurally a no-op for the entire hover/focus/timer subtree, and `collapsed` mode hands all label-discovery to a custom `RailTooltip`. v0 has two interacting timers; v6 has four. Each new timer is a chance to leave a stuck state.

## Motion timing audit

| Surface | v0 ms | v6 ms | Right? |
|---|---|---|---|
| Rail expand (open) | n/a (always wide) | 80 open delay + 180 width transition | Yes — 80ms is sub-perceptual for a follow-the-cursor reveal; 180ms is mid-band of persona's 150–300 |
| Rail collapse (close) | n/a | 200 hide delay + 180 width transition | Yes — 200ms close > 80ms open is the right asymmetry (forgive cursor wobble) |
| Label fade in | n/a | 120ms with 60ms delay | Yes — fades in over the back half of the width transition; reads as "label catches up to label slot" |
| Hover-preview open | 0 (no delay) | n/a | **No** — persona spec is 250–350ms dwell; v0 ships ~0ms and feels jumpy |
| Hover-preview close | 150 | n/a | Tight but workable; works only because layout has 0px gap to flyout |
| Hover-preview defer | up to 600ms safety, ends on URL match | n/a | Yes — clever; documented in `project_v0_flyout_defer_close.md` |
| Custom tooltip (collapsed) | 300ms open / 0ms close | 300ms open / 0ms close | Open: yes. Close: no — instant dismiss flickers between adjacent icons |
| ⌘K open | instant via Dialog | instant via Dialog | Yes — palette opens are state, not motion |
| AI panel push | 200ms width, no reduced-motion branch | inherited, same | **No** — `ai-assistant-panel.tsx:52` ignores `prefers-reduced-motion` |

`prefers-reduced-motion` handling: v6 explicitly checks (`usePrefersReducedMotion`, line 98) and sets `widthTransition = 'none'` and label transition to `'none'` (lines 386, 1123). v0 has no `prefers-reduced-motion` branch in the rail — it doesn't need one (no rail motion) but the AI panel still animates regardless.

## Focus management

**v0.** No focus-management state in the rail itself. Focus on a rail Link does not preview the product (preview is hover-only). Tab order: top-bar → rail items linearly → second column → main. ⌘K's Dialog handles its own focus/return. After leader-key navigation, `SECOND_COLUMN_FOCUS_FLAG` (sessionStorage) signals `SecondColumn` to focus the first link on next render — clean cross-component handoff (`second-column.tsx:36-44`).

**v6.** Three focus-related concerns interact:
1. `handleFocusIn` (line 192) — only acts in `hover` mode, opens rail; gated by `suppressFocusInRef`.
2. `handleFocusOut` (line 199) — uses `relatedTarget` containment to avoid closing when focus moves between rail items, then schedules close after `CLOSE_DELAY_MS`.
3. `collapseRail` (line 359) — sets `suppressFocusInRef = true` for 150ms after a navigation click so the dropdown's "restore focus to trigger" doesn't re-expand the rail.

**Concerns.**
- The 150ms suppress window in `collapseRail` is shorter than the 200ms close delay. If a user clicks an item, the close timer fires (200ms later) but `focusOpen` may have already been re-set during the suppression window. In practice the combination works because `setHoverOpen(false)` and `setFocusOpen(false)` are called synchronously before the suppression starts — but it's fragile. A user clicking and immediately Tab-ing would race the timer.
- `handleFocusIn` only acts in `hover` mode (line 193). In `collapsed` mode, focus does **not** widen the rail. Keyboard users in collapsed mode are stuck with custom tooltips on `onFocusCapture` to learn labels — which works (line 1180), but means the discoverability path differs from `hover` mode where focus = expansion.
- `expanded` mode has no focus management because there's nothing to manage — labels are always visible.
- Esc handling in `handleRailKeyDown` (line 332) only fires in `hover` mode. In `collapsed` mode pressing Esc on a focused rail item does nothing — fine, since there's nothing to escape from. But it means Esc semantics depend on rail mode.

The leader-key handler is registered in capture phase (line 319) — necessary so it fires before Ark's portal listeners while a Menu is open. This is correct and matches `project_leader_key_capture_phase.md`.

## Keyboard — 5-point Supportive nav check

| Test | v0 | v6 |
|---|---|---|
| Reachable without mouse | Pass — Tab through rail, but no arrow-key roving (every Home/Recent/product/utility is a Tab stop). 13+ stops to reach the avatar. | Pass + better — `handleRailKeyDown` (line 330) implements ArrowUp/Down roving over `itemRefs`, so rail is one Tab-stop with arrow nav inside. |
| Reachable by name (⌘K) | Pass — global capture, works inside Dialogs (`global-search.tsx:81`). | Pass — same global handler, controlled-mode supported. |
| Reachable by memory (shortcut) | Pass — leader keys G+E/A/I/T/H/R/S registered in capture phase (line 153). | Pass — identical leader-key map (line 319), capture phase. |
| Reachable by recency | Pass — Recent dropdown via G+R, dispatches ArrowDown to Ark Menu.Content to engage `data-highlighted` (line 110–124). | Pass — same pattern (line 276–290). Both go through the documented `project_ark_menu_highlight_gotcha.md` workaround. |
| Always escapable | Partial — Esc closes ⌘K and Dialogs. Rail itself has nothing to escape from. Hover preview cannot be escaped without mouse-out (no Esc handler). | Pass — Esc in `hover` mode collapses rail and blurs active element (line 332–340). Leader-key Esc cancels mid-sequence (line 256). |

Both variants pass the five-point test. v6 is marginally better on the Tab-vs-arrow story; v0 is marginally worse on hover-preview escapability (a hover-only surface with no keyboard equivalent — the persona's "what you push back on" list).

## Pointer behavior

**v0.** Hover-to-preview: instant (0ms open, 150ms close). Active-product hover suppressed (`activeId !== p.id`, line 251). Recent has its own dropdown path. Hover preview is a sibling overlay anchored `fixed left-96 top-48` (no gap to rail). Defer-close pattern: feature click sets `pendingNavSlot`, the `useEffect` waits for `productSlot` to match before unmounting (lines 169–181). This is the load-bearing fix from `project_v0_flyout_defer_close.md`.

**v6.** Hover-to-expand: 80ms open, 200ms close, gated to `mode === 'hover'`. Two carve-outs: Recent's trigger `stopPropagation`s on `mouseenter` (line 922) so peeking at recents doesn't widen the rail; SidebarControl does the same (line 1010). The rail is `position: absolute` with a sibling spacer of `committedWidth`, so hover-expansion overlays without reflow — Principle 1 evidence. The `mode` change effect (lines 223–228) clears hover/focus state and timers when the user picks a new mode from the SidebarControl dropdown.

**Concerns.**
- v0 hover across products: fast diagonal cursor traversal hits `cancelHide` on the new trigger before the 150ms close fires on the old one — flyout swaps cleanly. But because there's no open delay, the flyout *flashes* through products as the cursor crosses — visible on a quick scan. The defer-close pattern only protects the *committed* flyout during the URL-change window; it doesn't smooth the hover-traversal noise.
- v6 mode-change effect (line 223): when the user switches `hover → expanded`, this fires `setHoverOpen(false)` and `setFocusOpen(false)`. The composite `expanded` then becomes `true` (because `mode === 'expanded'`). No flicker — both writes happen in the same render and `expanded` is a derived boolean. But if the user switches `hover → collapsed` mid-hover, the rail snaps from 192px to 64px during the 180ms width transition. Watching closely, this can read as a flick — the transition is interruptible and that's correct, but it does double-animate.
- v6 `collapseRail` after navigation (line 359): only fires when `mode === 'hover'`. In `collapsed` mode it's a no-op (rail is already at rest); in `expanded` mode the rail stays open by design. So it resets cleanly across all three modes — the early-return at line 360 is the safety.
- Narrow viewports: v0's preview at `w-[256px]` plus rail at `w-96` plus second column at `w-[256px]` plus main = chrome eats ~600px before content. v6's collapsed (64px) + second column (256px) is far gentler. Below ~960px both variants degrade similarly because neither has a mobile breakpoint.

## Reduced motion

**v0.** No `prefers-reduced-motion` handling in `rail.tsx` or `hover-preview.tsx`. The rail itself doesn't animate, so this is mostly fine. The AI panel (`ai-assistant-panel.tsx:52`) animates a 200ms width transition unconditionally — a real violation that v0 inherits.

**v6.** Explicit handling. `usePrefersReducedMotion` hook (line 98) is consumed by `widthTransition` (line 386 → `'none'`) and `RailLabel` (line 1123 → `'none'`). The custom `RailTooltip` (line 1144) has no transition to suppress. Mode-change still snaps states but motion is fully disabled. Done correctly. The shared AI panel still violates regardless of variant.

## Lane verdict

**v0 is the calmer, more predictable interaction model — by a small margin, and only because v6's three modes structurally cost more.** v0's state machine fits in one head: `hoveredId` plus a `pendingNavSlot` defer-close trick, two timers, no mode axis. The biggest interaction debt (`hover-preview` opens at 0ms — `v0/rail.tsx:32, HOVER_HIDE_DELAY_MS = 150` but no open delay) is a five-line fix. v6 is the more *capable* model — it's the only one that lets a power user pin to expanded, lets a flow-user opt into collapsed-with-tooltips, and lets the cautious user pick hover-overlay. The state machine is well-tended (`collapseRail` line 359, `suppressFocusInRef` line 140, mode-change cleanup line 223, capture-phase leader keys line 319) and the timing constants are right (80ms open / 200ms close / 180ms width / 120ms label fade are all in-band). But four timers and three modes are inherently more failure surface than two timers and one mode, and the per-mode behavior split (focus expands rail in `hover` only, Esc only in `hover`, collapseRail only in `hover`) means the user's mental model has to track which mode they're in to predict the rail's next move. That's the cost of user-controlled flexibility — v6 buys reachability-by-preference at the cost of v0's simpler invariants. For a calm-chrome principle, v0 wins on predictability; for a supportive-nav principle, v6 wins on reachability paths. If we ship one, ship v6 with a default of `hover` and accept the higher complexity. If we want one fewer thing to break, ship v0 with a 250ms hover-preview open delay added.
