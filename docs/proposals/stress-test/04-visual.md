# Stress test — visual lane (v0, v2, v3, v4)

**Lane:** Visual hierarchy, density, typography, color, surface stacking, WADS conformance, consistency.
**Excluded:** v5 (per scope), IA, interaction state machines, QA bug-hunting, competitive, PM, adversarial.
**Reviewed at:** 1024 / 1440 / 3440 px · light + dark · default theme.
**Code anchor commits:** at HEAD on `main` (43bd46c).

---

## 1. Executive summary

- **Strongest visual at rest:** **v3** (icon-only rail). Calmest, most disciplined, most "Wallarm-shaped." It looks like a believable next version of the console because it gets out of the way.
- **Strongest visual when working:** **v4 expanded** (256-px tree). Cleanest hierarchy (per-product caps + h-36 rows + per-row icons at depth 0). Better than v0's second-column pattern because the column header is the wordmark area + product cap, not a redundant title strip.
- **Weakest visual:** **v0**. The combined 96-px rail + 256-px second column eats 352 px of horizontal chrome before content begins. At 1024 px that's 34% of the viewport gone to navigation, and the rail's vertical-stacked icon+label items read as denser-than-Wallarm. The rail also competes with its own second column for attention.
- **Most visually inconsistent:** **v4**. There are effectively three visual languages stitched together: collapsed-rail icon column, hover pop-out menu (rounded card + shadow + 240–320 px), and expanded-rail tree (256-px solid surface, no shadow). The pop-out is a different *species of surface* from the inline tree — that should be reconciled.
- **Biggest WADS risk:** the **avatar surface stack**. In `v2/rail.tsx:669`, `v3/rail.tsx:365`, `v4/rail.tsx:767` the avatar is a `28×28` circle filled with `--color-bg-light-primary` sitting **on top of** `--color-bg-surface-1`. In light mode both tokens are very close to white — the avatar circle is barely visible. The exact gotcha called out in `CLAUDE.md` ("surface-1/2/3/4 collapse in light mode"), only the inverse: `bg-light-primary` is *almost* surface-1.
- **Second WADS risk:** the v0 hover preview (`v0/hover-preview.tsx:29`) lays a 256-px overlay panel against the second column with `--color-bg-surface-1` on **both** surfaces. The only separator is `border-color: var(--color-border-primary)` and a `shadow-lg`. In light mode the panel reads as one visual surface — a stronger border or a one-step-down surface for the body of the second column would carry the depth.

---

## 2. Per-variant visual review

### v0 — always-open sidebar (96-px rail + 256-px column)

**Hierarchy & scannability**
- Active product reads in <500 ms because the rail items have `--color-bg-primary` fill (`v0/rail.tsx:450`). The chip-style accent is the right call — it's the same active-state vocabulary the rest of WADS uses.
- The eye lands on the **rail label stack** first, not on the second column's title. That's wrong for a two-column nav: the second column is where the user is going to *act*, but the rail is louder. Cause: rail uses 12-px text under 20-px icons in a column flex (`gap-4` = 4 px), making each rail item a vertical sandwich. The second column's title is a quiet `Text size="md" weight="medium"` (`v0/second-column.tsx:48`) — too quiet to win against six rail sandwiches.
- Tertiary structure (groups inside the second column) is barely there. Group toggles use the same `Text size="sm" weight="medium"` as feature rows (`v0/sidebar-tree.tsx:80` vs `:151`). The chevron carries all the differentiation. Should be uppercase/secondary or visually thinner.

**Density**
- 352 px of chrome before content. At 1024 px that leaves 672 px for the canvas, which is below the practical threshold for a security console (charts, tables, rule editors). At 1440 px it's 75%, livable. At 3440 px it's wasteful — the rail's per-item width is set, but the whole structure feels under-scaled for ultrawide.
- v0 promises "everything visible" — and delivers, but with a tax. The rail's 96-px width is mostly whitespace around 20-px icons + 12-px labels. There's no payoff for that width since the labels are 7–8 chars max.

**Surface stacking**
- Rail: surface-1 + bg-light-primary on hover. Correct.
- Second column: surface-1 + bg-light-primary on hover. Correct.
- Hover-preview overlay: surface-1 sitting on second-column surface-1. **Shadow is doing all the depth work** — in light mode a strong shadow under a same-color panel reads as "page is scrolling" rather than "this is a transient menu." Consider `shadow-xl` plus a 1px `--color-border-primary` (already present) and a tiny `border-radius` on the *outer* edge to set it apart.

