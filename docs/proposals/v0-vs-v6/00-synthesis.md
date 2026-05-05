# Synthesis — v0 vs v6

**Author:** Project Manager (synthesis lane).
**Date:** 2026-05-05.
**Inputs:** seven lane reports in this directory (`01`–`07`).
**Audience:** design lead. Read this when `VERDICT.md` is not enough.

## Headline

**v6 is not a competing variant — it is v0 with a setting.** Five lanes (IA, Adversarial, QA, Competitive, PM) and the Interaction lane's tied call all converge on: ship v0 default, absorb v6's `expanded` mode as a single ⌘B-class toggle, kill `collapsed` and `hover` as shipped surfaces. The Visual lane dissents on calm-at-rest grounds — that dissent is partly correct and the ship list adopts its specific fixes (avatar regression, edge-elevation token), but its strategic conclusion does not survive contact with the other six lanes' platform-launch read.

## Where the lanes agree

1. **The IA is identical.** Both variants consume the same `getProductManifests()` / `getPlatformUtilityManifests()` from `src/nav/manifest/registry.ts`. Both delegate scope drill to the shared `SecondColumn`. v6 even imports v0's `SECOND_COLUMN_FOCUS_FLAG`. The taxonomy is bit-identical (IA, QA, Competitive). What differs is the root-layer rendering only.
2. **v0 is the stronger discovery surface; v6's `collapsed` default punishes newcomers.** IA, Adversarial, PM, Competitive all flag this. Brand-new pillar icons (Edge globe-lock, AI Hypervisor, Discovery, Testing) carry no prior recognition — `collapsed`-by-default lands the 30%-of-base "new admin" segment plus the 25% auditor segment on tooltipped icon chrome at the launch moment. PM lane scores it 2/5 across four of five segments.
3. **v6's `expanded` mode is structurally v0 with a 192px rail.** Adversarial, IA, Competitive, PM name this directly. Same labels, same persistent visibility, same hierarchy — just wider.
4. **v6's `hover` mode has hostile precedent.** Competitive lane: zero major operator consoles ship hover-overlay-rail as default. NN/G, UX Collective, Smashing all warn against it (diagonal-cursor, accessibility, brittle timing). The closest analogue (Material rail+drawer) pairs icons with persistent labels on expand — i.e. it is opt-in from a labeled default, the inverse of v6's posture.
5. **Pair-programming and screen-shares break under per-browser mode persistence.** PM names this Scenario C; QA flags the touch-device degradation when a user persists `hover` and reopens on tablet. "Click the third icon" stops being universal once two operators' rails are in different modes.
6. **v6 inherits all of v0's defects and adds two.** QA: same High AI-panel Escape gap, same Medium 375px responsiveness gap, plus two new Mediums (touch hover-trap when `hover` is persisted; rail-Escape parity gap across modes). Interaction lane's complexity audit confirms: roughly **4× state-machine surface** (4 timer families vs 2; mode × hoverOpen × focusOpen × suppressFocusInRef × leader-key state matrix).
7. **v6 is the only variant that lets rail loudness scale to operator familiarity.** IA, Interaction, Visual all credit this. The capability is real; the question is whether it should ship as a 3-mode picker or a single toggle.

## Where the lanes disagree (and adjudication)

### Tension 1 — Visual says v6 is the calmer chrome at rest; six lanes call v0

**The disagreement.** Visual lane scores v6's resting state (collapsed/hover spacer at 64px) as the cleaner hierarchy: rail recedes, second-column title and work expand to lead. v0 lands "rail-loud" — six vertical icon-and-label sandwiches in a 96px column always pull the eye before the second-column header. Every other lane treats v0's perceptual loudness as the *price of v0's load-bearing attribute* — visible platform inventory at the launch moment.

