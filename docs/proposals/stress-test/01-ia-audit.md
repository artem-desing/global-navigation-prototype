# IA Audit — v0 / v2 / v3 / v4 stress test

Lane: **Information Architecture only.** Visual fidelity, motion, copy,
keyboard ergonomics, and competitive vendor critique beyond IA precedent are
out of scope here — other lanes own those.

Author: Principal IA Researcher. Date observed: 2026-04-30.
Variants compared: v0 (always-open sidebar), v2 (icon rail with hover-expand),
v3 (icons-only with tooltips), v4 (pop-out menus + ⌘B merged sidebar).
v5 (workbench tabs) is intentionally excluded per scope.

Source-of-truth manifests inspected: `edge`, `ai-hypervisor`, `infra-discovery`,
`testing` (products) plus `docs`, `settings`, `user` (platform utilities).
Scope/tenant model inspected via `src/nav/url.ts` (`resolveShellContext`) and
`src/nav/variants/v0/top-bar.tsx`.

---

## 1. Executive summary

- **Strongest IA: v0.** It is the only variant that surfaces the platform's
  three-tier model (product → top-level features → drilled scope) all at once
  on the screen. First-glance information scent for a new user is highest;
  cross-product wayfinding is unambiguous because the rail is a permanent
  artefact, not a conditional one. The cost is horizontal real estate.
- **Weakest IA: v3.** Permanently icon-only product slots leak the entire
  vendor-icon-vocabulary problem: at four products you can fake it; at ten
  the product axis becomes a memory test. Information scent collapses to the
  literal pixel pattern of an icon. Tooltips do not restore it — a tooltip
  is a recall aid, not a discoverability aid.
- **Most underrated: v4.** The dual-state model (collapsed pop-outs + ⌘B
  merged column) is the only variant that lets a power user *see all
  products' top-level features simultaneously* (Cloudflare-style) while
  keeping the canvas wide for daily work. Its IA risk is not the IA, it's
  the discoverability of the ⌘B keystroke — which is a microcopy/onboarding
  problem, not an information-architecture one.

---

## 2. Per-variant analysis

### Notes that apply to all four variants

Before I grade, three structural facts of the prototype apply equally to all
four — they are properties of the **manifest**, not of any variant:

1. **Tenant scope lives in the top bar** as a `<button>` that opens a
   placeholder dialog (`v0/top-bar.tsx` lines 54–66). This is identical in
   v2/v3/v4 because they all reuse v0's `TopBar`. Tenant clarity is
   therefore a constant across the four variants — none of them can be
   credited or blamed for it. The IA question "where does scope live, is it
   always visible" has the same answer everywhere: top-bar chip, label
   reads "tenant" (lowercase placeholder), no hierarchy of scope nouns yet.
   This is a **prototype gap to flag separately**, not a variant
   differentiator. (See risks §4.)