**Typography**
- Consistent with WADS. Rail labels `xs`, second column features `sm`, scoped header is `Heading size="md" weight="medium"` — appropriate progression.
- Issue: the `Heading size="md" weight="medium"` in the scoped header (`v0/second-column.tsx:78`) matches the un-scoped `Text size="md"` (line 48) too closely. Two paths into the same column produce near-identical type. The scoped flow has more chrome (back link + separator) but the title weight should differ.

**Iconography**
- Rail icons all WADS (`Folder`, `Home`, `Settings`, `Activity`, `Layers3`, `Skull`, `GlobeLock`, plus `ArrowRight`). Custom (`User`, `Sun`, `Memory`) are stylistically aligned — `STROKE_PROPS` matches WADS line weight. No drift.
- Active vs hover vs inactive states are visually distinct: filled chip (active) > tinted chip (hover) > nothing (inactive). Good 3-tier system.

**Spacing & rhythm**
- Vertical rhythm: rail items `gap-4` (4 px) between, `py-8` (8 px) inside. That's **8/16/8 stack** per item — fine.
- Tap targets: rail items are ~52 px tall (icon 20 + gap 4 + label ~14 + py 8×2 = ~52). Above 44-px minimum. Good.
- Second column: `gap-2` between rows, `py-6` inside. That's **6/12/6 stack** = ~24-28 px row. **Below 44-px minimum** — barely. Acceptable for a dense product nav, but every row is a tap risk on a touch laptop.
- Inset for nested groups: `ml-16 pl-8 border-l` = 24-px indent + border. Reads correctly.

**WADS conformance**
- All colors via `var(--color-...)`. ✓
- All component imports are deep-pathed. ✓
- One justifiable hex (`#FF441C` brand chevron in the wordmark). ✓
- No `eslint-disable` / `@ts-ignore`. ✓
- Spacing override understood (`w-96` = 96 px, `h-48` = 48 px). ✓
- Surface gotcha: not regressed at the chrome layer; one mild concern at the hover-preview overlay (above).

**Cross-breakpoint**
- 1024: chrome too heavy, content too narrow.
- 1440: balanced.
- 3440: rail width does not scale; whitespace pools left of the icons on ultrawide.
- Light: as described.
- Dark: hierarchy improves — surface-1 vs page-bg has more contrast in dark mode, so the rail/column divisions read more confidently.

---

### v2 — icon rail with hover-expand (64 px → 192 px)

**Hierarchy & scannability**
- At rest (64 px) active product reads fast because of the `--color-bg-primary` chip on the icon. The 28-px icon column inside a 40-px row gives the active chip nice negative space — looks more confident than v0's vertical sandwich.
- When expanded, the label-with-icon row pattern is solid. **But** the active chip's right edge is unanchored: at 64-px collapsed the chip width is roughly 48 px (full row minus 8-px h-padding); at 192-px expanded the chip stretches to ~176 px. The icon stays at x=24, so on expand the icon appears to slide left while the chip blooms right. It's a *width* transition, not a *grow* — but it reads as motion in two axes. (Lines 489–509, `RailItem`.) Minor, but visible at the supported 180 ms.
- Pin button at top-right (line 405). Visually fine — small enough not to compete with nav. Concern: the pin renders only when `expanded`, so it appears + disappears with the rail width animation, slightly chained with the label fade. Reads okay.

**Density**
- At rest 64 px chrome + 256 px second column = 320 px (32 px less than v0). At 1024 px that leaves 704 px. Real, measurable canvas win.
- When expanded by hover: overlays the second column, doesn't push (`overflow: hidden` + `position: absolute` with z-index `Z_RAIL_OVERLAY`). The overlay is a **second-column-equivalent surface** sitting on top of the actual second column. Two surface-1 panels stack — only the rail's `border-r` separates them. In light mode this looks like the second column got a gradient.
- When pinned: the spacer expands too (line 304–311), so the layout shifts right. Layout shift is honest here — pinning means committing the width.

**Surface stacking**
- **The hover overlay-on-second-column is the biggest light-mode hazard.** Both panels paint `--color-bg-surface-1`. The 1-px right-border on the rail does the work, but at 1.5x DPR / Retina that border is sub-visible. Recommend bumping the rail border on the expanded state to `--color-border-primary` (slightly stronger than `--color-border-primary-light`) only when `expanded`, or adding a subtle `box-shadow: 1px 0 0 ...` so the seam reads as separation.
- Avatar circle (line 667–675) has the same `bg-light-primary on surface-1` problem as v0/v3/v4. In light mode the circle is near-invisible without the initials.

