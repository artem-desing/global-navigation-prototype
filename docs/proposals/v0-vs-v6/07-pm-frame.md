# PM frame — v0 vs v6

**Author:** Principal PM. **Date:** 2026-05-05.
**Lane:** segments, scenarios, success signals, risk, strategic recommendation. Not state machines, not motion budgets.

---

## Segments and counts

Estimated distribution across the eventual customer base (post-reveal, 12-month horizon). Numbers are PM judgment grounded in support-ticket and pilot conversations, not telemetry.

| Segment | Share | Why they matter to nav |
|---|---|---|
| **Daily power user** (6+ hrs/day, knows shortcuts, lives in 1–2 products) | ~15% | Loudest internal voice; their pain dominates Slack. They're also least at risk from any default. |
| **Multi-product operator** (weekly across Edge + Hypervisor + Discovery + Testing) | ~20% | The segment the platform-of-products narrative is *for*. Cross-product fluency is the launch promise. |
| **Occasional auditor / quarterly visitor** (compliance, SE, exec) | ~25% | Lowest tolerance for chrome they have to relearn. Highest political weight per session. |
| **New admin** (first 30 days) | ~30% | Largest cohort over a 12-month launch curve. Their first session is the platform's first impression. |
| **Pair-programming / screen-share** (two operators, one screen) | situational, all segments | Not a segment but a *failure mode*. Inconsistent chrome between viewer and driver kills the call. |

Two takeaways. (1) Power users are loud but small — designing for them and ignoring the other 85% is the classic B2B nav mistake. (2) Auditors + new admins are 55% of the base and both are punished by hidden affordances.

## Scenario × variant matrix (1–5 per cell)

Score = "does this variant *help* this segment in this scenario?" 5 = best fit, 1 = actively gets in their way.

### Scenario A — "I know exactly where I'm going"

| | Power user | Multi-product | Auditor | New admin | Pair/screen-share |
|---|---|---|---|---|---|
| v0 | 4 | 5 | 5 | 5 | 5 |
| v6 | 5 | 4 | 3 | 2 | 3 |

v6's `collapsed` default punishes auditors and new admins who don't yet have icon recall; v6's per-browser persistence breaks pair sessions when driver and viewer aren't in the same mode.

### Scenario B — "I don't know which product owns this feature" (cross-product peek)

| | Power user | Multi-product | Auditor | New admin | Pair/screen-share |
|---|---|---|---|---|---|
| v0 | 4 | 5 | 5 | 5 | 5 |
| v6 | 3 | 3 | 2 | 2 | 3 |

v0's `HoverPreview` flyout is the only chrome in the prototype that lets a user *peek* a sibling product's tree without committing a navigation. v6 dropped it. For multi-product operators and new admins this is the load-bearing affordance for building the platform mental model.

### Scenario C — "I'm watching another engineer's screen"

| | Power user | Multi-product | Auditor | New admin | Pair/screen-share |
|---|---|---|---|---|---|
| v0 | 5 | 5 | 5 | 5 | 5 |
| v6 | 3 | 3 | 3 | 3 | 2 |

v6's localStorage-per-browser mode persistence is the single biggest predictability hazard in the prototype. "Click the third icon" stops being a universal instruction the moment two operators' rails are in different modes.

### Scenario D — "I'm onboarding a teammate"

| | Power user | Multi-product | Auditor | New admin | Pair/screen-share |
|---|---|---|---|---|---|
| v0 | 5 | 5 | 5 | 5 | 5 |
| v6 (default) | 2 | 2 | 2 | 2 | 2 |
| v6 (after expanding) | 4 | 4 | 4 | 4 | 4 |

v6 only matches v0 *after* the new user discovers the mode toggle. Onboarding is exactly the moment we cannot afford a hidden control.

## Charter goal alignment

| Charter goal (quoted) | v0 | v6 |
|---|---|---|
| "Lets users sense the platform as one coherent surface" | 5 — every product visible at all times; `HoverPreview` makes the coherence demonstrable | 2 — default `collapsed` hides the platform; user must opt in to coherence |
| "Gives each product/pillar room to breathe" | 4 — labels visible, four pillars stack cleanly at 96px | 4 — `expanded` matches v0; other modes trade breath for canvas |
| "Holds up as Hypervisor + Gateway light up over the next quarters" | 3 — scales to ~9 products before the 96px rail crowds; needs evolution past that | 4 — `collapsed` extends the runway by ~3 products via narrower rows |
| "Prototype demonstrates the click-through flow naturally enough that stakeholders pick a model from feel" | 5 — one rail, one width, no setup | 2 — first impression is icon-only chrome; stakeholders see v3-in-disguise on default load |
| "Feel like one control plane" *(launch promise, AWS Summit reveal 2026-06-10)* | 5 — the platform is *visible* | 2 — the platform is *configurable*, which is a different feeling |

