# Global Navigation Prototype — Glossary

Working vocabulary for the project. The point of this file: when Artem, PM, and engineering talk about "the thing inside the other thing," everyone names it the same way.

**Nothing here is locked yet.** Every term below is Artem's working proposal. Status will only flip from **proposal** to **agreed** after a review pass with the team.

Status legend:
- **proposal** — Artem's working term, refine via PR or in conversation
- **agreed** — locked after team alignment, use it consistently
- **open** — concept exists, name still to be chosen

---

## Quick reference

At-a-glance overview of the levels and cross-cutting concepts. Level numbers are *typical* — the model is recursive, so Scope / Scoped sub-nav / Resource can repeat at deeper levels (a `service-id` is a Resource of one Tool but also acts as a Scope for the next sub-tree).

| Level | Term | What it is | Examples (from Platform-jam) | Status |
|---|---|---|---|---|
| 0 | **Platform shell** | The chrome that hosts everything: top bar, sidebar, switcher, context strip | The nav itself | proposal |
| 1 | **Service** | Top-level platform bucket | Edge, AI Hypervisor, Infra Discovery, Testing | proposal |
| 1 (parallel) | **Platform utility** | Cross-cutting nav items that live *outside* any Service | global settings, user settings, doc center, notifications | proposal |
| 2 | **Tool** | Direct child of a Service | Edge → Overview, Attacks, WAF rules, Dataplane | proposal |
| 3+ | **Scope** | Selection that gates access to a sub-tree (Tool can't render until a Scope is chosen) | A specific `dataplane-id` chosen inside Edge → Dataplane | proposal |
| 3+ | **Scoped sub-nav** | The set of children that appear inside a chosen Scope | Nodes, Overview, Services, Govern (inside `dataplane-id`) | open |
| ∞ | **Resource** | Leaf-level, ID-addressable entity | `route-id`, `policy-id`, `service-id`, `dataplane-id` | proposal |

Cross-cutting:

| Concept | What it is | Status |
|---|---|---|
| **Manifest** | What a team submits to inject a Service or Tool into the global nav | proposal |
| **Switcher** | The control that switches between Services | proposal |
| **Picker** | The control that selects a Scope (e.g. picks a `dataplane-id`) | proposal |
| **Context strip** | Persistent surface showing the active Service + Scope + parent Resources, with swap controls at each level | proposal |
| **Filter strip** | Page-level horizontal strip carrying per-view scopes (time range, env, region) | proposal |
| **Palette** | Global ⌘K command surface with sigil prefixes and bucketed results | proposal |
| **Pin** | User-controlled affordance to surface an item to the top of a sub-nav | proposal |
| **Hover-flyout** | Collapsed-sidebar render mode (hover icon → flyout sub-nav) | proposal |
| **Editor-swap** | Chrome takeover for level-4+ deep work | proposal |
| **Detail drawer** | Right-side slide-in panel for entity detail (list stays behind) | proposal |
| **Lock-and-show** | Entitlement-gated Tools rendered as visible-but-disabled (not hidden) | proposal |
| **Distributed Settings** | Tool-specific settings co-located with the Tool; only cross-cutting stays central | proposal |

---

## Levels of the navigation model

Top-down, from platform shell to leaf resource.

### Service — **proposal**

A top-level platform bucket. The Atlassian analogue: Jira and Confluence are both Services within the Atlassian ecosystem. In our model: **Edge**, **AI Hypervisor**, **Infra Discovery**, and **Testing** are Services. More Services will arrive over time.

A Service:
- has its own internal nav tree
- is what the cross-platform Switcher switches between
- is owned by one team (typically), which declares its tree via a Manifest

### Platform utility — **proposal**

A cross-cutting nav item that lives *outside* any Service. Examples from the Platform-jam: **global settings**, **user settings**, **doc center**, **notifications**. The board annotates these as "not attached to services → they live outside of them."

A Platform utility:
- is reachable from anywhere in the platform — independent of which Service the user is in
- is owned by the shell, not by any single product team
- typically lives in the top bar (often the right side, like AWS / GCP / Atlassian)
- is *not* a Service: it doesn't host a tree of Tools the way Edge does

This is the right home for things like the global Settings cluster, account/user menu, help/docs entry, notifications, and global cmd+K search.

Open: do Platform utilities support team injection via Manifest (e.g., a team adds a "billing" item) or are they fixed by the shell? Captured in [open-items.md](open-items.md).

### Tool — **proposal**

A direct child of a Service. Within Edge, examples are **Overview**, **Attacks**, **WAF rules**, and **Dataplane**. A Tool is what the user actually navigates to in order to do something — it's the unit teams ship.

Considered alternatives: *Application* (heavier, Atlassian-flavored), *Section* (purely structural, says nothing about purpose), *Module* (engineering-flavored). Sticking with **Tool** because Artem used "tools or applications" in conversation and it pairs naturally with Service.

A Tool may be:
- **Unscoped** — usable directly (Edge → Attacks).
- **Scoped** — gated behind an entity selection (Edge → Dataplane → pick a `dataplane-id`). See *Scope* below.

Pattern observation: every Service in the Platform-jam currently has an **Overview** Tool as a default landing. "Overview" also reappears inside scoped sub-nav (`dataplane-id` → Overview). It looks like a per-level convention, not a unique entity — worth treating as a pattern in the Manifest contract rather than a hard-coded slot.

### Scope — **proposal** (structural concept; user-facing label TBD)

The selection that has to be made before a Scoped Tool's contents become reachable. Today the only example is a **data plane**: inside Edge, choosing a specific `dataplane-id` defines the scope, and the Scoped sub-nav (`Nodes`, `Services`, `Overview`, `Govern`) is rendered against that scope.

Other Services will introduce their own scope axes — project, tenant, cluster, environment. The structural concept is the same; the user-facing label will vary per Service.

Open: do we use a single user-facing word ("Scope," "Context") consistently across Services, or let each Service name its own scope (Wallarm-Edge says "Data plane," another Service might say "Cluster")? Captured in [open-items.md](open-items.md).

### Scoped sub-nav — **open**

The set of Tools or sections that appear *inside* a selected Scope. Inside `dataplane-id`: `Nodes`, `Overview`, `Services`, `Govern`. Functionally these are Tools too, but they only exist in the context of a chosen Scope.

Naming options on the table: *Scoped Tool*, *Sub-tool*, *Section*. **Section** is tempting as a generic level-2+ term, but it collides with the everyday meaning of "section of a sidebar." Holding off until the Service / Tool / Section split is settled with the team.

### Resource — **proposal**

A leaf-level entity addressable by ID. Examples from the Edge tree: `route-id`, `policy-id`, `service-id`, `dataplane-id`. Resources are what URLs end on; everything above them is structure.

Note: a Resource at one level can act as a Scope at a deeper level. A `service-id` is a Resource of the Services Tool, but its sub-tree (`Routes`, `Flows`, `Setting`) is rendered as if `service-id` were a Scope. This recursion is exactly why the nav primitive has to be agnostic about depth.

---

## Cross-cutting concepts

### Manifest — **proposal**

The declaration a team submits to inject a Service or Tool into the global nav. Working shape (informed by Sentry's `<SecondaryNav>`, GitLab's `Sidebars::Panel`, and Supabase's `useRegisterCommands`):
- **Identity**: id, name, icon, category
- **Sidebar**: sections (titled groups) → items (with optional `pinnable`, `scope-picker slot`, `footer slot`)
- **Routes**: URL patterns mapping to sections; scope requirements (which Resource ID is needed before the route renders)
- **Palette commands**: actions registered into the Palette (with optional sigil)
- **Settings**: which sub-routes are "settings for this Tool" (so they co-locate, not bubble up to global Settings)

See [references.md](references.md) for the vendor evidence behind each slot.

### Switcher — **proposal**

The control that switches between Services. Working form (informed by the reference research): a peer-product rail (Cloudflare / Kong / Zapier shape) or a stacked-secondary pattern (Sentry shape). Tile / waffle launchers are off the table — they don't appear in any reference. Once Service count exceeds ~8-10, complement the rail with an "All Services" catalog page (GCP / PostHog pattern) so the rail can show pinned ones.

### Picker — **proposal**

The control that selects a Scope (e.g. picks a `dataplane-id`). Distinct from the Switcher: Switcher moves between Services, Picker chooses a Scope inside one.

Working placement rule (Kong's "scope-frequency dictates chrome placement"): rare swaps live in Settings or top-right corner; frequent swaps live in the sidebar header or as breadcrumb segments; page-level scopes (time range, environment) live in a page-level **Filter strip**.

### Context strip — **proposal**

The persistent surface (likely a breadcrumb-with-pickers) that shows the active Service + Scope + parent Resources, and lets the user swap any level without losing their place. Working shape: page-level breadcrumb at the top of the content area, scoped to the active Service, with each segment as a clickable popover-picker (Neon / Supabase / Kong / GitLab pattern).

### Filter strip — **proposal**

A page-level horizontal strip carrying scope selectors that are **per-view** rather than per-Service (time range, environment, region). Distinct from the Context strip — the Context strip carries hierarchy ancestors, the Filter strip carries query parameters. Sentry pattern; cross-page sticky.

### Palette — **proposal**

The global ⌘K command surface. Working shape:
- **Sigil prefixes** for query-type routing: `:` Services, `@` entities by Resource ID, `~` settings/files, `>` actions, plain text = global search (GitLab pattern).
- **Bucketed results** by scope: "Platform-wide" vs "Current Service" (Cloudflare pattern).
- **Registry-driven**: each Service's Manifest declares its commands at runtime (Supabase `useRegisterCommands` pattern).

### Pin — **proposal**

User-controlled affordance to surface an item to the top of a sub-nav (or rail). Pin sets are typically **scoped to a class** — e.g. pins inside any Edge Service appear in every Edge Service (GitLab per-scope pinning). Reduces the "fixed top-level" problem by letting users curate.

### Hover-flyout — **proposal**

The collapsed-sidebar render mode: when the sidebar is collapsed to icons, hovering an icon surfaces the same sub-nav contents in an absolute-positioned flyout. Paired with an **explicit pin/expand toggle** (often `cmd+B`) that commits to the expanded state and persists per-user. Sentry / Supabase / Intercom / Cloudflare pattern.

### Editor-swap — **proposal**

Chrome takeover for level 4+ work. The global rail and sidebar collapse; a focused canvas plus a named back-button replace the chrome. Used sparingly for genuinely deep configuration flows (Vercel deployment detail, Postman workbench, Zapier Zap editor). Distinct from a Picker / Drawer because it removes the surrounding nav.

### Detail drawer — **proposal**

A right-side slide-in panel for an entity's detail, with the originating list staying behind it (filters intact). Standard for level-4 drilling without losing context (Vercel Logs, Supabase row editor, Postman context bar, GitLab details panel).

### Lock-and-show — **proposal**

Render entitlement-gated Tools as visible-but-disabled with a lock icon and a tooltip explaining the gate, instead of hiding them. Discoverability over cleanliness. Databricks pattern; distinct from "hide if not entitled."

### Distributed Settings — **proposal**

Pattern of co-locating Tool-specific settings *with the Tool*, not bubbling everything up to a global Settings tray. Only cross-cutting settings (members, billing, audit, integrations) stay central — those become Platform utilities. Cloudflare and Supabase have both shipped migrations toward this; the trend is consistent.

---

## Anti-terms

Words to avoid because they're already overloaded inside Wallarm or in our references:

- **App / Application** — collides with the customer's protected applications in the Wallarm product domain. Use **Service** for top-level buckets and **Tool** for their children.
- **Section** — too generic; means "any visual chunk of the sidebar" in casual use. Use only if we deliberately lock it to one structural level.
- **Module** — engineering-flavored, implies code packaging more than user mental model.
- **Product** — Atlassian uses this for Jira/Confluence, but inside Wallarm "product" already means commercial offering / SKU. Avoid.

---

## Still to name

- The user-facing word for **Scope** (one term across all Services, or per-Service).
- The user-facing word for **Scoped sub-nav** (Tool vs. Sub-tool vs. Section).
- The label for the **Context strip**.
- Whether **Platform utility** is the right name, or something shorter ("Utility," "Shell item," "Top-bar item").
- The exact **sigil set** for the Palette (`:` Services, `@` entities, `~` settings, `>` actions — confirm or adjust per Wallarm conventions).
- Whether plug-in / Marketplace Services should look identical to platform Services after install (Vercel pattern) or be visually marked.
