# Variant 2 — Icon rail with hover-expand overlay

**Status:** scope memo, prototype-grade. Frontend-buildable, not pixel-spec.
**Owner:** PM (this memo) · Product designer + interaction designer (next pass)
**Reference:** Intercom and Supabase product UIs — frames `160:227`, `160:423`, `160:606` in Figma `1GJb0riOtfuLA8MMqrDdCo`.

## 1. Hypothesis

A 96-px icon-only rail buys back canvas width for content-heavy product surfaces (Edge dataplanes, Topology, Test Suites) without losing wayfinding, because hover-expand and pin make the labelled rail one gesture away. v2 should feel calmer than v0 at rest and equally legible the moment a user reaches for it.

## 2. What's the same as v0

- Manifest, routes, scope drilldown logic, breadcrumb, scope-chip swap menu.
- ⌘K palette, recents store, AI assistant push panel.
- Top bar (wordmark stays the picker escape hatch), Wallarm chrome.
- Auto-select-first-child on product click (resolver behavior).
- Settings, utilities, tenant stub — untouched.

## 3. What changes

- Rail is icons-only at rest; labels hidden.
- Hovering anywhere on the rail expands it as an **overlay** above any open product sidebar (does not push canvas or sidebar).
- All product labels become visible while expanded.
- Pin-to-keep-expanded toggle on the rail; pinned state persisted in `localStorage` per variant (`nav:v:v2:rail-pinned`).
- Recent stays a dropdown trigger — hovering Recent opens the recents dropdown directly and does **not** expand the rail. Explicit carve-out from the hover-expand rule.
- Full keyboard parity: focus into the rail expands it, arrows traverse, Enter activates, Esc collapses (and unfocuses to canvas).

## 4. What we want to learn

- Does the icon rail at rest read as "less noise" or "I can't tell what these are"?
- Is hover-expand discoverable without a tooltip or first-run hint?
- Does the overlay (vs. push) feel correct when a product sidebar is already open, or does the layered chrome confuse depth?
- Do users pin within the first session, or never? Pinning behavior is the cleanest signal of which rest-state they actually want.
- Invalidation: if testers can't name two products from icons alone, or repeatedly mis-click while the overlay is up, v2 loses against v0.

## 5. Success signals

- **Pursue:** users describe v2 as "cleaner" unprompted; pin rate is bimodal (clear pinners vs. clear hoverers — both succeeding); time-to-target on cross-product navigation is no worse than v0.
- **Abandon:** icon recognition fails for non-Edge products; users complain about flicker or accidental expansion; pinning becomes the dominant behavior (means rest state is wrong and v0 is the honest answer).

## 6. Scope

**In:** icon rest state, hover-expand overlay, pin toggle, keyboard parity, Recent carve-out, per-variant localStorage.
**Out:** mobile / <1024px (desktop only); Intercom-style command bar inside the expanded rail; rail reordering or customization; tooltip on rest-state icons (designer call later); animation polish beyond "feels cheap to open, slightly stickier to close."

## 7. Open questions for the design trio

1. **Product designer:** active-product treatment at rest (icon-only) — accent bar, fill, or icon-color shift? Must read at 96-px width without a label.
2. **Product designer:** does the expanded overlay get a subtle elevation / shadow to separate it from the product sidebar underneath, or is a hairline border enough?
3. **Interaction designer:** hover-open and hover-close delays — concrete millisecond values, plus the rule for "user is moving toward the sidebar, don't collapse."
4. **Interaction designer:** what cancels an expansion in flight (mouse leaves before threshold, focus moves to canvas, ⌘K opens)?
5. **Microcopy:** pin button label and tooltip — and the aria-label for the rail's expanded vs. collapsed states.
