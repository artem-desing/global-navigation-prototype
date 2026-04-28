# Global Navigation Prototype — Product / Feature inventory

Per-Product list of known Features. This is a working catalog — populate as new Product surfaces become known. Names here are reproduced verbatim from the source (FigJam, screenshot, design file) so they survive renames in our meta-vocabulary; if a Product team renames a Feature later, update this list.

Terms (Product, Feature, Scope, Resource) are defined in [glossary.md](glossary.md).

Status legend:
- **Confirmed** — observed in a design artifact (FigJam node, screenshot, design file)
- **Speculation** — inferred but not yet confirmed
- **TBD** — Product team hasn't shared yet

---

## Edge

Edge in the new model is expected to absorb the entire existing Wallarm Console nav (per Artem, 2026-04-28). Two reference points exist today, sourced separately and listed below until the redesign converges them:

1. **Today's Wallarm Console sidebar** — what's shipping right now; the working baseline for prototype Feature names while the redesign settles.
2. **Platform-jam FigJam** — the redesigned IA under exploration, focused on the dataplane-scoped sub-tree.

### Edge — current Wallarm Console IA — **Confirmed (live screenshot + audit, 2026-04-28)**

Sources: live product screenshot Artem shared on 2026-04-28, and the comprehensive flag-aware audit in [current-ia.md](current-ia.md) (captured 2026-04-27). Use the screenshot for "what a typical user sees today" and `current-ia.md` for the full conditional-logic picture (~30 items, plus a separate Settings cluster and Admin zone).

Visible top-level groups (from the screenshot) with their level-2 Features:

- **Dashboards** — collapsed in the screenshot (uses a `>` chevron suggesting flyout / drilldown rather than inline expand)
- **Events**
  - Attacks
  - Incidents
  - Security Issues
  - API Sessions
- **API Security**
  - API Attack Surface
  - API Discovery
  - API Abuse Prevention
  - API Specifications
- **Security controls**
  - IP & Session Lists
  - Triggers
  - Rules
  - Mitigation Controls
  - Credential Stuffing
- **Security Testing**
  - Threat Replay
  - Schema-Based
- **Configuration**
  - Nodes
  - **Security Edge** — rendered with a lock icon (entitlement-gated; visible but disabled)

Notes:
- The **Security Edge** lock icon is real-world precedent for the **Lock-and-show** pattern (see [glossary.md](glossary.md)) — Wallarm already does this today; the prototype's entitlement gating can match the existing affordance.
- The grouping (Dashboards / Events / API Security / Security controls / Security Testing / Configuration) is **not final** — Artem flagged that the redesign will reshuffle. For prototype purposes, use this grouping as the working baseline until the new structure is settled.
- `current-ia.md` lists additional flag-gated Features that don't appear in this particular screenshot (e.g. Attacks Library, BOLA Protection, Rules Testing Lab, Rogue MCP, OWASP API 2023 dashboard, Business Logic & Flow). When those flags are on, they should be considered in scope for the Edge sidebar too.

### Edge — Platform-jam exploration (future IA) — **Confirmed (FigJam, 2026-04-28)**

Source: FigJam `SXMI2M57m35vK7NlSVA7EO`, node `64:156`. Captured during Artem's walkthrough. This is the redesign exploration, not what ships today — it focuses on how a `dataplane-id` Scope reveals contextual sub-Features.

#### Level 2 — Features (children of Edge)
- **Overview** — unscoped landing
- **Attacks** — unscoped
- **WAF rules** — unscoped
- **Dataplane** — gating Feature; selecting a `dataplane-id` reveals the Scoped sub-tree below
- *Section N* — placeholder slot in the FigJam, signals room for more Features

#### Level 3 — Features (inside a selected `dataplane-id` Scope)
- **Nodes**
- **Overview** (dataplane-scoped)
- **Services** ← note: this is the Wallarm Edge "gateway services" Feature; literal name "Services"
- **Govern**

#### Level 4+ — drill-down through the **Services** Feature
- `service-id` (Resource selected from the Services list)
  - **Routes** Feature
    - `route-id` (Resource)
      - **flow** sub-area
        - **policies** Feature
          - `policy-id` (Resource)
  - **Flows** Feature
    - **pre-route** sub-area → **policies** → `policy-id`
    - **post-route** sub-area → **policies** → `policy-id`
  - **Setting** Feature

This is the 5+ level path that motivates the "two-level chrome ceiling" rule in [references.md](references.md) — anything past `service-id`'s direct children belongs in page chrome (tabs / drawers / breadcrumb-with-pickers), not the sidebar.

---

## AI Hypervisor — **Confirmed (product screenshot, 2026-04-28)**

Source: screenshot of the AI Hypervisor product UI shared by Artem on 2026-04-28. Branding: graffiti-style "AI HYPERVISOR" wordmark + "by Wallarm" subtitle; warm cream background with subtle line-pattern accents — the Product has its own distinctive visual identity that the shell needs to host without overriding.

### Level 2 — Features (children of AI Hypervisor)
- **Heatmap** — default landing in the screenshot; has internal sub-views (see below)
- **Registry**
- **Topology**
- **Data Tracks**
- **User Tracks**
- **Supply Chain**
- **Enforcement**
- **Integrations**
- **Red Team** — labeled `β` (beta)
- **Debugger** — labeled `Ebbers` (apparent codename / status label; clarify with Product team)

### Heatmap sub-views (level 3 — likely page-level tabs, not nested sidebar)
- **Risk Matrix** (default selected)
- **Full Stack**

### Asset categories surfaced in Heatmap content
Not nav items — they're rows in the Heatmap table. Listed here for future reference because they suggest what AI Hypervisor's domain Resources / Scope axes may be:
- AI Agents (1,980 assets in the screenshot)
- MCP Servers (42 assets)
- LLM Providers (8 assets)
- APIs (400 assets)
- Data Sources (49 assets)

Open question for future capture: are these categories also Scope axes elsewhere in AI Hypervisor (e.g., does Registry let you pick an "AI Agents" scope?), or are they purely content groupings inside Heatmap?

---

## Infra Discovery — **TBD**

Surfaced as a Product in the updated Platform-jam FigJam (2026-04-28). Feature list not yet shared.

Placeholder Features visible in the FigJam: Overview + "Sections A" + "Section N" — these are placeholders, not real Feature names.

---

## Testing — **TBD**

Surfaced as a Product in the updated Platform-jam FigJam (2026-04-28). Feature list not yet shared.

Placeholder Features visible in the FigJam: Overview + "Sections A" + "Section N" — placeholders.

---

## Platform utilities — **Confirmed (Platform-jam FigJam, 2026-04-28)**

Cross-cutting nav items that live outside any Product. From the FigJam annotation: *"this sections of the main nav is not attached to services → they live outside of them → global platform settings, ser settings, doc, notifications and etc."*

- **global settings**
- **user settings**
- **doc center** (annotated as "new tab → doc center")
- **notifications** (mentioned in the annotation, not yet a discrete node)

---

## How to update this doc

- New Product surfaces (screenshots, design files, walkthroughs) → add a **Confirmed** section with source + date.
- Feature renames → update in place; preserve old name in a *(formerly: X)* note for one cycle if anyone might still reference the old term.
- Resource / Scope speculation → keep in **Speculation** so it's clearly distinguished from observed names.