The charter is unambiguous: the launch moment wants the platform to *show its products at once*. v0 is a literal demonstration of "we are now many products." v6's default is a denial of that demonstration in service of horizontal real estate that the launch isn't asking for yet.

## Risks

**v0:**
- *Density ceiling.* At ~9+ products the 96px rail crowds. Real, but a 2027 problem, not a 2026 problem.
- *Power-user complaint surface.* Daily operators in one product will ask for a collapse keybind within weeks. Foreseeable; addressable as a folded-in toggle.
- *Hidden-affordance debt.* `HoverPreview` is itself a hidden affordance — nothing announces it. Lowest-priority risk, but real.

**v6:**
- *Decision burden on every new user.* Three modes is three choices the user did not ask for. Violates Principle 1 (calm chrome) the moment the user notices the toggle exists.
- *Persistence-of-state-per-browser.* localStorage means same user, different browsers, different chrome. For operators using a work laptop + a personal laptop + a tablet, the platform feels inconsistent — the opposite of "one control plane."
- *Per-tenant consistency.* Wallarm is multi-tenant; v6 mode is global to the *user-agent*, not to the *tenant*. An operator who switches tenants does not switch chrome — defensible. But two operators in the same tenant comparing screens *do* see different chrome — indefensible during incidents and audits.
- *Default punishes the majority.* `collapsed` default lands new admins (30% of base) and auditors (25%) on icon-only chrome with brand-new pillar icons they have zero prior association with. This is the v3 problem the team already killed in the 2026-04-30 stress test (memory: `project_v2_is_v0_collapsed_mode.md`).
- *Pair/screen-share break.* Documented above. Non-recoverable without users explicitly synchronizing modes — which they will not do.
- *Embargo:* none for either variant. Pure chrome.

## Reframe check

**Yes — this is the same category error as v2.** The 2026-04-30 stress test concluded "v2 is v0's collapsed mode, not a competing variant." v6 is structurally the same shape one layer up: v6 is **v0 plus three opt-in rest states** for the same rail. v6 `expanded` is v0 with a 192px rail. v6 `hover` is v2 with a settings opt-out. v6 `collapsed` is v3 with a settings opt-out. The IA Researcher's adversarial lane (`02-adversarial.md`) and the IA-audit lane (`01-ia-audit.md`) both independently arrived at the same conclusion: this is one product with a setting, not two products.

A real customer would not perceive v0 and v6 as two products. They would perceive them as "the rail" and "the rail with a setting I can collapse." Treating them as competing variants smuggles in v6's framing that user agency over rail mode is a load-bearing strategic choice. It isn't. It is a designer-side win disguised as a user-side win — *especially* given the launch goal of demonstrating breadth.

## Strategic recommendation

**Fold. Ship v0 as canonical default. Absorb v6's `expanded` mode as a single ⌘B toggle on top of v0. Kill v6's `collapsed` and `hover` modes outright. Do not ship a three-way mode menu.**

Reasoning, segment-grounded: the 55% of the base who are auditors + new admins need the platform *visible* on first contact, every contact. The 20% who are multi-product operators need `HoverPreview` for cross-product peek (v6 dropped it). The 15% power-user complaint about horizontal real estate is real and deserves a one-bit toggle (⌘B collapse to icons + tooltips), not a three-mode preference panel. v6's `hover` mode is genuinely clever interaction-design work, but a clever rest state that breaks pair-programming, screen-shares, and onboarding consistency is a clever thing the platform cannot afford during the launch window. Park `hover` mode in the prototype as a reference for the post-launch revisit; do not ship it as a third mode.

This is the same verdict the team reached on v2 last week. Reaching it twice in a row on structurally similar work is signal — the team is reliably catching "rail-mode-as-variant" reframings. Log this one explicitly so it doesn't have to be relitigated a third time when v7 arrives wearing the same hat.

## Decision-log entry (draft)

> **Decision:** Ship v0 as canonical. Absorb v6's `expanded` mode as a single ⌘B-collapse toggle on the v0 rail. Kill v6 `collapsed` default and `hover` mode as shipped surfaces. v6 stays in the prototype at `/v/v6/` as a reference until 2026-06-10, then retires.
>
> **Dissent:** Power users will continue to ask for the `hover` overlay rest state — Linear/Sentry/Notion all ship it. Recorded: if post-launch qualitative signal shows >25% of daily operators manually collapse the rail every session, revisit `hover` overlay as a third mode behind a hidden preference (not a visible setting).
>
> **Revisit if:** (a) product count crosses 9 — v0's "everything visible" promise breaks and the collapse default may need to flip; (b) pair-programming / screen-share workflows become a top-3 support theme — confirms predictability beats agency, hold the line; (c) a real customer in pilot spontaneously asks "can my whole team's chrome match mine?" — that's the per-tenant consistency signal and the mode preference moves from per-browser to per-tenant.