**Typography**
- `Text size="sm" weight="medium"` for expanded labels — correct.
- Tight `lineHeight="tight"` everywhere — appropriate for a nav row.
- Truncation: `truncate` on label span (line 841) → handled. Only fires at expanded width; collapsed never shows labels.

**Iconography**
- Same as v0 — all WADS or matching custom. The `Pin` / `PinOff` toggle is a nice WADS-native call (line 442).
- The avatar fallback (initials in a circle) is local, but visually aligned.

**Spacing & rhythm**
- Items `h-40` (40 px) tall + `gap-4` between → 44-px rhythm. **At minimum tap-target threshold.** Good for desktop, marginal for hybrid touch.
- Icon column fixed at 28 px wide + 10-px left margin → icon visual center at x=24. Same x in collapsed and expanded states: that's the headline interaction discipline of v2 and it pays off.

**Active state at rest**
- Per the v2 memo question 1: filled chip is the answer chosen, and it works. An accent bar (left inset stripe) was the alternative — would have read clearer at 64 px width but at the cost of being a different active-state vocabulary from the rest of the console.

**WADS conformance**
- Clean.
- One quirk: width transition uses `width` directly (line 326, `transition: width 180ms ease-out`). Animating `width` is non-cheap — at 60 fps on a slower laptop it can stutter. WADS doesn't have a tokenized motion duration, so this is a project decision. Acceptable for a prototype.

**Cross-breakpoint**
- 1024: material canvas win vs v0.
- 1440 / 3440: same — the rail doesn't scale, but at rest it's quiet enough that ultrawide whitespace doesn't read as wasted.
- Light: hover-overlay-on-second-column hazard called out above.
- Dark: cleaner because surface-1 vs page-bg has actual contrast.

---

### v3 — icons only with tooltips (64 px, no expand)

**Hierarchy & scannability**
- At rest, this is the **calmest of the four**. Eye lands on the second column's title or the canvas content first — exactly where it should land. The rail is a quiet wayfinder.
- Active product reads in <500 ms via the `--color-bg-primary` chip. Same vocabulary as v0/v2.
- But: because there are no labels at rest **and no hover-expand**, the rail's wayfinding is icon-only forever. That's fine for `Home` (universal) and probably `Settings` (cog), but `Edge`, `Discovery`, `Hypervisor`, `Testing` all share the "abstract diagram" icon family (`GlobeLock`, `Layers3`, `Skull`, `Activity`). At a glance the four products are distinguishable; named cold, only Skull = "Threat / Hypervisor" reads unambiguously. **The variant relies on tooltips to do work the icons don't fully do alone.** That's a usability tax masquerading as elegance.
- This is a real risk: a first-time user hovering each icon for 300 ms (`TOOLTIP_OPEN_DELAY_MS`, line 38) just to learn product names is a 1.5-second discovery cost across the four products. v2 buys that back via hover-expand for free.

**Density**
- 64 px rail + 256 px second column = 320 px chrome. Identical to v2 at rest. Same canvas math.
- Visually denser than v2 because there's no breathing — the second column does all the typographic work.

**Surface stacking**
- Rail: surface-1 + bg-light-primary on hover. Correct, no overlay hazards because there's no expand.
- Tooltip: uses `--color-component-tooltip-bg` + `--color-text-primary-alt-fixed` (`v3/rail.tsx:204`). **This is the cleanest surface decision in any of the four variants.** The tooltip is a different surface family entirely and the contrast holds in both modes.
- Avatar issue: same `bg-light-primary on surface-1` near-invisibility (line 365).

**Typography**
- Tooltip text: `Text size="xs" weight="medium"` — correct WADS pattern.
- Otherwise no nav typography at rest (icons only).

**Iconography**
- The variant lives or dies on icon literacy. Today's manifest icons (`globe-lock`, `layers-3`, `skull`, `activity`) are not specific enough to be self-evident. **The visual variant is correct; the manifest's icon choices are the bottleneck.**
- Active/inactive hover states distinct via the same chip pattern.

