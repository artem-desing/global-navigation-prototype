# 06 — Competitive / vendor benchmark

**Lane:** competitive precedent only. No IA theory, interaction critique, visual critique, or QA — those run in their own lanes.
**Scope:** v0, v2, v3, v4. v5 excluded by instruction.
**Method:** vendor reads pulled from `docs/references.md` (the field study from 2026-04-28) plus targeted product-UI checks for vendors not in that doc (Datadog, Wiz, Snyk, Linear, VS Code, Stripe, AWS Console, Notion, Slack). Per the methodology memo (`feedback_competitor_nav_research_methodology.md`), product UI was the artifact, not docs URL trees.

---

## 1. Executive summary

**Strongest external precedent: v0** (always-open wide sidebar with every product's sections always visible). It is the modal pattern for dense multi-product enterprise consoles — Datadog, GitLab, Stripe, Databricks (post-2023), Cloudflare (post-2024), Konnect, AWS console (after the user pins). When a vendor that started elsewhere converged on a navigation model at scale, this is the model they converged on. Databricks explicitly walked back a different model (persona/mode switch) to land here. The pattern's documented ceiling is ~20 products + 2-tier categorization (GitLab, Cloudflare, Databricks all live there).

**Weakest external precedent: v3** (icon rail with tooltips, no expand). Among multi-product B2B/infra consoles studied, no vendor of comparable scope ships this as the *only* nav surface. Amplitude is the closest cousin and is cited in `references.md` as working *because depth rarely exceeds 3* — Wallarm's 5+ level paths break the assumption. Linear and Notion ship near-pure rails but with much shorter section names and consumer-shaped IA. v3 is the most ambitious bet against precedent of the four.

**Closest single vendor analogue per variant:**
- v0 → Konnect / Cloudflare / Stripe (clean precedent)
- v2 → Sentry / Intercom / Linear (clean precedent for the *interaction*; less clean for the *catalog size*)
- v3 → Amplitude (precedent that explicitly does not generalize to our depth)
- v4 → Cloudflare 2024-25 + Apollo.io (precedent for both halves separately; the *combination* is novel)

**Pattern Wallarm should adopt on competitive evidence alone: v0**, with a v2-style collapse mechanism added on top so dense users can reclaim horizontal space without losing the model. That's what Cloudflare, Sentry, Intercom, and Vercel actually ship — "v0 expanded by default + Sentry-style hover-flyout-when-collapsed + explicit pin." v3 and v4 each pick *one half* of that compound and ship it alone; the working vendors ship both.

The "missing variant" worth considering: a **stacked / swap-secondary** model (Sentry, Cloudflare's recent Zero Trust direction) where the primary rail items don't navigate — they swap the secondary column. None of v0/v2/v3/v4 implements that explicitly; v0's rail-clicks-then-second-column is the closest, but it still navigates on click rather than purely swapping context. See section 4.

---

## 2. Vendor table

| Vendor | Product UI shape | Closest variant | Scale (products / sections) | Working? | Trajectory |
|---|---|---|---|---|---|
| **Cloudflare** | Always-on left sidebar with category headers; recent Zero Trust direction nudges toward stacked-swap | v0 (primary), v4 (recent) | ~20+ products in 5-6 categories | Working — flagship reference | Refactor 2024-25: distributed Settings, AI as new top-level, "Traffic policies" / "Cloud & SaaS findings" reframing — *more* sidebar surface, not less |
| **Konnect (Kong)** | Always-on categorized rail + scope-gated drill, replace-don't-stack | v0 (near-identical) | ~8-10 top-level + push-replace on CP entry | Working — "almost identical to our v0 Manifest model" per memory | Heavy ⌘K investment 2024 (29 entity types, query syntax) — depth via search, not deeper rail |
| **Datadog** | Always-on left sidebar; ~20+ products grouped; redesigned 2024 to put search + recents at top, admin at bottom | v0 | 20+ products, 1000+ integrations | Working but acknowledged as dense | Redesign sharpened density rather than abandoning it — placed *more* into the rail with better contrast and recents |
| **Stripe Dashboard** | Always-on left sidebar, recently *minimized* to fewer top-level items | v0 (lighter) | ~8-10 top-level items | Working — canonical fintech reference | 2024 update *reduced* sidebar links toward simpler v0 rather than collapsing to a rail |
| **GitLab** | Always-on left sidebar, two-level ceiling, stage-style groups (Plan/Code/Build/Secure/Deploy/Operate/Monitor/Analyze) | v0 | 8 top-level stages, dozens of features within | Working — but well-known density complaint | 2023 redesign consolidated *into* a single sidebar from prior top+side mix; pinning + ⌘K added as relief valves |
| **Databricks** | Two-tier sidebar: universal pillars + product groups (collapsible) | v0 (with grouping) | 3 product areas + universal utilities | Working | **Walked back persona/mode switch (2023).** Strongest single negative signal for any "swap" model |
| **Sentry** | Stacked nav: 4 primary "areas" swap a secondary column; `<SecondaryNav>` plug-in contract; hover-flyout when collapsed | v0 + v2 hybrid (partial v4) | 4 primary areas, each with own secondary tree | Working — cleanest plug-in registration pattern in the survey | GA'd 2025 after consolidating ~12 product links into 4 areas — *fewer top-level items*, more secondary depth |
| **Vercel** | Resizable, collapsible left sidebar with scope switchers in top bar | v0 with v2 collapse | ~6-8 top-level per project | Working | Feb 2026 redesign replaced *horizontal tabs* with the sidebar; trajectory is *toward* v0, not away |
| **Intercom** | Always-on left sidebar, 6 fixed top-level sections, customizable level 2 with pin/unpin; collapses with hover-flyout | v0 + v2 collapse | 6 fixed top-level | Working — cited as Artem-favorite in references | 2025 IA redesign reduced top level, standardized secondary across products |
| **Supabase** | Top bar (org + breadcrumb) + lockable left rail (icon-first, pin-to-expand); registry-driven ⌘K | v2 (close to its locked model) | 8-14 in-project products | Working | Trajectory: distributed Settings, palette as registry — toward v0/v2 hybrid, not away |
| **Linear** | Always-on left sidebar; team rows expand to Issues / Projects / Cycles / Triage; sidebar collapsible (`[`) | v2 (lighter), v0 when expanded | 4-6 top-level per team, multi-team supported | Working — best-in-class polish | Iterations have *added* density with sub-menus on hover for Issues / Cycles — toward v0, away from pure rail |
| **VS Code** | 48px Activity Bar + Primary Sidebar (the variable-width column); user-customizable | v2/v3 hybrid (icon rail + slot) | 5-7 default activities + extension-contributed | Working at scale (millions of users) | Stable model since 2015. Note: VS Code is the **direct ancestor of v5**, not v2/v3 — Activity Bar swaps *which sidebar contents* you see, not navigates |
| **Postman** | Type-first icon rail (Items / Services / History / Local files) + relational sidebar + workbench tabs | v2/v3 with workbench (more like v5) | 4 rail items, broad workbench depth | Working | Stable; rail item *swaps* the secondary column rather than navigating |
| **Apollo.io** | Collapsed icon rail with hover-popout menus per product | **v4 (collapsed half)** — explicitly cited in `variants.md` | Sales-engagement product set, ~10 modules | Working | Stable as a sales-engagement pattern; less validated for enterprise infra/security shape |
| **PostHog** | User-curated sidebar; canonical Product list lives in search dropdown; truly global ⌘K | None of v0-v4 directly | 10+ products growing toward 50+ | Working — but explicitly abandoned a fixed product menu | Trajectory is *away from any of v0-v4* and toward palette-first nav |
| **Wiz** | Always-on left sidebar with CNAPP modules (Inventory, Issues, Threat Center, Code, Defend) | v0 | ~10-12 modules across CSPM/CWPP/CIEM/DSPM/Code/Defend | Working — fastest CNAPP scale-up in market | Scope expanded from CSPM → full CNAPP without changing nav shape; bolted modules into the same sidebar |
| **Snyk** | Always-on left sidebar; **retired horizontal menu in favor of vertical** (2024-25); 4 product areas (Code, Open Source, Container, IaC) | v0 | 4-6 product areas | Working post-redesign | **Walked back top-bar nav to a sidebar.** Same trajectory direction as Vercel — toward v0 |
| **Notion** | Always-on left sidebar with Favorites / Teamspaces / Shared / Private; pages nest infinitely via toggle | v0 (consumer-shaped) | Variable user-defined | Working | Stable consumer pattern — but content tree, not product tree |
| **Slack** | Workspace-switcher rail (when multi-workspace) + main channel sidebar | v2-shape + v0 sidebar | 1-N workspaces | Working | 2023-24 simplification reduced sidebar density; rail reserved for *workspace identity* not products |
| **AWS Console** | Service-launcher mega-menu + per-service own sidebars; bookmarks bar | None ship as-is; counter-example | 200+ services | **Acknowledged poor UX.** Third-party browser extensions exist solely to fix it (`aws-sidebar`) | Improvements 2021-23 added favorites bar + descriptive titles — but core multi-product nav is still considered the worst-in-class reference |
| **GCP** | Top platform bar + collapsible "Navigation menu" with pinned-at-top + categories | v0 (catalog-vs-working split) | ~120+ products, 8 categories | Working but Artem-flagged as "UX-heavy" | Pinned-products in left nav (vs top bar) doubled pin rate — confirms the v0 layout outperforms top-bar product switching at scale |
| **Zapier** | Single peer-product rail, ~10-11 items | v0-shape, no product grouping | 6+ products, flat | Works for them, **explicit anti-precedent for us** per references.md | Late 2024 consolidated dual top+side nav into single vertical rail — same trajectory as Snyk and Vercel |
| **Neon** | Stable left sidebar + breadcrumb-as-scope-picker in top-left | v0 with stable structure | 6-8 top-level | Working | 2025 changelog: breadcrumb branch switching — depth carried by breadcrumb, sidebar stable |
| **Amplitude** | Sibling products as continuous sections in one left nav; aggressive depth flattening | v3 (closest analogue) | Analytics + Experiment + Session Replay + Data | Working — **but explicitly does not generalize to depth >3** per references | Stable; the canonical "icons-and-tooltips works only when shallow" precedent |

**Aggregate signal — direction of vendor migrations 2023-26:**

| From | To | Vendors |
|---|---|---|
| Top-bar / horizontal tabs | Always-on left sidebar | Snyk, Vercel, Zapier (consolidation), GitLab (top+side → side) |
| Always-on left sidebar | Top-bar + palette-first | PostHog (only) |
| Persona/mode switcher | Always-on multi-product sidebar | Databricks (**explicit walk-back**) |
| 12-item flat rail | 4-area stacked-swap rail | Sentry |
| Centralized Settings | Distributed Settings | Cloudflare, Supabase |

Direction is overwhelmingly *toward* always-on sidebar (v0-shape), with palette as relief valve and stacked-swap as the only credible alternative shape.

---

## 3. Per-variant analysis

### v0 — Always-open wide sidebar

**Vendor analogues (close to identical):** Konnect, Cloudflare, Datadog, GitLab, Wiz, Stripe, Databricks (post-2023), Vercel (post-2026), Snyk (post-2024), Intercom.

**Precedent strength: very strong.** This is the modal pattern across the entire enterprise infra/observability/security/API-platform reference set. Vendors that started elsewhere have migrated toward it (Snyk top-bar → sidebar, Vercel horizontal-tabs → sidebar, Databricks persona-switch → sidebar, Zapier dual-nav → single sidebar). No vendor at our scope has migrated *away* from this pattern.

**Scale evidence:**
- GitLab carries 8 top-level stages (Plan / Code / Build / Secure / Deploy / Operate / Monitor / Analyze) plus ~5-15 features per stage in the same sidebar without breaking. That is the *upper end* of demonstrated capacity.
- Datadog carries 20+ products in essentially the same shape (with categorization and recents-at-top as relief).
- Cloudflare carries 20+ products via category headers in one sidebar.
- Wiz carries the entire CNAPP module set (CSPM + KSPM + CWPP + CIEM + DSPM + Code + Defend) in one sidebar — ~10-12 modules — and is still considered usable.
- Konnect is the closest direct analog: ~8-10 entitlement-driven top-level items, push-replace at scope-in. Maps onto Wallarm's stated 4-product-plus-platform-utilities shape almost perfectly.

**Wallarm-specific risk:** v0 in this prototype renders **every product's sections always visible** (per the variant brief). That is denser than what most v0-vendor-analogues actually ship — most show product labels at top level and reveal sub-sections only when a product is selected (Konnect, Datadog, GitLab, Stripe). Cloudflare and Databricks are the exceptions that *do* expand multiple products simultaneously (Cloudflare via categorization, Databricks via collapsible groups). If we keep v0's "everything visible" rule we are at the densest end of the precedent — closer to old Databricks (which they walked back) than to Konnect (which we want to match).

**Verdict:** Pattern is the safe, well-precedented choice. v0's specific "always show everything" implementation is the *most aggressive* form of the pattern; tightening it to "product labels always visible, sub-sections only when product is selected" lands us on Konnect's shape — strongest single precedent.

---

### v2 — Thin icon rail that expands on hover/pin

**Vendor analogues (close):** Sentry (collapsed mode + hover-flyout), Intercom (collapsed mode), Supabase (lockable rail), Linear (sidebar with collapse via `[`), Cloudflare (collapsed mode).

**Precedent strength: strong for the *interaction*, weak for the *default state*.** Every reference vendor that ships hover-expand ships it as a *secondary* mode of an always-on sidebar — the user's default is expanded, hover-collapse is a power-user accommodation. Sentry's EPIC documents this explicitly: *"the sidebar items should instead be rendered in a flyout"* — "instead" meaning *when collapsed*, not always. Supabase is the same: lockable open or closed, lock-open is the recommended default.

If v2's default is the 64px collapsed state with expand-on-hover, that *inverts* the vendor pattern. Vendors that have shipped hover-collapse-as-default at multi-product scope: zero in this study.

**Scale evidence:**
- Linear's sibling rail handles 4-6 team-scoped sections — small catalog.
- Sentry's stacked nav handles 4 primary areas — also small.
- Intercom's 6 top-level sections — small.
- Cloudflare hover-collapse is documented but applied to their existing 20-product sidebar as the *collapsed mode* — vendor itself doesn't recommend it as default.

**Wallarm fit:** v2's mechanic (hover to peek, click pin to commit) is well-precedented and is what Sentry and Cloudflare actually ship. The bet that needs precedent is "default to collapsed." That bet is uncited.

**Verdict:** Pattern (mechanic) is well-precedented. Default state (collapsed-by-default) is novel; closest negative signal is that Cloudflare and Sentry ship it as opt-in collapse rather than opt-in expand.

---

### v3 — Thin icon rail with tooltips, never expands

**Vendor analogues:** Amplitude (closest, with the explicit caveat that depth rarely exceeds 3), VS Code's Activity Bar (but only as a *swap* surface — clicking opens the sidebar, doesn't navigate), Postman icon rail (also swap, not navigate), Slack workspace switcher (single-purpose: identity, not products), Notion (consumer scope).

**Precedent strength: weak.** No reference vendor in the enterprise infra / API-platform / security / observability set ships icon-rail-with-tooltips as the *primary* and *only* nav surface for a multi-product catalog. Every analog either (a) is consumer/desktop-shaped with a small flat catalog, or (b) uses the rail as a swap-the-sidebar surface, not as the sidebar itself.

VS Code and Postman both have an icon rail at the leftmost edge, but in both cases clicking an icon **opens or swaps the secondary column** — the rail is not the destination. v3 collapses both surfaces into one rail and skips the secondary column entirely, which is structurally different from VS Code/Postman.

Amplitude is the closest *true* analogue and `references.md` already flags it: *"Amplitude lacks a visible breadcrumb / context strip. Works because depth rarely exceeds 3. Wallarm can't replicate this — `service-id → Routes → Route ID → flow → policies → policy-id` is genuinely 5+ deep."* That sentence applies verbatim to v3.

**Scale evidence:**
- Amplitude: 4-6 product sections, depth ~3. Ships.
- VS Code Activity Bar: 5-7 default activities, but with the secondary column (so structurally a different model).
- No vendor at our claimed scope (4 products + scoped sub-trees + entity drilling 5+ deep) ships this shape.

**Wallarm fit:** v3 is a *space-efficiency* play. The vendors that prioritize space efficiency at our scope (Sentry, Cloudflare, Intercom) all reach for hover-flyout — *not* for tooltips-only. The conscious choice the field has made is that when you compress to 64px, you compensate with a *flyout that contains structure*, not a tooltip that contains a label.

**Verdict:** Most novel of the four. The novelty is on the wrong side of the field's compound bet — vendors compress *and* add a flyout structure; v3 compresses *without* adding the flyout. The known ceiling is Amplitude's depth-3 catalog. Above that, no precedent.

---

### v4 — Thin icon rail + hover pop-out menus + ⌘B swap to merged sidebar

**Vendor analogues:**
- Collapsed half (icon rail with hover-popout menus): **Apollo.io** — explicitly named in `variants.md`. Working as a sales-engagement pattern.
- Expanded half (⌘B-toggled merged sidebar with all products' top-level features inline): **Cloudflare 2024-25 dashboard** — explicitly named. Working as the flagship multi-product reference.
- The *combination* (one variant offers both as user-toggled modes): no single reference vendor ships this. It is a synthesis of two real patterns into one variant.

**Precedent strength: medium.** Each half is well-precedented. The compound is novel — but novel-as-synthesis (two known-good patterns offered as user choice), not novel-as-bet. The risk profile is "mode switching cost": Databricks walked back a different mode switch (persona/mode), citing user confusion. v4's ⌘B mode switch is structurally different (it's a *layout* preference, not a *content* preference — both modes show the same products), so the Databricks anti-precedent is partial.

**Scale evidence:**
- Apollo: ~10 modules, hover popouts work fine at that count.
- Cloudflare merged sidebar: 20+ products with categorization, working at scale.
- Compound mode-switch: untested in any reference vendor at our scope.

**Wallarm-specific notes:**
- v4 keeps v0's persistent second column for Settings + drilled scopes (per `project_v4_second_column_delegation.md`). That hybrid is a load-bearing pragmatic choice and matches Konnect's "replace, don't nest" rule for scope-in. The compound is now *three* renderings (collapsed-with-popout / expanded-merged / second-column-when-drilled), which is more states than any reference vendor.
- The ⌘B keystroke for layout toggle has explicit precedent (VS Code uses ⌘B for the same purpose — toggle primary sidebar). Familiar gesture for the developer audience.

**Verdict:** Pattern halves are individually well-precedented. The compound is a designer-driven synthesis — defensible but uncited. Risk is mode-switch cognitive cost, partially mitigated by ⌘B being a familiar gesture.

---

## 4. The "missing variant" — stacked / swap-secondary

The cleanest vendor pattern *not represented* in v0-v4 is **stacked navigation where the primary rail items don't navigate, they swap a secondary column**. Two vendors ship this and both are credited as best-in-class:

- **Sentry's stacked nav (GA 2025).** ~12 product links collapsed into 4 primary "areas": Issues, Explore, Boards, Insights. Clicking an area **swaps the secondary nav column** rather than navigating. The primary column *is* the product switcher; destinations live in the secondary. The plug-in contract — `<SecondaryNav>` portal with `Body` → `BodySection` → `Item` + `Footer` — is the cleanest plug-in registration pattern in the entire reference set.
- **Cloudflare's recent direction.** Less explicit but trending the same way: AI got its own top-level area in 2026, Zero Trust got a swap-secondary refresh, Settings got distributed *into* the relevant areas.

How this differs from v0-v4:
- v0 navigates on rail click and shows the secondary tree as a parallel always-visible column. Stacked-swap navigates only on secondary clicks; the rail is a content router.
- v2/v3 collapse to a rail but do not have a stable secondary column — destinations must be reached by navigating from the rail.
- v4's hover-popout is a *transient* version of the stacked-swap idea — hover an icon and a menu pops out — but the menu is ephemeral and the user must land somewhere to keep it open. Stacked-swap commits the secondary column on click without leaving the current page.

The ergonomic value is precisely the thing Wallarm wants for Hypervisor / Gateway / Discovery: I can change *which product's tools I see* without losing my current page. v0 forces a navigation; v4 forces me to commit to a hover or to expand mode. Stacked-swap doesn't force either.

**Recommendation:** include a stacked-swap variant in the next round if benchmarking is the criterion. The plug-in contract benefit alone (`<SecondaryNav>` registration model) is a strong reason — multiple personas in the team brief have flagged a manifest contract as load-bearing for Wallarm's plug-in story.

---

## 5. Competitive-only recommendation

**Adopt v0 as the baseline. Borrow v2's collapse mechanic on top of v0. Treat v3 and v4 as exploratory.**

Reasoning, competitive-only (not synthesizing other lanes):

1. **v0 wins on precedent count and trajectory.** 12 reference vendors at our scope ship this pattern. Three vendors (Snyk, Vercel, Zapier) walked *into* it from elsewhere in the last 24 months. One vendor (Databricks) walked *out of* a different model into it. The opposite migration — vendors leaving v0-shape for v2/v3/v4-shape — is uncited.

2. **v2's collapse mechanic is not a separate variant, it is v0's documented collapsed mode.** Cloudflare, Sentry, Intercom, Supabase, Linear, Vercel all ship "always-on sidebar by default + collapsible to icons + hover-flyout when collapsed + explicit pin to commit." That is structurally **v0 with v2 layered as the collapse behavior** — not v0 vs v2 as alternatives. The competitive evidence treats them as one compound pattern, and the prototype currently fragments them.

3. **v3's tooltip-only-rail has no enterprise multi-product precedent at our depth.** Amplitude is the only direct analogue and its own architecture has a depth ceiling Wallarm exceeds. Shipping v3 as the production model is a bet *against* every reference vendor in the relevant scope.

4. **v4's compound is novel-as-synthesis.** It combines Apollo's collapsed-with-popout + Cloudflare's expanded-merged + v0's persistent second column for drilled scopes. Each part is precedented; the compound and the ⌘B mode-switch are not. It is the most defensible non-v0 variant on competitive evidence — but the precedent for shipping a layout *mode switch* in this product class is weaker than the precedent for shipping a *collapse-state*.

5. **The strongest pattern not yet tried is stacked-swap (Sentry / Cloudflare 2025-26).** It is the model both vendors specifically credited as best-in-class plug-in registration converged on. If we want a second nav variant to take to alignment alongside v0, stacked-swap has stronger external precedent than v3 or v4.

**One-line takeaway:** of the four prototyped, v0 has the strongest precedent and v2's collapse is its proper companion; v3 is the variant most likely to require defending without external evidence; v4 is the most defensible non-v0 design choice but is a synthesis rather than a citation. The strongest external pattern Wallarm has not yet prototyped is stacked-swap.

---

## Sources

In-repo:
- `/Users/artem/Documents/work-projects/global-navigation-prototype/docs/references.md` — vendor field study from 2026-04-28 (Cloudflare, Intercom, GCP, Vercel, Konnect, Neon, Supabase, Postman, Zapier, Databricks, Amplitude, Sentry, PostHog, GitLab)
- `/Users/artem/Documents/work-projects/global-navigation-prototype/docs/variants.md` — explicit vendor citations per variant (Apollo.io for v4, Cloudflare for v4, Amplitude for v3, Intercom/Sentry for v2)
- `/Users/artem/.claude/projects/-Users-artem-Documents-work-projects-global-navigation-prototype/memory/project_kong_konnect_ia.md` — Konnect IA snapshot
- `/Users/artem/.claude/projects/-Users-artem-Documents-work-projects-global-navigation-prototype/memory/feedback_competitor_nav_research_methodology.md` — product UI vs docs URL tree

External (vendors not in references.md or supplementary checks):
- [Datadog: A closer look at our navigation redesign](https://www.datadoghq.com/blog/datadog-navigation-redesign/)
- [Linear: How we redesigned the Linear UI (part II)](https://linear.app/now/how-we-redesigned-the-linear-ui)
- [Linear preview: New sidebar & team icons](https://linear.app/changelog/2022-01-20-linear-preview-new-sidebar-and-team-icons)
- [Linear: Collapsible Sidebar changelog](https://linear.app/changelog/unpublished-collapsible-sidebar)
- [Snyk: Introducing the new Snyk UI](https://snyk.io/blog/introducing-new-snyk-ui/)
- [Snyk product updates](https://updates.snyk.io/)
- [Stripe Dashboard update: May 2024](https://support.stripe.com/questions/dashboard-update-may-2024)
- [Stripe Dashboard basics](https://docs.stripe.com/dashboard/basics)
- [VS Code Activity Bar UX Guidelines](https://code.visualstudio.com/api/ux-guidelines/activity-bar)
- [VS Code Sidebars UX Guidelines](https://code.visualstudio.com/api/ux-guidelines/sidebars)
- [VS Code Custom Layout](https://code.visualstudio.com/docs/configure/custom-layout)
- [Notion: Navigate with the sidebar](https://www.notion.com/help/navigate-with-the-sidebar)
- [Slack: Switch between workspaces](https://slack.com/help/articles/1500002200741-Switch-between-workspaces)
- [Slack: simpler streamlined sidebar](https://slack.com/blog/news/simpler-streamlined-sidebar)
- [AWS Management Console navigation bar updates (2023)](https://aws.amazon.com/about-aws/whats-new/2023/09/aws-management-console-usability-navigation-bar/)
- [HN thread: Why is the AWS console UX so bad?](https://news.ycombinator.com/item?id=24264428)
- [aws-sidebar Chrome extension (third-party fix)](https://github.com/jpriebe/aws-sidebar)
- [Wiz Cloud and AI Security Platform](https://www.wiz.io/platform)
- [Vercel: New dashboard redesign rollout](https://vercel.com/changelog/dashboard-navigation-redesign-rollout)
- [Cloudflare AI dashboard experience improvements (2026-02-19)](https://developers.cloudflare.com/changelog/post/2026-02-19-ai-dashboard-experience-improvements/)
- [Cloudflare New Zero Trust navigation](https://blog.cloudflare.com/zero-trust-navigation/)
- [GitLab: How designing platform navigation is like building a dream home (2023 redesign)](https://about.gitlab.com/blog/2023/05/15/overhauling-the-navigation-is-like-building-a-dream-home/)
- [GitLab Pajamas: Navigation sidebar](https://design.gitlab.com/patterns/navigation-sidebar/)