2. **Drilled scope (e.g. into a specific Edge data plane) is rendered by
   v0's `SecondColumn` in every variant.** v0 always renders it; v2 always
   renders it (it imports v0's SecondColumn directly); v3 always renders
   it; v4 conditionally renders it when `ctx.backHref !== null` or under
   `/settings/*`. So scope-drill IA is identical across v0/v2/v3 and a
   superset in v4 — v4 chooses *when* to surface the same component.
3. **Product slot count is fixed at four products** in the manifest today
   (Edge, AI Hypervisor, Infra Discovery, Security Testing) plus three
   platform utilities (Docs, Settings, User). Scalability questions below
   reason hypothetically about 10 / 20 / 30 products. Today's prototype
   doesn't render that, but the variant chrome does or doesn't accommodate
   it — that's the IA-relevant bit.

---

### v0 — Always-open sidebar

**Slug:** `v0`. **Chrome:** ~96px rail (icons + labels under each icon, full
words shown) + 256px persistent SecondColumn for the active product +
canvas. Source: `src/nav/variants/v0/{shell,rail,second-column}.tsx`.

#### Steel-man (best IA argument FOR v0)

The platform's mental model is three concentric scopes:

1. **Tenant** — which customer org am I in? (top bar)
2. **Product** — which of N security products am I working in? (rail)
3. **Section / feature** — within this product, where am I? (second column)

v0 is the only variant that renders all three layers permanently. A user
who has just landed in the console can answer "where am I?" without a
hover, a click, or a memorised keystroke. The rail's product list is also
the **canonical product inventory** of the platform — the vendor's
narrative ("we have four products") is structurally embodied in what's on
screen at idle. Newcomers internalise the platform shape by *seeing it*,
not by exploring it.

Information scent is maximised because every feature label is visible at
all times for the active product, and every product label is visible at
all times. A first-click test on "where do I find Heatmap?" succeeds with
zero recall load: the user reads "AI Hypervisor" (label visible on rail),
clicks it, reads "Heatmap" (label visible in second column), clicks it.
Two clicks, both label-readable, no tooltip.

It also matches today's Wallarm Console mental model most closely
(`docs/current-ia.md`) — today's sidebar already does this work for one
product. v0 generalises it to N products without rewiring users' habit.

Vendor precedent: Datadog (always-visible left nav with products and
sections), AWS Console (services rail + per-service sub-nav), Snyk
(persistent left nav with project context). All multi-product security /
observability consoles converge here for a reason — the operator's day
involves frequent cross-product moves, and the cost of *making them think
about how to navigate* compounds.

#### Attacks (where IA breaks)

- **The sidebar's two columns conflate two axes that are architecturally
  different.** The rail shows products + platform utilities (Docs / Settings
  / User), all in the same visual treatment. A new user has no IA cue that
  Edge and Settings are different *kinds* of things. The bottom-stack
  separation (utilities at bottom) is a visual hint, not a structural one;
  it can be missed at a glance. (Caveat: this is a manifest-level concern
  that affects v2/v3/v4 too, since they inherit the same rail logic. v0
  isn't worse here — but its visibility makes the conflation more obvious.)
- **96px rail × N products is the binding constraint.** Today four
  products fit comfortably with labels shown. At 10 products with current
  vertical density (icon + label + 4px gap = ~52px), the rail can still
  fit on a 1080px display. At 20 products, lower entries fall below the
  fold and require scrolling — and a scrolling rail is an IA failure
  (cross-product nav must be one-glance). v0's "always shown" promise
  becomes "shown if you scroll," which is not the same thing.
- **The second column is locked to the active product.** A user comparing
  "where does Integrations live for AI Hypervisor vs. Infra Discovery"
  can't see both at once. v0 forces a visit to each product's tree to
  diff. (v4's expanded mode is the only variant that solves this.)
- **Group labels are not URL segments.** In the manifest, "Events,"
  "API Security," "Security controls" etc. are `GroupNode`s — visual
  dividers without their own routes. v0 renders them inline in the
  SidebarTree. From an IA standpoint this is a tradeoff: it preserves the
  flat-feature URL space, but it means breadcrumbs (`src/nav/url.ts`
  `findGroupAncestorLabels`) have to *reconstruct* group membership at
  render time. If a feature ever gets re-grouped, no URL changes — the
  user's existing tabs / bookmarks survive — but their mental model of
  "Attacks lives under Events" silently shifts. This is a mild IA risk
  (silent re-grouping erodes trust), not a flaw in v0 specifically.

#### Task walkthroughs

**(a) "I just got paged about a runtime threat in tenant X."**

1. User lands at `/v/v0/`. Reads top-bar tenant chip, sees they are in the
   wrong tenant. Clicks chip → tenant dialog (placeholder) → switches.
   IA assessment: tenant is in the right place (top, persistent). Chip
   wording "tenant" is a placeholder weakness, not v0's fault.
2. Rail shows four products. "Runtime threat" is ambiguous between Edge
   (runtime traffic / attacks) and AI Hypervisor (AI-runtime concerns).
   User has to *decide* which product owns runtime threats. This is a
   manifest ambiguity, not a v0 ambiguity, but v0 makes it visible —
   you see both icons and read both labels and pick.
3. Picks Edge → SecondColumn opens with full tree, "Events" group
   uncollapsed → "Attacks" → click. Three label-readable clicks total.

Verdict: v0 makes step 2's ambiguity *visible* (good — surfaces the IA
question for the user to resolve) but doesn't *resolve* it (the manifest
must). Score: **A** for nav efficiency, **B+** for ambiguity handling.

**(b) "I'm setting up a new integration for AI Hypervisor."**

1. Rail → AI Hypervisor → SecondColumn loads with Heatmap landing.
2. "Integrations" is the 8th item in AI Hypervisor's top-level features
   (verbatim from product UI per memory). User scans, finds it, clicks.

But: **"Integrations" also exists in Edge** (under Configuration group)
**and in Infra Discovery** (top-level). Three products each have their
own Integrations page. v0's IA at least makes this *legible*: opening
each product, the user sees its Integrations item in context, so the
mental model "integrations are per-product" forms naturally. A new user
who first lands in Edge and clicks Integrations there and configures
something for AI Hypervisor will be confused — but **no variant** solves
this manifest-level ambiguity.

Verdict: **A** for the local nav task; the cross-product Integrations
collision is a manifest concern documented in §4.

**(c) "I'm a new user who doesn't know what's a product vs feature."**

v0 is the most forgiving here. The rail's labels and second column's
labels are both readable. After 30 seconds of looking at the screen, the
user has internalised: "the four big things on the left are products,
the things in the middle column are features inside the current product."
The mental model forms by direct perception, not by exploration.

Verdict: **A.**

#### Scalability verdict (v0)

| Dimension | 4 products | 10 products | 20 products | 30 products |
|---|---|---|---|---|
| Rail fits in viewport | yes | yes (1080p) | scroll required | scroll required |
| Cross-product wayfinding clarity | high | high | medium | low |
| Per-product feature density (5 / 10 / 20) | comfortable | comfortable | tight | overflow |

v0 scales **linearly and visibly**. No hidden ceiling — the screen runs
out before the IA does. That is actually a feature for a stress test: you
can *see* when the model breaks, instead of being surprised by it.

#### Vendor pattern resemblance

Datadog circa 2024 (icon+label rail), AWS Console (services list rail),
classic Snyk (multi-pane). All of these are well-established multi-product
security / observability patterns. **Good IA precedent, not cargo-culted.**
Kong/Konnect (per memory `project_kong_konnect_ia`) ships a similar model
and its scope-noun decisions (Org / Workspace / Region) are exactly the
ones the prototype hasn't decided yet — which is corroborating, not
contradicting.

---

### v2 — Icon rail with hover-expand

**Slug:** `v2`. **Chrome:** 64px icon-only rail at rest, expands to 192px
on hover or click-to-pin, revealing labels. Same SecondColumn as v0.
Source: `src/nav/variants/v2/{shell,rail}.tsx`.

#### Steel-man

v2 is v0 with a power-user accelerator. Once a user has internalised the
product set (which icon is AI Hypervisor, which is Edge), the labels are
redundant — they take horizontal space and offer no new information per
glance. v2 collapses that real estate by default and gives it to the
canvas.

The hover-expand behaves like a **deferred discovery affordance**: the
icons are recognition, the hover reveals recall when needed. Pinning is
the explicit "I want v0 today" toggle for users who want the labels back.

The IA implication: v2 doesn't change the model, it changes the *cost
function* of accessing the model. For a user navigating cross-product 50
times a day (incident responder triaging across Edge and AI Hypervisor),
v2 saves ~32px × the height of the workspace per page load. For a user
who lives in one product (say a security analyst working only in Edge),
v2 saves them nothing — but also costs them nothing once they've pinned
or learned the icons.

Vendor precedent: Intercom (hover rail), Sentry (hover-peek + pin),
GitHub Mobile-style rail. The pattern is a known, named affordance in
modern enterprise UI.

#### Attacks

- **Hover is a learned affordance, not a discovered one.** A new user
  who lands on v2 sees four icons. They may or may not realise that
  hovering expands. They may or may not realise that pinning persists.
  Information scent at idle is *lower than v0* — measurably, because
  fewer pixels carry meaning. The IA question "what is this product?"
  used to be answered by reading; in v2 it's answered by hovering plus
  reading. That's an extra step.
- **The hover-expand overlay covers the canvas's leftmost column.**
  When unpinned, the rail-overlay floats over content. For a power user
  this is fine (they hover, read, click, the overlay collapses). For a
  new user it is *more disorienting* than v0 — content moves under
  their cursor.
- **"Pin" is a universally weak affordance.** Across vendor product
  UIs, the pin/unpin control is one of the lowest-discoverability
  controls (Intercom 2025 product UI puts it in the bottom-left corner;
  most users never click it). v2's pin lives top-right of the expanded
  rail. In an IA-only sense, this means *the variant cannot be relied
  upon to default to its expanded state* for new users — they will live
  in icon mode.
- **At 4 products, v2's compression is mostly free; at 20 products,
  it's still icon-bound.** v2 doesn't fix the icon-vocabulary problem
  (see v3) — it merely defers it to the moment of hover. Power users
  acquire the vocabulary; new users are punished.

#### Task walkthroughs

**(a) Runtime threat in tenant X.** Same as v0 once expanded. Hover
penalty: ~120ms before labels appear (per `OPEN_DELAY_MS` in
`v2/rail.tsx`). Marginal IA cost in a paged-incident moment where
muscle memory hasn't formed. Verdict: **B+** for incident-response
context (hover delay non-zero, but tolerable).

**(b) Setting up integration for AI Hypervisor.** Identical to v0 once
labels are showing. Verdict: **A**.

**(c) New user, doesn't know products vs features.** v2 is **measurably
worse than v0** here. The new user sees 4 icons + 3 utility icons at
the bottom. With no labels visible, they cannot tell at a glance what
the platform's product inventory is. They must hover (which they may
not think to do), or pin (which they will not discover within the
first session), or wait for the second column's title to load after
clicking. Each of those is a recall-vs-recognition flip. Verdict: **C**.

