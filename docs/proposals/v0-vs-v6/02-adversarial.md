# Adversarial review — v0 vs v6

**Reviewer.** Principal IA Researcher (Red Hat). Skeptic first. Consensus is not validation.

**Frame.** v0 ships one rail at one width (`w-96`, 96px under WADS spacing override) with always-on labels and a hover-preview flyout for cross-product peeks. v6 ships three modes (`expanded` 192px / `collapsed` 64px tooltipped / `hover` overlay), persisted per-variant in `localStorage`, default `collapsed` (`readMode` line 86). Shared: TopBar, SecondColumn, ⌘K, Recents, leader keys (G+E/A/I/T/H/R/S), drift-back.

## Steel-man: v0

v0 is the variant that **does not lie about the platform**. Five products, four utilities, all visible at all times in a 96px rail with labels. There is no mode to choose, no setting to restore, no width that oscillates, no shortcut to remember to "reveal what's there." Recognition beats recall, period. A first-day SOC analyst opens the console and sees the whole platform; spatial memory locks within sessions because chrome never moves. Hover-preview (`hover-preview.tsx`, fixed 256px, `left-96`) lets a power user peek another product's tree without committing — calm chrome scoring its strongest point. Code is the simplest of any variant: one rail, one width, no `RailMode` type, no `readMode/writeMode`, no `suppressFocusInRef`, no `prefersReducedMotion` width transition. **The most boring variant, and that is the case for it.**

## Attack: v0

v0 burns 96px of horizontal real estate on every single screen, including the 41-feature Edge tree where the SecondColumn is already screaming for room. The labels inside the rail (`shortLabel`, vertical-stacked icon-over-text) are decorative for power users — by week 2 nobody reads "Edge" under the Edge icon, but the prototype pays full chrome width for the privilege. Worse, the 96px rail + 256px SecondColumn + content gives a 1024px viewport just 672px of canvas before any AI panel opens. v0 has zero answer to the canvas-density complaint that drove every other variant into existence. The hover-preview is a hidden affordance — nothing tells a new user it exists, and the `pendingNavSlot` defer-close pattern (line 169-181) is the kind of state machine v0 supposedly avoids. **v0 already has a state machine; it's just smaller than v6's.**

## Steel-man: v6

v6 is the only variant that **respects that operators are not one persona**. The L1 SOC rotating every six months wants `expanded` (labels, no learning curve). The senior SecOps engineer who lives in three products wants `hover` (calm at rest, full reveal on demand, overlay so content doesn't reflow — `Z_RAIL_OVERLAY` line 39, spacer at `committedWidth` line 384). The CISO who only opens the console weekly wants `collapsed` with tooltipped shortcuts. v6 ships **all three rest states** behind one persistent control (`SidebarControlItem`), per-variant `localStorage`, and full leader-key parity with v0. Labels-when-expanded use a staggered `LABEL_FADE_MS` animation (line 1125) that respects `prefers-reduced-motion`. The same shell, leader keys, and SecondColumn delegation work identically to v0 — v6 is **v0 plus an axis of control**, not a different variant.

## Attack: v6

v6's user-agency claim **is the entire confession**. Four facts: (1) default mode is `collapsed` (line 86) — v6 ships looking like v3, the variant the team already killed in `02-adversarial.md` of the stress test as a tooltip graveyard. (2) Three modes means three tab orders, three tooltip behaviors (`tooltipsEnabled = mode === 'collapsed'` line 400), three different focus contracts (`hover` mode runs `focusOpen`/`hoverOpen`/`suppressFocusInRef` machinery; `collapsed` and `expanded` don't). A user who switches modes is learning a new sub-product. (3) The `SidebarControlItem` is a 40px button hidden at the bottom of the rail under a separator — discoverability of the entire premise depends on that button. (4) Across-screen consistency is dead: pair-programming, screen-shares, and "click on my screen" become "what mode are you in?" Spatial memory is now per-user, not per-product. **v6 trades shared mental model for individual preference, then defaults to the worst of the three modes.**

## Reframe check

**Yes — partial reframe.** This is not "v0 vs v6." It is **"opinionated default vs. configurable rail,"** and the configurable-rail framing already exists in mature consoles (Linear, Sentry, Notion, VS Code). Memory entry `project_v2_is_v0_collapsed_mode` is the precedent: the team correctly reframed v2 as "v0's collapsed mode, not a competing variant." v6 hover-mode is **literally v2's hover-expand pattern** with a setting toggle to opt out — and v6 expanded-mode is **v0 with a 192px rail instead of 96px**. The honest framing: v6 is v0 plus two opt-in modes (one of which is v2 in disguise). Treating v6 as a competing variant repeats the v2 category error. The real question is not "which variant?" but **"is the third state (`collapsed`-with-tooltips) worth the cost of a settings menu?"** That is a much smaller question than "v0 vs v6," and the answer is probably no — it's the v3 pattern the team already killed.

## Head-to-head scoring (1–5 per criterion, sum at bottom)

| Criterion | v0 | v6 |
|---|---|---|
| Cognitive load at rest | 5 | 2 |
| Decision burden | 5 | 2 |
| Predictability across users | 5 | 2 |
| Failure-mode resilience | 4 | 3 |
| **Total** | **19** | **9** |

Reasoning: v0 wins cognitive load because there is nothing to remember about the rail — it is what it is. v0 wins decision burden because v6 forces the user to choose a mode (and `collapsed` default punishes them for not choosing). v0 wins predictability because every v0 user sees the same rail; v6's localStorage-persisted mode means any two users have potentially different rails. Failure modes: v0 fails gracefully (busy at rest, hover-preview is hidden); v6's `hover` mode has timer cycles (`hideTimerRef`, `openTimerRef`, `suppressFocusTimerRef`) where confused users get trapped between rest states, and `collapsed` default re-imports v3's icon-recognition problem with brand-new pillar icons (Hypervisor, Discovery).

## Verdict

**v0 wins, but the real verdict is a reframe: ship v0, fold v6's `expanded` mode in as a single ⌘B toggle (no three-way menu), kill v6 `collapsed` and `hover` modes outright.** v6 collapsed default is v3 with a settings escape hatch — the same icon-only-with-tooltips pattern the team already retired. v6 hover mode is v2 with an opt-out — the variant the team reframed as "v0's collapsed mode" precisely because pinning was the dominant behavior. The only mode v6 contributes that v0 doesn't already have is `expanded` (192px rail with inline labels), which is genuinely useful for ultrawide screens and density-loving power users. That is a one-bit toggle, not a three-mode preference panel. Calling this a tie would be a category error: the comparison itself smuggles in v6's framing that "user agency over rail mode" is a real win. It isn't — it is a designer-side win disguised as a user-side win. **One default that works for everyone is the calmer choice. Always.**
