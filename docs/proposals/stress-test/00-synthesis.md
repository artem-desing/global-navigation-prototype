# 00 — Stress test synthesis (master document)

**Author:** Project Manager (synthesis lane).
**Date:** 2026-04-30.
**Inputs:** seven lane reports in this directory (01–07). v5 explicitly excluded throughout.
**Audience:** design lead. Read this first; drill into the lane reports for evidence.

This document destroys every option and picks a winner. It is unflinching by design — the lane authors did not pull punches and neither does this synthesis.

---

## Section 1 — The unbiased verdict

**Winner: v0 (always-open sidebar). Ship it as the default.**
**Loser: v3 (icons + tooltips). Kill it.**
**Misframed: v2 (hover-expand). It is not a competitor to v0 — it is v0's collapsed mode wearing the costume of an alternative. Fold it.**
**Park: v4 (pop-out + ⌘B merged sidebar). Has the only genuinely fresh idea in the prototype (the merged-sidebar expanded mode), but ships it strapped to a weaker collapsed mode and a discoverability problem.**

### Per-lane rank order, side by side

| Lane | 1st | 2nd | 3rd | 4th | File |
|---|---|---|---|---|---|
| IA audit | **v0** | v4 | v2 | v3 | `01-ia-audit.md` |
| Adversarial battle royale | **v0** (16) | v4 (12) | v3 (8) | v2 (5) | `02-adversarial.md` |
| Interaction critique | **v2** | v0 / v4 (tied) | — | v3 | `03-interaction.md` |
| Visual / hierarchy | **v3** at rest / **v4-expanded** working | v3 | v2 | v0 | `04-visual.md` |
| QA defects | **v0** (fewest) | v2 | v3 | v4 (most) | `05-qa.md` |
| Competitive precedent | **v0** | v4 | v2 | v3 | `06-competitive.md` |
| PM frame | **v0** | v2 (opt-in) | v4 (park) | v3 (kill) | `07-pm-frame.md` |

### Where the lanes converge

Five of seven lanes (IA, adversarial, QA, competitive, PM) put v0 first outright. Six of seven put v3 last or recommend killing it. Six of seven explicitly call out v4's expanded mode as the genuinely interesting design idea in the prototype.

### Where the lanes fight

Two real tensions, both addressable:

1. **Interaction lane awards v2 the medal for "most refined state machine."** Visual lane's "most calm at rest" goes to v3. These are *craft* judgements about the implementation, not strategy judgements about the bet. They are real but they are evaluating a different question than the other five lanes.
2. **Visual lane calls v0 the weakest variant** (34% chrome at 1024 px) while every other lane calls it the winner. This is the load-bearing tension and §3 adjudicates it.

The convergence vastly exceeds the dissonance. v0 wins on truth, scale, learnability, precedent, and product strategy; the dissents are about polish and pixels.

---

## Section 2 — Where the lanes agree

Strong-consensus findings (≥ 5 of 7 lanes flag them):

1. **v3 is the weakest variant.** Lanes 01/02/03/06/07 all rank it last or call it dominated. The IA lane calls it "the wrong precedent for the trajectory." The adversarial lane calls it "a tooltip graveyard." The competitive lane finds zero multi-product enterprise precedents. The PM lane calls its target user segment "narrower than for any other variant — that's it." Only the visual lane defends v3, and only at rest.
2. **v0 wins on the platform-launch story.** IA, adversarial, competitive, and PM all argue that v0 is the only variant that *renders the platform's product inventory perceptually* — every product label is on screen at idle. For the 2026-06-04 reveal, where the goal is "feels like one control plane," every other variant hides the inventory pending a hover, click, or shortcut.
3. **v0's chrome is genuinely heavy at 1024 px.** Visual lane (34%), adversarial (352 px / 672 px content at 1024), QA (concern flagged), interaction (acknowledged), PM (acknowledged for the SOC-on-incident scenario). Five lanes flag it. Four of those five still recommend v0 anyway — they consider the cost worth paying. One (visual) does not.
4. **v4's expanded mode is the strongest single design idea in the prototype.** IA, adversarial, visual, interaction, competitive, and PM all explicitly call this out. It is the only variant that surfaces the cross-product feature inventory at once. The competitive lane corroborates the pattern via Cloudflare 2025.
5. **v4's collapsed mode and v3 share the same fatal flaw.** Six lanes (01/02/03/04/06/07) note this independently. Icon-only at rest with brand-new pillar icons is a recall-vs-recognition failure. The adversarial lane is most direct: "you cannot icon-only your way to recognition for a product that doesn't exist yet."
6. **Tenant scope is unsolved across all four variants.** IA explicitly, adversarial implicitly, QA implicitly. The placeholder dialog in `top-bar.tsx` is identical in every variant; choosing v0 vs v4 doesn't move this needle. The IA lane calls this "the largest unsolved IA decision in the prototype."
7. **AI assistant push-panel has an a11y bug.** Interaction lane (no focus trap, no return-focus) and QA lane (no Escape handler) both raise this independently. Cross-cutting, fix-once.
8. **v4 in its current implementation has multiple holes** beyond strategy. Interaction names three (8 px hover-corridor gap, ⌘B intercepts text inputs, in-flight menu not dismissed on mode swap). QA adds five more (ExpandedRail has no arrow-key handler, no Escape on hover menu, dual-tree state when scoped + expanded simultaneously, latent localStorage re-init on slug change, dead `growUpward` prop). v4 is unfinished, not just unproven.

