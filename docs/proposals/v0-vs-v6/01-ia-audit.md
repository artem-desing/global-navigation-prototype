# IA audit — v0 vs v6

## Executive summary

v0 and v6 are the same IA wearing two different overcoats — both consume `getProductManifests()` / `getPlatformUtilityManifests()` from `src/nav/manifest/registry.ts` and delegate scope drill to the shared `SecondColumn` (v6 even imports v0's `SECOND_COLUMN_FOCUS_FLAG`), so the taxonomy is bit-identical. The IA-relevant difference is *root-layer expression*: v0 renders persistent labels + a same-bay flyout that previews a sibling product's tree; v6 renders three user-controlled modes (expanded / collapsed / hover) and removes the cross-product peek. For information architecture purposes, v0 is a stronger discovery surface, v6 is a stronger living-in-one-product surface, and the right answer is to fold v6 into v0 as a user preference rather than ship them as competing models.

## v0 — strengths and weaknesses (IA only)

- **Strength:** Persistent labels next to icons (`src/nav/variants/v0/rail.tsx:633`) make the four-product taxonomy legible at all times — a first-time operator sees "Edge / AI Hypervisor / Infra Discovery / Testing" without hovering. This matters under `docs/current-ia.md` observation #5: there is no app switcher today, and v0 most closely externalises the new platform-of-products noun set.
- **Strength:** The `HoverPreview` flyout (`src/nav/variants/v0/hover-preview.tsx`) lets a user *peek* into a sibling product's sidebar without committing to a route — a unique cross-product wayfinding affordance that no other variant in this prototype offers and that explicitly satisfies Principle 1's "calm chrome / look without committing" reading.
- **Weakness:** The rail is a fixed `w-96` (96px in WADS' 1px-spacing). It can't shrink, so vertical density is fixed — adding a 5th and 6th product still fits, but at 7+ products (Hypervisor + Gateway + Discovery + Testing + Console + two-more) the bottom utility stack starts crowding the product stack with no escape valve.
- **Weakness:** Always-visible rail is a permanent attention tax; for a daily power-user who already knows where Edge lives, v0 spends pixels re-teaching them every session. No way to opt out.

## v6 — strengths and weaknesses (IA only)

- **Strength:** The three modes (`src/nav/variants/v6/rail.tsx:41`) give the user explicit control over how loud the root layer is. A daily power-user picks `collapsed` and reclaims 128px of horizontal real estate for the work; an occasional auditor picks `expanded` and gets v0's legibility. This is the **only** variant in the prototype that lets the IA's loudness scale to the operator's familiarity.
- **Strength:** `hover` mode keeps the spacer at 64px and overlays the 192px expansion (`committedWidth` vs `railWidth` at line 384–385), so the workspace never reflows on collapse/expand. From an IA perspective this is the cleanest implementation of "shell outlives the work" — adding a product doesn't change main-content reflow behavior.
- **Weakness:** v6 has no equivalent of v0's `HoverPreview`. To inspect what's inside a sibling product, the user must commit a navigation. For new operators, this collapses cross-product mental-model building into a serial click-walk instead of a parallel hover-scan.
- **Weakness:** `collapsed` is the default (`readMode` returns `'collapsed'` at line 86) and a first-time user lands on icon-only chrome. Without label-priming or onboarding, the four product icons (`globe-lock` for Edge, etc.) are not self-documenting — `docs/current-ia.md` doesn't claim users have prior icon-association for the new pillars. This violates Principle 2's "reachable by name" for users who don't yet know the names.

## Head-to-head on the five criteria

| Criterion | v0 | v6 | Winner |
|---|---|---|---|
| Taxonomy fit | Identical — both consume the same manifest split (products above, utilities below the separator at `rail.tsx`). | Identical. | Tie |
| Scope expression | Renders shared `SecondColumn` with drift-back; rail layer is taxonomy-only and never fights the scope tree. | Same `SecondColumn`, same drift-back; rail is also taxonomy-only. Mode change does not interact with scope state. | Tie |
| Scalability (7→12 products) | Fixed 96px width × ~64px per item: ~9 items vertical before the products stack collides with the utilities stack. Breaks gracefully but has no escape valve. | `collapsed` mode at 64px width × 40px-ish items fits ~12 items per stack; `expanded` matches v0. Mode toggle *is* the escape valve. | **v6** |
| Mental-model fit | Best for occasional / first-time operators — "where am I, where can I go" is answered without interaction. | Best for daily power-users — they pick the level of nav presence that matches their fluency. Worst for newcomers in default state. | Split: v0 for newcomers, v6 for daily |
| Discoverability of products | Labels always visible → highest first-click correctness for an operator who has never opened a product. | Default `collapsed` requires hover-to-label or trial click; `hover` mode works but adds latency; `expanded` matches v0 but isn't default. | **v0** |

## IA-lane recommendation

**Fold v6 into v0 as a mode.** The two variants are not competing IAs — they are competing *defaults* for the same IA. v0's persistent-label rendering should remain the **default** because new-operator discoverability and cross-product peek (the `HoverPreview` flyout) are load-bearing for the platform-of-products narrative landing in 2026-06; without persistent labels, the platform will not *feel* like one control plane on first contact (charter success criterion). But v6's `collapsed` and `hover` modes are real wins for daily users and for the 7→12-product scalability ceiling — they should ship as preferences attached to v0's rail, not as a separate `/v/v6/` slug. This mirrors the established pattern from the 2026-04-30 stress test ("v2 is v0's collapsed mode, not a competing variant" — `project_v2_is_v0_collapsed_mode.md` in memory): build collapse states as toggles, not slugs. The unique IA capability v6 has that v0 lacks — user-controlled rail loudness — is worth absorbing; the unique IA capability v0 has that v6 lacks — persistent labels + sibling-tree peek — is non-negotiable for the platform launch window.