#### Scalability verdict (v2)

| Dimension | 4 products | 10 products | 20 products | 30 products |
|---|---|---|---|---|
| Rail fits | yes | yes | yes (icon-only) | tight (icon-only) |
| Cross-product wayfinding | high (pinned) / low (icon-only) | medium | low | very low |

v2's scaling is bimodal: pinned, it's v0; unpinned, it degrades faster
than v0 because more items at the same icon density means a higher
recall load per glance. There's no IA-level pressure release — at 30
products with icons only, even daily users will misclick.

#### Vendor pattern resemblance

Intercom 2024–2025, Sentry, Linear (sidebar resize). All productivity /
support tools, **not** multi-product security consoles. The closest
multi-product security parallel is Cloudflare's pre-2024 dashboard — and
Cloudflare moved off this pattern toward an expanded-by-default merged
sidebar (which is v4's reference). This matters for IA precedent: the
pattern is well-attested *in adjacent verticals*, but the security /
observability vendors that actually live in this space have largely
moved away from it. **Mild precedent risk** — worth validating that
Wallarm's operator persona resembles Intercom's user persona more than
Cloudflare's, before committing.

---

### v3 — Icons only with tooltips

**Slug:** `v3`. **Chrome:** permanent 64px icon strip; labels surface as
tooltips on hover with a 300ms delay. No expand state ever. Same
SecondColumn behavior. Source: `src/nav/variants/v3/{shell,rail}.tsx`.

#### Steel-man

v3 is the maximum-canvas variant. Any cm² of horizontal space saved goes
to the user's actual work. The argument is most compelling for users who
already know the product set cold — e.g. a daily Wallarm operator with
two years on the platform — and least compelling for everyone else.

The IA case is: at-rest information scent is provided by the **icon
itself**, not by a label. Tooltips are a remediation, not a primary
affordance. v3 commits fully to that bet.

Vendor precedent: Amplitude (per `docs/variants.md`), VS Code's activity
bar, Postman desktop. All tools where the product set is *small and
fixed and learnable*.

#### Attacks (this is where IA breaks)

- **The vendor product-icon vocabulary problem is fatal at scale.**
  Today: Edge (`globe-lock`), AI Hypervisor (`memory`), Infra Discovery
  (`layers-3`), Security Testing (`skull`). Distinguishable. Now imagine
  Wallarm ships product #5 (say "AI Gateway"), product #6 ("Identity
  Posture"), product #7 ("Secrets Detection"), product #8 ("Compliance
  Auditor"). The icon set inside `@wallarm-org/design-system` is ~189
  icons (per memory) — but **distinct, semantically clear, security-
  relevant icons** in that set number well below 20. By product #10, you
  are picking icons that are visually similar (two shields, two locks)
  or semantically forced. Information scent from icon alone collapses.
- **Tooltips are recall aids, not discoverability aids.** A new user
  hovering at random over icons has to do this systematically to learn
  the product set. v0 lets the eye pre-attentively scan all four product
  names in 200ms. v3 forces a 300ms tooltip delay × N hovers. The IA
  cost of *first-session product inventory acquisition* is roughly
  300ms × N products + reading + pointer-move cost. At N=4 that's
  tolerable; at N=10 it is not.
- **Tooltips compete with the system for the same gesture.** Hover
  over an icon to see its label, click to navigate, but mouse-rest on
  an icon while reading content (because the rail is at canvas-left and
  the cursor naturally idles there) triggers tooltips repeatedly. This
  is an interaction concern that bleeds into IA: it makes the *labels-
  available* state feel transient and unstable, which undermines trust
  in the rail as a wayfinding artefact.
- **No state distinguishes "I know where I am" from "I don't."** v3
  presents identically to a 5-second user and a 5-month user. v0 lets
  the user *progressively dismiss* labels (mentally) as they internalise
  them; v3 has no such progression — it's all-icon for everyone forever.
  This is a flat IA, not a layered one.
- **Group context inside a product is invisible from the rail.** v0's
  rail tells you which product you're in by highlighting the active
  rail item. v3 does too. But once you're inside a product, the second
  column is the same in both — so v3 is no worse here. The IA cost is
  entirely paid at the cross-product layer.

#### Task walkthroughs

**(a) Runtime threat in tenant X.** Tenant via top bar (same as all).
Then: which icon is the runtime threat product? At four products, you
hover. At ten products, you hover *several*. In a paged-incident
context, this is meaningfully worse than v0 — incident responders
have time-pressured recognition tasks, and v3 forces recall.
Verdict: **C** in incident context.

**(b) Setting up integration for AI Hypervisor.** Pick the AI
Hypervisor icon (memory chip). Reasonable for the four-product case
(memory chip is fairly distinctive). At ten products, this is the
moment a user picks the wrong icon, lands in Infra Discovery
("Integrations" is also a top-level item there), and configures the
wrong thing. The IA failure is *silent and consequential* — the user
is in the wrong product but can't tell, because the rail doesn't
label anything. Verdict: **C/D** depending on icon distinctiveness.

**(c) New user, doesn't know products vs features.** **D.** A new
user opening v3 sees seven icons stacked vertically. There is *no
label visible anywhere* until they hover. They cannot answer "what is
this platform?" without a hover sequence. The platform's product
narrative ("we are four products") is structurally invisible. For the
2026-06-10 reveal — where the goal is "feels like one control plane"
— v3 is the variant that least communicates the product set.

#### Scalability verdict (v3)

| Dimension | 4 products | 10 products | 20 products | 30 products |
|---|---|---|---|---|
| Rail fits | yes | yes | yes | tight |
| Cross-product wayfinding | medium | low | very low | broken |
| Recall load | manageable | high | very high | unmanageable |

v3 scales **vertical pixels** but does not scale **mental load**. The
icon vocabulary ceiling is structurally low.

#### Vendor pattern resemblance

Amplitude (single product, ~6 sections) — apt comparison only because
Amplitude is *not* a multi-product platform. VS Code (5 activity-bar
icons, fixed). Postman (similar). All of these are tools where the icon
set is curated, semantic, and small. Wallarm's roadmap (per
`docs/charter.md`) is the opposite trajectory — *adding* products
quarterly. **Wrong precedent for the trajectory.** This is the closest
to "cargo-culted" of the four variants, IA-wise.