---

## Section 3 — Where the lanes disagree (adjudicated)

### Tension 1: Visual says v0 is weakest; PM/IA/competitive/adversarial want v0

**The disagreement.** Visual lane scores v0 a 2 on density at 1024 px and a 3 on rest hierarchy ("rail-loud"). It calls the rail+second-column combo a 34% chrome eat. The other lanes treat the same chrome cost as the *price of v0's strongest attribute* — perceptual visibility of the platform.

**Adjudication: the synthesis sides with the strategic lanes, with the visual lane's specific fixes adopted.** The visual lane is correct that v0 is the densest variant; the other lanes are correct that the density is a feature, not a bug, *for this product launch*. The adversarial lane already proposed the resolution: drop rail width from 96 → 80 px (the visual lane independently flags the rail's whitespace around 20 px icons + 12 px labels as wasted). That's a 16 px recovery for free, plus normalizing v4-expanded's row-height drift carries over to any future expanded mode.

The visual lane's actual "ship v4 collapsed-by-default" recommendation does not survive contact with the adversarial / competitive / PM lanes. Visual elegance at rest does not trump platform-narrative legibility at the reveal moment.

**Verdict:** ship v0; harvest the visual lane's specific tightening recommendations (rail to 80 px; tighten typographic hierarchy in second column; fix the avatar circle in light mode; fix the hover-preview overlay surface stack). Reject the visual lane's strategic conclusion (ship v4 collapsed).

### Tension 2: Interaction says v2 is most refined; adversarial says v2 is the worst

**The disagreement.** Interaction lane awards v2 the highest grade for state-machine craft — pin commit, focus suppression, unpin blur, reduced-motion branch, arrow keys, Escape. The adversarial lane calls v2 the lowest-scoring variant (5/20) and says "the polish is the tell — it's compensating for an unstable hypothesis."

**Adjudication: both lanes are correct, and the adversarial framing is the load-bearing one.** v2 is well-built. v2 is also, in adversarial's words, "three half-decisions stacked into a single chrome that needs 200+ lines of timer-juggling code to keep its state machine consistent." The interaction craft is real; the underlying bet (collapsed-by-default at multi-product scope) is uncited in the competitive lane. Sentry, Cloudflare, Intercom, Supabase all ship hover-collapse as *opt-in collapse from an expanded default*, not as the default state. v2 inverts this.

The competitive lane delivers the killing reframe: **v2 is not a separate variant; it is v0's collapsed mode**. Section 4 below makes this load-bearing.

**Verdict:** the interaction craft is real and worth preserving — but as the *behavior for "collapsed v0,"* not as a standalone variant. Fold v2's state machine (pin, Esc, focus suppression, reduced-motion branch, arrow keys) into v0 as an opt-in compact-rail mode. Kill v2 as a variant slug.

### Tension 3: Visual + interaction like v4 with fixes; IA + adversarial say v4 is two-models-stitched-together

**The disagreement.** Visual lane wants to ship v4 collapsed-by-default with the row-height and surface-language fixes. Interaction lane calls it competitive-with-v2 once the three holes (corridor gap, ⌘B input-blind, mode-swap dismiss) are closed. IA and adversarial both say v4 collapsed is essentially v3 with hover-menus and inherits v3's fatal flaw on icon vocabulary.

**Adjudication: the IA/adversarial framing is correct, and the resolution is to split v4.** v4 is not one design — it is two. The collapsed mode is v3-with-richer-hover; the expanded mode is the genuinely fresh Cloudflare-style merged sidebar. Six lanes agree the expanded mode is the prototype's strongest novel idea. Five lanes raise concerns about the collapsed mode.

The right move is not "ship v4 with fixes" or "kill v4 entirely." It is: **drop v4-collapsed as a variant; preserve v4-expanded as a ⌘B-toggleable mode on top of v0** (the adversarial lane's exact recommendation, and the competitive lane's "what working vendors actually ship"). This preserves the only fresh idea in the prototype while removing the unfinished half and the icon-recognition gamble.

