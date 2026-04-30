# v2 — Icon-rail visual chrome

Sibling of v0's rail. Same brand mark, breadcrumb, second column, scope chips, AI panel, top bar wordmark — only the rail itself changes. WADS tokens only; spacing utilities are 1px each (`w-64` = 64px).

## 1. Widths

- **Collapsed: 64px.** v0 rail is 96px because it carries icon + label stack; stripping the label lets us go narrower, but 64px gives a 36px hit target with `px-14` slack — 56px feels cramped against `--color-bg-surface-1` borders, 72px wastes the canvas the variant exists to recover.
- **Expanded: 240px.** "Security Testing" at non.geist 14/medium is ~118px; +24px icon column + 16px gutters + 8px right padding for the pin = 240 fits with margin and matches Konnect's expanded rail.

## 2. Transition

- **Width-grow, 180ms `ease-out`.** Container animates `width` from 64→240, labels fade in `opacity 0→1` over the last 120ms. Slide-in panel breaks the "icon column doesn't move" promise users feel from Intercom; width-grow keeps icons at the same x.

## 3. Resting (collapsed) appearance

- Container `w-64`, full height, `bg-[var(--color-bg-surface-1)]`, `border-r` `--color-border-primary-light`.
- Brand mark: top, 48px square slot (`h-48`), wordmark hidden at rest, logo glyph centered.
- Item slot: `h-40`, icon 20px (WADS `size="md"`), centered. `py-10` vertical padding per item, `gap-4` between items, `mx-8` outer.
- Separator above products group: `h-[1px]` `--color-border-primary-light`, `mx-12 my-8` — same as v0.
- Bottom utilities (Help, Settings, Avatar): same icon stack, separated from products by flex spacer; avatar is the existing 28px initials circle, no label below.

## 4. Expanded appearance

- Item slot grows to full 240 - 16 = 224px wide; icon **stays at x=22** (centered in the 64px column) so it does not jump.
- Label: `Text size="sm" weight="medium"` (non.geist 13/500), color `--color-text-primary`, `ml-12` from icon, single line, `truncate`.
- Hover (non-active): `bg-[var(--color-bg-light-primary)]`, `rounded-md`, full-row. Never `surface-2/3` — paints invisibly on `surface-1`.

## 5. Active state

- **Filled background, full row.** `bg-[var(--color-bg-primary)]`, `text-[var(--color-text-primary)]`, `rounded-md`. Reads at 64px (icon sits in a 40px filled pill) and at 240px (full row fill). No left accent stripe — it would conflict with the section drill indicator inside the second column.

## 6. Pin affordance

- Lives top-right of the expanded rail, in the brand-mark row, `top-12 right-12`. Hidden at rest (no room, and rest-state is the unpinned read).
- Icon: `Pin` (unpinned) / `PinOff` (pinned) from `@wallarm-org/design-system/icons` — both ship and are barrel-exported in 0.29.2. No custom SVG needed.
- Button: 28px square, ghost, `--color-text-secondary` default, `--color-text-primary` on hover, `--color-bg-light-primary` background on hover. Pinned state: filled icon + `--color-bg-light-primary` resting fill so the toggled state is unambiguous.
- Tooltip and aria-label are microcopy's call.

## 7. Dark / light parity

- Surface: `--color-bg-surface-1` (rail) + `--color-bg-light-primary` (hover) — confirmed safe; the gotcha bites only when stacking surface-1 on surface-1.
- Active: `--color-bg-primary` resolves correctly in both themes.
- Border: `--color-border-primary-light`. Dark mode inherits. No explicit dark overrides needed.

## 8. Stays exactly v0 — do not fork

1. Top bar: wordmark, scope chips, ⌘K, AI assistant trigger, tenant picker.
2. Breadcrumb component and truncation rules.
3. Second column (product sidebar tree, drill rules, gated-drill freeze).
4. AI assistant push panel.
5. Recent dropdown contents and behavior — only the trigger location changes (still on the rail, but it does **not** expand the rail on hover; carve-out per PM frame).

---

**Build vs WADS:** `Pin`/`PinOff`/`Text`/`DropdownMenu*` from WADS per-component paths. Container, hover/active styling, expand transition, and pin button are local to `src/nav/variants/v2/rail.tsx`.
