# Global Navigation Prototype — Open Items

## Open questions

- Tenant / project scope — does it sit *above* the product switcher (third axis) or fold into the top bar another way? Surfaced in the Figma jam, not yet decided.
- Data-plane / environment as a cross-cutting selector inside product nav — keep it as a sidebar header, a separate strip, or scope it per-section?
- Within Edge, the jam splits **management (read/write, scoped to a data plane)** from **read-only views (cross-data-plane)**. How does this surface visually — two clusters in the sidebar, a toggle, separate routes?
- Where does the Wallarm brand mark / account / search live in the new top bar? (cmd+K search shipped 2026-04-29 in centered top-bar slot; brand left, account/limits cluster right — layout holding for now)
- Mock data volume — light fixtures (just labels and counts) or richer narratives (a fake account with realistic state)?
- Admin zone — same place as today, or rethought (e.g., separate workspace)?
- Do all platform pillars get equal switcher treatment, or does Edge stay the "anchor" since it's the only one with screens today?

## Structural questions — agnostic nav model (Platform-jam Edge walkthrough, 2026-04-28)

Surfaced while walking the Edge bucket on the Platform-jam board (`64:156`). These are about the *shape of the primitive*, not the v0 layout. Terms below use the working vocabulary in [glossary.md](glossary.md).

Several of these now have strong vendor precedent from the [reference research](references.md) (2026-04-28). Where the precedent is consistent, the question moves to **tentatively decided** — refine with the team but don't re-litigate from scratch.

### Tentatively decided (vendor consensus)

- **Same sidebar or new chrome on scope-in** → **replace, don't stack**. Universal across vendors (Cloudflare, Kong push-replace, Sentry stacked-swap, Vercel reframe, Neon stable-structure-rebound-targets). When `dataplane-id` is selected, the Edge sidebar replaces its content with `Nodes/Services/Overview/Govern`. No second column. *(See `references.md` "Replace, don't stack" pattern.)*
- **Deep paths: full tree vs. focus** → **focus, with two-level chrome ceiling**. GitLab Pajamas spec is explicit; Intercom, Sentry, Cloudflare, Databricks, Vercel all enforce it. Sidebar caps at 2 visible levels; depth lives in tabs (level 3), drawers (level 4), filter-zoom (level 5), Editor-swap when needed. *(References: GitLab Pajamas, Sentry design tenets.)*
- **Recursive sub-nav** → **no, cap at 2 levels**. Universal. Recursion happens in *content* (folders, prefixes, tree explorers), not chrome.
- **Two render states for every gated Feature** → **confirmed; both must exist**. "No scope" = list/search/recent/empty state. "Scope selected" = contextual sub-nav. Plus a "last-used Scope" memory per Product per user to short-circuit re-picking. Cloudflare, Kong, Supabase, Vercel, Neon all do this.
- **Product switcher form** → **peer-product rail or stacked-secondary; tile/waffle launchers off the table**. Tile launchers are absent from every reference. Default is a peer-product rail (Cloudflare/Kong/Zapier/Intercom/Cloudflare) or Sentry-style stacked-secondary. Once Product count exceeds ~8-10, complement with an "All Products" catalog page (GCP / PostHog).
- **"Overview" as per-level convention** → **convention, not a reserved slot**. Most vendors have an Overview/Home at every meaningful level (Product home, Scope home) but the Manifest should treat it as opt-in, not required.
- **Platform utilities placement** → **top-bar right cluster** (universal). Distributed Settings is the trend (Cloudflare and Supabase have shipped migrations toward it) — only cross-cutting settings (members, billing, audit, integrations) stay central; Feature-specific settings co-locate with the Feature.

### Still open

- **Where the entity picker lives.** Vendor evidence supports two patterns: (a) top-of-sidebar slot (Cloudflare account/zone, Sentry project icon item) or (b) breadcrumb-segment-as-picker (Neon, Kong CP, Supabase chevron). Either works — we need to pick one and apply it consistently. Frequency rule (Kong): rare swaps in corner / Settings, frequent swaps in sidebar header or breadcrumb, page-level scopes in a Filter strip.
- **Cross-Product teleport rule.** Vercel's "scope-preserving slot" (switch project → land on same Feature) is the reference. Adopt as: switching Product lands on the same Feature slot if target Product has it; otherwise on Product home. Do we also persist last-used Scope per Product?
- **Manifest exact shape.** Sentry's `<SecondaryNav>` portal component, GitLab's `Sidebars::Panel`, Supabase's `useRegisterCommands` are the three cleanest precedents — each Product team declares Identity + Sidebar + Routes + Palette commands + Settings. Need to consolidate into our schema.
- **Sigil set for the Palette.** GitLab uses `:` projects, `@` users, `~` files, `>` commands. Wallarm equivalent: `:` Products, `@` entities by Resource ID (`dataplane-id`, `route-id`, `policy-id`), `~` settings, `>` actions? Confirm or adjust. *(v1 ships plain text only — sigils deferred until the grammar is committed and there's something for `@` to resolve to.)*
- **Lock-and-show vs hide.** Databricks' lock-and-show (entitlement-gated Features visible but disabled, with a tooltip) trades cleanliness for discoverability. Worth the swap for Wallarm given the entitlement-driven shapeshift?
- **Plug-in / Marketplace Products — visually identical or marked.** Vercel makes installed integrations look identical to native products after install. Wallarm: do third-party / partner Products need a visual marker, or do we follow Vercel?
- **Editor-swap trigger.** When does a Feature earn the right to take over the chrome (Vercel deployment detail, Postman workbench, Zapier Zap editor)? Rule of thumb candidates: "any flow at level 4+ where the user is actively editing for >2 minutes" — needs a real heuristic, not a vibe.

## Resolved (starting point for v0 — not locked)

- ~~Cross-product nav pattern: app switcher vs. top tabs vs. left rail~~ → top-bar product switcher above per-product sidebar (see decisions log, 2026-04-27)
- ~~Settings: global vs. per-product vs. hybrid~~ → global cluster above product scope (matches today's separate Settings cluster)
- ~~Shapeshift driver: roles vs. entitlements~~ → entitlement combinations (which products are enabled), not RBAC

## Blockers

- GitLab destination: which group on `gl.wallarm.com`? `wallarm-cloud/`? Internal-only group?
- Lead PM name not captured

## Follow-ups

- Once PM is named: write `memory/people/<name>.md` and update `1-stakeholders.md`
- Once eng partner named: same
- Once a navigation model is picked: copy the decision to `memory/decisions/YYYY-MM-DD-<slug>.md`
- Pre-2026-06-04 review: scrub repo README and commit history for embargo-safe language