**Verdict:** v4 the variant doesn't ship. v4-expanded the *behavior* survives, layered onto v0 as opt-in via ⌘B (or another key — see §8 on the bookmark-bar conflict).

---

## Section 4 — The reframe: was the variant set itself wrong?

The user's framing was "v0 vs v2 is the main contest." The competitive lane (06) demolishes this:

> "v2's collapse mechanic is not a separate variant, it is v0's documented collapsed mode. Cloudflare, Sentry, Intercom, Supabase, Linear, Vercel all ship 'always-on sidebar by default + collapsible to icons + hover-flyout when collapsed + explicit pin to commit.' That is structurally **v0 with v2 layered as the collapse behavior** — not v0 vs v2 as alternatives. The competitive evidence treats them as one compound pattern, and the prototype currently fragments them."

This is the most important reframe in the entire stress test. The user's framing was a category error, and the lane reports collectively expose it. v2 was never the rival — it was the collapse behavior of v0, prototyped as if it were a competing model.

That reframe makes everything else snap into place:

- **The four variants are not four products. They are four points in a 2-D space.** Axis 1: state at rest (everything visible / icons-only). Axis 2: where labels live (in the rail / in a flyout / in a merged sidebar / nowhere). v0 = expanded+labeled. v2 = collapsed+hover-revealed. v3 = collapsed+tooltip-only. v4 = two-modes (collapsed+flyout / expanded+merged).
- **Vendors don't pick one corner. They ship a default state and a collapse behavior.** Cloudflare = expanded default + hover-flyout collapsed + recently added merged-sidebar pattern. Sentry = stacked-swap. Konnect = expanded with push-replace on drill. *None* of them ship a variant set; they ship one compound surface with state.
- **The user's "v0 vs v2 is the main contest" framing was the wrong axis to argue.** The right axis is: which default? what collapse behavior? what mode-switch (if any)? Once framed that way, v0 wins the default contest decisively (consensus across five lanes), v2's mechanic wins the collapse-behavior contest, and v4-expanded wins the optional-mode contest.

**The variant set itself was useful as exploration but misleading as a decision frame.** It encouraged "pick one and ship it" thinking. The right output is "ship v0 as default; harvest v2's mechanic as v0's collapsed-mode behavior; harvest v4-expanded as v0's optional ⌘B mode." That's one product with three states, not three competing variants.

This synthesis adopts that reframe.

---

## Section 5 — Master comparison matrix

Grades A (excellent) → D (poor). One-line justification per cell. Last row = composite call.

| Axis | v0 | v2 | v3 | v4 |
|---|---|---|---|---|
| **IA mental-model fit** (3-tier scope at idle) | A — all 3 layers visible at once (`01:79-101`) | B — 2 layers idle, 3rd on hover | C — 1 layer carries labels (canvas only) | B+ — collapsed reveals on hover; expanded reveals all |
| **IA scalability** (10–20 products) | B+ — scales linearly until rail scrolls (~20 prod) | B- — bimodal, recall-bound when collapsed | D — icon vocabulary collapses past ~7 products | A (expanded) — only variant that scales legibly to 30+ |
| **Adversarial steel-man strength** | A — "most boring is the strongest argument" (`02:31`) | C — pin is the confession (`02:104`) | D — no defensible use case (`02:20`) | B+ — expanded mode does real rhetorical work; collapsed is dead weight |
| **Adversarial fatal flaw** | C — performs no rhetorical work for the platform launch (`02:59`) | D — three half-decisions stacked; pin is the rollback | F — icon-only in front of audience that has no icons yet (`02:148`) | C — two variants stitched together; ⌘B is hidden |
| **Interaction state machine** | C — 0 ms preview is jumpy; AI panel has no focus trap | A — best-in-class (pin, focus suppression, Esc, arrow keys, RM branch) (`03:114`) | D — instant tooltip dismiss; no Esc; no fallback | C — 8 px corridor gap, ⌘B input-blind, mode-swap UI not dismissed |
| **Interaction risk** (top-of-mind bugs) | B — AI panel a11y, hover preview 0 ms, no skip-link | B — focus-suppression flag is plumbing for cycles | C — 300 ms × 6 icons cold-start tax | C — 5 v4-specific defects in QA (`05`) |
| **Visual hierarchy** | C — rail-loud, fights second column | A- (when overlay) — quiet rail, clear active chip | A — calmest at rest of all four (`04:14`) | A (expanded) / B (collapsed) — best clarity in expanded; same as v3 collapsed |
| **Visual density** (1024 px chrome) | D — 352 px (34% of viewport) (`04:14`) | A- — 320 px when unpinned | A — 320 px | A+ (collapsed unscoped) — 64 px / D (expanded+drilled) — 512 px |
| **QA defects** (variant-specific count) | A — 0 in-scope (`05:13`) | B — 0 in-scope; 5 lint warnings | B — 1 medium (no Esc on rail) | D — 5 v4-specific (`05`) |
| **Competitive precedent strength** | A — 12 vendors at our scope; 3 migrated INTO it 2024–26 (`06:11`) | C — interaction precedented as collapse-behavior, not as default | D — 0 multi-product enterprise precedents (`06:13`) | B — both halves separately precedented; compound novel |
| **PM segment fit** | A — new hire / architect / demoer / exec (`07:344`) | B — power user / SOC analyst (opt-in) | D — narrow band of senior power users (`07:344`) | C — platform engineer if they find ⌘B; brittle without |
| **Reversibility** | A — high; conventional pattern carries forward | B — moderate (learned-behavior lock-in) | B — moderate | D — lowest (highest lock-in once learned) (`07:314`) |
| **Composite call** | **SHIP as default** | **FOLD into v0 as compact mode** | **KILL** | **PARK; harvest v4-expanded as ⌘B mode** |

