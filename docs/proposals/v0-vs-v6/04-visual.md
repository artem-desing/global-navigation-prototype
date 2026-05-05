# Visual review — v0 vs v6

**Lane:** Visual hierarchy, density, surface stacking, WADS conformance.
**Excluded:** IA, state machines, routing, microcopy.
**Code anchor:** HEAD on `main` (d11f4c3).
**Reviewed at:** 1024 / 1280 / 1440 px · light + dark.
**Note on the brief:** the prompt described v0's rail as 192 px — in code it is `w-96` (96 px in WADS' 1px spacing). All numbers below use the actual code, not the brief.

---

## Hierarchy at rest

**v0:** Eye lands on the **rail's vertical icon-over-label sandwich** first (`rail.tsx:622`, `flex-col items-center` + `gap-4`, `py-8`, with `Text size="xs" align="center"` underneath). There are nine of these sandwiches stacked top-to-bottom — Home, Recent, four products, Settings, an external link, the avatar — so the rail is the loudest object on the page. Brand wordmark (top bar) > rail item stack > second-column title. The second-column title (`Text size="md" weight="medium"`) is quieter than the rail's six aligned active-state-eligible chips. The hierarchy lands rail-first, second-column-second, work-third — which is the wrong order for a console where the work is the work and the rail is wayfinding chrome. Verdict at rest: **rail-loud**.

**v6:** Default in code is `collapsed` (`readMode` returns `'collapsed'` at `rail.tsx:86`); the project default is `hover` (per memory `project_v6_user_controlled_rail`). Either way the resting visual is a single 64-px column of icons with a horizontal-row layout (`flex h-40 items-center`, icon-column-then-label slot — label hidden behind opacity 0). The eye lands on the second column's title or the canvas content first. Brand wordmark > second-column title > rail. The rail recedes. Verdict at rest: **calm**, in the same way v3 was calm in the prior stress test, but now with an explicit user dial.

---

## Density

| Surface | v0 | v6 expanded | v6 collapsed | v6 hover (rest / open) |
|---|---|---|---|---|
| Rail width | 96 px | 192 px | 64 px | 64 px (spacer) / 192 px (overlay) |
| Chrome at 1024 px (rail + second column 256) | 352 px (34% of viewport) | 448 px (44%) | 320 px (31%) | 320 px rest / 448 px on hover |
| Chrome at 1280 px | 352 px (28%) | 448 px (35%) | 320 px (25%) | 320 px / 448 px |
| Chrome at 1440 px | 352 px (24%) | 448 px (31%) | 320 px (22%) | 320 px / 448 px |

v6 hover mode wins density at rest because the spacer is `committedWidth` (64 px) and the expanded 192 px is *overlay*, not push (`rail.tsx:404–408, 418–430`). The workspace never reflows. v0 sits at a fixed 352 px of chrome the user cannot trade away. v6 expanded mode is heavier than v0 at rest, but is opt-in.

---

## Surface stacking concerns

**v0:** Two surface concerns, both inherited from the prior visual lane.
- `HoverPreview` (`hover-preview.tsx:35–39`) lays a 256-px `surface-1` panel against the second column's `surface-1`. Separators are `border-color: var(--color-border-primary)` and `shadow-lg`. In light mode the seam dissolves into one continuous white slab. The shadow does the work, but reads as "page is scrolling" rather than "transient menu."
- The avatar circle in `UtilityDropdownRailItem` does NOT regress this in v0 — v0 renders the avatar without a `bg-light-primary` background fill (line 540, plain `<span>` with only `color`), so the prior-lane "avatar near-invisible" finding does not apply here.

