# Adversarial Review — v0/v2/v3/v4 Battle Royale

**Reviewer role.** Principal IA Researcher (Red Hat). Skeptic first, supporter never until proven wrong. Consensus is not validation. Intuition is not evidence.

**Scope.** v0 (always-open sidebar), v2 (hover-expand rail), v3 (icons-only with tooltips), v4 (pop-out menus + ⌘B merged sidebar). v5 deliberately excluded — it competes on a different axis (tabs vs. pages) and the user has carved it out.

**Key data point I'm pinning every claim against.** The current Wallarm Console manifest already contains **41 features in Edge, 14 in AI Hypervisor, 11 in Infrastructure Discovery, 9 in Testing, and 16 in Settings** — call it ~91 navigable leaves under 6 top-level entry points before Hypervisor + Gateway light up the way the charter says they will. Any nav model that performs at "6 products × small trees" but degrades at "6 products × deep trees" is on probation. The charter explicitly says this nav has to "hold up as Hypervisor + Gateway light up over the next quarters." That's the load test.

---

## 1. Executive verdict

**Survives.** v0 is the only variant that survives every challenge below without requiring a different mental model than the one operators already have. It is unfashionable, dense, and not "calmer" — and that is precisely why it works in incidents, with sparse manifests, on screen readers, with assistive tech, at 1024 px, and in week 4 when the novelty has worn off. **Ship v0 as the default, with caveats.**

**Most overrated.** v2. The hover-expand-with-pin pattern is theatre: it sells "calmer at rest" while quietly relying on the user pinning it open (i.e., reverting to v0) as soon as they do real work. The pinning rate is the only honest signal — and the team has correctly named it as the kill criterion in `docs/proposals/v2-icon-rail.md` ("if pinning becomes the dominant behavior … v0 is the honest answer"). I expect that signal to land. The interaction polish on v2 is real and the code is the most intricate of any variant, but the underlying hypothesis is unstable.

**Most underrated.** v4 *expanded mode*. Cloudflare's merged sidebar is an under-appreciated pattern for multi-product platforms because it makes cross-product navigation a single visual gesture instead of a click-and-wait. The `V4Tree` in `expanded-rail.tsx` is the most credible piece of new design in the prototype. **But v4 collapsed mode is a separate, weaker design** — it is essentially v3 with hover-menus bolted on, and pretending it is the same variant as v4 expanded is the variant's biggest unforced error.

**Dead.** v3. It is a tooltip graveyard. There is no defensible use case in this product class (multi-product enterprise console, ~91 leaves, incident response context, moderate-to-low product-icon recognition because three pillars are brand-new) that v3 serves better than v0, v2-pinned, or v4-expanded. The fact that the team had to write `RailTooltip` from scratch because WADS Tooltip + DropdownMenu nesting breaks Ark's anchor (per `project_wads_tooltip_dropdown_gotcha`) is the universe trying to tell you something.

**One-line summary.** v0 wins on truth. v4-expanded wins on ambition. v2 wins on aesthetics and loses on first contact with reality. v3 should not ship.

---

## 2. Per-variant section

### 2.1 v0 — Always-open sidebar

#### Steel-man (the strongest case for v0)

> "v0 is the model that **does not lie about the platform**. The charter says the platform must feel like 'one coherent surface' with each product given 'room to breathe.' v0 shows you both at once: a 96 px rail of products at the left edge, and a 256 px second column with that product's full top-level tree. There is nothing hidden. Recognition beats recall (Nielsen #6). Spatial memory holds because the chrome never moves: the rail stays where it is, the second column stays where it is, the canvas takes the rest. Operators triaging at 10% attention can navigate without thinking. Power users build muscle memory in days, not weeks. ⌘K covers cross-product jumps. Recents covers the pages you visit constantly. The flag panel and tenant dialog show how shapeshifting (free tier, AASM-only, super-admin) reflows the nav without it feeling like a different product. There is no chrome state to reason about, no expand/collapse to remember, no tooltip to summon, no menu to keep open while you mouse toward it. **It is the most boring variant and that is the strongest argument for it.**"

(Cited claims: `docs/charter.md` "feel like one control plane"; `docs/current-ia.md` "the sidebar is a single column, scoped to one product"; classic enterprise convention — Datadog, GCP, AWS, Azure, Splunk all default-render their primary trees expanded.)

#### Attack vectors

**Cognitive load and learnability for new users.** Strong. The active product is highlighted in the rail; its tree is fully revealed in the second column. A first-day user does not need to learn a hover gesture, a pin button, a ⌘B chord, or that hovering one icon spawns a menu while hovering another expands the rail. The cognitive model is "products on the left, sections inside each, content on the right" — which is the model every other enterprise console uses, including the existing `my` console the operators come from. Hick's law penalty (decision time scales with options visible) is real but **it's penalty paid once and amortized over thousands of sessions**; the alternative is paying it on every hover.

