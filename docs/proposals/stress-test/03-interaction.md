# Stress test — interaction critique (v0, v2, v3, v4)

**Author:** Principal Interaction Designer
**Date:** 2026-04-30
**Lane:** motion, timing, focus, keyboard, state machines, pointer behavior. Not IA, not visual hierarchy, not bug-hunting beyond interaction.
**Scope:** v0, v2, v3, v4 only. v5 excluded.

---

## 1. Executive summary

- **Most refined interaction model: v2.** It is the only variant that takes the
  full hover/focus state machine seriously — open delay, close delay, focus-vs-
  hover separation, pin commit, focus-suppression flag, explicit blur on unpin,
  reduced-motion branch, arrow-key navigation with Esc-to-collapse. The
  mechanics on `v2/rail.tsx:114-280` show someone who has built one of these
  before. It's the only one where I never lost the cursor.

- **Most fragile: v4.** Two competing models (collapsed pop-out menus and ⌘B
  merged sidebar) sharing one rail, with a shortcut that overlaps the most
  common browser-bookmark-bar binding (⌘B in Chrome / Safari / Firefox toggles
  the bookmarks bar). The hover-menu has no corridor of forgiveness — the menu
  is anchored `left-full ml-8` (8px gap) and the trigger only opens it after
  120ms (`v4/rail.tsx:50-51, 495`). Cross that 8px gap diagonally and you'll
  re-open Home/Recent/another product before the menu can mount. The Settings
  "tooltip-only" rule plus the inline drilled SecondColumn rule plus the hover-
  menu rule means there are three different ways the same rail responds to a
  hover, depending on what you happen to be hovering. That's a memory tax on
  the user, not a feature.

- **Most clever: v4's ⌘B mode swap.** Real "I am one user but two contexts"
  affordance — collapsed when you know where you're going, expanded when you're
  exploring. The mechanism is sound; the binding choice is wrong, and the in-
  flight hover menu isn't dismissed when the mode flips
  (`v4/rail.tsx:64-73`).

- **Most boring (compliment): v0.** The least surprising. No state machine to
  speak of — you click a thing, it goes there. The 150ms hover-preview delay
  (`v0/rail.tsx:31`) is one number, and it's the right number. Costs the most
  pixels.

- **Most dishonest: v3.** Sells "icons + tooltips" as space-efficient minimalism
  while actually shipping a 300ms guessing game on every cold use. The tooltip
  is the *only* way to learn what an icon means. There's no second column
  collapse/expand to amortize the learning curve, and no pinning option. The
  user's reward for memorizing the icon vocabulary is… the same vocabulary they
  already had in v2-pinned. v3 is v2 with the recovery affordance amputated.

---

## 2. Per-variant audit

### 2.1 v0 — Always-open sidebar

**Pointer**

- Hover-to-preview timing: ad-hoc. The rail has no open delay — preview shows
  instantly on `mouseenter` (`v0/rail.tsx:47-53, 111-114`). Persona spec says
  250–350ms dwell. v0 ships ~0ms. Result: jumpy preview as the cursor crosses
  the rail diagonally.
- Hover-out: 150ms close delay (`HOVER_HIDE_DELAY_MS = 31`). That's tight but
  workable. The trigger and preview both call `cancelHide` on
  `mouseenter`/`onMouseEnter`, so once you're in the preview the timer cancels.
- Corridor of forgiveness: there is none. Preview is `fixed left-96 top-48`
  (`v0/hover-preview.tsx:29`) — adjacent to the rail with zero physical gap, so
  this happens to work, but only because of layout luck. A 1px gap (which a
  border could introduce) would create a dead zone where the timer fires.
- Active-product hover: deliberately suppressed (`v0/rail.tsx:113`,
  `if (activeId !== p.id) showPreview`). Good — prevents the preview shadowing
  the second column the user is already reading.
- Pin/unpin: not applicable; rail is always wide.
- Misclick recovery: clicking the wrong product immediately swaps the second
  column. No undo affordance beyond clicking the right one. Active-state
  `aria-current="page"` is set, but there's no transient highlight on the
  destination — feedback is "the whole second column changed." That's a lot of
  motion for an accidental click.

**Keyboard**

- Tab order: top-bar → rail → second column → main. Predictable.
- No skip-to-main link anywhere (grep `skip` returns nothing).
- No arrow-key navigation in the rail. Tab moves linearly through every Home /
  Recent / product / utility. With 7 products + 4 utilities + Home + Recent
  that's 13 tabs to reach the user avatar. Compare v2/v3/v4 which have arrow
  navigation.
