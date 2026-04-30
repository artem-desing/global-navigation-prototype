# PM frame — v0 / v2 / v3 / v4 stress test

**Lane:** product strategy. Audience, scenarios, signals, risk, alignment.
**Scope:** v0, v2, v3, v4. v5 explicitly excluded — the workbench bet is being
evaluated on its own terms.
**Author:** Principal PM. **Date:** 2026-04-30.

---

## 1. Executive summary

- **Recommended pick: v0 (always-open sidebar).** It is the only variant of the
  four that doesn't bet against the platform's near-term reality. We are about
  to *increase* the count of products and the count of cross-cutting features
  on screen. The job we are hiring nav for, between now and reveal+90, is "make
  the platform legible," not "save 200px of horizontal space." Discoverability
  beats density when the catalog is changing under the user's feet.
- **Recommended kill: v3 (icons + tooltips).** It is the variant most optimized
  for a steady state we will not be in for ~12 months. It also fails the
  weakest user we cannot abandon — the once-a-quarter auditor — and it
  maximizes the cost of every label change microcopy will want to make in the
  pillar reveal.
- **Biggest strategic risk across the set:** all four variants assume
  *product* is the primary axis. If the post-reveal mental model turns out to
  be scope-first (tenant / data plane / region) — which the IA Researcher's
  parked dissent on v5 already flagged — then a left-rail decision in any
  shape is a local optimum. Hold v0 lightly. The "revisit if" clause in this
  doc is load-bearing.

---

## 2. Per-variant frame

### v0 — always-open sidebar

**For whom is this the correct answer?**

- *Security architect doing weekly review.* They sweep across products
  (Events → API Security → Security controls → Settings) and the cost of
  each transition needs to be near-zero. v0 gives them every item in
  peripheral vision.
- *New hire learning Wallarm.* The single highest-value moment for nav is
  the first 30 days. Everything visible at once is how a new operator learns
  the topology — they read the sidebar like a table of contents.
- *Partner running a demo.* Fewest hidden affordances = fewest moments of
  "let me find this." The sidebar *is* the product story.
- *Exec doing a posture review.* They will not learn a hover model. Visible
  > clever.

**For whom is it wrong?**

- *SOC analyst on hour 6 of an incident.* The sidebar is just chrome — they
  live on one page (Attacks / Incidents). Width spent on nav they aren't
  using is width missing from the table they are. v0 is the worst on this
  axis of the four.
- *Customer with one product on a small laptop.* All that nav for a single
  destination feels heavy.

**Scenarios.**

| Scenario | v0 rank | Why |
|---|---|---|
| Triage an alert in tenant X | Mid | Nav stays out of the way once you're in Attacks; tenant switch is one top-bar click; second column adds value when drilling into a scope. |
| Configure a product feature | **Best** | Both columns are visible; the path from product → section → feature is one read, not three hover-reveals. |
| Compare posture across tenants | Mid | The tenant picker in the top bar handles this; the sidebar isn't load-bearing for the comparison itself. v0 doesn't help, but doesn't hurt. |

- *Brand-new user:* v0 is the friendliest. They will use the sidebar as a
  tour.
- *Customer with one product:* v0 is wasteful.
- *Customer with 50 tenants:* v0 is no better or worse than the others — the
  tenant picker is the load-bearing surface and it lives in the top bar
  across all four.

**Success signals (week 1 of an internal pilot).**

- *Winning:* tenured operators report "calmer," new hires can name 5+
  sections unprompted after first session, support tickets about "where do I
  find X" trend down.
- *Failing:* operators close the sidebar manually (we'd need a collapse
  affordance v0 doesn't currently feature), comments cluster around "too
  much," screen-recording shows operators scrolling the sidebar to find
  items they've used before.
- *Production metric proxies:* time-to-first-click after route change (lower
  is better), ⌘K usage as fraction of total nav events (if it climbs above
  ~25% the sidebar isn't doing its job), repeat-visit nav-to-content ratio.
- *Leading indicator of regret:* operators ask for a collapse keybind within
  the first two weeks. That means we shipped the wrong default density.

**Risk.**

- *Reversibility:* high. v0 is the conventional pattern; rolling back from
  it to anything denser is straightforward and pre-existing user habit
  carries forward. Rolling back *to* it from a denser variant is what's
  hard.
- *Maintenance burden as we add products 11/12/13:* this is v0's real
  weakness. At 6 products the sidebar already feels full. At 9+, v0 must
  evolve — section grouping, "more" overflow, collapse, or dual-rail.
  Manageable but not free.
- *Investment trap:* low. v0 doesn't foreclose mobile (mobile is its own
  redesign anywhere), doesn't foreclose embedded chrome (the manifest is
  the asset, not the rail), doesn't foreclose multi-window (Workbench can
  layer on top of v0).