**Adjudication.** The visual lane is right about the resting hierarchy and partially right about v6 being more visually stable mid-interaction (one moving object, no second tree-shaped surface). It is wrong about the strategic conclusion. The 2026-06-10 AWS Summit reveal needs the rail's product list to *literally embody* "we are now many products"; a `collapsed` default is a denial of that demonstration in service of horizontal real estate the launch isn't asking for yet (PM lane's charter alignment row scores v6 2/5 on "feel like one control plane"). The right move is to **adopt the visual lane's specific fixes without adopting its conclusion**:
- Drop the `bg-light-primary` avatar circle on top of `surface-1` (Visual lane top concern; same gotcha as the prior stress test).
- Tokenize a faint elevation on the rail's right edge so any future hover-overlay never reads as continuous with light-mode card content.
- Tighten v0's rail width (96 → 80px) per the prior synthesis; carry forward.

The visual win at rest is not large enough to outweigh the launch story, the precedent gap (no operator console ships this default), and the predictability cost of per-browser mode state.

### Tension 2 — Interaction: v6's `prefers-reduced-motion` handling is correct; v0 ignores it

**The disagreement.** v6 explicitly checks `usePrefersReducedMotion` (`src/nav/variants/v6/rail.tsx:98`) and sets width / label transitions to `'none'`. v0 has no such hook. Interaction lane awards v6 the win here; the rest of the lanes don't grade it.

**Adjudication.** v0 doesn't need the hook *for the rail* (no rail motion). But v0 ships the shared `ai-assistant-panel.tsx:52` which animates a 200ms width transition unconditionally. That violation belongs to both variants. **Fix it once at the shell layer, regardless of v0/v6.**

### Tension 3 — Interaction: v6 wins keyboard reachability via Tab+arrow roving

**The disagreement.** v6 implements ArrowUp/Down roving across `itemRefs` (`v6/rail.tsx:330`); v0 makes every rail item a Tab stop (~13+ stops to reach the avatar). Interaction lane prefers v6.

**Adjudication.** Real win, low cost. **Harvest the roving pattern into v0** when absorbing the `expanded`-mode toggle. Doesn't change the variant call.

### Tension 4 — Interaction's "ship v6 with `hover` default" minority position

The Interaction lane explicitly says: *"If we ship one, ship v6 with a default of `hover` and accept the higher complexity. If we want one fewer thing to break, ship v0 with a 250ms hover-preview open delay added."* The conditional structure is the answer. Every other strategic lane (PM, IA, Adversarial, Competitive) takes the second branch on segment-fit and precedent grounds. Interaction's complexity-vs-capability framing is sound; the trade reads against `hover` once you weight new-admin + auditor + pair-share scenarios.

## Reframe

**This is the same shape as the 2026-04-30 v2-vs-v0 reframe. Name it explicitly.**

Last week the team concluded "v2 is v0's collapsed mode, not a competing variant." Memory entry: `project_v2_is_v0_collapsed_mode.md`. The competitive lane delivered the killing line: vendors don't ship "always-on rail" and "user-toggleable rail" as competing apps; they ship one component with one or more user-controlled states.

v6 is structurally **the next layer up of the same category error**. v6 `expanded` is v0 with a 192px rail. v6 `hover` is v2 with a settings opt-out. v6 `collapsed` is v3 with a settings opt-out (the variant the team killed). The IA, Adversarial, Competitive, and PM lanes all independently arrived at this reframe — four lanes converging without coordination is load-bearing.

**Stop building "competing rail variants" entirely.** A future variant slug (v7+) earns the slug only when it proposes a *different IA* (scope-first, stacked-swap, workbench), not when it proposes a different rendering of the same rail. This is the second time in two stress tests we've reached the same call. Log it so we don't relitigate it on v8.

## What ships

**Default.** v0, unchanged at the IA layer.

**Absorb from v6 into v0:**
- **`expanded`-mode toggle** — single keystroke (`⌘B` or equivalent — coordinate with the parked `⌘\`/`⌘.` from the prior synthesis), no three-way menu. When toggled, rail widens from current 96px to 192px with persistent inline labels. Default off. Persist preference in localStorage under `nav:rail-width` (variant-agnostic key — see Open Items below).
- **ArrowUp/Down roving** on the rail (`v6/rail.tsx:330` pattern) — single Tab stop, arrow keys move within. Strict win on Supportive Nav reachability.
- **`prefers-reduced-motion` handling** for any motion the merged toggle introduces (label fade, width transition).

**Kill (do not ship):**
- v6 `collapsed` mode as a user-facing default. The icon-only-with-tooltips pattern is the v3 problem the team already retired. If a future stress test rehabilitates it, that's a different conversation.
- v6 `hover` mode. No operator-console precedent, hostile usability literature, breaks pair-share consistency, doubles the state-machine surface, introduces the touch-device hover-trap (QA Medium). The visual-stability win it offers is real but isolated.
- The three-way mode menu (`SidebarControlItem` at `v6/rail.tsx:503-512`). One toggle, not a picker.

**Park in the prototype:** `/v/v6/` stays on the deploy as a reference until 2026-06-10 alongside `/v/v2/` `/v/v3/` `/v/v4/`. After the AWS Summit reveal, retire all four. Memory entry `project_v6_user_controlled_rail.md` stays as historical context.

## Adjacent fixes (regardless of variant call)

These are not v0-vs-v6 questions. They surfaced across lanes and should ship anyway:

1. **v0 hover-preview 0ms open delay → 250ms.** Interaction lane: persona spec is 250–350ms; v0 currently flashes through products on diagonal traversal. Five-line fix at `src/nav/variants/v0/rail.tsx` (constant near `HOVER_HIDE_DELAY_MS = 150`). Carried over from the prior stress test; still not fixed.
2. **Avatar surface-stacking regression.** v6 paints `bg-light-primary` on `surface-1` (`v6/rail.tsx:730–741`), invisible in light mode. Fix in v6's deathbed before retirement *and* audit any v0 path that picks this up if the harvested toggle reuses v6 chrome.
3. **AI panel Escape handler + `prefers-reduced-motion`.** QA High (no Escape, no return-focus); Interaction Medium (200ms width transition ignores RM). Cross-cutting; fix once at `src/nav/shell/ai-assistant-panel.tsx`. Same defect the prior stress test flagged.
4. **375px responsiveness.** QA fail across both variants. The `(hover: hover)` media-query gate from QA's recommendation should land regardless — it protects any future collapsed/hover behavior from touch degradation.
5. **`Z_AI_PUSH_PANEL` etc. unused exports.** Wire them up or drop them (`src/nav/z-index.ts:6-11`). Prevents drift when a future portal changes stacking order.
6. **Skip-to-main link.** Carried from prior synthesis. Still not in.
7. **`:focus-visible` audit on custom rail items.** Carried from prior synthesis. Still not in.

## Risks the call accepts

- **Power-user complaint surface remains.** Daily operators in one product will keep asking for a quieter rail. The harvested `expanded`-mode toggle does not address them — they want the *opposite* (collapse, not expand). If post-launch qualitative signal shows >25% of daily operators manually trying to collapse the rail every session, the `hover`-mode revisit is on the table (behind a hidden preference, not a visible setting).
- **Density ceiling at ~9 products.** Same as prior synthesis. Remains a 2027 problem.
- **Hover-preview hidden affordance debt.** v0's flyout discovery is unannounced — no on-screen hint that hovering a sibling product reveals its tree. Lower priority but real.
- **Per-tenant nav consistency unsolved.** Mode preference (when we ship the toggle) is per-browser, not per-tenant. Two operators in the same tenant comparing screens see different chrome. PM lane scenario C. Not a blocker; flagged for the post-launch revisit.

## Draft decision-log entry

> **Decision:** Ship v0 as canonical. Absorb v6's `expanded` mode as a single ⌘B-class toggle on the v0 rail (no three-way mode menu). Harvest v6's keyboard roving (ArrowUp/Down across `itemRefs`) and `prefers-reduced-motion` discipline into v0. Kill v6 `collapsed` and `hover` as shipped surfaces. v6 stays in the prototype at `/v/v6/` as a reference until 2026-06-10, then retires alongside v2/v3/v4.
>
> **Date:** 2026-05-05
>
> **Branch / MR:** synthesis on main (8-lane stress test of v0 vs v6, second variant-comparison test in two weeks)
>
> **Decided by:** Project Manager (synthesis lane), informed by 7 lane reports (IA, Adversarial, Interaction, Visual, QA, Competitive, PM).
>
> **Context:** Four lanes (IA, Adversarial, Competitive, PM) independently arrived at the same reframe: v6 is structurally v0 plus opt-in rest states for the same rail, not a competing variant. The reframe matches the 2026-04-30 v2-is-v0's-collapsed-mode call (memory: `project_v2_is_v0_collapsed_mode`). Reaching the same shape twice in two weeks is signal — variant slugs that propose a different rendering of the same rail are category errors and should not occupy slots; future v7+ slugs reserved for *different IAs* (scope-first, stacked-swap, workbench).
>
> **Options considered:**
>   1. Ship v6 with `hover` default (Interaction lane minority) — pros: best resting visual hierarchy, only variant with `prefers-reduced-motion` discipline. Cons: zero operator-console precedent, breaks pair-share consistency, touch-hover trap, 4× state-machine surface, `collapsed` default lands new admins on v3-in-disguise.
>   2. Ship v0 unchanged — pros: simplest, highest first-day legibility, strongest competitive precedent (Datadog, New Relic, Konnect, Sentry). Cons: leaves the 15% power-user density complaint on the floor; carries v0's existing defects (0ms hover-preview, avatar in v6, AI panel Escape).
>   3. Fold (chosen) — ship v0 default, absorb v6's `expanded`-mode toggle and keyboard roving, kill the rest. Pros: preserves v0's launch narrative, harvests v6's two real wins (capability dial, keyboard roving), eliminates the per-browser inconsistency hazard, matches what every analogous vendor actually ships. Cons: more engineering than picking one variant whole; introduces one optional layout the team must maintain.
>
> **Decision:** Option 3.
>
> **Dissent:**
>   - **Visual lane** ranks v6 first on calm-at-rest. Specific fixes adopted (avatar regression, edge-elevation tokenization); strategic conclusion (ship v6) rejected on launch-narrative grounds.
>   - **Interaction lane** conditional preference for v6+`hover`-default if shipping one. Rejected on segment-fit + precedent grounds; the lane's complexity-vs-capability framing is sound, the trade reads against `hover` for the launch window.
>
> **Revisit if:**
>   - Post-launch qualitative signal shows >25% of daily operators manually trying to collapse the rail every session — `hover`-overlay revisit on the table behind a hidden preference, not a visible setting.
>   - Pair-programming / screen-share inconsistency becomes a top-3 support theme — confirms predictability beats agency, hold the line.
>   - A real customer in pilot spontaneously asks "can my whole team's chrome match mine?" — per-tenant consistency signal; mode preference moves from per-browser to per-tenant.
>   - Product count crosses 9 — v0's "everything visible" promise breaks; default density question reopens.
>   - A v7+ slug proposes a *different IA* (scope-first / stacked-swap / workbench) — this guidance does not block it; it blocks only re-renderings of the same rail.