**Spacing & rhythm**
- `h-40` items, `gap-4` between → 44-px rhythm. Same as v2. Good.
- Items `w-full` and `justify-center` → icon centered horizontally in the 64-px column. Reads correctly.

**WADS conformance**
- Clean.
- The local `RailTooltip` (lines 161–215) is justified by the WADS `Tooltip` + `DropdownMenu` `asChild` nesting bug (memory: `project_wads_tooltip_dropdown_gotcha`). It mirrors WADS tooltip styling via tokens. Correct workaround.

**Cross-breakpoint**
- 1024: best canvas allocation of the four.
- 1440 / 3440: same — rail stays 64 px, second column stays 256 px, content takes the rest.
- Light: cleanest of the four. Tooltip's strong contrast does the heavy lifting.
- Dark: similar.

---

### v4 — pop-out menus + ⌘B (collapsed 64 px ↔ expanded 256 px)

**Hierarchy & scannability**
- Collapsed mode looks identical to v3 at rest (same 64-px rail, same icon vocabulary). All the v3 hierarchy notes apply.
- Hover triggers `SectionHoverMenu` (lines 488–511): a **distinct visual surface** — rounded `surface-1` card with `border-primary` (not `border-primary-light`) and `shadow-lg`, 240–320-px width, 8-px gutter. Reads correctly as a transient menu, not a sibling panel. Better than v0's hover-preview overlay treatment.
- Expanded mode is a 256-px sidebar with per-product capped sections (`SectionHeader` + tree). The cap reads as the wayfinding signal. **This is the clearest hierarchy of the four variants.**