---

## Section 6 — Per-variant verdict

### v0 — Always-open sidebar

**The case for.** Five of seven lanes rank it first. It is the only variant that surfaces the platform's three-tier mental model on screen at idle (`01:79`). Strongest competitive precedent count and trajectory — twelve vendors at our scope ship this pattern; three migrated *into* it in the last 24 months (`06:11`). Best fit for the 2026-06-04 launch context: the rail's product list literally embodies the "we are now N products" narrative. Best for new hires, architects, demos, execs, auditors, and assistive-tech users (`02:48`, `07:36`). Highest reversibility.

**The case against.** Heaviest chrome of any variant — 352 px at 1024 px (`04:14`). Performs no rhetorical "we re-architected" signal beyond more sidebar (`02:59`). Will start to creak at 9+ products (`07:96`). Hover preview opens at 0 ms (jumpy on fast cursors). AI panel has no focus management (cross-cutting). Group-expand state lost on product switch (cross-cutting).

**Most damaging single critique.** From adversarial (`02:59`): "v0 is not actually new. It is the existing console with a left rail strapped on. … If the redesign's purpose is to *announce* the platform shift, v0 is the variant that says 'we added more products to the same console.' That may be honest, but it is not a story."

**Recommendation:** **SHIP** as the default for the 2026-06-04 reveal. With three concessions:
1. Tighten rail width 96 → 80 px (adversarial + visual lanes converge).
2. Raise hover-preview open delay 0 → 250 ms; raise close delay to 200 ms (interaction lane).
3. Adopt v2's state-machine craft (pin, Esc, arrow keys, focus suppression) inside v0 as the behavior for an opt-in compact mode (see v2 below).

### v2 — Hover-expand rail

**The case for.** Best state machine in the prototype (`03:12`). Pin gives users the explicit "I want v0 today" toggle. Saves ~32 px of canvas vs v0 when unpinned. Three load-bearing fixes (onNavigate chain, focus suppression, unpin blur) per `project_v2_icon_rail` memory all hold (`05:62`). Strong precedent for the *mechanic* (Sentry, Cloudflare, Intercom, Supabase ship it).

**The case against.** Adversarial scores it 5/20 — lowest of the four (`02:296`). Cold-start is measurably worse than v0 (`01:282`). Default state inverts the vendor pattern (vendors ship hover-collapse as opt-in collapse, not as default — `06:97`). PM lane points out the rail hides exactly what the launch is teaching the market exists (`07:181`). Pin is the variant's self-confession that v0 was right (`02:104`). Three lanes (01, 02, 06) independently note that v2 is a less-confident v0, not a separate model.

**Most damaging single critique.** From competitive (`06:21`): "v2's collapse mechanic is not a separate variant — it is v0's documented collapsed mode." The variant exists because the prototype fragmented a compound pattern into two competing slugs. The adversarial lane delivers the same point in one line: "the pin is the entire variant's confession" (`02:104`).

**Recommendation:** **FOLD** into v0 as opt-in `compact-rail` mode. Kill the standalone variant slug. Harvest the state-machine craft (the work of `v2/rail.tsx:114-280` is real engineering and should not be lost). The adversarial lane's exact prescription: "ship v0 with a slimmer rail if 'calmer' is the goal" (`02:228`). A future variant slug can carry stacked-swap or scope-first; v2 should not occupy a slot.

### v3 — Icons-only with tooltips

**The case for.** Calmest visual at rest (`04:13`). Best canvas budget at 1024 px among always-rendered states. Cleanest tooltip surface decision (`04:127`). Lowest implementation complexity. Spatial stability is best of any variant.