---

### v4 — Pop-out menus + ⌘B merged sidebar

**Slug:** `v4`. **Chrome:** 64px collapsed icon rail with hover-pop-out
section menus per product *plus* a ⌘B-toggled 256px expanded "merged
sidebar" that lists every product's top-level features inline. Settings
and drilled scopes still get v0's SecondColumn. Source:
`src/nav/variants/v4/{shell,rail,expanded-rail}.tsx`.

#### Steel-man

v4 is the only variant that gives the user **a choice of mental model**:

1. *Collapsed mode (default-ish):* canvas-maximised, hover any product
   icon to see its top-level features as a floating panel. Equivalent
   information scent to v3 *plus a peek* — the hover panel shows full
   feature labels, so within ~120ms of cursor-on-icon the user knows
   not just what the product is but its sections.
2. *Expanded mode (⌘B):* the entire platform's top-level features are
   visible inline in a 256px "merged sidebar." Edge → Overview / Data
   planes / Dashboards / etc., AI Hypervisor → Heatmap / Registry /
   Topology / etc., all stacked. This is the **only variant that lets
   a user see the full feature inventory of every product at once**,
   without clicking. For cross-product tasks ("where do I configure
   integrations across all products?") this is a genuine IA innovation
   in the prototype — none of the other variants surface this view.

The hover-menu mode also handles the **icon-vocabulary problem** that
sinks v3: even if a user can't tell the icons apart, hovering surfaces
the section list, which carries enough context (e.g. "Heatmap, Registry,
Topology" vs "All assets, Untagged, Topology") to disambiguate the
product without reading the product name. That is, **v4's hover panel
provides icon-disambiguation by content rather than by label**, which
is robust against iconography exhaustion at scale.

Vendor precedent: Apollo.io (collapsed pop-out menus per product),
Cloudflare 2025 dashboard (expanded merged sidebar with Workers / R2 /
KV / etc.). Cloudflare specifically made this transition recently —
moving from a per-product nav model to a merged-and-collapsible one —
which corroborates this as **a current best practice for multi-product
infrastructure consoles**, not a retro pattern.

#### Attacks

- **Two-mode chrome is two mental models the user must hold.** v4 asks
  the user to know *both* "icons + hover-menu" and "merged sidebar"
  navigations. Power users will pick one and live in it; new users
  will be confused by the asymmetry — especially because ⌘B is a
  hidden affordance with no on-screen entry point in collapsed mode.
  The **collapse-button at the bottom of the expanded rail** does
  surface ⌘B's reciprocal action (`expanded-rail.tsx` line 614), but
  the *expand* affordance is keyboard-only-ish (there's a chevron
  button at the bottom of the collapsed rail; `rail.tsx` line 187, but
  it competes for attention with utility icons).
- **Hover-menu × utility = potentially weird interaction.** Settings
  is a "rich utility" that bypasses the hover-menu and goes straight
  to a v0 SecondColumn. That's a sensible IA exception (Settings has
  many sub-items and a SecondColumn fits the pattern), but it means
  the user has to learn that *most rail items pop out a hover menu,
  but Settings doesn't*. This is a rule-with-exceptions IA, which is
  always weaker than rule-without-exceptions IA. (Mitigation: Docs is
  also exceptional — it opens an external URL — so the user is
  primed to expect bottom-stack items to behave differently.)
- **The "drilled scope" rule is doubly conditional.** v4 chose to
  surface the v0 SecondColumn only when (a) the path is `/settings/*`
  OR (b) `ctx.backHref !== null` (i.e. user has drilled into a scoped
  resource like a specific data plane). For everything else, the user
  is in pop-out / merged-sidebar mode. This is a sound rule, but it
  means **the chrome shape changes mid-flow**: a user in Edge top-
  level sees no SecondColumn, drills into a data plane, and suddenly
  a SecondColumn appears. From an IA standpoint this is *honest*
  (the chrome reflects scope state) but *jarring* (the spatial layout
  changes). v0 doesn't have this problem because the SecondColumn is
  always there.
- **Expanded merged sidebar shows top-level features only, not the
  drilled tree.** Scrolling Cloudflare-style through every product's
  Section list at once is great for cross-product comparison, but the
  drilled-scope tree (`Edge → Production data plane → Services →
  myservice → Routes → ...`) does NOT live in the expanded sidebar; it
  lives in the SecondColumn. So the expanded sidebar is a **flat-
  product comparison view**, not a single source of nav truth.
  Sophisticated, but adds a layer of "where does the deep tree live?"
  that v0 answers identically (deep tree is the SecondColumn) but
  without the parallel flat view.

#### Task walkthroughs

**(a) Runtime threat in tenant X.** In collapsed mode: hover product
icons to find one whose section list mentions Attacks / Events. The
hover panel resolves the ambiguity quickly (~120ms hover delay).
Click Edge → Attacks. Verdict: **B+**, the hover-menu's section
preview is a genuine help over v3 here.

In expanded mode (if ⌘B was discovered): scan the full sidebar, find
"Events → Attacks" under Edge, click. Verdict: **A**.

**(b) Setting up integration for AI Hypervisor.** Collapsed: hover
AI Hypervisor icon → menu shows all 10 features including
Integrations → click. **A.** Expanded: scroll to the AI Hypervisor
section, find Integrations, click. **A.**

But: in expanded mode, the user can also **see Edge's Integrations
and Infra Discovery's Integrations on the same screen.** This is
the variant where the cross-product Integrations ambiguity becomes
*visible and resolvable* without clicking through each product. v4
is the only variant that surfaces the manifest's cross-product
collisions naturally. **A+ for cross-product comparison tasks.**

**(c) New user, doesn't know products vs features.** Collapsed
mode (default): same problem as v3 — icons only, no labels visible
at idle. **C.** But the hover-menu reveals far more on first hover
than v3's tooltip does (whole section list, not just the product
label), so the recovery from "I don't know" is faster. Effective
score: **B-** for v4 default, **A** if expanded mode is the user's
first encounter.