- ⌘K: works globally (`global-search.tsx:81-90`, `window.addEventListener`),
  including when AI panel is open. Good.
- Esc on hover preview: nothing. The preview only closes when the cursor leaves
  both surfaces. Keyboard users who tabbed in via the rail item have no
  preview open in the first place (preview is hover-only — see below).
- Esc on tenant dialog: WADS Dialog handles it.
- AI panel push: `aside` with `aria-hidden={!open}` and `transition-[width]`
  (`ai-assistant-panel.tsx:50-58`). On open, focus does **not** move into the
  panel. There's no focus trap. A keyboard user who hits the AI button and
  starts tabbing will tab through the rest of the page chrome before reaching
  the textarea. **Accessibility violation.**
- Visible focus ring: WADS primitives carry it. Custom `<button>` rows in
  `sidebar-tree.tsx` and `top-bar.tsx` rely on browser defaults.

**State machines**

- Drill: handled in `url.ts` — gated drills with the unscoped-freeze rule. URL-
  driven, so back/forward works. ✓
- Tenant switch: placeholder dialog (`top-bar.tsx:99-112`). Doesn't preserve or
  reset anything because it doesn't actually do anything. Unobservable.
- Product switch: SidebarTree's `<GroupItem>` uses local `useState` for
  open/closed (`sidebar-tree.tsx:63`). Switching products remounts the tree;
  every group resets to its `!collapsed` default. Switching back loses your
  expansion state. Same for the second column scroll position.
- Hover-then-click vs. click: same href, same destination. ✓
- Recent rail: dropdown works but the keyboard story is poor — the trigger has
  `aria-label="Recent"` but the open mechanism is `DropdownMenu` from WADS,
  which means Enter/Space opens it. Once open, arrow keys work inside. Closing
  with Esc returns focus to trigger. ✓ (this part is solid because WADS does
  the work.)

**Motion**

- The rail is static; the second column re-renders on URL change with no
  animation. Switching products is *snap*. That's actually fine — the chrome
  isn't supposed to dance.
- Hover preview has no entry transition (no `opacity` / `transform`); it just
  appears. At 0ms open delay this reads as a glitch on fast cursors.
- AI panel: 200ms width transition (`ai-assistant-panel.tsx:52`). Good number.
  No reduced-motion branch. Will animate even when the user has set
  `prefers-reduced-motion: reduce`.

**Power-user vs. novice tension**

- Novice: maximum discoverability. Everything is named, everything is reachable
  in two clicks. ✓
- Power-user: ⌘K is good. But the rail is unskippable in the layout — you can
  see it always, you can't shrink it. There's no pinned-recent shortcut
  (Recent is itself a click) and no ⌘1..⌘9.

**Three flows**

- (a) Cold-start, find "API Discovery": `/v/v0/`. User scans the rail, sees
  product names, hovers "AI Hypervisor" (assuming embargo-safe rename), preview
  flies in (0ms open, jarring), they spot "Discovery" or "Inventory" — but the
  v0 rail uses iconography that is, per memory, abundant white space. Click,
  land. **~6 seconds, low cognitive cost.** Best of the four for cold-start.
- (b) Power flow, runtime-threats-tenant-A → API-inventory-tenant-B in <3s:
  fails. Tenant dialog is a placeholder; the real flow doesn't exist. Even if
  it did, the path is "click avatar / tenant chip → dialog → search → commit →
  click product → click feature." Realistically ~5–7s. ⌘K could collapse the
  feature step but not the tenant step.
- (c) Recovery from misclick: Click wrong product, second column swaps. Eye has
  to re-find the prior product in the rail. ~1.5s at best. No "back" affordance
  in the chrome (back button on the breadcrumb is feature-local, not product-
  local). This is the single biggest deficit of the always-open model — it
  makes wrong-clicks expensive because the whole right side moves.

**Verdict.** Predictable, accessible enough, slightly outdated motion. The
preview-with-no-delay is a small bug. The missing focus-management on AI panel
is real. Otherwise this is the baseline everything else is being judged against.

---

### 2.2 v2 — Hover to expand

**Pointer**

- **Open delay: 80ms** (`v2/rail.tsx:47, OPEN_DELAY_MS`). Below the persona
  spec's 250–350ms. I'd argue the spec is for *preview* opens (peeking into
  another product); v2's open is the rail itself revealing labels, which is
  closer to a hover-tooltip moment, where 80ms is reasonable. I'll allow it.
- **Close delay: 200ms** (`CLOSE_DELAY_MS`). Generous, and the right call —
  prevents accidental collapse when the cursor wobbles toward the second
  column.