- *Stakeholder risk:* engineering may push back on "the sidebar is too
  wide" once content density on inner pages becomes the constraint. That
  objection is real but it's a 2027 problem, not a 2026 problem.

**Strategic alignment.**

- *Roadmap fit:* good *now*, decreasing over time. v0 is a 12-month
  decision, not a 36-month decision.
- *Embargo fit:* best of the four. The reveal moment wants the platform to
  *show* its products at once. v0 is a literal demonstration of "we are now
  many products."
- *Cross-cutting features (Insights, Reports, Settings):* clean home —
  Settings already has its precedent as a separate cluster, and Insights /
  Reports can sit at the top of the sidebar above products or in a top-bar
  utility cluster. v0 has the most space to absorb new cross-cutting
  surfaces without hiding them.

---

### v2 — icon rail with hover-expand

**For whom is this the correct answer?**

- *SOC analyst on incident.* The 64px rail is exactly the trade-off they
  want — nav is reachable but doesn't eat horizontal space they need for
  tables, timelines, request bodies.
- *Power operators (tenured, daily use).* They've memorized which icon is
  which; hover-expand is just-in-time labels for the 5% of cases they need
  one.
- *Customers running ≤3 products.* Icon recognition stays manageable.

**For whom is it wrong?**

- *New hire in week 1.* They don't yet know what a shield-with-lightning
  means versus a shield. They will hover everything until they've built the
  mental map, which is the worst of both worlds.
- *Partner running a demo.* "Hover to see" is a discovery tax during a sales
  conversation.
- *Exec doing a quarterly review.* They will not invest in learning the
  iconography.

**Scenarios.**

| Scenario | v2 rank | Why |
|---|---|---|
| Triage an alert in tenant X | **Best** | Maximum content area; nav stays out of the way; pin-on-demand when needed. |
| Configure a product feature | Mid | Hover-expand introduces an extra interaction step compared to v0; once expanded, equivalent to v0. |
| Compare posture across tenants | Mid | Same as v0 — tenant picker carries the load. |

- *Brand-new user:* v2 is harder than v0 — first session features more
  hovering. Mitigated if onboarding pins the rail open.
- *Customer with 1 product:* v2 looks proportional, finally — single icon,
  light chrome.
- *Customer with 10+ products:* the rail starts to feel crowded; tooltip
  collisions become real; recall on icons degrades sharply past ~7.

**Success signals.**