**v6:** Adds **one new** stacking concern v0 doesn't have.
- The hover-mode rail is `position: absolute` over the workspace area (`rail.tsx:418`), with its own `surface-1` background and a `border-r`. When it expands, a 192-px `surface-1` panel floats over whatever surface the page renders below. If the page renders `--color-bg-page-bg` (the slate page background, per `shell.tsx:24`) the seam is fine — page-bg is darker than surface-1 and the rail border stays visible. But on a route whose `<main>` ships its own `surface-1` card content (settings forms, tables in cards), the rail-overlay-on-surface-1 is the same hazard v2 had: two near-white panels separated by a hairline border.
- The avatar in v6 *does* regress: line 730–741 paints a 28-px circle with `--color-bg-light-primary` on top of `--color-bg-surface-1`. This is the exact gotcha called out in the prior visual lane (top issue #1), now back. In light mode the circle is barely visible; the initials carry the affordance alone.
- **Mitigation already in place:** the rail's inline `border-r` plus a non-zero `Z_RAIL_OVERLAY` plus `overflow: hidden` during the width transition keeps the seam crisp on the page-bg side. The hazard is real only when the workspace renders its own light-mode card.

---

## Active state legibility

**v0:** Active state is the full-row vertical chip — `--color-bg-primary` background + `--color-text-primary` foreground on the centered icon-and-label sandwich (`rail.tsx:624–630`). Chip is ~80 px wide (96 px rail minus 8 px h-padding ×2) × ~52 px tall. Reads in <500 ms. The label is part of the chip, so the active state carries both visual signal and verbal confirmation.

**v6:** Mode-dependent.
- Collapsed (`tooltipsEnabled = true`, line 400, 559–561): chip is `h-40 w-full justify-center`, so the active fill is centered icon on a ~48-px-wide chip. Tight, disciplined.
- Expanded / hover-open: chip becomes `h-40` icon-column-plus-label-slot row (line 561, 578–587). Per memory `project_v6_user_controlled_rail`, Artem dismissed the "active pill width in expanded mode looks unanchored" concern — noting and not reopening. The chip is fine.
- The rhythm change between modes is the visible cost: switching from collapsed to expanded shifts the active chip's center-of-gravity from "centered icon" to "icon-then-label." The eye notices because the chip footprint changes shape, not just size. Acceptable as the dial's purpose.

---

## Motion stability

**v0:** Static rail (no width animation) plus a hover-preview flyout that mounts a 256-px overlay anchored at `left-96 top-48 fixed z-10`. The flyout is a **sibling product's tree** — different content from the active second column. Two distinct trees on screen at once when hover-preview is open. Calm in the sense that the rail itself doesn't move; busy in the sense that hovering a sibling product creates a new sidebar-shaped surface to read.

**v6:** Hover mode animates the rail's own `width` from 64 → 192 over 180 ms (`rail.tsx:49, 386–388`), with a label opacity fade chained at 60 ms offset (line 1122–1126). The workspace never reflows because the spacer is committed width (already noted). What moves is only the rail; what changes is only labels appearing. **No second tree, no sibling content, no surface collision with the second column.** From a visual-stability standpoint this is calmer than v0's hover-preview — the user gets *one moving object* (the rail itself), not a new floating panel that must be visually parsed as a different tree. v0's hover-preview is more *informative* (you see sibling content); v6's hover-mode is more *stable* (you see only your own labels). For "calm chrome while you work," v6 wins.

The width animation cost: animating `width` is non-cheap and can stutter on slow laptops at 60 fps. WADS does not tokenize motion duration, so 180 ms is a project decision. Acceptable for a prototype; flag for production.

---

## WADS conformance audit

**v0: PASS.** All colors via `var(--color-...)`. All component imports deep-pathed (Text, DropdownMenu*, icons from `/icons`). Spacing uses the WADS 1-px override consistently (`w-96`, `gap-4`, `py-8`, `h-36` etc.). Custom icons (`HomeIcon`, `HistoryIcon`) are WADS-barreled. No `eslint-disable`, no `@ts-ignore`, no third-party icon libs. One justified hex (`#FF441C` brand chevron) lives in the wordmark, not the rail.

**v6: PASS, with one note.** Same import discipline. Same token discipline. Adds the `PanelLeftDashed` custom icon via `src/nav/manifest/custom-icons.tsx` — the established workaround per `project_wads_icon_gaps` — and inherits the existing custom-icons `STROKE_PROPS` (stroke-width 2, round caps), so it visually matches WADS. The new icon's stroke and corner radius rhyme with WADS' lucide-derived line family. The `Z_RAIL_OVERLAY` constant is local, not WADS-tokenized — fine because WADS doesn't ship z-tokens. The avatar regression noted under surface stacking is the only real-world WADS-gotcha hit (`bg-light-primary on surface-1` in light mode).

---

## Lane verdict

**v6 is the calmer chrome at rest.** v0 puts a louder rail in front of a quieter second column and that ordering fights itself — six vertical icon-and-label sandwiches in a 96-px column will always pull the eye before a single-line column header in `Text size="md"`. v6's collapsed-mode rail is almost invisible at rest, and its hover-mode expansion is more visually stable than v0's hover-preview because v6 moves only one object (the rail itself) while v0 mounts a second tree-shaped surface that competes with the active second column. The tradeoff v6 makes is real — losing the cross-product peek is a discoverability cost — but on the visual axis alone, v6 is the cleaner story: the rail recedes, the work expands, and the user has a dial. The two visual concessions v6 should fix before shipping are (1) the avatar-on-surface-1 regression (drop the `bg-light-primary` circle, let initials sit on the rail's hover state), and (2) tokenize a faint elevation on the right edge of the rail when in hover-overlay mode, so the seam against any future light-mode card content reads as separation rather than continuation. With those fixes, v6 is the calmest rail in the prototype to date — quieter than v3 because it carries v3's rest state plus an explicit power-user dial without a literacy tax.

---

**Reviewed files (absolute paths):**
- `/Users/artem/Documents/work-projects/global-navigation-prototype/src/nav/variants/v0/rail.tsx`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/src/nav/variants/v0/shell.tsx`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/src/nav/variants/v0/hover-preview.tsx`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/src/nav/variants/v6/rail.tsx`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/src/nav/variants/v6/shell.tsx`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/src/nav/manifest/custom-icons.tsx`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/docs/proposals/stress-test/04-visual.md` (prior lane)