- **Width transition: 180ms ease-out** (`WIDTH_TRANSITION_MS = 49`). Inside
  the persona's 150–300ms band. Label fade is 120ms with delay
  `WIDTH_TRANSITION_MS - LABEL_FADE_MS` = 60ms (`v2/rail.tsx:50, 846`). So the
  label fades in over the back half of the width animation. Subtle, correct.
- **Corridor of forgiveness:** the rail and the second column are siblings in
  the layout (`v2/shell.tsx:20-22`); the rail is `position: absolute` overlay
  (`v2/rail.tsx:321`) sitting on top of the spacer that holds the second
  column open. When the rail expands, it overlays the left edge of the second
  column. So the cursor moving rail → second column has 0 dead space. ✓
- **Pin commit:** explicit. Pin button is a 20×20 affordance in the top-right
  of the expanded rail (`v2/rail.tsx:404-447`). Discoverable on first expand.
  `aria-pressed` toggles. localStorage-persisted. Esc unpins-and-collapses in
  one keystroke (`v2/rail.tsx:211-225`). The unpin handler explicitly blurs
  active element so focus doesn't keep the rail open
  (`v2/rail.tsx:271-279`). This is the most thoughtful pin implementation of
  the four.
- **Focus-vs-hover separation:** `expanded = pinned || hoverOpen || focusOpen`
  (`v2/rail.tsx:128`). Three independent paths to "expanded" — pointer, focus,
  pin — composed cleanly. None can leak.
- **Focus-suppression flag** (`v2/rail.tsx:118-126, 252-258`): the trick that
  prevents Radix dropdown's "restore focus to trigger" from re-expanding the
  rail. 150ms is well-chosen. Without this, every dropdown selection would
  bounce the rail back open.
- **Recent carve-out** (`v2/rail.tsx:780-799`): Recent's mouseenter
  `stopPropagation`s so hovering Recent doesn't expand the rail. This is a
  micro-policy: "Recent is a peek, not a navigation," and the peek shouldn't
  cost a 200px reveal. Smart. Subtle. The kind of thing that took someone
  three sessions to figure out.
- **Misclick recovery:** Same as v0 — once you click, second column swaps.
  v2 makes it slightly worse because the rail has just collapsed under your
  cursor (`v2/rail.tsx:246-259, collapseRail` runs on every navigate). So the
  cursor is now over an icon, not a label, and the rail just moved. You have
  to either move down to the second column, or hover-expand again to read
  labels and find the right one.

**Keyboard**

- Arrow up/down rove through Home → Recent → products → utilities → Pin
  (`v2/rail.tsx:209-240`). The pin is reachable. ✓
- Esc collapses-and-unpins, blurs active element (`v2/rail.tsx:211-225`). One
  keystroke to fully reset. ✓
- Focus-in expands the rail (`v2/rail.tsx:173-177`). So tabbing from top-bar
  into the rail reveals labels. Good.
- Focus-out closes after `CLOSE_DELAY_MS` (`v2/rail.tsx:179-191`). Matches
  mouse close.
- Tab order is the same as v0 modulo the pin button being added when expanded.
- ⌘K: same as v0, works globally.
- Visible focus ring: relies on browser defaults on `<Link>` and `<button>`.
  No explicit `focus-visible` styles. WADS DropdownMenu items carry their own.

**State machines**

- Drill: same shared `url.ts` resolver. Same correctness.
- Tenant switch: shared placeholder.
- Product switch: same SidebarTree mount, same lost group state.
- Hover-then-click: collapse-on-navigate kicks in (`v2/rail.tsx:343, 352, 368,
  392`). Result: click and the rail tucks away while the second column
  reveals. Clean handoff. ✓
- Pin survives navigation: `pinned` is read from localStorage via init
  function (`v2/rail.tsx:109`) so the first paint after a route change is
  correct. No collapse-flash. ✓

**Motion**

- Width 180ms ease-out + label fade 120ms ease-out @60ms delay. Reduced-motion
  branch sets transition to `'none'` (`v2/rail.tsx:283-285`). Done correctly.
- Pin button has its own opacity transition tied to width — 120ms with the
  same `WIDTH_TRANSITION_MS - LABEL_FADE_MS` delay. Coherent.

**Power-user vs. novice tension**

- Novice: collapsed by default. Hovers, learns labels, pins when convinced.
  Healthy progression.
- Power-user: pin once, stay expanded forever. Or stay collapsed and rely on
  ⌘K. v2 supports both attitudes without forcing a choice.

**Three flows**