- *Winning:* operators report calmer screens, ⌘K usage stays similar to v0
  (the rail is good enough they don't reach for search to escape it).
- *Failing:* operators pin the rail and never unpin (which means they've
  rebuilt v0 the hard way — kill the variant), or ⌘K usage spikes (which
  means the rail isn't navigable and they're routing around it).
- *Production metric proxy:* pin-state distribution. If >70% of users pin
  open, v2 is just v0 with extra friction in week 1. If <30% pin, v2 is
  doing what it claims.
- *Leading indicator of regret:* qualitative — operators saying "I keep
  hovering the wrong icon."

**Risk.**

- *Reversibility:* moderate. The hover-expand interaction is a learned
  behavior; reverting will feel like a downgrade to people who liked it.
- *Maintenance burden:* moderate. Each new product needs an icon that
  reads at 24px and is distinguishable from the others. By product 10 we
  will be reaching for second-tier glyphs.
- *Investment trap:* the *bigger* trap is that v2's whole value prop —
  reclaim horizontal space — is undermined the moment we introduce the
  pillar reveal and stakeholders ask us to *show* the platform's breadth.
  v2 hides the breadth on hover. That collides with the launch goal.
- *Stakeholder risk:* marketing / sales will push back at reveal — "you
  can't see the platform." Load-bearing objection.

**Strategic alignment.**

- *Roadmap fit:* better *over time* than v0, worse right now. v2's case
  strengthens once the platform story is internalized and we stop needing
  to demonstrate breadth.
- *Embargo fit:* worst of the four for the reveal moment specifically —
  hides what we just spent a launch teaching the market exists.
- *Cross-cutting features:* awkward — Insights / Reports either become
  rail icons (competing with products) or hide in the top bar.

---

### v3 — icons only with tooltips

**For whom is this the correct answer?**

- *Senior power user, daily use, on a 13" laptop, comfortable with
  iconography.* This is the variant for them. Maximum density, lowest
  chrome, lowest distraction.
- That's it. The legitimately-served user segment for v3 is narrower than
  for any other variant.

**For whom is it wrong?**

- New hires (forced into hover-discovery as the *only* mode of learning).
- Auditors (once-a-quarter, will not retain icon-to-product mapping).
- Demo / sales contexts (chrome that requires explanation is anti-sales).
- Anyone with an accessibility need that interacts poorly with hover-only
  affordances.

**Scenarios.**

| Scenario | v3 rank | Why |
|---|---|---|
| Triage an alert | **Best on density**, mid on confidence | Most content area of any variant; but operators must trust their icon recall under stress. |
| Configure a feature | Worst | Two hover-tooltip steps before they're inside the section — there's no expand at all. |
| Compare across tenants | Mid | Tenant picker carries the load same as elsewhere. |

- *New user:* the worst of the four. There is no fallback to "see the
  labels."
- *1-product customer:* fine — one icon, minimal chrome.
- *10+ products:* breaks. Recall on >7 icons in a vertical strip is poor
  and well-documented in HCI literature.

**Success signals.**

- *Winning:* tenured operators report fast, calm flow; tooltip-hover dwell
  time short.
- *Failing:* tooltip dwell long, mis-clicks high (operator clicks the wrong
  icon, tooltip confirms after the fact), new users disengage. ⌘K usage
  spikes — the leading indicator of "they're routing around the rail."
- *Production metric proxy:* mis-click rate (clicks immediately followed
  by a back navigation within 2s).
- *Leading indicator of regret:* support requests for "label the icons."

**Risk.**

- *Reversibility:* moderate. Same as v2.
- *Maintenance burden:* highest of the four per new product — every new
  icon is a memorization tax we levy on every user, with no escape valve.
- *Investment trap:* deepest. v3 says "labels are optional" and that is a
  bet against the next 18 months of platform expansion. It also collides
  hard with the embargoed pillar reveal — pillars need names visible to
  read as a story.
- *Stakeholder risk:* microcopy / IA / marketing will all object. The
  objections are load-bearing: pillar names *are* the launch, and v3 hides
  them by default.

**Strategic alignment.**

- *Roadmap fit:* poor. v3 is the variant most optimized for a steady-state
  product whose surface isn't changing. Ours is.
- *Embargo fit:* worst. Reveal moment requires legibility of the new
  pillar names; v3 reduces them to icons.
- *Cross-cutting features:* worst home for them. Insights / Reports become
  yet another icon; the user must remember what every glyph is.

---

### v4 — pop-out menus, ⌘B merged sidebar

**For whom is this the correct answer?**

- *Mid-tenure operators.* The collapsed pop-out gives space when focused;
  ⌘B reveals the platform when they're navigating. Two modes for two
  jobs.
- *Platform engineers configuring across products.* The Cloudflare-style
  merged sidebar is the only mode of any variant that lets them scan
  *every* product's features in one column without expanding individually.
- *Customers with 5–8 products.* Density curve fits.

**For whom is it wrong?**

- *Anyone who won't learn ⌘B.* Which is almost everyone except daily
  users. Without the keystroke, v4 is just v3-with-pop-outs, and the
  pop-out menus are slower than v0's persistent column.
- *New hires.* Two modes is one mode too many in the first 30 days.
- *Partners / demos.* Modal hover behavior is hard to narrate.

**Scenarios.**

| Scenario | v4 rank | Why |
|---|---|---|
| Triage an alert | Mid | Comparable to v2; collapsed rail is fine while reading. |
| Configure a feature | **Best for cross-product configuration**, worst for single-product configuration | The merged expanded mode is the only place in any variant where every product's features sit visible together. But for "I'm in API Security, configure rules," the pop-out adds a step v0 doesn't have. |
| Compare across tenants | Mid | Same as elsewhere. |

- *New user:* worse than v0, marginally better than v3 (at least the
  pop-out gives labels eventually).
- *1-product customer:* v4 collapsed is fine; expanded is overkill.
- *10+ products:* v4 expanded shines here — the merged sidebar is the
  only variant that scales legibly to that count *if* users find ⌘B.

**Success signals.**

- *Winning:* split usage — operators use collapsed mode for focused work
  and expanded for cross-product configuration. Both modes get traffic.
- *Failing:* one mode dominates (>85% usage). If everyone lives in
  expanded, v4 is v0 with extra steps. If everyone lives in collapsed,
  v4 is v3 with extra hover affordances.
- *Production metric proxy:* mode-switch frequency per session.
- *Leading indicator of regret:* operators don't discover ⌘B without
  being told. If usage of the expanded mode requires onboarding, v4 has
  a hidden-power problem.

**Risk.**

- *Reversibility:* low. v4 is the most distinctive of the four; users
  who learn it will resist a "regression" to v0 or v2. Worst lock-in
  among the candidates.
- *Maintenance burden:* highest among the four. Two chrome modes ×
  drilled-scope special-cases × Settings special-case = the most
  state to maintain. Each new product touches both modes.
- *Investment trap:* moderate. The pop-out menu pattern is harder to
  embed in a partner UI or compress to mobile than a simple rail.
- *Stakeholder risk:* engineering objects to the maintenance complexity.
  Microcopy objects to having to make labels work in three contexts
  (rail tooltip, pop-out menu, expanded inline). Both load-bearing.

**Strategic alignment.**

- *Roadmap fit:* good *long-term* (best at scale) if users find the
  expand keystroke. Bad short-term (learning curve coincides with
  reveal moment when we want zero friction).
- *Embargo fit:* mixed. Collapsed mode hides the platform like v2/v3;
  expanded mode shows it more legibly than v0. The variant only works
  for the launch if we ship it *defaulting to expanded* on first load
  — at which point it's v0 with extra steps for week 1.
- *Cross-cutting features:* best home of the four. The merged expanded
  sidebar is the only chrome that gives Insights / Reports a natural
  cross-product seat alongside products.

---

## 3. Decision matrix

| Variant | Best-fit user | Worst-fit user | Scaling outlook (12→36 mo) | Reversibility | PM recommendation |
|---|---|---|---|---|---|
| v0 | New hire, architect, demoer, exec | SOC on incident with limited screen | Strong now, weakening at 9+ products | High | **Ship to all** |
| v2 | Power operator, SOC analyst | New hire, exec, demoer | Stable middle of road | Moderate | Ship as opt-in |
| v3 | Senior power user, narrow band | Almost everyone except above | Weakest — bets against expansion | Moderate | **Kill** |
| v4 | Platform engineer, cross-product configurator | New hire, demoer, anyone who won't learn ⌘B | Strongest at scale *if* ⌘B is found | Low (highest lock-in) | Park; revisit at 9 products |

---

## 4. The framing question

> **"Is the next 12 months about teaching the market our platform exists, or
> about serving operators who already know it does?"**

If the answer is *teaching* — which the AWS Summit reveal, the post-launch
expansion of products, and the embargo timeline all imply — the answer is
v0. Discoverability is the load-bearing property; horizontal-space efficiency
is secondary.

If the answer is *serving the steady state* — which we will not be in until
~mid-2027 — v2 or v4 become defensible. v3 doesn't become defensible at any
realistic time horizon for our trajectory.

Every other strategic question downstream of nav (collapse-by-default? icon
literacy budget? pop-out vs persistent?) is answered by where this question
lands.

---

## 5. PM recommendation

**Ship v0 as the default. Offer v2 as an opt-in setting (`Compact rail`).
Park v4 in the prototype as a reference for the post-launch revisit. Kill v3.**

**Rationale.**

- v0 maximizes the property the launch needs (legibility of the new platform
  shape) and minimizes the property we can least afford to lose (auditor /
  exec / new-hire / partner success).
- v2 covers the SOC-analyst incident scenario as an opt-in without forcing
  the cost on everyone. It's the cheapest concession to power users.
- v4 is the variant most likely to be the *right* answer in 18 months, but
  shipping it now means asking the market to learn a two-mode chrome at the
  same moment it's learning a multi-product platform. Two simultaneous
  learning loads is one too many. Park, don't kill.
- v3 is dominated. Anything v3 does well, v2 does within ~10% — and v2 has
  an escape valve for new users. There is no scenario where v3 is the
  right call that isn't better served by v2.

**Dissent on the record.**

- The IA Researcher's framing (carried in the v5 decision) implies the
  whole left-rail axis may be a local optimum and the real bet is
  scope-first nav. That dissent applies to v0 as much as to v2/v3/v4.
  v0 is recommended *despite* that dissent, on the grounds that we ship
  the conventional answer at reveal and treat scope-first as the next
  bet, not this one.
- The Adversarial reviewer would likely note that v0 is the lowest-risk
  pick and therefore the lowest-information pick. True. The information
  v0 doesn't generate is information we should generate via v5
  (workbench) and a future scope-first variant — not by gambling the
  reveal on a denser left rail.

**Revisit if.**

- Product count crosses 9 — v0's "everything visible" promise breaks; v4
  becomes the favored upgrade path, not v2.
- Internal pilot shows ⌘K usage above 25% of all nav events in week 2 —
  the sidebar isn't doing its job at any density and we should investigate
  scope-first / workbench before iterating on the rail.
- Post-reveal qualitative signal that operators want to "switch the whole
  page to a different tenant / data plane / region" without changing
  product — that's the scope-first signal and it leapfrogs all four
  rail variants.
- Mobile becomes a real surface — v0 doesn't survive a phone screen
  unmodified, and the variant we'd need is closer to v4-collapsed.

**Embargo check (this document).**

This file lives in `docs/`, internal-only. No visible artifact derived from
this document may carry "AI Control Platform," "Infrastructure Discovery,"
"API/AI Gateway," or "AI Hypervisor" before 2026-06-04. The pillar names
referenced inline above stay inside `docs/` per the embargo rule.