The big IA question for v4 is **what state new users land in**. If
collapsed-by-default, v4 inherits v3's first-session weakness (with
faster recovery). If expanded-by-default, v4 is plausibly better than
v0 for new users. The current implementation (`useExpandedRail`
hook) reads from localStorage and defaults to `false` (collapsed) on
first paint — meaning **first-session users today would see v4 as a
v3 with hover-menus**. That is an IA decision worth re-litigating.

#### Scalability verdict (v4)

| Dimension | 4 products | 10 products | 20 products | 30 products |
|---|---|---|---|---|
| Collapsed rail fits | yes | yes | tight | scroll |
| Expanded sidebar fits N products' top features | yes | yes (scroll) | scroll | heavy scroll |
| Cross-product wayfinding (collapsed) | hover-menu high | high | medium | low |
| Cross-product wayfinding (expanded) | high | high | medium-high | medium |

v4 is the variant whose IA *improves* relative to others as N grows,
because the expanded mode is the only model where the user can see
the full feature space without clicking around. At 30 products,
expanded-v4 is still navigable (scroll) where v0 has run out of
vertical pixels and v3 has run out of icon vocabulary.

#### Vendor pattern resemblance

Apollo.io's collapsed product rail with hover sub-menus, Cloudflare's
2025 expanded merged sidebar. Both **current** (not legacy) patterns
in serious multi-product platforms. Apollo is a sales tool not a
security console — modest precedent fit. Cloudflare is the closest
multi-product infrastructure parallel and they recently committed to
this pattern. **Strong, current IA precedent for the trajectory
Wallarm is on.**