- (a) Cold-start: lands at 64px rail. Sees icons. Hovers any one — 80ms later
  rail expands, labels appear. Reads "AI Hypervisor", continues hovering
  toward "Discovery" — wait, the labels are there but the second column shows
  the *previously active* product, which on cold-start is Home. So the user
  has to *click* the product to see its tree. **The hover doesn't preview the
  product's tree the way v0 does** — v2 only widens the rail. So cold-start in
  v2 is two-click: click product, then click feature. Slightly worse than v0.
  ~7s.
- (b) Power flow: same tenant problem as v0. Once tenant exists, ⌘K is the
  only sub-3s path. Rail itself is fine.
- (c) Recovery: collapse-on-navigate makes this *worse* than v0. The wrong
  click triggers (i) second column swap, (ii) rail collapse to 64px. To
  recover, the user must either re-hover to expand, or read icons. Two extra
  beats. The "interaction fixes don't undo" memo (in `docs/variants.md`)
  protects this behavior because it pays off for *intentional* navigation;
  for misclicks, it's a tax.

**Verdict.** Best-in-class state machine. Cold-start cost is real but not
catastrophic — once you've used it three times, the icons mean something. The
collapse-on-navigate is a defensible tradeoff. Pin is the best escape hatch of
the four variants.

---

### 2.3 v3 — Icons only, with tooltips

**Pointer**

- Tooltip open delay: **300ms** (`v3/rail.tsx:38, TOOLTIP_OPEN_DELAY_MS`).
  Inside the persona band. ✓
- Tooltip dismiss: immediate on `mouseleave` (`v3/rail.tsx:181-184`). No
  close delay at all. Cursor crosses the icon edge → tooltip vanishes →
  cursor's halfway between two icons → no help. Compare v2's 200ms close.
- `onPointerDown` dismisses the tooltip (`v3/rail.tsx:185-188`). Good — clicks
  shouldn't pin tooltips. But it dismisses *before* `onClick` fires, so on a
  fast click the tooltip flashes briefly. Cosmetic.
- Focus-driven tooltips: `onFocusCapture` opens, `onBlurCapture` closes
  (`v3/rail.tsx:189-196`). Keyboard users get tooltips. ✓ (v0's preview is
  hover-only — v3 is actually better for keyboard discoverability of icon
  labels.)
- No active-tooltip suppression: hovering the active product still shows the
  tooltip. Mildly redundant but not wrong.
