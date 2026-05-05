# v0 vs v6 — verdict

**Ship v0. Absorb v6's `expanded` mode as a single toggle. Kill `collapsed` and `hover` as shipped surfaces.**

## What ships

- **v0 default**, IA unchanged.
- **One toggle** (⌘B-class) widens the rail to 192px with persistent labels — harvested from v6 `expanded`. No three-way menu.
- **Keyboard roving** (ArrowUp/Down across `itemRefs`) harvested from `v6/rail.tsx:330`.
- **`prefers-reduced-motion`** wired wherever the toggle introduces motion.

## What gets killed or parked

- v6 `collapsed` mode — v3 with a settings opt-out. Killed.
- v6 `hover` mode — no operator-console precedent, hostile usability literature, breaks pair-share consistency. Killed.
- The three-way mode menu (`SidebarControlItem`). Killed.
- `/v/v6/` stays on the deploy as reference until 2026-06-10, then retires with v2/v3/v4.

## Why

- 5/7 lanes converge on fold-not-compete (IA, Adversarial, QA, Competitive, PM).
- 4/7 lanes (IA, Adversarial, Competitive, PM) independently reframe v6 as v0-with-a-setting — **same shape as the 2026-04-30 v2-is-v0's-collapsed-mode call.** Second variant-comparison test in two weeks reaches the same answer.
- PM lane: `collapsed` default punishes new admins (30% of base) and auditors (25%) on icon-only chrome at the launch moment.
- Competitive lane: zero major operator consoles ship hover-overlay rail as default.
- Interaction lane: v6 has ~4× the state-machine surface; v0's wins are smaller but its invariants are predictable.

## What the dissenting lane is right about

Visual lane is right that v6 is the calmer chrome at rest and that v0 ships avatar / surface-stacking / hover-preview-flyout regressions. The ship list adopts those specific fixes (avatar `bg-light-primary` regression, edge-elevation tokenization, hover-preview 0 → 250ms). Its strategic conclusion (`hover` default) is rejected on launch-narrative grounds.

## Next

- **Adjacent fixes regardless:** AI panel Escape + reduced-motion (still not in), 375px responsiveness with `(hover: hover)` gate, hover-preview open delay, avatar regression, skip-to-main, focus-visible audit.
- **No more "competing rail variants."** Future v7+ slugs reserved for *different IAs* — scope-first, stacked-swap, workbench. Not for re-renderings of the same rail.

Full reasoning: `00-synthesis.md`. Lane reports: `01`–`07`.