**Density**
- Collapsed: 64 px rail + (conditional) 256 px second column = 64 or 320 px chrome. The second column appears only when (a) inside `/settings/*` or (b) drilled into a scope (memory: `project_v4_second_column_delegation`). For top-level product pages, only 64 px of chrome — most canvas of any variant.
- Expanded: 256 px rail (subsumes the second column's job for unscoped product pages). Net chrome = 256 px on top-level product, 256 + 256 = 512 px on a drilled scope. **The drilled-scope state is the densest chrome of any variant** — by design, but worth flagging.
- The expanded rail is *long* on a 1024 viewport. Ten products × (header 24 px + 4–10 features × 36 px) → easily 800–900 px tall. Scrolls inside the rail. Acceptable, but the visual stops being a "rail" and becomes a "tree."

**Surface stacking**
- **Two visual languages problem.**
  - The hover pop-out menu uses: `surface-1` + `border-primary` (full-strength) + `shadow-lg`.
  - The expanded rail uses: `surface-1` + `border-primary-light` (no shadow).
  - These are the **same content** (a list of product sections) rendered in two materially different surfaces depending on whether the rail is collapsed-with-hover or expanded. That's a consistency tax. Pick one: either the pop-out should also be borderless / shadowless (matching the inline tree), or the expanded tree should adopt the bordered/shadowed card vocabulary on its own panel.
- **The hover pop-out at left=full + ml-8 right of a 64-px rail will collide with the breadcrumb / canvas content** at narrow widths because there's no viewport-aware repositioning. At 1024 the menu max-width is 320 → it fits, but it still overlays content rather than pushing.
- Drilled-scope second column: same hazard as v0's hover-preview overlay if both ever stack. Today the shell hides the hover menu for the active product (line 457: `shellCtx={active ? shellCtx : undefined}`), but the menu **still renders** for the active product's top-level items — so on a drilled `/edge/data-planes/dp-eu-west-1/...` page, hovering the Edge icon still pops a menu that overlays the second column. Two surface-1 panels with different borders abutting.

**Typography**
- Collapsed: same as v3.
- Pop-out menu: `Text size="xs" weight="bold"` for the product cap, `Text size="sm" weight="medium"` for items. Correct progression.
- Expanded rail: `Text size="xs" weight="medium" color="secondary"` uppercase for product caps (line 141); `Text size="sm" weight="medium"` for features (line 380). Strong, restrained, Cloudflare-ish.
- The toggle row at the bottom (line 615–642) shows "⌘B" in `Text size="xs"` after the collapse label. **No keycap chrome, no border, just plain text.** Inconsistent with how command palettes show shortcuts elsewhere in the console.

**Iconography**
- Collapsed: same icon set as v3.
- Pop-out menu items: per-feature icons via `resolveIcon(item.icon)`. Many features have no icon → 16-px placeholder slot (line 603). Mixed pop-out menus end up with some rows having icons and some not, which reads as ragged.
- Expanded rail: depth-0 features get icons, depth-1+ don't (line 357). Intentional and works.

**Spacing & rhythm**
- Collapsed items `h-40`. Same as v3.
- Expanded TopLink (Home, Recent, utilities) `h-32`. Tree feature rows `h-36`. **Inconsistent vertical rhythm in the expanded rail.** Home is 32, Edge → "API Discovery" is 36, Settings (utility) is 32. The eye notices the jolt. Pick one: either all 32 or all 36 in the expanded tree.
- Pop-out menu rows `h-32` with depth-1 indent of 28 px (line 588). Reasonable.

**WADS conformance**
- Clean. Deep imports throughout. Tokens throughout.
- The `min/maxWidth: 240/320` magic numbers on the pop-out (lines 499–500) are not tokenized — but WADS doesn't ship sidebar dimension tokens, so this is fine to keep local.
- Two unused-variable suppressions via `void` (`v4/rail.tsx:486, 674`) instead of underscore-prefix or destructure. Style-only nit.

**Cross-breakpoint**
- 1024: collapsed mode is the canvas-leader of all four variants. Expanded mode is fine. Drilled-scope expanded mode (256 + 256 = 512 px chrome) is **51% of the viewport** — too heavy. The shell-delegation rule should consider auto-collapsing the rail when entering a drilled scope.
- 1440: all states comfortable.
- 3440: expanded rail at 256 px is a thin column on ultrawide; the per-product caps look airy. Could grow to 280–320 px without harm but isn't critical.
- Light: pop-out vs expanded surface mismatch is most visible here.
- Dark: same mismatch but less painful (shadows read more honestly in dark mode).

---

## 3. Comparison matrix

Grades on a 5-point scale (1 = poor, 5 = excellent) against each axis. One-line rationale per cell.

| Axis | v0 | v2 | v3 | v4 |
|---|---|---|---|---|
| **Hierarchy at rest** | 3 — rail-loud | 4 — quiet rail, clear active chip | 5 — calmest, least noise | 4 — same as v3 collapsed |
| **Hierarchy when working** | 3 — second column quiet vs rail | 4 — overlay confident | 4 — second column carries it | 5 — expanded mode best of four |
| **Density / canvas math (1024 px)** | 2 — 352 px chrome | 4 — 320 px | 4 — 320 px | 5 collapsed / 2 drilled-expanded |
| **Surface stacking (light mode)** | 3 — overlay weak | 2 — hover-overlay-on-column hazard | 4 — cleanest, no overlay | 3 — two surface languages |
| **Surface stacking (dark mode)** | 4 | 4 | 4 | 4 |
| **Typography rhythm** | 4 — consistent | 4 | 4 | 3 — h-32/h-36 inconsistency in expanded |
| **Iconography clarity** | 4 — labels rescue ambiguous icons | 4 — labels on hover/pin | 2 — icon-only is too lean for current manifest icons | 3 — same risk as v3 collapsed; mixed icons-some/none in pop-out |
| **Active/hover/inactive distinction** | 4 | 4 | 4 | 4 |
| **Tap targets** | 3 — second-column rows ~28 px | 4 — h-40 rail, second-column same | 4 | 4 collapsed / 3 expanded h-32 too narrow |
| **Cross-variant consistency (vs v0 baseline)** | n/a | 4 | 4 | 3 — pop-out vs inline tree mismatch |
| **Brand/wordmark consistency** | 4 — top-bar wordmark identical across all | 4 | 4 | 4 |
| **WADS conformance (imports/tokens)** | 5 | 5 | 5 | 5 |
| **WADS gotcha regression** | None | None | None | None |

---

## 4. Top 5 visual / WADS issues across the set

1. **Avatar circle near-invisible in light mode (v2/v3/v4).**
   In `v2/rail.tsx:667–675`, `v3/rail.tsx:362–372`, `v4/rail.tsx:765–775`, `v4/expanded-rail.tsx:567–577`: the user-avatar fallback is a `28×28` circle filled with `--color-bg-light-primary` placed on top of `--color-bg-surface-1`. In light mode both tokens are very near white. The initials carry the affordance, the circle does not. Recommend either (a) drop the circle background and let the initials sit on the rail's hover state, or (b) use `--color-bg-secondary` / a brand-tinted background so the circle reads.

2. **v0 hover-preview surface-stack-on-light hazard (`v0/hover-preview.tsx:29`).**
   A 256-px overlay panel paints `surface-1` against the second column's `surface-1`. Only `border-color: var(--color-border-primary)` and `shadow-lg` separate them. In light mode the seam dissolves. Recommend either a stronger explicit background (a slightly tinted variant) for the overlay, or replace the same-color sibling with a clearly elevated card (rounded, full-shadow, slight inset).

3. **v2 hover-expand overlay-on-second-column light-mode seam.**
   The 192-px expanded rail floats over the 256-px second column with `overflow: hidden` and `border-r`. Two surface-1 panels meet on a 1-px hairline. At 1.5x/2x DPR the hairline is sub-visible. Recommend a small box-shadow (`1px 0 0 var(--color-border-primary)` or similar) on the rail when expanded — tokenized, not a hardcoded shadow.

4. **v4's two visual languages for the same content.**
   The same product's top-level features render with two different surface treatments depending on rail state: shadowed/bordered card (collapsed + hover) vs flat inline tree (expanded). The expanded rail treats the user as already committed; the pop-out treats the user as previewing. That's a defensible interaction distinction, but the visual **vocabulary** should rhyme. Either pop-out adopts the inline-tree surface (no shadow, light border) or both adopt the same elevation scale.

5. **v4 expanded-rail row-height drift (`h-32` Top/Recent/Utility vs `h-36` features).**
   Within the 256-px panel, the rhythm jolts at the section boundary. Pick a single row height — `h-36` reads better at default WADS line-heights for `Text size="sm"` — and apply it consistently. The 4-px difference is small but visible because rows are stacked with `gap-1`/`gap-2` and the offset compounds.

**Honorable mentions (not top 5):**
- v0 second-column row height ~28 px is sub-44-px tap target.
- v3's reliance on tooltip discovery is a literacy tax — not a WADS issue, but a visual one (icon set does not carry the labels' work).
- v4 pop-out menu icons are inconsistent (some features have icons, some don't) → ragged left edge.
- v4 toggle button shows "⌘B" as plain `Text size="xs"` — give it a keycap chrome consistent with the global search palette.

---

## 5. Visual-only recommendation

**For the prototype's discussion phase:** ship v4 (collapsed-by-default) as the visual front-runner with two fixes:

1. **Reconcile v4's two visual languages** — make the pop-out menu surface match the expanded-rail tree surface (drop the shadow, use `border-primary-light`, drop the rounded-card vibe). The pop-out becomes "an inline tree that happens to float" rather than "a different kind of surface."
2. **Normalize row heights to `h-36` across the expanded rail.**

If we have to ship one variant unmodified today, **v3** is the calmest visual and the safest light-mode performer. Its weakness is icon literacy — that's a manifest-content fix, not a chrome fix.

**Do not ship v0 unmodified.** The 352-px chrome at 1024 px is too heavy for a security console, and the rail-vs-second-column visual hierarchy fights itself.

**v2 is the most ambitious interaction** but the hover-expand-overlay-on-second-column is a real light-mode hazard. If we keep v2, the rail's right edge needs explicit elevation when expanded.

**Cross-variant fixes that should land regardless:**
- Avatar circle background swap (issue #1) — applies to v2/v3/v4 today.
- v0 hover-preview overlay surface fix — applies wherever hover-preview is used.
- Expanded `h-36` normalization — applies to v4 today, applies to any future variant that gains an expanded mode.

---

**Reviewed files (paths absolute):**
- `/Users/artem/Documents/work-projects/global-navigation-prototype/src/nav/variants/v0/rail.tsx`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/src/nav/variants/v0/sidebar-tree.tsx`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/src/nav/variants/v0/second-column.tsx`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/src/nav/variants/v0/top-bar.tsx`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/src/nav/variants/v0/hover-preview.tsx`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/src/nav/variants/v0/breadcrumb.tsx`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/src/nav/variants/v0/wordmark.tsx`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/src/nav/variants/v2/rail.tsx`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/src/nav/variants/v2/shell.tsx`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/src/nav/variants/v3/rail.tsx`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/src/nav/variants/v3/shell.tsx`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/src/nav/variants/v4/rail.tsx`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/src/nav/variants/v4/expanded-rail.tsx`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/src/nav/variants/v4/expand-state.ts`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/src/nav/variants/v4/shell.tsx`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/src/nav/manifest/custom-icons.tsx`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/src/nav/manifest/icons.ts`