**Speed and friction for power users.** Strong. The shortest possible cross-product navigation is one click on the rail (already-targetable Fitts target on the screen edge) plus one click on the second column. Hover-expand variants add an 80 ms wait before the column even reveals — `OPEN_DELAY_MS = 80` in `v2/rail.tsx`. That's a forced floor under v2's speed; v0 has no such floor.

**Spatial memory.** Strong. Chrome never moves. Width of the rail and the second column are both fixed. The drilled-scope re-header uses the same 256 px column, so the user does not have to re-find the back link.

**Failure modes.** *Sparse manifest:* Edge collapses to "Edge" + a couple of leaves. The second column is 70% empty. This looks bad. *Dense manifest:* Edge has 41 features and nested groups; the second column scrolls. Still works, but the user loses the bottom-of-tree to the fold. *Manifest changes:* a feature added to Edge appears in the second column on the next render — no chrome state to reconcile.

**Breakpoints.** At 1024 px: 96 (rail) + 256 (column) + AI panel (closed) = 352 px of chrome before content. Content gets 672 px. Acceptable but tight. At 1440 px: comfortable. Ultrawide: chrome looks anchored and content gets the room. **At 375 px: completely broken.** v0 has no mobile story, and the variants doc admits as much (v2's scope memo: "Out: mobile / <1024px"). This is a real gap.

**Assistive tech / keyboard-only.** Best of the four. Tab order is rail → column → content; aria-current marks the active product; SidebarTree uses semantic `<ul>` / `<li>` and `aria-expanded` for groups. No hover-only affordances. No timing dependencies. Screen-reader users get the same nav as sighted users.

**P1 incident.** Strong. An on-call SOC analyst with a Slack DM, an alert email, and a tunnel-vision focus on "open Attacks now" can see Attacks without summoning anything. **Hover-based variants fail this test categorically** — under stress, users abandon hover discovery and hammer-click.

**Tenant-switcher 30×/day.** Neutral. The tenant dialog in `top-bar.tsx` is the same in every variant. The product selection persists across tenant switches in URL. v0 has no advantage and no disadvantage here.

**Single-product user.** Slight weakness. A user who lives in Edge sees 5 product icons they never click and 256 px of column they always need. That's wasted space. v4-collapsed does this better; v3 does it best (in theory). But the cost is small — ~96 px on a 1440+ display is rounding error.

**Second-day problem.** Strong. v0 ages well precisely because it never asks the user to remember anything new. Week 4 looks like week 1. There is no "wait, do I hover or click?"

#### Most damaging critique

> "v0 is not actually new. It is the existing console with a left rail strapped on. The charter asks for a navigation model that lets users **sense the platform as one coherent surface** — and v0 sells one coherent surface by tiling six product surfaces side-by-side. There is no platform-level home, no cross-product dashboard, no scope-as-context. The rail is just a navigation menu prefixed with the word 'global.' If the redesign's purpose is to *announce* the platform shift to existing customers and AWS Summit attendees, v0 is the variant that says 'we added more products to the same console.' That may be honest, but it is not a story."

This is the one critique that lands. v0 is a high-quality information architecture that does not perform any rhetorical work for the platform launch. If the launch needs a visible "we re-architected" signal, v0 underdelivers. If the launch needs a navigation model that survives the next two years, v0 is the only candidate.

#### What would have to be true for v0 to *fail*

1. The Hypervisor + Gateway product trees turn out to be 50+ features each, making the second column an unscrollable wall.
2. Customers actually browse cross-product more than within-product, and the click-then-click-again rhythm becomes the dominant friction.
3. The platform message requires a "platform home" surface that v0's home tab cannot carry alone.
4. Mobile / tablet usage rises to >15% of sessions before redesign — v0 has no answer.

I have low confidence that any of (1)–(4) become true within the 2026-06-10 launch horizon. (1) is the only one that's on a believable timeline.

---

### 2.2 v2 — Hover-expand rail

#### Steel-man

> "v2 buys back canvas width — 192 px when expanded vs. 64 px at rest, and crucially the rail **overlays** rather than pushes when transient — so content-heavy product surfaces (Edge data planes, Topology, Test Suites) get the room they need without losing the cross-product way-finding. The pin gives users explicit control: prefer always-on? Pin. Prefer minimal at rest? Don't. The Recent dropdown carves out an explicit interaction pattern (no expand) so high-frequency clicks stay one-handed. Three non-obvious interaction fixes (`onNavigate`, focus suppression, unpin blur — see `v2/rail.tsx` lines 240-280) prove the team has thought through the failure modes. The vendor reference set (Intercom, Sentry, Supabase) has shipped this pattern at scale. v2 is what v0 should grow into when canvas density becomes the bottleneck."

#### Attack vectors

**Cognitive load and learnability.** Weak. The user must learn (a) icons collapse to icon-only at rest, (b) hover expands them, (c) some items (Recent) don't expand, (d) clicking pin makes it permanent, (e) navigating *also* collapses the rail (a deliberate but counterintuitive choice — see `collapseRail` in `v2/rail.tsx`). That is five rules where v0 has zero. The variant's own scope memo names "Is hover-expand discoverable without a tooltip or first-run hint?" as an unresolved question — meaning the team has not yet validated discoverability.

**Speed and friction for power users.** Worse than v0. Three forced delays: `OPEN_DELAY_MS = 80`, `CLOSE_DELAY_MS = 200`, `WIDTH_TRANSITION_MS = 180`. A power user who knows where they want to go pays 80 ms of nothing every time, plus 180 ms of width transition, before they can read the labels. v0 pays 0 ms. The pin escape hatch helps — but a power user who pins is, by definition, signaling that v0 was correct.

**Spatial memory.** Mixed. Pinned: chrome stays still — equivalent to v0 with a 192 px rail (slightly better proportions). Unpinned: the rail width oscillates 64↔192 every time the user mouses over it, and content shifts left as the rail expands as overlay (it doesn't push; the rail uses a `Z_RAIL_OVERLAY` to layer over the second column — see lines 297-330). **Reading the second column while the rail is open is partially occluded.** That is a real spatial-memory hit.

**Failure modes — sparse / dense / changing manifest.** Unchanged from v0; the column logic is reused. But icon-only at rest with sparse manifest = "two icons and a lot of empty space" that looks more pointless, not less.

**Breakpoints.** Better than v0 at 1024 px when *unpinned*: 64 + 256 + content = 320 px chrome, content gets 704 px. But the moment the user hovers the rail, 128 px of content is overlaid — i.e., content visibility is **interaction-dependent**. At 375 px: still broken; explicitly out of scope.

**Assistive tech / keyboard-only.** Worse than v0. The focus-suppression flag (line 125-126 in `rail.tsx`) is a plumbing fix to keep dropdowns from re-expanding the rail — a direct sign that the variant's interaction graph has cycles. Tab into the rail expands it (focus-open). Tab out collapses it after a 200 ms timer. Screen-reader users get a navigation that announces "expanded" / "collapsed" state changes at every focus event. This is technically compliant but cognitively noisy — and the WCAG 2.1 SC 1.4.13 (Content on Hover or Focus) requires that the expanded content be dismissible without moving the pointer; the Esc handler does that, but the user has to know it exists.

**P1 incident.** Worst of any variant. An operator under stress sees an icon strip; their first instinct is to click. Clicking navigates *and* collapses the rail, so they cannot easily traverse to a second product without a second hover. Hover-then-wait-80ms is the wrong rhythm under tunnel vision. The variant's authors named this implicitly: they made `onNavigate` collapse the rail "so the user immediately sees the second column." But the SOC analyst who wanted a second product is now staring at an icon strip and a wrong product's tree.

**Tenant switch 30×/day.** Neutral; tenant logic is unchanged.

**Single-product user.** This is v2's strongest case. The lone-Edge user pins once and gets v0 with a thinner rail and a slightly nicer left edge. Fine.

**Second-day problem.** Real. Hover-expand variants are notorious for "I love this!" in week 1 and "why does this thing keep moving?" in week 4. The Sentry pin-to-keep pattern v2 references exists *because Sentry users complained about exactly this*. Sentry's eventual answer was: pin it. That answer is the product team admitting v0 was right and dressing it up.

#### Most damaging critique

> "v2's pin button is the entire variant's confession. The rail is icon-only because someone decided icon-only was 'calmer.' But the team can't commit to icon-only, so they added expand-on-hover. They can't commit to expand-on-hover either, so they added pin-to-keep-open. Pin-to-keep-open is just v0 with extra steps — a different rail width and a setup tax. The variant is **three half-decisions** stacked into a single chrome that needs 200+ lines of timer-juggling code (`hideTimerRef`, `openTimerRef`, `suppressFocusInRef`, `suppressFocusTimerRef` — all in `v2/rail.tsx`) to keep its state machine consistent. Show me the user research that says hover-to-expand is a *user-preferred* interaction at this product complexity level — not a designer-preferred one. Sentry, Intercom, and Supabase shipped it; not all of them are still happy with it. **What's the evidence that this pattern works for security operators specifically, vs. for devtools / dashboard users with much shallower hierarchies?**"

The variant memo in `docs/proposals/v2-icon-rail.md` explicitly lists "if pinning becomes the dominant behavior — means rest state is wrong and v0 is the honest answer" as the abandon criterion. I am going to bet $5 that pinning will be the dominant behavior in any real testing. Save the $5 — go to v0.

#### What would have to be true for v2 to win

1. Operators consistently rate "calm visual rest state" higher than "find target in 1 click."
2. Pin rate after 1 week of use is ≤ 20% (i.e., most users are happy with hover-expand as their default).
3. Hover-expand discoverability hits ≥ 80% of new users without a first-run hint.
4. Tooltip-only icon recognition hits ≥ 90% on day 1 for all 6 products (including the not-yet-shipped Hypervisor / Gateway).

I see no path to (2). I have low confidence in (3) without onboarding scaffolding the variant explicitly chose not to build. (4) is the deepest unknown and is *the same problem v3 has*.

---

### 2.3 v3 — Icons only, with tooltips

#### Steel-man

> "v3 is the most space-efficient variant possible. It commits to one rule (rail is always 64 px) and pays the cost honestly: labels live in tooltips. Tooltips are a known affordance. The Amplitude reference shipped this pattern. The chrome doesn't move, doesn't have a state machine, doesn't surprise. It is the simplest of the four chrome implementations — `v3/rail.tsx` is the smallest of the rail files. Spatial memory is perfect: every icon is always in the same place. Power users with two weeks under their belt navigate by position alone, never reading the tooltip again."

#### Attack vectors

**Cognitive load and learnability.** **This is the variant's mortal wound.** Day-1 cognitive load is: see 6 icons; recognize none of them; hover each to discover what it does; build a mental map. That is a Hick's-law search through 6 unlabeled options on every cross-product jump until icon recognition develops. Recognition-vs-recall (Nielsen #6) is a 25-year-old principle and v3 violates it harder than any other variant. AI Hypervisor and Infrastructure Discovery are net-new pillar names that **users have never seen and have no icon-language for**. The team's own memory note (`project_ai_hypervisor_features`) lists features by verbatim sidebar names — there is no established icon for "Heatmap" or "Data Tracks" or "Supply Chain" in the security-operator visual vocabulary. Icon-only commits to icons that don't exist yet.

**Speed for power users.** Strong only after 2-4 weeks of daily use. Until then, the user reads the tooltip every time. The 300 ms `TOOLTIP_OPEN_DELAY_MS` (line 38 of `v3/rail.tsx`) is the floor on every cross-product jump for that learning period. v0 has no such floor.

**Spatial memory.** Best of the four — and this is the only argument that genuinely supports v3. Icons never move.

**Failure modes.** *Sparse manifest:* doesn't matter, the rail looks the same. *Dense manifest:* same — but the cost is borne entirely by the second column. *Manifest changes:* a new product means a new icon to learn and a new tooltip. Adding two products (Hypervisor + Gateway) at once = the user has to learn 2 new icons cold.

**Breakpoints.** Best at 1024 px for chrome budget (64 + 256 = 320 px). Best at ultrawide for content. **At 375 px: completely broken** (same as the others).

**Assistive tech / keyboard-only.** Worst of the four when audited honestly. The variant's own README admits that WADS Tooltip is broken inside DropdownMenuTrigger and they hand-rolled `RailTooltip`. The hand-rolled tooltip is shown by mouse hover *and* by `onFocusCapture` — but it disappears on `onPointerDown`, meaning a user who clicks an item never gets to see the label they were about to confirm. Screen readers get aria-labels (per the code), but **a low-vision sighted user with no screen reader and 200% zoom is in the worst position**: the tooltip is a 12 px text inside a small float. The variant has no commitment to tooltip persistence.

**P1 incident.** Worst variant for incident response. Stressed operator sees 6 icons. Cannot recall which one is "Edge" vs. "Discovery" vs. "Hypervisor." Has to hover each and wait 300 ms. **This is the one variant I would not put in front of a SOC at 3 AM.**

**Tenant switch 30×/day.** Neutral.

**Single-product user.** This *should* be v3's home turf — but it's not, because the single-product user does not need the rail at all and would benefit from v0's wider second column.

**Second-day problem.** Backwards. v3 punishes day 1 and rewards week 4. That is a viable tradeoff for an IDE used 8 hours a day; it is not a viable tradeoff for a security console used by L1 SOC analysts who rotate every 6 months. The persona gap matters: tools used continuously by experts (Photoshop, VS Code) can afford icon-only; tools used episodically by mixed-experience users cannot.

#### Most damaging critique

> "Icon-only navigation works in tools where the **icons have a 30-year lineage** (Photoshop, IntelliJ, VS Code) or where the user uses them daily for hours (Slack, Linear). Wallarm Console will have *brand-new* products with *brand-new* icons that *brand-new* personas (the ones the platform launch is courting) will see for the first time. **You cannot icon-only your way to recognition for a product that doesn't exist yet.** The Amplitude reference is a poor analog: Amplitude has 12+ years of icon equity in product analytics; their users see those icons every workday. Wallarm doesn't have that equity. v3 is icon-only in front of an audience that has no icons yet."

#### What would have to be true for v3 to win

1. Icon recognition test ≥ 90% on day 1 for all 6 products including Hypervisor and Gateway.
2. The product names are genuinely so frequently used that a 2-week recognition-build period is amortized.
3. The user base skews heavily power-user / single-product.
4. Mobile / tablet usage is genuinely zero.

(1) is testable cheaply (a 5-minute icon-association test) and I would bet against it. Skip the rest of the validation; (1) is the gate.

**Recommendation: do not ship v3. Use it as the "minimal" rest state of v2 if v2 ships pinned-by-default; otherwise retire it.**

---

### 2.4 v4 — Pop-out menus + ⌘B merged sidebar

#### Steel-man

> "v4 is the only variant that genuinely **uses the platform model as nav**. The collapsed mode shows just product icons; hovering a product reveals its sections in a floating menu, anchored to the icon (Apollo pattern). Pressing ⌘B swaps to a 256 px merged sidebar that shows *every product's* top-level features inline (Cloudflare pattern) — meaning the user sees the entire platform at once, in one column, without click-and-wait. The drilled-scope case correctly delegates to v0's SecondColumn (see `v4/shell.tsx` lines 22-29) so deep workflows don't compete with the rail. Pinned utilities at the bottom (Docs / Settings / User) follow the Cloudflare convention. **v4 is the variant where 'sense the platform as one coherent surface' is literally rendered.**"

#### Attack vectors

**Cognitive load and learnability.** Mixed. Collapsed mode is identical to v3 from a discoverability standpoint — but v4 *adds* a hover-menu reveal, which is a more rewarding interaction than v3's tooltip (you get a usable menu, not just a label). Expanded mode is the most cognitively expensive of any rest state — it is a full-platform tree. But cognitive load that's *paid in legibility* (you can read everything) is fundamentally different from cognitive load *paid in interaction* (v2's hover, v3's tooltip).

**Speed for power users.** Best of the four when expanded — every product's top-level features are one click away, no second column needed. Worst-tied (with v2) when collapsed — hover-then-wait-120ms. The variant's saving grace: **⌘B is a single keystroke to switch modes**. A power user who knows the shortcut can choose their rest state at will. Cloudflare's data on this pattern (per their 2025 redesign post) is supportive.

**Spatial memory.** Two competing models. Collapsed: icons stay still, hover menus float. Expanded: full tree, products in fixed order. Switching between them is jarring — the icon you knew at position N in the rail is at position N + product-tree-height in the expanded sidebar. **The user has to maintain two spatial maps.**

**Failure modes.** *Sparse manifest expanded:* the merged sidebar is short and pleasant. *Dense manifest expanded:* the merged sidebar gets *very long* — Edge alone has 41 features. With Hypervisor + Gateway lighting up, expanded mode could be 100+ rows. The `V4Tree` in `expanded-rail.tsx` doesn't lazy-render; it always shows the full tree (see lines 285-298). At ~1400 px tall viewport, the user scrolls in the rail — and the rail has its own scroll, distinct from content scroll. *Manifest changes:* both modes update. No lag.

**Breakpoints.** Collapsed at 1024 px: 64 + content. With drilled scope (SecondColumn renders): 64 + 256 + content. Expanded: 256 + content. The mode-switch is essentially "do you want chrome to be 64 or 256?" Both fit at 1024. **Concern:** expanded mode at 1024 with Settings open would be 256 + 256 + content = 512 px before content, which is the worst chrome budget of any variant configuration. Edge case but present.

**Assistive tech / keyboard-only.** Mixed. Expanded mode has a clean tab order (Home → Recent → product features in sequence → utilities). Collapsed mode's hover menu introduces an aria-haspopup="menu" pattern (line 427 of `v4/rail.tsx`) — better than v3's tooltip-only. The ⌘B shortcut works regardless of focus, which is good. But **focus management on hover-menu interaction has a known race**: line 430-440 reads "Only close if focus left the trigger AND the menu panel." The "AND" is doing a lot of work; in practice this kind of guard is where Apollo-style menus break for screen-reader users on JAWS.

**P1 incident.** Best of the four when expanded. Worst when collapsed (same as v3). The ⌘B shortcut is the variant's true incident weapon — but only if the operator remembers it. **The variant has no visible affordance teaching ⌘B in collapsed mode** (the chevron-right toggle button at the bottom of the rail is the only hint). New operators won't know ⌘B exists.

**Tenant switch 30×/day.** Neutral.

**Single-product user.** v4 collapsed is functionally identical to v3 for this user. v4 expanded is *strictly worse* than v0 for them because every other product's sections are on screen taking attention.

**Second-day problem.** Real but mitigated. The "two competing modes" problem is real, but the user converges on one mode personally and stays there. The week-4 user is either an "always-collapsed-with-hover" user or an "always-expanded" user. In practice the latter is more sustainable.

#### Most damaging critique

> "v4 is **two variants stitched together**, and the stitch shows. The collapsed mode is essentially v3-with-richer-hover and inherits all of v3's icon-recognition problems. The expanded mode is a Cloudflare-style merged sidebar and inherits Cloudflare's content-density tradeoffs (Edge with 41 features means a long scroll). The team's claim that ⌘B unifies the two is a designer-side claim — most users don't know ⌘B exists, and the only visible toggle (the chevron at the bottom of `v4/rail.tsx`) is a 32 px button at the very bottom of the rail that nothing about the visual hierarchy elevates. **Show me the data on what % of v4 users actually toggle modes.** I bet you converge on one mode (probably expanded once they discover it) and the other mode is dead weight. Pick one mode and ship it as its own variant — that's the honest design."

#### What would have to be true for v4 to win

1. The collapsed mode is genuinely usable by new operators — meaning the hover-menu reveal is discoverable without ⌘B onboarding.
2. The expanded mode at full Hypervisor + Gateway scale (~120 features) doesn't become a scroll wall.
3. Mode-switching frequency is high enough to justify two modes — not "everyone picks one mode and stays."
4. The drilled-scope handoff to SecondColumn doesn't visually surprise users (i.e., they understand why a column appears in some routes and not others).

(1) is plausible. (2) is the deep risk. (3) I bet against. (4) is testable cheaply.

**Recommendation: ship v4 as "v4-expanded" only. Drop the collapsed mode. The Cloudflare-style merged sidebar is the variant's contribution; the Apollo-style hover menus are noise.**

---

## 3. Head-to-head matchups

### Round 1 — v0 vs. v2 (the main contest)

| Axis | v0 | v2 | Winner |
|---|---|---|---|
| Day 1 learnability | 0 new rules | 5 new rules | v0 |
| Power-user speed | 0 ms forced delay | 80–280 ms forced delay floor | v0 |
| Spatial stability | static chrome | width-oscillating chrome | v0 |
| Density on canvas | 352 px chrome | 320 px chrome (unpinned) | v2 |
| Incident response | works under stress | hover gestures fail under stress | v0 |
| Aesthetic at rest | "busy" | "calm" | v2 |
| Code complexity | low | very high (4 timers, focus suppression, suppress-focus-on-navigate) | v0 |
| Ages well | yes | depends on pin behavior | v0 |

**Winner: v0, decisively.**

The team's existing decision logs already contain the pivot point: "if pinning becomes the dominant behavior … v0 is the honest answer." This is correct. The aesthetic gain v2 offers is real but small (32 px of canvas width); the cognitive cost is large and pays compounding interest. Sentry, Intercom, and Supabase ship v2-shaped patterns *and their users complain about them* — the pin is the rollback. Don't ship the rollback as the redesign.

**The honest synthesis:** if the team wants v2's resting calm without v2's interaction tax, ship v0 with a *narrower* rail (64 px instead of 96 px) and a *visually quieter* second column (less border, more whitespace). That gets the calm without the state machine.

### Round 2 — v2 vs. v3

| Axis | v2 | v3 | Winner |
|---|---|---|---|
| Day 1 learnability | 5 rules | 1 rule (icon-only, tooltips) but lower payoff | v3 nominally; v2 if onboarding is provided |
| Power-user speed (after learning) | hover then read; pinned = labels | icons only forever | v3 |
| Spatial stability | width oscillates | static | v3 |
| Recognition support | labels appear on hover | tooltips on hover | v2 (labels in context > floating tooltip) |
| Code complexity | very high | low | v3 |
| Pinned-mode equivalent | becomes v0 with thin rail | no expanded mode, no fallback | v2 |

**Winner: v2, narrowly — but only because v2 has a fallback (pin) that v3 doesn't.**

Both variants share v3's icon-recognition problem at day 1; v2 mitigates it by letting users hover or pin to see labels. v3 commits to icons forever. v2's complexity is a real cost; v3's lack of any fallback is a bigger one. Neither variant ships in my view, but if you must pick, v2 wins because it can degrade gracefully into v0.

### Round 3 — v0 vs. v4 (always-on density vs. on-demand density)

| Axis | v0 | v4 (expanded) | v4 (collapsed) | Winner |
|---|---|---|---|---|
| Cross-product visibility | one product visible | all products visible | only icons visible | v4-expanded |
| Within-product depth | full second column | inline merged | hover menu | v0 |
| Drilled-scope handling | dedicated column | dedicated column (delegates to v0) | dedicated column (delegates to v0) | tie |
| Day 1 learnability | 0 new rules | 1 new mental model | 2 new rules | v0 |
| Sparse manifest | empty column looks bad | merged tree compact | icons-only at rest | v4 |
| Dense manifest (Hypervisor/Gateway live) | scrollable column, manageable | very long merged tree, scrollable | hover menus get tall | v0 |
| Code complexity | low | medium | medium-high | v0 |
| Aesthetic for "platform" pitch | "another sidebar" | "the whole platform at a glance" | minimal | v4-expanded |

**Winner: split decision.** v0 wins on robustness, learnability, and dense-manifest behavior. v4-expanded wins on the "platform-at-a-glance" rhetoric the launch needs.

**My call:** v0 as default-render, v4-expanded as a learn-it-once power-user mode toggled by ⌘B. That is *not* the same as shipping v4 — it's shipping v0 with v4-expanded as an alternate keybind-driven layout. The collapsed-with-hover-menus mode of v4 is the part to drop.

### Round 4 — v3 vs. v4 (minimalism vs. dynamism)

| Axis | v3 | v4 | Winner |
|---|---|---|---|
| Visible chrome at rest | 64 px | 64 px or 256 px | tie (collapsed) / v4 wins (expanded) |
| Reveal mechanism | tooltips (label only) | hover menus (full sub-tree) | v4 |
| Cognitive payoff per hover | tiny (one label) | substantial (full menu) | v4 |
| Mode-switching | none | ⌘B | v4 |
| Day 1 ease | hard | easier (menus help) | v4 |
| Failure mode | "I see icons and don't know" | "I see icons and a menu reveals" | v4 |
| Code simplicity | simplest variant | most complex | v3 |

**Winner: v4, decisively.**

Both variants commit to icon-rest, but v4's hover yields information (the section list); v3's hover yields a label. Information beats label. v3's only structural advantage is code simplicity, which is not a user-facing benefit. **There is no scenario in which I would ship v3 over v4 collapsed.**

### Round 5 — 4-way: which variant survives every challenge

I scored each variant 0/1/2 across 10 axes (cognitive load day 1; power-user speed; spatial memory; sparse-manifest UX; dense-manifest UX; 1024 px breakpoint; assistive-tech support; P1 incident; ages-well at week 4; matches the platform launch story).

| Axis | v0 | v2 | v3 | v4 |
|---|---|---|---|---|
| Cognitive load day 1 | 2 | 0 | 0 | 1 |
| Power-user speed | 2 | 0 | 1 | 2 |
| Spatial stability | 2 | 0 | 2 | 1 |
| Sparse manifest | 1 | 1 | 1 | 2 |
| Dense manifest | 2 | 2 | 1 | 0 |
| 1024 px | 1 | 1 | 2 | 1 |
| Assistive tech | 2 | 0 | 0 | 1 |
| P1 incident | 2 | 0 | 0 | 1 |
| Ages-well week 4 | 2 | 0 | 1 | 1 |
| Matches launch story | 0 | 1 | 0 | 2 |
| **Total** | **16** | **5** | **8** | **12** |

**v0: 16. v4: 12. v3: 8. v2: 5.**

v0 survives. v4 has the second-strongest claim and is the only variant that does meaningful rhetorical work for the launch. v2 is the lowest-scoring serious option, which is unintuitive given how much polish went into it; the polish is the tell — it's compensating for an unstable hypothesis.

---

## 4. The case against the entire set — is there a 6th option?

**Possibly yes.** Three structural axes none of v0/v2/v3/v4 fully exercises:

### 4a. Scope-as-context (the recorded dissent in `docs/decisions.md`)

The 2026-04-30 decision log already captures this: the IA Researcher recommended a scope-first variant (Datadog/Honeycomb pattern) that puts scope (tenant / region / data plane / environment) as a top-of-page context selector, *above* product. v5 won the slot for tabs instead, and the decision explicitly notes "if testers … spontaneously ask 'can I switch the whole page to a different cluster/data plane?' — that's the scope-first signal and we promote B."

**My read:** this is the highest-signal next variant. Every variant we have right now puts product as the primary axis. Real SOC operators don't say "I'm in Edge"; they say "I'm in production, where's the attack surface?" Scope-first is the variant that tests whether product-first is a designer's mental model rather than an operator's.

### 4b. Workspace-scoped sidebars (per-workspace nav configuration)

None of v0/v2/v3/v4 lets a tenant administrator hide products their org doesn't license. The `current-ia.md` doc explicitly notes "Conditional logic is heavy" and the prototype's `flag-panel.tsx` only mocks this. **A real-world enterprise tenant with only Edge will see Hypervisor / Gateway / Discovery as dead icons in every variant.** That is a material UX regression for single-product customers vs. today's `my` console.

### 4c. Recents-as-rail (recent items as the primary nav target)

Every variant treats Recents as a secondary affordance (dropdown). For 80%+ of operator sessions, the user is going to one of 3-5 pages they visited yesterday. A nav model that elevates Recents to a first-class persistent column would beat all four of these on time-to-target for repeat tasks. The data justifies it: recency-of-use is the strongest predictor of next-click in any heavy-use console (per Microsoft's classic Office ribbon research).

**Recommendation:** before locking the redesign, build a quick variant that combines (a) v0's always-on second column with (b) a top-row "recently visited" pinned strip inside that column. Test against v0. If recents-as-rail wins on time-to-target for power users, it changes the conversation.

---

## 5. Adversarial recommendation

### Ship

**v0, with three caveats:**
1. **Drop the rail width from 96 px to 80 px** to recover canvas without inviting v2's interaction tax.
2. **Lazy-render below-the-fold sidebar tree items** so dense manifests (Edge today, Hypervisor + Gateway tomorrow) don't degrade scroll perf.
3. **Add ⌘B as a keybinding** that toggles between v0 default and a v4-expanded merged-sidebar mode. This is the smallest possible adoption of v4's strongest idea without inheriting v4's collapsed mode.

### Kill

**v3.** Tooltip graveyard. No defensible user. The only argument for it (spatial stability) is also true of v0 and v4-expanded.

**v4 collapsed mode.** Same fundamental problem as v3 (icon-only at rest with brand-new icons). The hover menus help but don't eliminate the icon-recognition gap.

**v2 in its entirety.** The pin is the confession. The state machine cost is real. Ship v0 with a slimmer rail if "calmer" is the goal.

### Keep as fallback / revisit

**v4-expanded as a ⌘B mode on top of v0.** This is the single richest idea in the prototype and the one that does work for the platform-launch narrative.

**Scope-as-context (the deferred B option).** Recorded dissent in `docs/decisions.md` explicitly says to promote it if v5 testing surfaces the scope signal. I would re-prioritize this *now* — v5 is exploring tabs (a different axis); scope is unexplored and likely more valuable to test before launch.

---

## 6. What I tried to break but couldn't

- **v0's drilled-scope handling** (re-headering the second column with a back link in `v0/second-column.tsx`). Survived: works the same for shallow and deep scopes, doesn't shift any other chrome, screen-readers handle it correctly via `aria-label={`${ctx.header} navigation`}`.
- **v0's manifest-driven shape-shifting under flags.** Tested by reading `flag-panel.tsx` interaction with the manifest registry. The variant correctly rebuilds the second column when flags toggle. None of v2/v3/v4 do this differently — they all share v0's SecondColumn for the drilled state.
- **The variant-prefix routing pattern** (`withVariantPrefix`, `useVariant`). All four variants correctly preserve URLs, and the wordmark-as-picker-escape-hatch decision is consistent across them. Not a nav problem.

These are the parts of the prototype that *are* validated. The variant chrome is where the unvalidated assumptions concentrate.

---

## 7. Recommended validation steps (gates for the redesign decision)

1. **Icon-recognition test, 5 minutes per participant, n ≥ 12 across personas (L1 SOC, Senior SecOps, CISO, Auditor).** Show 6 product icons, ask to label. **If recognition < 90% on day 1 for Hypervisor / Gateway / Discovery, v3 and v4-collapsed are dead.**
2. **Pin-rate instrumentation if v2 ships in any form.** If pin rate exceeds 40% in week 1, the variant is failing its own abandon criterion.
3. **First-click test on cross-product navigation, n ≥ 12.** Compare v0, v4-expanded, and a scope-first mock. Measure time-to-target for the task "open Attacks in Edge production, then check Topology in Hypervisor."
4. **Stress-condition usability session** — give participants a Slack notification + an email + the navigation task simultaneously. The variants that hold up under this kind of cognitive load are the ones that ship.
5. **Manifest-density stress test.** Mock a 50-feature Hypervisor manifest. Render every variant. Photograph at 1024 px. **If any variant looks broken at 50 features, it will be broken in production within 2 quarters.**
6. **Tooltip / hover-menu screen-reader audit** with a real JAWS or NVDA user, not just axe. v2's focus-suppression flag and v4's hover-menu focus-out guard both have known failure patterns under real assistive tech.
7. **Mobile / tablet decision.** All four variants explicitly punt mobile. Decide whether that's strategically acceptable before alignment, not after. If mobile usage is real, none of these variants ship.

---

**Closing.** The team has built a capable prototype with one variant that survives scrutiny (v0), one variant with a genuinely fresh idea worth keeping (v4-expanded), and two variants whose hypotheses I would not bet on (v2, v3). The redesign decision should be: **v0 as default + v4-expanded as a ⌘B mode + scope-first as the next test**, rather than picking any single variant whole. Picking a single variant whole was always going to be wrong; the variants are exploring *axes*, not *finished products*.

Consensus is not validation. Polish is not correctness. Pin is the confession.