---

## 3. Comparison matrix

| Criterion | v0 | v2 | v3 | v4 |
|---|---|---|---|---|
| Mental-model fit (3-tier scope) | **A** — all 3 layers visible at idle | **B** — 2 layers visible (rail icons + canvas), 3rd on hover | **C** — only 1 layer carries labels at idle (canvas) | **B+** — hover-menu or ⌘B reveals the full layer hierarchy on demand |
| Scope/tenant clarity | **C** (all variants tied — placeholder dialog) | **C** | **C** | **C** |
| Discoverability of new product | **A** — appears in rail with label, instant recognition | **B** — appears in rail as icon, label on hover | **C** — appears as a new icon among many; recognition depends on icon choice | **B+** — collapsed: same as v3 with hover-menu; expanded: same as v0 |
| Information scent (first glance) | **A** — every product+feature label readable | **B** — products labeled when expanded, icon-only at rest | **C** — icons only; tooltip-on-hover is recall not recognition | **B-** collapsed / **A** expanded |
| Scalability to 10 products | **A** | **B** | **C** | **A** (expanded) / **B** (collapsed) |
| Scalability to 20 products | **B** (rail starts to scroll) | **B-** (icon-only, but density OK) | **D** (icon vocabulary collapses) | **B+** (expanded scrolls but stays scannable) |
| Scalability to 5 / 10 / 20 features per product | **A / A / B** | **A / A / B** (same SecondColumn) | **A / A / B** (same SecondColumn) | **A / A / B** (same SecondColumn or expanded sidebar scroll) |
| Ambiguity handling (cross-product collisions) | **B+** — visible per-product, not directly comparable | **B** — same as v0 once expanded | **C** — invisible until clicked | **A** — expanded mode shows collisions side by side |
| Vendor-pattern precedent fit | **A** — Datadog / AWS / Snyk | **B** — Intercom / Sentry; weaker for security verticals | **C** — Amplitude / VS Code; small-product-set tools | **A** — Cloudflare 2025 / Apollo; current security/infra precedent |