- Misclick recovery: same as v2 — click wrong icon, second column swaps. v3 is
  marginally better than v2 here only because the rail doesn't itself move
  (it's permanently 64px). The user's cursor is still over an icon, not a
  label. To find the right icon, they hover each one and wait 300ms per
  tooltip. **300ms × 6 products = 1.8s of pure tooltip-shopping.** v3's whole
  pitch dies in the recovery flow.
- **No corridor of forgiveness needed**: tooltips are 1:1 with their trigger,
  no second surface. ✓

**Keyboard**

- Arrow up/down rove (`v3/rail.tsx:62-78`). Same pattern as v2. ✓
- **No Escape handler** on the rail. Compare v2 which Escape-collapses. v3
  doesn't have anywhere to escape *from*, so this is academically fine.
- ⌘K: shared. ✓
- Focus on icon → tooltip appears (`onFocusCapture` in RailTooltip). Keyboard
  user can confirm icon meaning. ✓
- Visible focus ring: relies on browser defaults again.

**State machines**

- Drill: shared `url.ts`. ✓
- Tenant switch: shared placeholder.
- Product switch: same as v0/v2 — group state is local to SidebarTree mount,
  resets on switch.
- Hover-then-click vs. click: same destination. ✓ But "hover-then-click" in
  v3 is "wait 300ms for tooltip, read it, click" — explicit cost.

**Motion**

- Tooltip appears with no opacity transition — just toggles `open`
  (`v3/rail.tsx:198-213`). Reduced-motion is irrelevant because there's no
  transition to suppress. Actually one variant where reduced-motion is
  honored by default — by accident.
- No reduced-motion check anywhere in `v3/rail.tsx`.

**Power-user vs. novice tension**

- This is where v3 falls apart. The variant only pays off for users who have
  already learned the icon vocabulary. There is no progression — no expand-on-
  pin, no widen-on-hover — so the user is stuck in icon-jeopardy until they
  internalize the iconography. The first session is brutal: 300ms tooltips ×
  every nav decision = a rail that feels slow.
- For users who *have* memorized: v3 is faster than v0 (less visual noise to
  parse) but identical to v2-pinned-collapsed except v2 lets them un-pin in 1
  keystroke when they're stuck. v3 has no rescue.

**Three flows**

- (a) Cold-start: lands at 64px rail. Hovers icon. Waits 300ms. Reads "AI
  Hypervisor". Hovers next icon, waits 300ms, reads "Cloud WAAP". Etc. To
  inspect 6 product icons: 1.8s of mandatory dwell + cursor travel.
  Then to find "API Discovery", click the right product (assuming tooltip
  matches expectation), and read the second column. ~9–10s. **Worst of the
  four for cold-start.**
- (b) Power flow: same shared bottleneck. Rail itself is fast for a power user
  who has the icons memorized.
- (c) Recovery: as above — 1.8s of tooltip-shopping at worst, or clicking
  blindly at best.

**Verdict.** Cleanest visual code (`RailTooltip` is a 50-line component
including the asChild gotcha workaround). Worst novice experience. No safety
net. The pitch — "Amplitude does it" — doesn't survive that Amplitude is also
not great at this. v3 should ship a hover-expand fallback or admit it's a power-
user-only model.

---

### 2.4 v4 — Pop-out menus + ⌘B merged sidebar

**Pointer (collapsed mode)**

- Hover-menu open delay: **120ms** (`v4/rail.tsx:50,
  HOVER_MENU_OPEN_DELAY_MS`). Faster than v3's tooltip but slower than v2's
  rail expand. In the right band.
- Hover-menu close delay: **160ms** (`HOVER_MENU_CLOSE_DELAY_MS`). Tight.
- **Corridor of forgiveness: broken.** The menu is `absolute left-full ml-8`
  (`v4/rail.tsx:495`). That's an 8px physical gap between the trigger
  (right edge of rail icon at x=56) and the menu (left edge at x=64+8=72).
  Moving the cursor diagonally from product icon toward menu items at any
  reasonable speed exits the trigger's `mouseleave` zone — which schedules
  close in 160ms — and *also* may cross over Home or Recent as the cursor
  drifts down-right. The neighboring trigger then schedules its *own* open
  in 120ms. Net effect: a wobbly cursor opens and closes the wrong menus.
- The trigger's `<div>` wraps the `<Link>` AND the `<menu>` together
  (`v4/rail.tsx:411-462`), so `mouseleave` on the wrapper does correctly
  fire only when the cursor leaves both surfaces. But the wrapper is
  `relative flex w-full` — the wrapper width is the **rail** width, not
  including the menu. **The menu is `absolute` and so is outside the wrapper's
  hit area.** Moving from menu back to trigger is fine; moving from trigger to
  menu crosses dead space. Verifiable on the live deploy by hovering a product
  and quickly diagonal-traversing toward menu items.
- **The fix:** either (a) zero the gap (`ml-0`) and overlap, or (b) widen the
  trigger wrapper to include the gap zone with a transparent bridge element.
  The persona's hover-preview spec is explicit: "Dismisses when pointer leaves
  both trigger and preview." v4 honors the *intent* but not the *geometry*.
- Active-product menu shows `activeFeatureId` (`v4/rail.tsx:454-461`).
  Inactive products show no active highlight in their menu. Reasonable.
- Settings is a single tooltip-only icon (`v4/rail.tsx:699-707`) — no hover
  menu. Three different rail-item behaviors (product hover-menu, settings
  tooltip-only, utility dropdown) on one rail. Each is locally defensible;
  collectively they're a "what does this icon do?" lottery.

**Pointer (expanded mode)**

- All hover behavior collapses to a static rail with inline trees. Predictable.
- Group rows toggle on click (`v4/expanded-rail.tsx:418`). Group state is
  `useState(!node.collapsed)` — local. Switching products doesn't lose state
  because the expanded rail mounts every product's tree at once
  (`v4/expanded-rail.tsx:91-100`); the same React tree persists. **Better
  than v0/v2/v3 for cross-product state preservation.** This is a real win.
- No corridor problem in expanded mode — there are no floating menus.

**Pointer (mode swap)**

- ⌘B toggles (`v4/rail.tsx:64-73`). Listens at `window` level. Works regardless
  of focus.
- **In-flight hover menu on ⌘B: not dismissed.** When the user is mid-hover
  on a product, sees the menu, and presses ⌘B, the rail re-renders as
  `<ExpandedRail>` (`v4/rail.tsx:75-79`). The `<CollapsedRail>` unmounts.
  React unmounts the timer-bearing components. `useEffect` cleanups
  (`v4/rail.tsx:396-402`) clear the timers. The menu disappears because its
  parent is gone. So the user sees the menu vanish and the rail expand at the
  same moment. This is acceptable, but it's *implicit* — the code doesn't
  intentionally close the menu, it just unmounts it. If `ExpandedRail` ever
  gains its own hover menus, they'd "carry over" because `menuOpen` is per-
  product-row state. Not robust to future change.
- **⌘B is a hidden mode.** No on-screen "expand sidebar (⌘B)" affordance until
  you've already expanded *or* until you hover the bottom-of-rail toggle
  button (`v4/rail.tsx:187, 199-236`). The toggle button is the only
  collapsed-mode discoverability path. Acceptable for a power-user shortcut,
  not for a novice. **And the binding conflicts with browsers' bookmark-bar
  toggle.** I would lose this fight every time.

**Pointer (drilled scope)**

- When the user has drilled into a scope, `shell.tsx:27-29` pulls in the v0
  `SecondColumn`. Now the rail (collapsed) shows hover-menus AND there's a
  persistent column. Hovering a non-active product shows that product's hover-
  menu *over* the second column. The menu's z-index is 50 (`rail.tsx:505`);
  the second column doesn't set z-index but is in document flow. The menu
  should layer correctly, but on rapid hover-out the menu close-timer fires
  while the cursor is over the second column, which is fine. ✓ Subtle but
  works.
- **Inconsistency:** in the unscoped case, the hover-menu IS the secondary
  nav. In the scoped case, the hover-menu shows top-level features (which
  are not what the user is operating on) AND a scoped column shows the
  drilled tree. Two competing affordances visible at once. Users will hover
  the rail looking for "data planes" sub-items and find the parent feature
  list instead.

**Keyboard**

- Arrow up/down on collapsed rail (`v4/rail.tsx:107-123`). ✓
- Arrow keys on expanded rail: **none**. The expanded rail has no keydown
  handler at all (`v4/expanded-rail.tsx:67-76`). Users get default tab-only
  navigation through every link in every product's tree. With 7 products
  expanded, that's a long tab. The collapsed rail has arrow keys; the
  expanded rail does not. **Inconsistency.**
- ⌘B: works globally.
- **⌘B during text input:** the handler doesn't check the event target
  (`v4/rail.tsx:64-72`). Pressing ⌘B inside the AI assistant textarea, the
  global search, the tenant dialog, or any future input would toggle the
  rail AND `e.preventDefault()` — preventing whatever bookmark/IME/format
  shortcut the input expects. Compare ⌘K which is intentionally global; ⌘B is
  not — Cloudflare's reference UX scopes ⌘B to non-input focus, I'd expect
  the same here.
- Hover menu on focus: the product `<Link>` has `onFocus` that opens the menu
  and `onBlur` that schedules close (`v4/rail.tsx:430-440`). Keyboard user
  tabbing through the rail gets a menu pop on each product. That's a lot of
  menu noise. With 7 products, tabbing through opens 7 menus in succession.
  Consider only opening on `Enter` or arrow-right.
- Esc on hover menu: nothing handles it. The user has to mouse out or tab
  away.
- Visible focus ring: browser defaults.

**State machines**

- Drill: shared `url.ts`. Adds the special-case in `shell.tsx:27-29` that
  shows the v0 SecondColumn when `ctx.backHref !== null`. ✓
- Tenant switch: shared placeholder.
- Product switch (collapsed mode): each product's hover menu is a fresh mount,
  so menu state doesn't leak. ✓
- Product switch (expanded mode): all products mount; group state preserved
  per product. ✓ (This is the only variant that does this.)
- Mode swap (⌘B): `useExpandedRail` (`expand-state.ts:34-52`) persists per
  variant slug. Re-expand survives reload.
- **Mode swap: in-flight hover menu issue (above).** Plus: if the user has
  expanded a group in the expanded sidebar, then ⌘B-collapses, the group
  state (held in `V4GroupRow` local state) unmounts. Re-expand → group
  state lost. Compare same-product behavior within expanded mode where state
  IS preserved. So `expand-state` persists, but per-group expand state does
  not.
- Hover-then-click vs. click-without-hover: same destination ✓; on click the
  menu closes (`closeImmediately` on `onClick`, `v4/rail.tsx:429`).

**Motion**

- Tooltip transitions: same `RailTooltip` as v3, no transitions
  (`v4/rail.tsx:247-302`). Reduced-motion irrelevant.
- Hover menu mount: no entry transition. Menu pops into existence.
- Mode swap (⌘B): no transition between collapsed (64px) and expanded (256px).
  The DOM swaps instantly. The persona's "interruptible, 200–250ms reveal"
  spec is violated — but in this case the absence of motion may be the right
  call for a mode swap (which is a state change, not a peek). I'd accept it.
- No `prefers-reduced-motion` handling anywhere in v4.

**Power-user vs. novice tension**

- Power user: ⌘B is a great affordance once learned. Hover-menus are fast
  pop-outs (120ms open). The hidden mode is a feature, not a bug, *for
  someone who's been told the trick*.
- Novice: collapsed mode is hostile. Tooltip-only on Settings, hover-menu on
  products, dropdown on User — three different micro-affordances that look
  identical at rest. To learn ⌘B, the user has to find the toggle button at
  the bottom of the rail, click it once, see the labels, and decide.
- The reference (Cloudflare) handles novice mode via expanded-by-default. v4
  defaults to collapsed (`expand-state.ts:8-15, default false`). Wrong default
  for prototype-stage user testing — collapse-on-demand instead of expand-on-
  demand inverts the discoverability story.

**Three flows**

- (a) Cold-start: lands at 64px rail. Hovers a product (120ms). Menu pops out
  showing top-level features. Reads names. Clicks "API Discovery." ~5s. **Best
  cold-start speed of the four** *if* the cursor doesn't drift across the 8px
  gap. With drift, ~8s including a couple of false-open menus.
- (b) Power flow: ⌘K-based. Same as others.
- (c) Recovery: click wrong product → second column doesn't show (no drilled
  scope) → rail re-renders with the wrong product's hover menu *if cursor is
  still over the rail*. Or page changes, hover menu closes. To find the right
  product, hover-shop through the rail. Same cost as v3 — but the menus give
  more info than tooltips, so the dwell pays off. **Best recovery of the
  four** if you trust the menu geometry.

