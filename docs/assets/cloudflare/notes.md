# Cloudflare reference screenshots

Visual + transition reference material captured 2026-04-28 from Cloudflare dashboard (`dash.cloudflare.com`), Artem's account. Saved here so we have something to fall back on while implementing — text descriptions can't capture proportions, density, or interaction feel.

The broader Cloudflare nav research (account/zone scope cascade, ⌘K Quick Search, Settings distribution, etc.) lives in [`../../references.md`](../../references.md). This folder focuses on the four specific frames Artem walked through during the v0 plan review.

## Inventory

| File | Shows | Key thing it teaches |
|---|---|---|
| [`01-workers-pages.png`](01-workers-pages.png) | Account → Build category → Compute group expanded → **Workers & Pages** selected | Single-column packing: category labels (Observe / Build), groups with chevron, indented children, item density |
| [`02-transformations.png`](02-transformations.png) | Build → **Media** group → **Images** sub-group → **Transformations** selected | Groups can nest recursively (group inside group); same chevron + indent treatment at every depth |
| [`03-domains-list.png`](03-domains-list.png) | **Domains** Feature selected, list of domains in main canvas (one row: `grida.space`) | Metadata-rich list view as the Scope-picker analog: Domain / Status / Security insights / Unique visitors / Plan columns; `+ Add domain` action in canvas top-right |
| [`04-domain-overview.png`](04-domain-overview.png) | Drilled into `grida.space` — sidebar **wholesale replaced** with domain-scoped Features (DNS / Email / SSL/TLS / Security / Access / Speed / Caching / Workers Routes / Rules / Error Pages / Network / Traffic / Web3 / ...). `< Back to domains` link at top. Scope name `grida.space` rendered as the column header | The Russian-doll mechanic — Cloudflare implements it within their single sidebar; we implement it via second-column swap |

## Patterns extracted (and where each lands in our v0 plan)

| Pattern | Already in v0 plan? | Status |
|---|---|---|
| **Replace, don't stack** when scope is selected (Domains → grida.space) | Yes — D2 in `v0-plan.md`, Russian-doll wireframes Frame 77:5341 / 77:5522 | **Validated.** Same mechanic, different visual location (their single column ↔ our second column). |
| **`< Back to {parent}`** affordance at top of replaced sidebar | Yes — D3 (`< back` + breadcrumb chip-`×` both work) | **Validated** by 04. |
| **Scope name as column header** after drill (`grida.space` with star) | Yes — anatomy spec, second column header | **Validated** by 04. Matches our `Plane ABC` header in Frame 77:5341. |
| **Recursive groups** (group inside group) | Was planned via recursive `SidebarNode` — to be added in batched Manifest schema refinement | **Confirmed needed.** Manifest's `GroupNode.children` should be `SidebarNode[]`, not just `FeatureNode[]`. |
| **Category dividers** as plain non-clickable labels above groups | Not yet — to be added in batched Manifest refinement | **Confirmed worth borrowing.** New `CategoryNode` type in the Manifest schema. |
| **Status badges** on items (Beta / New) | Not yet — to be added | **Confirmed worth borrowing.** Add `badge?: string` to `FeatureNode`. |
| **Metadata-rich Scope-picker table** (Status / metrics / Plan columns + action button top-right) | Partially — D9 calls for table only, but column composition was TBD | **Refines D9.** Data-planes table should have: Name, Description, Status, Region/Type, Last update — not just a flat list. `+ ADD new` and optional `Documentation` link in canvas top-right. |
| **Item density** in the second column | Implied by D11 (sub-nav scales to many) | **Sets a target.** Cloudflare fits ~17 items in `grida.space` view without crowding — that's our density goal. |

## Patterns explicitly NOT borrowing

| Pattern | Why we're not adopting |
|---|---|
| Single-column structural model | We use two columns (rail + replaceable second column) per the FigJam wireframes. Cloudflare combines what we split into two columns into one sidebar with deeper indentation. |
| Quick search inside the sidebar with `⌘K` shortcut visible | Our v0 plan puts global search (`Global search cmd+k` indicator) in the top bar per the wireframes. Different placement, same intent. |
| Account selector at the top of the sidebar | Our `tenant ⌄` chip lives in the top bar per the wireframes. Same scope concept, different placement. |

## Privacy note

Screenshots include the visible account email `lmickaa@gmail.com` in the top-left. Repo is private on GitHub at the time of capture; if visibility ever changes (public, more collaborators), revisit whether to redact.

## Cross-references

- [`../../references.md`](../../references.md) — full Cloudflare nav research (one of 14 vendors)
- [`../../v0-plan.md`](../../v0-plan.md) — what we're actually building, where these patterns land
- [`../../wireframes-flow.md`](../../wireframes-flow.md) — Artem's own wireframed Russian-doll flow that Cloudflare validates