Cells should be read as IA-only judgements. A cell graded **C** is not a
death sentence for the variant — other lanes (visual, interaction, motion)
may compensate, and a single A in a load-bearing criterion can outweigh
several Bs.

---

## 4. Top 3 IA risks across the set

These are risks that *no variant solves on its own* — they are properties
of the manifest, the scope model, or the platform narrative. Surfacing them
here so the synthesis lane doesn't pin them on a single variant.

### Risk 1 — Tenant scope is undecided across all four variants

The tenant chip in the top bar (`v0/top-bar.tsx` line 54) is a placeholder
labeled `"tenant"` that opens a non-functional dialog. None of v0/v2/v3/v4
choose a scope noun (Tenant / Workspace / Account / Org), none differentiate
between scopes that gate ALL products vs scopes that are per-product, and
none address the "I'm in one tenant for some products and another for
others" case (which exists in real customer deployments).

This is the largest **unsolved IA decision in the prototype**, and it sits
above the variant choice. Choosing v0 vs v4 will not affect it — the same
chip in the same place will inherit whatever scope-noun gets decided.
Recommend a separate study (tree-test or first-click on scope nouns with 5
real customer-org admins) before this is settled.

### Risk 2 — Cross-product feature-name collisions are baked into the manifest

"Integrations" exists in Edge (group: Configuration), AI Hypervisor (top-
level), and Infra Discovery (top-level). "Settings" exists as a platform
utility AND as a per-product item in Edge (`/edge/data-planes/<id>/setting`)
and Security Testing. "Topology" exists in AI Hypervisor (group) and Infra
Discovery (top-level). "Overview" appears as default landing for three of
four products.

Any variant inherits this collision. **v4 (expanded mode) is the only
variant that makes the collision visible** (you can see all three
Integrations entries in the merged sidebar at once). v0 / v2 / v3 hide it
behind product navigation. From an IA standpoint, surfacing collisions is
a feature of v4, not a bug — but it is also a forcing function: the
merged sidebar will *demand* clarification of what the duplicated names
mean.

Recommend: a card-sort study with Wallarm's existing customer-success team
on the question "given these three Integrations pages with these contents,
do you understand which one is which from the label alone?" before any
variant ships.

### Risk 3 — The drilled-scope chrome shift is unique to v4 and may be unintended

In v0/v2/v3, the SecondColumn is always present when in a product. In v4,
it appears *only* when (a) the path is `/settings/*` or (b)
`ctx.backHref !== null` (drilled into a scoped resource).

For v4 specifically, this means the spatial chrome **changes shape mid-
flow**: clicking from `/edge/data-planes` (no SecondColumn — just the
hover-menu / merged sidebar) to `/edge/data-planes/<plane-id>/services`
(SecondColumn appears) is a real layout transition. The user's mental
model is updated by the chrome *responding to scope state*, which is
defensible IA — but it is also potentially disorienting. v0/v2/v3 don't
have this issue because the SecondColumn is always rendered.