**Verdict.** Highest ceiling, lowest floor. The model is sound; the
implementation has three real holes (hover gap, ⌘B input-blind, ⌘B not
dismissing in-flight menus). Fix those and v4 is competitive with v2.

---

## 3. Comparison matrix

| Axis | v0 | v2 | v3 | v4 |
|---|---|---|---|---|
| **Hover-open timing** | F (0ms) | A (80ms) | A (300ms tooltip) | B (120ms menu) |
| **Hover-close timing** | C (150ms tight) | A (200ms) | F (instant) | C (160ms tight) |
| **Corridor of forgiveness** | A (zero gap by layout) | A (overlay) | N/A | D (8px gap, broken) |
| **Pin/unpin** | N/A (always open) | A (best-in-class) | F (no escape) | C (⌘B is hidden) |
| **Keyboard rail nav** | F (tab-only, no skip) | A (arrow + Esc + pin reachable) | B (arrow, no Esc) | C (arrow collapsed only) |
| **⌘K integration** | A (global) | A (global) | A (global) | A (global) |
| **Esc behavior** | A (in dialog/dropdown) | A (rail Esc) | C (no rail Esc) | C (no menu Esc) |
| **Focus on AI panel** | F (no trap, no focus move) | F (inherits v0) | F (inherits v0) | F (inherits v0) |
| **Drill state across scope** | A (URL-driven, frozen rule) | A (same) | A (same) | A (same) |
| **Group-expand across product switch** | F (lost) | F (lost) | F (lost) | A (preserved in expanded mode) |
| **Hover-then-click parity** | A | A | A | A |
| **Mode-swap interrupts in-flight UI** | N/A | N/A | N/A | C (implicit unmount) |
| **Reduced-motion** | F (AI panel ignores) | A (explicit branch) | A (no motion to suppress) | F (no handling) |
| **Misclick recovery cost** | C (column swap) | D (column swap + rail collapse) | C (300ms tooltip-shopping) | B (hover-menu helps) |
| **Cold-start cost** | B | C | F | A* (with caveat) |
| **Power-user efficiency** | B (no shortcuts beyond ⌘K) | A (pin) | A (memorized icons fast) | A (⌘B + memorized icons) |

