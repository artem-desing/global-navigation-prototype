# Global Navigation Prototype — Reference research

Field research on 14 reference platforms, conducted 2026-04-28. The goal isn't a beauty contest — it's to surface the **LEGO bricks** (recurring nav primitives) we can compose into a Wallarm shell that's agnostic about depth, breadth, and which Products are installed.

Sources: each vendor section ends with primary links. All research is from public materials (docs portals, changelogs, design-system docs, blog posts, public GitHub). Where a detail couldn't be verified publicly it's marked **(unverified)**.

Read this doc with [glossary.md](glossary.md) open — terms in **bold** like **Product**, **Feature**, **Scope** are defined there.

---

## How to use this document

- **Per-vendor summaries** (Artem's stated favorites first, then the rest) — what each vendor actually does, what's distinctive, what to borrow.
- **LEGO bricks** — the recurring primitives that keep showing up across vendors. These are the parts list for our shell.
- **Patterns by structural question** — maps each open structural question (from `open-items.md`) to vendor evidence so decisions can cite precedent.
- **Recommendations for Wallarm** — concrete starting positions for the prototype, with the reasoning attached.

---

## Per-vendor summaries

### Cloudflare — Artem favorite

**Shell anatomy.** Persistent left sidebar + thin top bar with a global ⌘K. Sidebar is collapsible. Items are organized under category headers (Compute & AI, Storage & Databases, etc.); ~20+ products fit because of the categorization, not because of a tile launcher.

**The defining mechanic: scope-driven sidebar identity swap.** The same physical rail means three different things based on URL state:
1. Account-level products list (no zone selected)
2. Zone-level products list (zone selected)
3. In-product section list (inside a product)

URL is `dash.cloudflare.com/{accountId}/{zoneName}/...` — every layer has a deterministic position. Account picker at the top of the sidebar; Zone picker as a search dropdown on the account home plus a forward-arrow control at the top of the zone view.

**Settings is distributed, not centralized.** The Zero Trust refresh moved Settings *"closer to the tools and resources they impact"* — Settings is no longer a global leaf, it's split across the Features that need it.

**Search-as-IA-aliasing.** Quick Search (⌘K) indexes both current and previous names — they use search as a migration shim when reorganizing the tree. Results bucket into "Account-Wide Products" and "Website-Only Products" — exactly the static-vs-scoped split Artem flagged. Search returns sidebar destinations only, not entities (yet).

**What to borrow:**
- URL-encoded Product / Scope / Feature triple — the shell renders nav from URL state, not from in-memory store. Plug-ins register routes against named scope levels.
- Distributed Settings: settings live next to the thing they configure, not in a central tray.
- ⌘K Quick Search with bucketed results (platform-wide vs current-Product) is the scaling lever as Products grow.

**Sources:** [Redesigning Cloudflare](https://blog.cloudflare.com/redesigning-cloudflare/), [Quick Search](https://blog.cloudflare.com/quick-search-beta/), [New Zero Trust nav](https://blog.cloudflare.com/zero-trust-navigation/), [Accounts/zones/profiles](https://developers.cloudflare.com/fundamentals/concepts/accounts-and-zones/).

---

### Intercom — Artem favorite

**Shell anatomy.** Persistent left sidebar (no top bar), 6 top-level sections after the 2025 IA redesign: **Inbox, Knowledge, Contacts, AI and Automation, Settings, Personal**. Top-level icons + labels. The set is fixed — extensibility is at level 2.

**Same secondary-nav skeleton across every product.** Per the IA blog: *"Every secondary navigation follows the same visual patterns"* — same folder structure, hierarchy, pin behavior across Inbox, Knowledge, Contacts, AI/Automation. Switching products doesn't reset your mental model of the sidebar; only the contents change.

**Customizable level 2, fixed level 1.** Top-level products are curated and stable; users get flexibility at level 2 via pin/unpin and custom folders, all managed via "Manage > Edit sidebar" at the bottom of the sidebar.

**Depth is pushed into the canvas, not the chrome.** Fin (their AI agent) goes Train → Test → Deploy → Analyze, with each splitting into 4-6 sub-areas — but all of that lives as in-page tabs and detail panes inside the destination, not as deeper sidebar levels. The chrome stays at two levels regardless of how deep a Feature actually goes.

**Demote rare scopes, promote frequent ones.** Workspace switching (multi-tenant) is buried under Settings. Team / view scoping inside Inbox is elevated into the secondary sidebar. The lesson: scope-swap UI weight should match scope-swap frequency.

**⌘K is permission-filtered actions, not just search.** ~23 actions — messaging, organization, navigation, conversation control, content, system. Direct shortcut keys (R for reply, Z for snooze) shown in the palette, so it doubles as discoverability for keyboard shortcuts. **Scoped to Inbox**, not global.

**What to borrow:**
- Standardize the secondary-nav contract for plug-in registration: every secondary nav looks structurally identical, teams declare structure, shell renders.
- Two-level chrome ceiling — anything deeper becomes tabs/detail panes inside the destination.
- ⌘K as action surface with shortcut hints, not just typed nav.

**Sources:** [Sweating the details: Designing improvements to our product navigation](https://www.intercom.com/blog/redesigning-product-navigation/), [Designing for clarity: How we restructured Intercom's IA](https://www.intercom.com/blog/designing-for-clarity-restructuring-intercoms-information-architecture/), [Customize the Inbox](https://www.intercom.com/help/en/articles/7911926-customize-the-inbox-to-suit-you-and-how-you-work-best), [⌘K with Inbox](https://www.intercom.com/help/en/articles/6272267-how-to-use-command-k-with-intercom-inbox).

---

### GCP — Artem ok ("UX-heavy but works")

**Shell anatomy.** Top "platform bar" (fixed) + collapsible left sidebar (the "Navigation menu," dismissable). Three layers when inside a product: top bar → product sidebar → page tabs.

**Pin-driven personalization.** The hamburger menu shows **Pinned products at the top** (~10-item ceiling — confirmed pain point), then groupings (Compute, Storage, Networking, Operations, Security, AI, etc.). "All products" is a separate full-page view (~120+ products), grouped by the same categories. Google ran an experiment moving pins from top bar to top of left nav and saw **2× more pinning** — the pinned-in-sidebar pattern is data-driven, not legacy.

**Project picker = scope cascade.** Top bar, modal dialog with Recent + All tabs, search, tree view that fuses Org / Folders / Projects into one control. Up to 4,000 entries. Switching project silently rebinds metrics scope, billing context, IAM evaluation, and page data. Powerful when the mental model holds, **lossy when it doesn't** (filters / regions / observability scope often reset).

**Region/zone is per-product, not global.** Deliberate — region is genuinely page-scoped in GCP. Lesson: don't force a global picker for something that's page-scoped.

**Global `/` search across products + resources + docs + competitor synonyms.** Typing "S3" surfaces Cloud Storage. The synonym layer is unusual and high-value for migration / discovery.

**Where "UX-heavy" comes from (honest):** hamburger is a click away (not docked); pinned-product ~10 limit; large org-tree project picker is slow; region fragmentation across pages; breadcrumb omits the project (screenshots are scope-ambiguous).

**What to borrow:**
- Catalog-vs-working-sidebar split: an "All Products" catalog page lets you ship 8+ Products without bloating the working sidebar; pinning hands curation to the user.
- Plug-in manifests slot into pre-defined categories — GCP's ~8 categories absorb 100+ products. Define our category set early.
- Make scope-rebind boundaries visible — show what survives a scope change and what resets.

**Sources:** [Find products faster (All products page)](https://cloud.google.com/blog/topics/developers-practitioners/find-products-faster-new-all-products-page), [Improved Google Cloud console search](https://cloud.google.com/blog/products/management-tools/improved-google-cloud-console-search-experience/), [Resource hierarchy](https://docs.cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy).

---

### Vercel — Artem favorite for nesting

**Shell anatomy.** Feb 2026 redesign replaced horizontal tabs with a resizable, collapsible left sidebar. Top bar carries scope switchers + universal search + account.

**Scope changes preserve the current page slot.** From Project A's Logs, picking Project B lands on Project B's Logs — not project overview. Same nav slot, different target. This is the key pattern for cross-Product teleport.

**No breadcrumbs — picker IS the breadcrumb.** Team picker + project picker in the top bar are always present; "going up" means clicking the picker. Right-side detail panels dismiss back to the list with filters intact ("previous stage without losing context"). URL is the formal up-button.

**Mixed depth strategies.** Vercel is the clearest case study of *not picking one*:
- Levels 1-2: same sidebar, scope reframes it
- Level 3 (Settings only): inline sub-sidebar — *"Vercel does break their own rule here"*
- Level 3 (Deployment): full page push with inner tabs
- Level 4 (a row in Logs): right-side detail panel
- Level 5 (Observability route → function): filter & zoom in place, not navigation

**Honest assessment:** Vercel's no-breadcrumb pattern works because they top out around level 4. **For our 5+ level path (`Routes → Route ID → flow → policies → policy-id`) it doesn't survive** — picker + back button can't represent it. Either we add a Product-scoped context strip (matches Artem's "breadcrumbs scoped on product level") or we enforce levels ≥4 must be panels / inner tabs / filter-zoom.

**Marketplace integrations install as native sidebar items** — third-party products *become* native after install. No visual difference between native and integration once installed. Worth deciding for Wallarm whether plug-in Products should look identical to platform Products or be marked.

**Universal Search + ⌘K Command Menu** — two surfaces, overlapping, AI Navigation Assistant interprets queries like "show errors in last hour" and applies filters.

**What to borrow:**
- "Same slot, different target" rule for cross-Product teleport.
- Marketplace-style plug-in registration where third-party Products become first-class.
- For deep paths, Vercel's pattern works only if we adopt their full toolkit: panels for level 4, filter-zoom for level 5. We can't borrow the no-breadcrumb piece in isolation.

**Sources:** [New dashboard redesign](https://vercel.com/changelog/dashboard-navigation-redesign-rollout), [The New Side of Vercel](https://vercel.com/try/new-dashboard), [Improved cross-team experience](https://vercel.com/changelog/improved-experience-for-moving-between-your-teams-and-projects), [Universal search](https://vercel.com/changelog/dashboard-universal-search), [Vercel Integrations](https://vercel.com/docs/integrations).

---

### Kong Konnect — Artem favorite

**The most directly relevant vendor for Wallarm** — their data-plane / control-plane / service / route / plugin vocabulary mirrors ours.

**Shell anatomy.** Persistent left rail + top bar with global search. ~8-10 entitlement-driven top-level items: Home, Gateway Manager, Mesh Manager, Service Catalog, Dev Portal, Advanced Analytics, Audit Logs, Teams, Settings.

**Scope by location, not by widget — frequency-driven placement.** Three nested scopes, each in different chrome:
- **Org** (top-right menu, rare switch)
- **Region/Geo** (bottom-left of sidebar, rare switch — physically separate Konnect deployments)
- **Control Plane** (NOT a global picker — entered by drilling: Gateway Manager → list of CPs → click into one)

This is the **closest analog to our `dataplane-id` pattern**: the frequent, contextual scope is acquired by drilling through a list, not via a global dropdown. The CP name then appears as a clickable breadcrumb segment that returns to the CP picker.

**Push-replace sidebar at the scope boundary.** Inside a CP, the left sidebar wholesale replaces its Konnect-level items with CP-scoped items (Overview, Gateway Services, Routes, Consumers, Plugins, Certificates, Vaults, Data Plane Nodes, Settings). No two-column nav, no nested tree. Back-out via breadcrumb click.

**Refuses to nest sidebars more than one level.** Depth becomes content: CP → Service uses tabs; Service → Route is a push-page; Route → Plugin is a side-panel form.

**⌘K is the depth shortcut.** Recently revamped — searches across **29 entity types** with two modes: Basic (keyword) and Advanced query syntax (`type:route AND label.env:prod`). Concurrent global + geo-scoped fetch. Kong invested heavily here specifically because the tree is too deep to navigate manually at scale.

**What to borrow:**
- **Scope frequency dictates chrome placement.** Reserve top-bar / corner for rare switches. The `dataplane-id` picker is frequent and contextual — enter via drilling, not via a global dropdown.
- **Replace, don't nest.** When a Feature shapeshifts on Scope selection, replace the sidebar contents wholesale. Nested rails / two-column nav don't appear at Kong.
- **Breadcrumb segment as scope-swap surface** (clickable CP name returns to CP picker).
- **⌘K with structured query syntax is non-optional** at our depth/breadth. Plan it in v1.

**Sources:** [About Gateway Manager](https://docs.konghq.com/konnect/gateway-manager/), [Konnect Search](https://developer.konghq.com/konnect-platform/search/), [Revamped Search Bar](https://konghq.com/blog/product-releases/konnect-revamped-search), [Account & org switcher](https://developer.konghq.com/konnect-platform/account/).

---

### Neon — Artem favorite

**The closest analog to our Product/Scope/sub-Scope cascade structurally** (org → project → branch ≈ Product → Scope → sub-Scope).

**Shell anatomy.** Left sidebar + top bar. ~6-8 top-level items at the project level (SQL Editor, Tables, Branches, Monitoring, Auth, Integrations, Settings). Neon keeps it small.

**Breadcrumb-as-scope-picker.** The defining pattern: top-left of the top bar shows a hierarchical breadcrumb (`Neon platform > Projects & resources > Integrations`), and **each segment is a clickable popover-picker**. One control does both location and selection. Org switcher is a separate top-right navbar (rare switch, demoted); project + branch switching happens via the breadcrumb.

**Resists sidebar inflation.** Auth, RAG/AI, Compute all arrived without adding sidebar pillars. Auth is a sidebar entry that opens into its own sub-sections; RAG isn't a sidebar destination at all — it's surfaced inline (AI hints in SQL Editor failures). New capabilities embed where the work happens.

**"Dynamic sidebar" = stable structure, dynamic binding.** When you switch branches, the sidebar items don't change — Tables, SQL Editor, Monitoring stay put — but each *binds to the new branch*. SQL Editor opens against the new branch+database, Tables shows the new branch's tables. This is what Artem called "dynamic sidebar" — it's actually structural stability with target rebinding, which scales far better than a structurally morphing tree (registered Features don't disappear during scope changes).

**Settings is a flat sub-list of ~10 items** — not nested groups. Easy to scan, hostile to deep nesting.

**No documented global ⌘K** for the console (only the VS Code extension has Cmd+Shift+P).

**What to borrow:**
- Make the breadcrumb the scope cascade. `Product > Scope (dataplane-id) > sub-Scope` belongs in one top-left control with each segment as a popover-picker. Don't split scope across a separate header dropdown.
- **Sidebar items stay; targets re-bind on scope change.** When `dataplane-id` changes, Nodes/Services/Overview/Govern stay put but bind to the new dataplane. This matches "dynamic" plug-in registration: registered items don't disappear during scope swaps.
- Push depth into the page, not the sidebar — flat sub-lists like Settings scale to ~10 children without becoming a tree.
- Product switcher is an **additional level Neon doesn't have** — likely belongs to the *left* of the breadcrumb so the breadcrumb stays focused on scope cascade within the active Product.

**Sources:** [Manage projects](https://neon.com/docs/manage/projects), [Manage branches](https://neon.com/docs/manage/branches), [Changelog Apr 25, 2025 (breadcrumb branch switching)](https://neon.com/docs/changelog/2025-04-25), [Changelog May 03, 2024](https://neon.com/docs/changelog/2024-05-03).

---

### Supabase

**Shell anatomy.** Top bar (org picker, breadcrumb, account) + left rail (icon-first, lockable open or collapsed). ~8-10 product icons inside a project: Home, Table Editor, SQL Editor, Database, Authentication, Storage, Edge Functions, Realtime, Advisors, Reports, Logs, API Docs, Integrations, Project Settings.

**One-org-at-a-time enforcement** — sidebar only shows projects for the active org; switching orgs reloads the home/landing scope. They consciously rejected a multi-org tree.

**Feature-specific settings co-located with the Feature** (the 2025-26 migration) — Settings live where the user already is (Database → Configuration, Auth → Configuration, etc.). Only truly cross-cutting settings (Data API, members, billing) stay central. Same pattern Cloudflare is shipping.

**Breadcrumb chevrons as sibling pickers.** Breadcrumb segments with siblings render as dropdown triggers — clicking opens a list of peer entities (other tables in the schema). A power-user accelerator that costs zero extra UI.

**Overloaded ⌘K.** Same key, different behavior by surface — palette in most contexts, AI assistant inside SQL Editor / inline editor. Built on `cmdk`. The palette is **registry-driven** via `useRegisterCommands` — each section registers its commands at runtime. As of March 2026 it can also create entities (tables, RLS policies, Edge Functions, Storage buckets) — not just navigate.

**Sectioned palette results** — separate groups for Action commands and Route commands, each with category labels.

**Tabs in the editor** — VSCode-style transient (single-click, replaceable) vs permanent (double-click) tabs, with "Close Others" / "Close to the Right" / "Open in New Tab" context menu.

**What to borrow:**
- Registry-driven ⌘K with `useRegisterCommands`-style hook. Each Product's plug-in registration includes both routes *and* actions in the palette.
- Co-located service settings, central tray for cross-cutting only.
- Breadcrumb segments as sibling pickers (zero-cost level-3+ jump).

**Sources:** [Upcoming breaking change to Dashboard Navigation](https://github.com/orgs/supabase/discussions/33670), [Project Settings migration](https://github.com/orgs/supabase/discussions/37655), [Command Menu (cmdk)](https://supabase.com/design-system/docs/components/commandmenu), [Breadcrumb component](https://supabase.com/design-system/docs/components/breadcrumb), [Studio 3.0](https://supabase.com/blog/supabase-studio-3-0).

---

### Postman

**Shell anatomy.** Three persistent vertical zones plus a header: top header → far-left **icon rail (4 tabs: Items / Services / History / Local files)** → relational sidebar → workbench → right context bar.

**Type-first sidebar, not feature-first.** Level-2 sidebar lists *one element type at a time* (collections OR environments OR specs), not a menu of mixed Features. The icon rail switches the lens.

**Workbench tabs as the deep-state container.** 5+ levels deep doesn't pollute the tree — the leaf opens as a workbench tab. State persistence lives in tabs, not URLs/breadcrumbs. **No persistent breadcrumb** — title bar + back button + relational-sidebar selection state are the wayfinding crutches.

**Context bar on the right** — entity-scoped actions don't crowd the tree or workbench.

**Customizable rail elements** per workspace — show/hide element types in the sidebar. Plug-in-style customization built in.

**Multi-level folders** with no documented depth cap — folder tree with indented disclosure triangles, drag/drop reorder. Selecting any node opens it as a workbench tab.

**What to borrow:**
- Right-side context bar for entity-scoped actions (especially well-suited to Scope-gated Features).
- Take the breadcrumb absence as a warning, not a model — Postman gets away with it because workspaces are usually small. Wallarm's variable-depth paths and cross-Product jumps need an explicit context strip.

**Sources:** [Navigating Postman](https://learning.postman.com/docs/getting-started/basics/navigating-postman), [Sidebar Configurations](https://blog.postman.com/focus-on-the-work-that-matters-with-sidebar-configurations/), [Multi-level folders](https://blog.postman.com/multi-level-folders-and-folder-reordering/), [The New Postman](https://blog.postman.com/new-postman-is-here/).

---

### Zapier

**Shell anatomy.** Single persistent left rail, expandable/collapsible. Late 2024 they consolidated *previously dual* top + side nav into one vertical menu. ~10-11 top-level items: Home, Zaps, Tables, Interfaces, Chatbots, Canvas, Agents, Apps, History, Tasks usage, Favorites.

**Peer-product rail, no waffle.** Six+ products live as siblings in the same rail with no grouping or switcher. Works because every Zapier surface fundamentally answers "show me my list of X." **Bad fit when products have wildly different internal structures** (which is exactly Wallarm's situation).

**Editor swaps the shell.** Going deep collapses the global rail and gives the canvas the screen. Return is a single named button (e.g. "Zaps" → back to the Zaps folder), not a breadcrumb.

**Folders span 5 levels of nesting** across all product types.

**Cross-product Favorites / Assets page** — Feb 2026's Favorites (any product type) and the unified Assets page are flat overlays *on top of* the per-product silos. They cut sideways through the IA without changing it.

**No global ⌘K** found in public materials. Search lives inside whichever surface you're on, not as a universal palette.

**What to borrow:**
- Cross-cutting Favorites / Pins surface that spans Products. Once Wallarm has 4+ Products with deep trees, users will lose track — pinning a route or policy across Products is the orientation lever.
- Editor-swap pattern is correct for level 4+ work (Zap editor / Postman workbench / Vercel deployment detail). For Wallarm's 5+ level paths, swap to a focused canvas with named back-button when the user goes deep into config.
- **Don't replicate the peer-product rail.** Zapier gets away with it because their products are flat-listing-shaped. Wallarm Products have variable internal trees — keep an explicit Product tier.

**Sources:** [Improvements to navigation](https://community.zapier.com/product-updates/improvements-coming-to-our-navigation-547), [February 2026 product updates](https://zapier.com/blog/february-2026-product-updates/), [Zap editor](https://help.zapier.com/hc/en-us/articles/16722578092429-Use-the-editor-to-build-and-view-your-Zaps), [Folders](https://help.zapier.com/hc/en-us/articles/8496327220877-Organize-your-Zaps-and-folders).

---

### Databricks — Artem reference for "overall layout"

**The persona switcher was removed.** Strongest single signal in this whole report. Pre-2023 you had to pick "Data Science & Engineering / SQL / Machine Learning" mode before seeing relevant tools. The current UI replaced that with a unified sidebar where all three product areas are simultaneously visible as collapsible groups. **Databricks tried persona-mode-switching and walked it back.**

**Two-tier sidebar.** Universal pillars at top (Workspace, Recents, Catalog, Jobs & Pipelines, Compute, Marketplace) + product-area groups below (SQL / Data Engineering / AI/ML — each collapsible with its own children). Locked-but-visible items for entitlement-gated Features — items aren't hidden, they're disabled. **Discoverability over cleanliness.**

**Feature-scoped deep nav, not shell-scoped.** Catalog hierarchy (catalog → schema → table → column) lives inside Catalog Explorer with its own breadcrumb and right-rail metadata panel. Shell stays shallow.

**Account vs Workspace as separate UIs.** Account console (`accounts.azuredatabricks.net`) is a different surface with its own narrower sidebar. Tenant-admin doesn't pollute operator workflows.

**What to borrow:**
- **Don't make Product a hard mode switch.** The strongest cross-cutting lesson. Surface all Products as collapsible groups + universal Platform utilities pinned above. Lock entitlement-gated items, don't hide them.
- Two-tier sidebar (universal pillars + product groups) maps cleanly onto our Platform-utilities-vs-Product-tools split.
- Push entity drill-down into the Feature, not the shell — your `dataplane-id`, `service-id`, `Route ID` cascade should live in the Feature's own breadcrumb / right-rail, not in global chrome.
- Consider Account / Platform admin as a context-jump to a separate UI rather than another sidebar item.

**Sources:** [Find what you seek (new navigation)](https://www.databricks.com/blog/find-what-you-seek-new-navigation-ui), [The Improved Databricks Navigation is Enabled for Everyone](https://www.databricks.com/blog/the-improved-databricks-navigation-is-enabled-for-everyone), [Workspace Browser](https://www.databricks.com/blog/2023/04/05/preview-new-workspace-browser.html), [Catalog Explorer](https://www.databricks.com/blog/accelerating-discovery-unity-catalog-revamped-catalog-explorer).

---

### Amplitude

**Three-tier scope model with different surfaces per cadence.** Org/project = settings deep-link (rare). Space = top-bar dropdown (frequent). Per-artifact project = inline on the chart title (very frequent). They picked surfaces by frequency, not by hierarchy. Same lesson as Kong, surfaced differently.

**Sibling products as continuous sections in one left nav.** No app-switcher / waffle. Analytics / Experiment / Session Replay / Data are sections in one continuous rail.

**User-generated items pin into the sidebar** alongside taxonomy. Created dashboards auto-add to the left rail.

**Aggressive depth flattening.** Space → Dashboard → Chart → Segment is collapsed into one shell + inline chart-title pickers + right-side panels. No nested left-rail tree drilling.

**Caveat:** Amplitude lacks a visible breadcrumb / context strip. Works because depth rarely exceeds 3. **Wallarm can't replicate this** — `service-id → Routes → Route ID → flow → policies → policy-id` is genuinely 5+ deep.

**What to borrow:**
- Match scope picker placement to selection cadence (rare = settings, frequent = top bar, very frequent = inline on the entity title).
- Auto-pin user-created entities into the sidebar.
- Don't borrow the missing breadcrumb — it's a tax we can't pay at our depth.

**Sources:** [Meet our new navigation](https://community.amplitude.com/product-updates/meet-our-new-navigation-1593), [Redesigning Navigation & UX](https://amplitude.com/blog/redesigning-navigation-and-ux), [Search docs](https://amplitude.com/docs/analytics/search), [Spaces](https://amplitude.com/docs/get-started/spaces).

---

### Sentry — Artem reference for hover+pin

**Stacked navigation (GA 2025).** Primary sidebar collapsed from ~12 product links to **4 top-level "areas": Issues, Explore, Boards, Insights** + footer cluster. Clicking an area swaps a **secondary nav column**, doesn't navigate. The primary column **is** the product switcher.

**Secondary nav as a plug-in contract.** `<SecondaryNav>` is a portal-rendered component beside the primary sidebar. **Each area registers its own — product teams own their secondary nav code.** Structure: `Body` → `BodySection` (titled groups) → `Item` / `ItemProjectIcon`, plus a `Footer` slot. This is the cleanest plug-in registration pattern in the whole survey.

**Sticky scope filters as a page strip, not sidebar nodes.** Project / Environment / Date Range live in a horizontal page-level filter strip — never pollute the nav tree. Persist across navigation. **Lesson:** scope pickers don't belong in the nav tree.

**Hover-pin sidebar pattern (the thing Artem flagged).** From the EPIC: *"we need this solution to handle a collapsible sidebar. When collapsed (either by user action or because the screen is too small), the sidebar items should instead be rendered in a flyout."* One component, three render modes (expanded / collapsed-flyout / mobile). Explicit toggle button for pin; preference is persisted.

*(Caveat: I couldn't confirm a literal "peek-on-hover-without-committing + click-to-pin" gesture in public materials. What's verifiable is collapsed-with-hover-flyout + explicit toggle for persistent expanded state. The "peek-then-pin" framing is consistent with the implementation but not stated verbatim.)*

**Levels 3+ are not sidebar nodes.** Issue → Event → Stack frame uses inline event dropdown + accordion in the main pane. Sidebars stay put as you drill (design tenet: *"Minimize Content Refreshes — preserve as much UI as possible (headers, sidebars) when navigating between views"*).

**What to borrow:**
- **The Sentry plug-in pattern is the spec we should write our Manifest against.** A uniform `<SecondaryNav>` portal component, each Product registers its own contents (with `Footer` slot for utility tools).
- Scope filters belong in a page-level strip, not the sidebar.
- Stacked nav: top-level Products are containers that swap the secondary column, not destinations themselves.
- Hover-flyout-when-collapsed + explicit pin toggle for persistent expanded state.

**Sources:** [Sentry's new Navigation (GA)](https://sentry.io/changelog/new-nav-issue-views-ga/), [EPIC Stacked Navigation](https://github.com/getsentry/sentry/issues/84016), [EPIC Milestone 1](https://github.com/getsentry/sentry/issues/84018), [SecondaryNav PR](https://github.com/getsentry/sentry/pull/83687), [Frontend Design Tenets](https://develop.sentry.dev/frontend/design-tenets/).

---

### PostHog

**Pin-anything shortcuts replace a fixed product menu.** Top-level nav is user-curated. Canonical product list lives in a search dropdown, not in chrome. Their explicit rationale: PostHog is *"outgrowing the clothes that once fit"* — past 10 products, planning for 50+. The same pressure Wallarm faces.

**Folders as a first-class organizational primitive** *across product types*. A folder can mix insights, dashboards, feature flags, experiments — nav is content-shape-agnostic.

**Right-side companion panel** (notebooks, docs, support, settings, onboarding) — orthogonal to nav. Travels with the user across products.

**`g`-prefix chord shortcuts** that work everywhere without the palette: `g t` theme, `g h` health, `g a` account, `g p` project switcher, `g o` org switcher. True keyboard-first scope switching.

**Truly global ⌘K** that indexes everything: 5 most recent items, all apps/tools by recency, persons by name or pasted ID, groups, organizations, all settings, "New X" creators, system utilities (SDK doctor, theme toggle), plus **Tab launches PostHog AI** with the current text. *"a single keystroke reaches anything in the app, which is how they justify removing the static top-level product list."*

**What to borrow:**
- **Don't enumerate Products in chrome forever.** The single biggest lesson at growth: pinned-shortcuts model + searchable Product registry scales where fixed top-bar switcher does not.
- Truly global ⌘K (entities + settings + actions) is the escape hatch that lets you delete navigation.
- `g`-prefix chord shortcuts for scope-swap surfaces — fastest possible cross-Product jump.

**Sources:** [Redesigned nav menu](https://posthog.com/blog/redesigned-nav-menu), [PostHog 3000](https://posthog.com/blog/posthog-as-a-dev-tool), [Command palette](https://posthog.com/docs/cmd-k).

---

### GitLab — Artem reference for "overall layout"

**Two-level sidebar ceiling, depth in page chrome.** Pajamas spec is explicit: only two visual levels in the sidebar (top-level item + sub-level items). Anything deeper goes to in-page tabs / sub-sub-tabs / URL state. GitLab handles 5+ logical levels (group → subgroup → project → MR → diff → comment) without ever exceeding two sidebar levels. **The discipline is: sidebar = "where am I working", page = "what am I doing inside it."**

**Per-scope pinning with persistent scope-sets.** Hover any sub-level item → thumbtack → click pins it to a "Pinned" section at the top of the sub-nav. Pin sets are scoped — what you pin in *any* project is independent from what you pin in *any* group. Map this to Wallarm: a user's pinned Features inside any Edge service appear in every Edge sidebar; pins inside any AI Hypervisor service appear there.

**Plug-in registration via a `Sidebars::Panel` subclass.** Each scope (Project, Group, Admin, Your Work) is its own Panel object that owns its sections. The shell asks the active Panel "what are your sections?" — variable breadth and depth become the Panel's problem, not the shell's. **This is the architectural pattern for our Manifest.**

**Stage-style top-level grouping** (Plan / Code / Build / Secure / Deploy / Operate / Monitor / Analyze) is more durable than feature-name grouping. Adding a new Feature slots into an existing stage. Wallarm should resist a flat list of Features per Product — group them by job-to-be-done so new Features don't repressure the IA.

**Single command-palette as the multi-product switcher.** "Search or go to" with sigil prefixes: `:` projects, `@` users, `~` files, `>` commands, plain text = global search. One palette absorbs all the cross-scope nav.

**Breadcrumb is the cascade.** Sidebar shows context label + sub-nav; ancestry lives in the breadcrumb at the top of the content area. Clicking ancestor segments goes up the tree.

**What to borrow:**
- **Two-level sidebar ceiling is the rule.** Combined with stage-style grouping (verbs/lifecycle phases) it absorbs new Features without IA pressure.
- Per-scope pinning (pinned within Edge appears in every Edge instance, etc.) — a Manifest can declare "pinnable" items.
- Sigil-prefixed ⌘K: `:` Products, `@` entities (`dataplane-id`, `route-id`), `>` actions.
- Plug-in registration as a Panel object that owns its sections.

**Sources:** [Tutorial: Navigate the GitLab interface](https://docs.gitlab.com/tutorials/left_sidebar/), [Pajamas Navigation sidebar](https://design.gitlab.com/usability/navigation-sidebar/), [Command palette docs](https://docs.gitlab.com/user/search/command_palette/), [Pin sidebar items #378547](https://gitlab.com/gitlab-org/gitlab/-/issues/378547), [Cmd+K issue #421947](https://gitlab.com/gitlab-org/gitlab/-/issues/421947).

---

## LEGO bricks — recurring nav primitives

These are the primitives that show up across multiple vendors. Building blocks for our shell.

### Top-level chrome

| Brick | What it is | Vendors | Notes |
|---|---|---|---|
| **Top utility cluster** | account avatar, notifications, help, search, ⌘K trigger | All | Right side of top bar; **never** part of any Product's nav |
| **Product rail** | persistent left rail listing Products | Cloudflare, Intercom, Postman (icon rail), Sentry (4 areas), GitLab, Databricks | Two flavors: full-sidebar list (Cloudflare) or icon-only rail (Postman, Sentry, Intercom partial) |
| **Product switcher in palette** | Products discoverable through ⌘K, not chrome | PostHog, GitLab (sigil `:`) | Used when product count > ~10 |
| **Scope picker in top bar** | org / project / workspace | Vercel, Supabase, Postman, PostHog, Amplitude (Spaces) | For frequent scope-swap |
| **Scope picker as breadcrumb** | top-left segment-clickable scope cascade | Neon, Kong (CP), Supabase | For very frequent scope-swap; one control does both location and selection |
| **All-Products catalog page** | full-page list of all Products + categories, separate from working sidebar | GCP, PostHog (Products dropdown) | Decouples discovery from daily-driver nav |

### Sidebar

| Brick | What it is | Vendors | Notes |
|---|---|---|---|
| **Two-level chrome ceiling** | top-level item + sub-level items, no third rail | GitLab (Pajamas spec), Intercom, Sentry, Cloudflare, Databricks, Kong | The most universal pattern in this survey |
| **Section header (collapsible group)** | titled group containing sub-items | GitLab, Intercom, Databricks, Sentry (`BodySection`) | Stage-style verb groupings (Plan/Build/Secure) outscale feature-name groupings |
| **Pin / unpin item** | hover thumbtack → adds to "Pinned" section at top of sub-nav | GitLab, GCP, Intercom, PostHog, Postman, Vercel (Favorites) | Universal personalization lever |
| **Scoped pin sets** | pins inside a Project apply to all Projects | GitLab | Maps to: pins inside any Edge service appear in all Edge services |
| **Lock-and-show (entitlement)** | items disabled but visible if user lacks permission | Databricks | Discoverability over cleanliness — ENABLE in plug-in Manifest |
| **Scope picker slot** | scope picker pinned to top of sub-nav | Cloudflare (account/zone), Sentry (project icon item) | For sub-nav that is scope-gated |
| **Footer slot** | utility items at bottom of sub-nav | Sentry (`Footer`), GitLab (Settings) | Plug-in registration should expose this |
| **Hover-flyout when collapsed** | collapse → icons; hover icon → flyout with sub-items | Sentry, Supabase, Intercom, Cloudflare | Standard collapsed-state pattern |
| **Pin / persist expanded state** | explicit toggle commits to expanded mode | Sentry, Supabase, Cloudflare, Vercel | Preference is per-user, persisted |
| **Drag-resize sidebar** | rare, but Vercel and Databricks BigQuery Studio support it | Vercel | Nice-to-have, not essential |

### Cross-cutting

| Brick | What it is | Vendors | Notes |
|---|---|---|---|
| **⌘K command palette** | global keyboard-first jump + actions | Supabase, Sentry, Vercel, Cloudflare, Postman, PostHog, GitLab, Intercom (scoped) | **Non-optional** at our depth/breadth |
| **Sigil-prefixed palette** | `:` projects, `@` users, `~` files, `>` actions | GitLab | Compact way to express scope-typed search |
| **Bucketed palette results** | results grouped by scope (account-wide vs zone-specific) | Cloudflare, Supabase | Solves the static-vs-scoped split Artem flagged |
| **Registry-driven palette** | each section calls `useRegisterCommands` at runtime | Supabase | Plug-in Manifest hook |
| **Search-as-IA-aliasing** | search indexes both old and new names during a redesign | Cloudflare | Migration shim |
| **Scope-preserving slot** | switching project lands you on the same Feature, not project home | Vercel | Cross-Product teleport without context loss |
| **Filter strip (page-level scope)** | sticky horizontal strip with project / env / date | Sentry | Scope pickers that are page-level, not nav-level |
| **Page-level breadcrumb** | top of content area, full path, segments are clickable | GitLab, Cloudflare, Supabase, Kong, GCP | The depth carrier when sidebar caps at 2 |
| **Breadcrumb sibling-picker** | chevron on segment opens list of peers | Supabase | Power-user accelerator at zero UI cost |
| **Right-side detail drawer** | slide-in panel for entity detail; list stays behind it | Vercel, Supabase, Postman, GitLab, Sentry (issue), Databricks | Standard for level 4 |
| **Editor-swap** | level 4+ takes over the chrome; named back-button to return | Zapier, Postman, Vercel (deployment) | For deep config flows |
| **In-page tabs on entity** | level 3 — tabs under entity header (Metrics / Logs / Settings) | Cloudflare, GCP, Vercel, Supabase, Sentry | Standard for level 3 |
| **Filter-and-zoom-in-place** | level 5 — no navigation, just refine the current view | Vercel (Observability), Cloudflare (R2), Amplitude | When data hierarchy is genuinely flat |
| **Distributed Settings** | service settings co-locate with the service | Cloudflare, Supabase | Trend; only cross-cutting settings stay central |
| **Cross-product Favorites / Recents** | flat overlay across Product silos | Zapier, GitLab, Vercel, GCP | Orientation lever as Product count grows |
| **Account console as separate UI** | tenant-admin lives in a different surface | Databricks | Keeps platform admin out of operator workflows |
| **Hierarchical URL** | `/[scope1]/[scope2]/[product]/[entity]/...` | Cloudflare, Vercel, Supabase, PostHog | Shell renders nav from URL state — **load-bearing for plug-in model** |

---

## Patterns by structural question

Mapping each open question (from `open-items.md`) to vendor evidence so decisions can cite precedent.

### "Two-level sidebar ceiling" — universal rule

**Evidence:** GitLab (explicit Pajamas spec), Intercom, Sentry (design tenet), Cloudflare, Databricks, Kong, PostHog, Amplitude, Vercel (with one Settings exception, which they call out as breaking their own rule).

**Implication:** Cap our sidebar at two levels. Anything deeper — the `Routes → Route ID → flow → policies → policy-id` chain — lives in page chrome (tabs, drawers, breadcrumbs, filter strips, editor swap).

### Scope-frequency dictates chrome placement

**Evidence:** Kong's explicit rule (org top-right, region bottom-left, CP via drilling). Amplitude's three-tier model (org=settings, space=top-bar, project=chart-title). Intercom (workspace=Settings, team=sidebar). Sentry (project filter in page-strip not sidebar).

**Implication:** Don't ask "where does the picker live" — ask "how often does it switch?" Then place accordingly:

| Switch frequency | Placement | Wallarm example |
|---|---|---|
| Rare (months) | Settings deep link or top-right corner | Tenant / billing scope |
| Occasional (days) | Top bar dropdown or breadcrumb segment | Product (Edge / AI Hypervisor / etc.) |
| Frequent (multiple/day) | Sidebar header or breadcrumb segment | `dataplane-id` Scope |
| Page-level (per view) | Inline filter strip on the page | Time range, environment within a Feature |

### Product switcher form — what's the shape?

**Evidence:** Tile launchers (waffle) are **absent** from every reference. The shapes that exist:
- **Peer-product rail** (Zapier, Intercom, Cloudflare, Kong, Supabase) — Products as siblings in one rail
- **Stacked-secondary** (Sentry) — top-level area swaps secondary column
- **Hamburger with categories** (GCP) — pin-driven; closest to a launcher but still anchored in the sidebar
- **Persona / mode switch** (old Databricks) — **explicitly walked back**; abandoned 2023

**Implication:** Drop tile/waffle from consideration. Default toward a peer-product rail or Sentry-style stacked. Don't introduce a mode switch.

### Same sidebar or new chrome on scope-in?

**Evidence:** **Replace, don't stack** is universal. Cloudflare's same-rail-three-meanings, Kong's CP push-replace, Sentry's stacked-swap, Vercel's scope-reframe, Neon's stable-structure-rebound-targets.

**Implication:** When a Product shapeshifts on Scope selection, the same sidebar replaces its contents. We do not add a second column.

### Deep paths — full tree vs focus

**Evidence:** Universal: focus, not full tree. Sidebar at 2 levels max; depth lives in tabs (level 3), drawers (level 4), filter-zoom (level 5). Vercel demonstrates this exact tier-by-tier toolkit.

### Two render states for every gated Feature

**Evidence:** Confirmed across Cloudflare (account-home before zone), Kong (CP list before in-CP), Supabase (project list before in-project), Vercel (team home before project), Neon (project list before in-project).

**Implication:** Every gated Feature needs both states designed: (a) "pick a scope" — list / search / recent / empty state; (b) "scope selected" — contextual sub-nav. Plus a "last-used scope" memory to short-circuit (a) when reasonable.

### Manifest contract — what does a team declare?

**Evidence:**
- **Sentry**: `<SecondaryNav>` portal component with `Body` → `BodySection` → `Item` + `Footer` slot — each Product team renders their own.
- **GitLab**: `Sidebars::Panel` subclass per scope class. Panel owns sections.
- **Supabase**: `useRegisterCommands` for palette integration.

**Implication:** Our Manifest has at least three slots: (1) sidebar declaration (sections, items, pinnable, scope-picker slot, footer), (2) routes (URL-encoded, with scope levels), (3) palette commands (registered for ⌘K). The shell renders the chrome; teams declare structure + commands.

### Recursive sub-nav — does the primitive recurse?

**Evidence:** **No.** Universal cap at 2. Recursion happens in *content* (Postman folders, Cloudflare R2 prefixes, GCP Catalog tree) not chrome.

### Cross-Product teleport without context loss

**Evidence:** Vercel's "scope-preserving slot" — switching project lands you on the same Feature. Supabase's "auto-redirect to last active organization." GitLab's per-scope pin persistence.

**Implication:** Adopt Vercel's rule for Wallarm: switching Product lands on the same Feature slot if the target Product has it; otherwise fall back to that Product's home. Persist last-used Scope per Product so re-entering doesn't force a fresh pick.

### Platform utilities — placement and ownership

**Evidence:** Top-bar right cluster is universal for account / notifications / help / ⌘K trigger. Settings is increasingly **distributed** (Cloudflare, Supabase migrating that way) — only cross-cutting settings stay central.

**Implication:** Platform utilities live in the top bar's right cluster. A "Settings" Platform utility exists for cross-cutting (members, billing, audit), but Feature-specific settings co-locate with the Feature inside the Product.

### "Overview" as per-level convention

**Evidence:** Confirmed across vendors. Most have a "Home / Overview" at every meaningful level (Product home, Scope home, etc.). Not a dedicated slot — a convention each team opts into.

**Implication:** The Manifest should reserve the *concept* of an Overview (always at index 0 in a section if present) without forcing teams to ship one.

---

## Recommendations for the Wallarm prototype

Concrete starting positions for v0. Each is rooted in vendor precedent — citation in parentheses.

1. **Two-level sidebar ceiling, hard rule.** Sidebar shows Product-level top items + one level of sub-items. Anything deeper is page chrome — tabs, drawers, filter strips, breadcrumb-with-pickers. *(GitLab Pajamas; Intercom; Sentry design tenets.)*

2. **Product rail as a left-side persistent control.** The four current Products (Edge, AI Hypervisor, Infra Discovery, Testing) plus future ones live as siblings in a left rail. Don't model this as a tile launcher. *(Zapier, Cloudflare, Kong, Sentry stacked.)* Once we exceed ~8-10 Products, an "All Products" catalog page becomes the discovery surface and the rail shows pinned ones. *(GCP, PostHog.)*

3. **Scope picker placement by frequency:**
   - **Tenant** (very rare) → Settings deep link
   - **Product** (occasional) → left-rail click (the Product rail itself)
   - **`dataplane-id`** (frequent) → top-of-sidebar slot or breadcrumb segment, entered by *drilling* through the Edge → Dataplane list
   - **Time range / region / env** (page-level) → page filter strip
   *(Kong's frequency rule; Sentry filter strip; Neon breadcrumb-as-picker.)*

4. **Replace, don't stack, on scope-in.** When `dataplane-id` is selected, the Edge sidebar replaces its content with `Nodes / Services / Overview / Govern`. No second column. The Product rail stays put. *(Cloudflare, Kong push-replace.)*

5. **Stable structure, dynamic binding.** Sub-nav items don't disappear on scope change — they re-bind to the new scope. Plug-in registrations are durable. *(Neon's "dynamic sidebar.")*

6. **Page-level breadcrumb scoped to the active Product.** Top of content area, full path: `Product > Scope > Feature > Entity > sub-Entity`. Each segment is a clickable picker (sibling list popover on chevron-click). This is our depth carrier. *(GitLab, Cloudflare, Supabase chevron-pickers, Neon.)* Note: this matches Artem's existing annotation on Vercel ("breadcrumbs scoped on product level").

7. **Distributed Settings.** Product-specific settings live in the Product's sidebar; cross-cutting Settings (members, billing, audit, integrations) are a Platform utility in the top bar. *(Cloudflare's recent migration, Supabase's recent migration.)*

8. **⌘K from day one.** Sigil-prefixed palette: `:` for Products, `@` for entities (any Resource by ID — `dataplane-id`, `route-id`, `policy-id`), `>` for actions, plain text for global search. Bucketed results: "Platform-wide" vs "Current Product." Registry-driven (each Product's Manifest declares its commands). *(GitLab sigils, PostHog scope, Supabase registry, Cloudflare bucketed results.)*

9. **Sidebar collapse model: hover-flyout + explicit pin.** Default expanded. Collapse to icon-only via `cmd+B` (matches Artem's note). Hovering a collapsed item surfaces the same sub-nav contents in a flyout. Explicit toggle commits to expanded-and-persisted. *(Sentry EPIC, Supabase, Intercom.)*

10. **Manifest contract** (first cut, to refine): each Product team declares
    - **Identity**: id, name, icon, category
    - **Sidebar**: sections (titled groups, optional pinnable, optional scope-picker slot, optional footer items)
    - **Routes**: URL patterns mapping to sections; scope requirements (which Resource ID is needed before this route renders)
    - **Palette commands**: actions registered into ⌘K (with optional sigil)
    - **Settings**: which sub-routes are "settings for this Feature" (so they co-locate)
    *(Sentry `<SecondaryNav>` shape + GitLab `Sidebars::Panel` + Supabase `useRegisterCommands` combined.)*

11. **Cross-Product teleport rule**: switching Product lands on the same Feature slot if target Product has it; otherwise on Product home. Persist last-used Scope per Product. *(Vercel's "improved cross-team experience.")*

12. **Pinning** (post-v0, not blocker): per-Scope pinned Features (Edge pins persist across all Edge dataplane scopes; AI Hypervisor pins persist across its instances). *(GitLab.)*

13. **Lock-and-show, don't hide.** Features the current user lacks entitlement for stay visible but disabled, with a lock icon and a "this is gated by X" tooltip. *(Databricks.)*

14. **Editor-swap for level-4+ work.** When a user drills into editing a `flow` or a complex `policy-id` configuration, the chrome can be replaced with a focused canvas + named back-button. Use sparingly — Vercel and Postman do this only for genuinely deep flows. *(Vercel deployment detail, Postman workbench, Zapier Zap editor.)*

15. **Hierarchical URL** is the source of truth. Shell renders nav from URL state. Format: `/{service}/{scope?}/{tool}/{entity?}/...` with each segment optional based on Manifest declarations. *(Cloudflare, Vercel, Supabase, PostHog.)*

---

## What this changes in our open questions

Several questions in [open-items.md](open-items.md) now have strong vendor precedent — they move toward "tentatively decided" rather than fully open. Specifically:

- **Product switcher form** → peer-product rail (or Sentry-style stacked); tile launchers off the table.
- **Replace vs stack on scope-in** → replace is universal.
- **Deep paths: full tree vs focus** → focus (sidebar caps at 2 levels).
- **Recursive sub-nav** → no, universal cap at 2.
- **Two render states for every gated Feature** → confirmed; both states must exist.
- **"Overview" as per-level convention** → it's a convention, not a slot.

New questions surfaced by the research, captured in `open-items.md`:
- Plug-in Manifest exact shape (Sentry / GitLab / Supabase patterns to consolidate).
- "Lock-and-show" vs "hide" for entitlement-gated Features.
- Whether Marketplace-style external integrations look identical to platform Products after install (Vercel) or are visually marked.
- Sigil set for our ⌘K palette.

---

## Appendix — research method

- 14 parallel research agents, one per vendor, dispatched 2026-04-28.
- Each agent had a focused 8-section brief (shell anatomy, multi-product, scope pickers, sub-nav, deep nav, breadcrumbs, search, what to borrow).
- Each agent restricted to public materials (docs portals, changelogs, design-system docs, blog posts, public GitHub).
- All sources cited inline per vendor.
- Cross-cutting synthesis (LEGO bricks, recommendations) is the main thread's work, not the agents'.

This is a snapshot. Re-run when the FigJam evolves significantly or when a referenced vendor ships a major nav redesign.