Recommend: validate the drilled-scope transition with an interaction
walkthrough (lane: interaction-designer, not IA) and a first-click test
on "I drilled into a data plane and now where am I?" In IA terms, the
trade-off is: v4 saves screen real estate at idle and pays a layout-shift
cost on drill; v0 pays a real-estate cost at idle and never has the
shift. Which trade-off fits the operator persona is the open question.

---

## 5. IA-only recommendation

**On IA grounds alone, v0 should win, with v4 as the close second-best
and the variant most worth investing in if/when the platform's product
count crosses ~8.**

Reasoning:

- **For the 2026-06-10 reveal**, the goal per `docs/charter.md` is "feels
  like one control plane" — i.e. the *narrative of being a multi-product
  platform must be perceptually obvious*. v0 is the variant that
  structurally embodies this narrative on screen at idle: the rail's
  product list IS the platform's product inventory, labeled and
  legible, with every product's first-level features one click away in
  the SecondColumn. v3 hides that narrative behind icons; v2 hides it
  pending hover; v4 hides it pending hover (collapsed) or ⌘B
  (expanded). For first-session, demo-context, "this is the platform"
  comprehension, v0 wins decisively.
- **For first-week and first-month users**, v0 minimises recall load.
  Information scent is highest. Cross-product wayfinding is most
  predictable.
- **For the 4-product current state**, v0 fits comfortably. The horizontal
  cost is real (~96px) but acceptable. None of v2/v3/v4's compression
  is *necessary* yet — they solve a problem that doesn't exist at N=4.
- **For long-term scale (N=10+)**, v0 starts to creak and v4 (in expanded
  mode) becomes the better answer. **A migration path from v0 → v4 is
  natural** because v4's expanded-sidebar mode is essentially "v0 with
  all products' features inline at once" — the user's spatial mental
  model (left rail → product → features in column) is preserved, just
  expanded. v0 → v3 is a much harder migration because it strips
  labels from the product axis, and v0 → v2 is a partial step
  (compression without the gain in cross-product visibility).

**The case for v4 as a second-best worth shipping** is that it preserves
v0's IA strengths in expanded mode while adding two real IA innovations:
(1) cross-product feature comparison (only variant that surfaces this),
and (2) graceful degradation to icon-only without total loss of section
context (hover-menu carries enough scent to recover).

**The case for v3 is essentially nil from an IA perspective.** It commits
fully to a pattern (icon-only, recall-driven) that the platform's
trajectory (more products, not fewer) actively penalises, and the
vendors it imitates (Amplitude, VS Code) are *not* multi-product
platforms. v3's IA bet is the wrong bet for Wallarm's stated direction.

**The case for v2 is moderate.** It's a less-confident v0 — same model,
worse first-glance scent, no innovation in cross-product wayfinding.
The pin affordance is too low-discoverability to rely on. If Artem and
PM choose v2, it should be with the explicit understanding that it
defaults to a state most users won't override and that state is
weaker than v0.

**Rank order on IA grounds:** v0 > v4 (close) > v2 > v3 (distant).

If the team can ship only one variant for 2026-06-10, ship v0. If the
team can ship a default + a power-user mode, ship v0 as default with v4
as opt-in (or v4 as default with expanded-mode-on-first-visit and
collapse-as-power-user-affordance).

---

## Appendix — files inspected

- `docs/charter.md`, `docs/current-ia.md`, `docs/variants.md`
- `src/nav/manifest/{registry,types,edge,ai-hypervisor,infra-discovery,testing,settings,docs,user}.{ts,tsx}`
- `src/nav/url.ts` (resolveShellContext)
- `src/nav/variants/v0/{shell,rail,top-bar,second-column,hover-preview,sidebar-tree}.tsx`
- `src/nav/variants/v2/{shell,rail}.tsx`
- `src/nav/variants/v3/{shell,rail}.tsx`
- `src/nav/variants/v4/{shell,rail,expanded-rail,expand-state}.tsx`

Vendor references cited (date observed 2026-04-30):

- Kong Konnect — corroborated via project memory `project_kong_konnect_ia.md`
- Cloudflare 2025 dashboard — referenced via `docs/variants.md` v4 vendor list (Cloudflare 2025)
- Apollo.io collapsed-rail pattern — referenced via `docs/variants.md` v4 vendor list
- Datadog, AWS Console, Snyk, Intercom, Sentry, Amplitude, VS Code, Postman — drawn from prior IA-research domain knowledge; **not re-validated against current product UI for this audit**. If any of these is load-bearing for a final variant decision, recommend a focused vendor-product-UI snapshot (per `team/agents/ia-researcher.md` methodology) before commit.