**The case against.** Six of seven lanes rank it last or recommend killing it. IA: wrong precedent for the trajectory (`01:417`). Adversarial: tooltip graveyard, no defensible user, the universe is trying to tell you something (`02:18`). Interaction: dishonest — sells minimalism while shipping a 300 ms guessing game on every cold use (`03:42`). Competitive: zero multi-product enterprise precedents at our depth (`06:13`). PM: kills the launch story; punishes the auditor / exec / new-hire / demo audience (`07:24`). Even the visual lane (which ranks v3 first at rest) admits the win is undermined the moment users have to recognize five new pillar icons cold.

**Most damaging single critique.** From adversarial (`02:148`): "you cannot icon-only your way to recognition for a product that doesn't exist yet." The platform's trajectory (more products, brand-new pillar names, embargoed but coming) is the exact opposite of what icon-only navigation requires (small, fixed, learned vocabulary). v3 is the only variant whose central bet runs *against* the roadmap.

**Recommendation:** **KILL.** Remove from the prototype. The visual lane's "calmest at rest" attribute is real but isolated; every other lane and every strategic consideration says no. If a future variant wants the calm, it can adopt v3's typographic discipline without inheriting its information-architecture failure.

### v4 — Pop-out menus + ⌘B merged sidebar

**The case for.** Expanded mode is the strongest novel idea in the prototype (six lanes converge). Only variant that surfaces cross-product feature inventory at once (`01:447`). Strong current precedent (Cloudflare 2025) for the expanded half (`06:135`). Hover-menu carries more information per hover than v3's tooltip (`02:264`). Best long-term scaling at 9+ products if ⌘B is discovered.

**The case against.** Two variants stitched together; the stitch shows (`02:194`). Collapsed mode inherits v3's icon-vocabulary fatal flaw (six lanes). Most v4-specific defects of any variant in QA (5 — `05:131`). Three interaction holes in collapsed mode (corridor gap, ⌘B input-blind, mode-swap UI not dismissed — `03:558-583`). ⌘B is hidden from new users; the only on-screen affordance is a 32 px chevron at the bottom of the rail (`02:194`). PM lane: lowest reversibility of any variant (`07:314`). Compound mode-switching has no enterprise precedent at our scope (`06:138`). Default ships as collapsed, which inverts Cloudflare's reference recommendation (`02:200`).

**Most damaging single critique.** From adversarial (`02:194`): "v4 is two variants stitched together, and the stitch shows. Pick one mode and ship it as its own variant — that's the honest design." Combined with PM's read: "shipping it now means asking the market to learn a two-mode chrome at the same moment it's learning a multi-product platform. Two simultaneous learning loads is one too many" (`07:386`).

**Recommendation:** **PARK the variant; harvest v4-expanded as a ⌘B-toggleable optional mode on top of v0.** This is the adversarial lane's exact recommendation (`02:331`) and the competitive lane's "what working vendors actually ship" (`06:174`). The collapsed mode dies with the variant. The expanded mode lives on as an optional layout the user can opt into via keystroke, with proper discoverability (visible toggle, not just chevron).

---

## Section 7 — The recommendation

**Wallarm should ship v0 as the default global navigation, with v2's state-machine harvested into v0 as an opt-in `compact rail` mode and v4-expanded preserved as a ⌘B-toggleable optional layout. v3 and the standalone v2 / v4 variant slugs should be removed from the prototype. The next variant the prototype needs is a stacked-swap-secondary pattern (Sentry / Cloudflare 2025-26 direction); the IA-flagged scope-first reframe should be the variant after that.**

To be specific:

