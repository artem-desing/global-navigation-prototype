# Adversarial review: v2 (icon-rail + hover-expand) vs v0 (icon-with-label rail)

## Steel-man

v0's 96px rail spends a full column on stacked icon+label tiles whose labels are 12px non.geist that nobody actually reads after session two — the icon is doing the work. v2 honestly admits that, narrows to 64px, recovers 32px of canvas across every product screen, and keeps the label one 80ms gesture or one Tab away. It is v0 minus a redundant text decoration, not v0 minus wayfinding.

## Attacks

1. **The premise misframes v0.** v0 is *not* a label-rail being compared to an icon-rail. v0 is already icon-first with a 12px caption; v2 deletes the caption and hides full labels behind hover. The "buy back canvas" win is 32px (96→64) — roughly 2.5% of a 1280px viewport. That is not the dataplane-rescuing margin the hypothesis implies. Show me a content surface where 32px is the difference.

2. **Recognition gap with no tooltip.** Spec section 6 explicitly defers rest-state tooltips to "designer call later" and the captions go away. A first-session SOC analyst now sees ten unlabeled glyphs — `check-braces`, `shield-lightning`, `admin-alt-tools` — and must hover-and-wait-80ms or Tab through to learn the mapping. v0's caption is the cheapest possible discoverability fix and v2 deletes it without a replacement.

3. **Pinned-near-100% kills the hypothesis.** Section 5 names the failure mode: "pinning becomes the dominant behavior — v0 is the honest answer." There is no instrumentation in the prototype, no telemetry plan, no A/B rig. With pin persisted in `localStorage` and zero cost to click it once, the rational user pins on first frustration and never unpins. We will ship v2, watch nobody complain, and have no idea we built v0-with-extra-steps. What is the measurement plan?

4. **Layered chrome under a scope-chip menu.** Spec edge-case acknowledges the rail overlay must coexist with the breadcrumb scope-swap popover and Radix portal stacking. v0 has no overlay — the rail is part of the layout. v2 adds a transient z-index'd surface on top of an already-busy canvas (product sidebar, second column drill, AI push panel, scope chips, ⌘K). That is four overlapping floating layers with no z-index contract documented. First MFE that ships its own portal will collide.

5. **Intercom is not Wallarm.** The PM frame cites Intercom and Supabase. Intercom users live in Inbox 80% of the day — single-product dwell. Wallarm Console is multi-product hop (Events → API Security → Testing → Settings). The pattern Intercom validated is "icon-rail for users who rarely switch products"; Wallarm's whole premise is that users *do* switch. Konnect (per `project_kong_konnect_ia`) keeps labels visible. The reference set is selecting for the wrong dwell pattern.

## Counter-claims

1. 32px × every pixel-hungry table view × every customer with a 1366 laptop is real money. And v0's caption being 12px is itself an admission it does not earn its space.
2. Pin solves first-session learnability — pin once, labels live, you are functionally on v0 with the option to unpin later. Tooltips can land in v2.1.
3. Pin rate IS the telemetry, even at prototype scale: stakeholder testers either pin on click 1 or they do not, and the design trio will see it during testing.
4. The overlay z-index rules already exist in v0's HoverPreview (`rail.tsx:140–149`); v2 inherits the contract.
5. The hop-frequency claim is an assumption too — most users live in one product per session even on multi-product platforms. That is what the variant is built to test.

## Verdict

**Ship v2 with these specific changes:** (a) add rest-state tooltip on icon hover with a short delay (300ms), so first-session discoverability does not depend on the user knowing to trigger the full overlay; (b) instrument pin-rate and time-to-first-pin as the one explicit success/abandon metric, even if it is just a `console.log` counter in prototype — without it the comparison is vibes; (c) document the z-index contract for rail overlay vs scope-swap popover vs AI push panel before the third floating surface is added.