`*` v4's A on cold-start assumes the corridor bug is fixed.

---

## 4. Top 5 interaction bugs / risks

1. **v4 hover-menu corridor gap (8px) is a dead zone.**
   `v4/rail.tsx:495, ml-8` separates the menu from its trigger. Diagonal
   cursor traversal exits the trigger's hit zone before entering the menu's;
   the close timer fires; the wrong neighbor opens. **Fix:** zero the gap and
   overlap the menu onto the trigger by 1–2px, OR widen the wrapper element
   to include the gap region as a transparent bridge.

2. **AI assistant push panel has no focus management.**
   `src/nav/shell/ai-assistant-panel.tsx:48-58` opens to width 440 with no
   focus trap and no `useEffect` to move focus into the textarea.
   `aria-hidden={!open}` is set, which means screen readers correctly skip the
   panel when closed; but on open, focus stays on the trigger button (which is
   then unmounted because v0/v2/v3/v4 hide the trigger when open —
   `top-bar.tsx:83-96`). **Focus is now nowhere.** A keyboard user has to tab
   through the entire app to find the panel. **Fix:** on open, `requestAnimationFrame
   (() => textareaRef.current?.focus())`. On close, return focus to the trigger.

3. **v4 ⌘B intercepts every keystroke, including inside text inputs.**
   `v4/rail.tsx:64-72` listens at `window` and unconditionally
   `preventDefault`s on Cmd/Ctrl-B. Inside the AI textarea, the global search
   input, or the tenant dialog, this kills the user's bookmark / format /
   IME shortcut. **Fix:** `if (e.target instanceof HTMLElement && e.target.matches('input, textarea, [contenteditable]')) return;` before
   the handler runs. Also worth considering whether ⌘B is the right binding
   given Chrome / Safari / Firefox use it for the bookmark bar.