- **Default to ship: v0.** Tightened to 80 px rail (recover 16 px from current 96 px). Hover preview raised to 250 ms open / 200 ms close. AI panel focus management fixed (`requestAnimationFrame(() => textarea.focus())` on open; return-focus on close). Group-expand state lifted to localStorage. Skip-to-main link added to top bar. Visible focus rings audited and explicit on custom rail items.
- **Compact mode (companion to v0, not a separate variant):** harvest v2's state machine (pin, Esc, focus suppression, unpin blur, arrow keys, reduced-motion branch). Behavior is "v0 with a 64 px rail that hover-expands to 192 px and pins on user request." Default off; users opt into compact via a setting or via clicking a compact toggle in the rail. The variant slug `/v/v2/` retires; the *behavior* survives inside v0.
- **Optional expanded mode (⌘\\ or ⌘.):** harvest v4-expanded as an optional layout toggleable via a non-bookmark-conflicting key (interaction lane recommends ⌘\\ — VS Code's secondary side-bar — or ⌘. — Linear-style). Default off. Layout swaps to a Cloudflare-style merged sidebar with every product's top-level features inline. Drilled-scope handoff to v0's SecondColumn preserved. Visible toggle in the chrome, not just a hidden keystroke.
- **Killed and removed from the prototype:** v3 entirely. v2 as a variant slug (mechanic preserved, slug retired). v4 as a variant slug (expanded mode preserved as optional layout, collapsed mode killed).
- **Parked for later evaluation:** the v4-expanded pattern is the parked piece. The standalone v4 collapsed-with-pop-out variant does not return.
- **New variant the prototype needs next:** a **stacked-swap-secondary** prototype (`/v/v6/` or similar slug). The competitive lane (`06:154`) makes the case: Sentry's GA 2025 redesign and Cloudflare's recent Zero Trust direction both converged here, both are credited as best-in-class plug-in registration patterns, and none of v0–v4 explores it. Primary rail items don't navigate; they swap a secondary column. This is the pattern the prototype hasn't tried and the strongest external precedent for what comes after v0.
- **Variant after that:** a **scope-first** prototype (`/v/v7/` or similar). Per the recorded dissent in `docs/decisions.md` (the IA Researcher's parked B option) and re-flagged by the adversarial and PM lanes — if real users say "I want to switch the whole page to a different cluster / data plane / region," that's the signal product-as-primary-axis is a designer's mental model rather than an operator's, and we should test scope-first before doubling down on rails.

This is one product with three states, optionally elevated to four via ⌘B/⌘\\, with a deliberate research backlog of two further variants. It is not "pick one of four and ship it."

---

## Section 8 — Cross-cutting issues that aren't variant decisions

These survive any variant choice. Fix them at the framework level, not in any single variant.

1. **Tenant scope is unsolved across all four variants.** The placeholder dialog in `top-bar.tsx:54-66` is identical across v0/v2/v3/v4. None of them choose a scope noun (Tenant / Workspace / Account / Org), differentiate scope-gates-all-products vs scope-is-per-product, or address the "I'm in tenant A for some products and tenant B for others" case. IA lane (`01:603`) and adversarial (`02:306`) both flag this as the largest unsolved IA decision. **Action:** schedule a separate study (tree-test or first-click on scope nouns with 5 real customer-org admins) before this is settled. Out of scope for variant choice but a blocker for any production rollout.

2. **AI assistant push-panel has a focus-management bug.** Interaction lane (`03:567-575`) and QA lane (`05:124`) both raise it independently. On open, focus does not move into the panel. On close, focus is not returned to a sensible target. There is no Escape handler. **Action:** fix once at `src/nav/shell/ai-assistant-panel.tsx`. Affects all four variants equally; eliminating it in v0 fixes it everywhere.

3. **Group-expand state is lost on product switch in v0/v2/v3.** Interaction lane (`03:594-603`). v4 expanded mode is the only variant that preserves it (because all products mount simultaneously). **Action:** lift group-expand state to a per-variant `Map<string, boolean>` keyed by `product+group`, persisted in localStorage. Cross-cutting infrastructure improvement.

4. **No skip-to-main link anywhere.** Interaction lane (`03:84`). Affects all variants. **Action:** add to top bar.

5. **No `:focus-visible` styling on custom rail items.** Interaction lane (`03:609`). WADS components carry it; custom `<button>` and `<Link>` rails fall back to browser defaults that may have been reset by Tailwind preflight. **Action:** audit explicitly and add tokenized focus-ring rules.

6. **Cross-product feature-name collisions are baked into the manifest.** "Integrations" exists in three products. "Settings" exists as platform utility AND as per-product item. "Topology" exists in two products. "Overview" appears as default landing for three. IA lane (`01:614`) flags this. **Action:** card-sort study with customer-success on "given these three Integrations pages with these contents, do you understand which one is which from the label alone?" before any variant ships to production. This is a manifest-level concern not solved by any variant.

7. **Embargo strings ("AI Hypervisor" etc.) visible on the public deploy.** QA lane (`05:123`) flagged High. **Per `feedback_drop_dismissed_concerns` memory, Artem has decided this is acceptable for the prototype phase.** Noted; not relitigated. Will need scrub before the embargo lifts on 2026-06-04 if the prototype is shared externally.

---

## Section 9 — Validation plan

To close residual uncertainty between this synthesis and a production decision. Pulled from adversarial lane's recommendations (`02:359`) plus additions from the synthesis.

### Tier 1 — gate the recommendation (must run before commit)

1. **Icon-recognition test, n ≥ 12 across personas (L1 SOC, Senior SecOps, CISO, Auditor).** Show 4 product icons (current Edge, AI Hypervisor, Infra Discovery, Security Testing), ask to label. **Bar: ≥ 90% recognition on day 1 across all four products.** If failed, v3 and v4-collapsed are dead permanently — and v0's icon row only has to disambiguate among labeled products, so v0 is unaffected. *Pulled from `02:362`. Cheapest, highest-information test in the plan.*

2. **First-click test on cross-product navigation, n ≥ 12.** Tasks: (a) "open Attacks in Edge production" (b) "check Topology in AI Hypervisor" (c) "configure an integration for AI Hypervisor." Compare v0 (default), v0+compact (v2 mechanic harvested), v0+⌘B (v4-expanded as optional layout). Measure time-to-target and error rate. *Pulled from `02:363`.*

3. **Stress-condition usability session, n ≥ 6.** Slack notification + email + nav task simultaneously. Validates v0's "works under tunnel vision" claim and stress-tests whether the optional compact mode degrades that. *Pulled from `02:364`.*

### Tier 2 — gate the scaling assumption

4. **Manifest-density stress test.** Mock a 50-feature Hypervisor manifest and a 41+ feature Edge tree. Render every recommended state (v0 default, v0 compact, v4-expanded mode). Photograph at 1024 / 1440 / 3440 px. **If any state breaks at 50 features, it will be broken in production within two quarters.** *Pulled from `02:365`.*

5. **Pin-rate / mode-rate instrumentation in the prototype.** When the compact mode ships, measure (a) what % of users opt into compact, (b) what % of those pin within the first session, (c) what % use ⌘B-expanded mode at all, (d) mode-switching frequency among users who try expanded. *Pulled from `02:362` + `07:170`. Bar: if compact pin-rate exceeds 70%, the default is wrong; if expanded mode is used by < 5% of sessions, kill it.*

### Tier 3 — gate the reframe (would force a re-evaluation)

6. **Scope-first first-click test.** Build a `/v/v7/` prototype with scope (tenant / region / data plane) as the top-of-page context selector above product. Run the same first-click tasks as test 2. **If scope-first beats v0 on time-to-target,** the rail axis itself is a local optimum and the next redesign cycle re-frames around scope. *Pulled from IA Researcher's parked B option in `docs/decisions.md` and PM lane's `revisit if` clause in `07:407`.*

7. **Stacked-swap-secondary prototype.** Build a `/v/v6/` with Sentry-style stacked nav — primary rail swaps the secondary column rather than navigating. Test against v0 on the same task set. **If stacked-swap wins on cross-product feature-comparison tasks**, it replaces v4-expanded as the optional layout. *Pulled from competitive lane (`06:154`).*

### Tier 4 — quality / a11y gates

8. **Tooltip / hover-menu screen-reader audit** with a real JAWS or NVDA user, not just axe. v2's focus-suppression flag and v4's hover-menu focus-out guard both have known failure patterns under real assistive tech. *Pulled from `02:366`.*

9. **Mobile / tablet decision.** All four variants explicitly punt mobile (< 1024 px). Decide whether that's strategically acceptable before alignment, not after. If real mobile usage exists, the recommended v0 doesn't ship as-is. *Pulled from `02:367`.*

10. **Embargo scrub.** Before any external sharing, scrub `manifest/ai-hypervisor.manifest.ts` labels and the home `SummaryCard` for embargoed pillar names. Codename swap as needed. Noted but deferred per Artem's decision while the deploy stays internal-personal.

---

## Section 10 — Decision-log entry

To append to `docs/decisions.md` per the format in `team/agents/project-manager.md`.

```
## Decision: Stress-test verdict — ship v0 default + harvest v2 mechanic + park v4-expanded
**Date**: 2026-04-30
**Branch / MR**: synthesis on main (no MR — internal stress test across all four variants)
**Decided by**: Project Manager (synthesis lane), informed by 7-lane stress test
**Context**: Design lead requested a comprehensive battle of v0/v2/v3/v4 with a fully unbiased recommendation. Seven lanes (IA / adversarial / interaction / visual / QA / competitive / PM) ran independently. Five lanes ranked v0 first; six ranked v3 last; the competitive lane delivered the load-bearing reframe that v2 is structurally v0's collapsed mode rather than a competing variant.
**Options considered**:
  1. Ship v0 unmodified — pros: highest precedent count, best launch narrative fit, fewest QA defects, highest reversibility. Cons: 34% chrome at 1024 px (visual lane), performs no rhetorical "we re-architected" signal beyond more sidebar (adversarial), will creak at 9+ products (PM).
  2. Ship v2 — pros: best state-machine craft of the four (interaction lane), saves 32 px of canvas. Cons: lowest adversarial score (5/20), inverts vendor default-state convention (competitive), pin is the variant's self-confession (adversarial), hides the platform at the launch moment (PM).
  3. Ship v3 — pros: calmest at rest (visual). Cons: six of seven lanes rank it last; zero multi-product enterprise precedents (competitive); icon-only against brand-new pillar icons is a recall failure (adversarial / IA / PM); kills the launch story (PM).
  4. Ship v4 collapsed-by-default — pros: expanded mode is the prototype's strongest novel idea (six lanes agree). Cons: collapsed mode inherits v3's fatal flaw; most v4-specific defects in QA (5); three interaction holes; lowest reversibility; ⌘B is hidden; compound mode-switch has no enterprise precedent at our scope.
  5. Ship v0 default + v2 mechanic harvested as opt-in compact + v4-expanded as ⌘B optional layout (synthesis recommendation) — pros: aligns with what working vendors actually ship (compound default+collapse-behavior, not a variant set); preserves v2's state-machine craft and v4-expanded's novel idea while killing the unfinished halves; minimum-regret path. Cons: more engineering than picking one variant whole; introduces two optional layouts the team must maintain; doesn't fully resolve the "platform launch needs a we-re-architected signal" critique against v0.
**Decision**: Option 5. Ship v0 as the default with rail tightened from 96 → 80 px and hover-preview timing fixed. Harvest v2's state machine into v0 as an opt-in compact-rail mode (rail collapses to 64 px, hover-expands to 192 px, pinnable, Esc-collapses). Harvest v4's expanded merged-sidebar mode as an optional layout toggled by a non-bookmark-conflicting key (⌘\\ or ⌘.). Kill v3 entirely. Retire v2 and v4 as standalone variant slugs. Cross-cutting fixes (AI panel focus management, group-expand persistence, skip-to-main, focus-visible audit) ship before any external share. Next variant prototype: stacked-swap-secondary (Sentry / Cloudflare 2025-26 pattern). Variant after that: scope-first.
**Dissent**:
  - **Visual lane** wanted v4-collapsed-by-default with row-height and surface-language fixes. Position: v0 is the weakest visual at rest (34% chrome at 1024 px); v3 is the calmest. Reasoning rejected because visual elegance at rest does not trump platform-narrative legibility at the reveal — every other lane treats v0's chrome cost as the price of v0's load-bearing attribute (perceptual platform inventory).
  - **Interaction lane** wanted v2 as the conservative recommendation. Position: v2's state machine is best-in-class. Reasoning partially adopted — the state-machine craft is preserved by harvesting it into v0's compact mode, but v2 does not survive as a standalone variant because the underlying default-state bet is uncited in vendor precedent.
  - **The IA Researcher's recorded dissent on v5** (in `docs/decisions.md`) — that scope-first may be the right axis rather than product-first — applies to v0 as much as to v2/v3/v4. The synthesis recommends v0 *despite* that dissent, on the grounds that we ship the conventional answer for the launch moment and treat scope-first as the next bet (Tier 3 validation). Documented as the principal load-bearing dissent against v0 itself.
**Assumptions this rests on**:
  - The 2026-06-04 launch needs a navigation that *teaches the market the platform exists* (PM lane's framing question). If the answer were "serve the steady state we will reach in mid-2027," v2 or v4 would become defensible.
  - Product is the primary mental-model axis for the next 12 months. If real users say "I want to switch the whole page to a different tenant / region," scope-first leapfrogs all four rail variants.
  - Product count stays ≤ 8 through the launch and the four quarters following. v0 starts to creak at 9+; the v4-expanded optional layout becomes the favored upgrade path at that point, not v2's compact mode.
  - Mobile / tablet (< 1024 px) remains explicitly out of scope for the prototype phase.
  - The placeholder tenant scope dialog will be replaced by a real scope picker before production. Cross-cutting; not addressed by variant choice.
**Revisit if**:
  - Product count crosses 9 — re-prioritize v4-expanded as the favored layout and tighten "default density" question.
  - Internal pilot shows ⌘K usage above 25% of nav events in week 2 — sidebar isn't doing its job at any density; promote scope-first / workbench prototypes ahead of further rail iteration.
  - Post-reveal qualitative signal that operators want to "switch the whole page to a different tenant / data plane / region" without changing product — scope-first leapfrogs the rail axis entirely.
  - Compact-mode pin-rate exceeds 70% in instrumented use — the default is wrong; the compact mode should become the default.
  - Expanded-layout (⌘B/⌘\\) usage stays below 5% of sessions after first month — kill it.
  - Mobile becomes a real surface — none of the recommended states survive a phone screen unmodified; the variant we'd need is closer to v4-collapsed and the entire decision re-opens.
  - Stacked-swap (`/v/v6/`) prototype testing shows users prefer it for cross-product configuration tasks — it replaces v4-expanded as the optional layout.
```

---

## Appendix — Source files cited

- `/Users/artem/Documents/work-projects/global-navigation-prototype/docs/proposals/stress-test/01-ia-audit.md`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/docs/proposals/stress-test/02-adversarial.md`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/docs/proposals/stress-test/03-interaction.md`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/docs/proposals/stress-test/04-visual.md`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/docs/proposals/stress-test/05-qa.md`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/docs/proposals/stress-test/06-competitive.md`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/docs/proposals/stress-test/07-pm-frame.md`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/docs/charter.md`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/docs/decisions.md`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/docs/variants.md`
- `/Users/artem/Documents/work-projects/global-navigation-prototype/team/agents/project-manager.md`