4. **v3's tooltip dismiss is instantaneous; cursor between two icons gets no
   help.**
   `v3/rail.tsx:181-184` calls `setOpen(false)` directly on `mouseleave`. With
   a 64px rail and 40px-tall icon rows, the cursor crosses the gap in <50ms
   while the tooltip is still painted; close is immediate; the next icon's
   tooltip then has 300ms of dwell before opening. Net: a "flickering"
   experience for indecisive scrolling cursors. **Fix:** add a 100–150ms
   close delay matching v2's pattern, OR keep the previous tooltip visible
   while the new one is dwelling (a shared "tooltip context" that hides on
   commit).

5. **Group-expand state is lost on product switch in v0/v2/v3.**
   `sidebar-tree.tsx:63, useState(!node.collapsed)` is local to a remounted
   tree. Switching from product A to product B and back resets every group
   in product A. The user has to re-open them. v4's expanded mode is
   immune because all products are mounted simultaneously, but v4's collapsed
   mode is also immune because there's no group expand at all (hover-menu
   flattens). **Fix:** lift group-expand state to a per-variant `Map<string,
   boolean>` keyed by product+group, persisted in localStorage. This is a
   shared infrastructure improvement, not a per-variant fix.

**Honorable mention 6:** No variant has a visible focus ring beyond browser
defaults. WADS components carry their own `:focus-visible` styling, but the
rail items in all four variants are styled with `<Link>` and custom `<button>`
elements that fall back to the browser's default outline (which Tailwind v4
preflight may have reset). On Chrome / Safari with a non-standard outline
reset, keyboard users navigate by guessing. **Verify in browser.**

---

## 5. Interaction-only recommendation

**Ship v2 as the "conservative" recommendation.** It is the only variant where
the state machine reads like someone shipped this before. It handles every
axis on the persona's checklist — open delay, close delay, hover-vs-focus,
pin, Esc, focus-suppression, reduced-motion — and the three documented "non-
obvious fixes" in `docs/variants.md` are real fixes for real bugs. Cold-start
is slightly worse than v0; the pin makes it a one-time tax.

**Use v4 as the "ambitious" recommendation if and only if** the three holes
(hover gap, ⌘B input-blind, mode-swap UI dismiss) are closed AND the default
is flipped to expanded-on-first-visit. The ⌘B binding should be reviewed —
either keep it and accept the bookmark-bar conflict (most apps just do this),
or move to a less collision-y combo like ⌘\\ (VS Code's secondary side-bar
toggle) or ⌘. (Linear's command-bar inspired).

**Do not ship v3 as primary.** v3 ships a 300ms guessing game with no
escape hatch and a hostile cold-start. It's a fine *tertiary* option for
users who explicitly opt in via a "compact mode" toggle inside v2 — i.e.
"v2 with labels permanently off." As a standalone primary, it punishes
discovery.

**Ship v0 as the fallback** for users on `prefers-reduced-motion: reduce`
and small-screen accessibility scenarios. It is the variant where motion is
already minimal, the affordances are most generous, and the state machine is
simplest to reason about with assistive tech. Its preview-with-zero-delay
should be raised to 250ms to match the persona spec — five lines of change in
`v0/rail.tsx`.

**Cross-cutting fixes** (apply to all variants):

1. AI panel focus trap + return-focus-on-close.
2. Global group-expand state lifted to localStorage.
3. Explicit `:focus-visible` styling on all custom-styled rail items.
4. Skip-to-main link in the top bar (currently absent everywhere).
5. ⌘K stays global ✓ — keep it that way.

---

**End of audit.**
