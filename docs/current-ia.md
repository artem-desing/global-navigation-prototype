# Existing Wallarm Console — Information Architecture baseline

Captured 2026-04-27 from `/Users/artem/Documents/work-projects/my` (commit on `master`, last updated 2026-04-27). Source of truth for the redesign baseline.

Two layers exist in the codebase:
- **Route table** — `src/app/ui/router/pages/index.tsx` (~80 routes). Defines what URLs exist.
- **Navigation menu** — `packages/wallarm-core/components/page/navigation/general/`. Defines what's *visible* in the sidebar (subset of routes, gated by feature flags + permissions).

The redesign starting point is the navigation menu. The route table is the safety net for "did we forget anything?"

## Sidebar structure (today)

The sidebar is a single column, scoped to one product. Items group under labels with icons. Many items are conditional on feature flags or user permissions.

### Top (no group label)

- **Welcome** (icon: `hand`) — only when user is in onboarding

### Dashboards (icon: `grid`)

- Threat Prevention (default `/`)
- Subscription issues (when `withSubscriptions` is false; replaces Threat Prevention)
- API Discovery (`/dashboard-api-discovery`)
- OWASP API 2023 (flag: `owasp2023Enabled`)
- Business Logic & Flow (flag: `sbfDashboardEnabled`)
- Dashboards Favorites (flag: `biDashboardsEnabled`, lazy-loaded)
- BI Dashboards (`/dashboards`, flag: `biDashboardsEnabled`)

### Events (icon: `exclamation-triangle`)

- Attacks (`/attacks`)
- Attacks (Alpha) (flag: `newAttacksEnabled`)
- Incidents (`/incidents`)
- Security Issues (flag: `isSecurityIssuesEnabled`, not `isAASMOnly`)
- API Sessions (flag: `apiSessionsEnabled`)

### API Security (icon: `check-braces`)

- API Attack Surface (flag: `isAttackSurfaceFeatureEnabled`)
- API Discovery (`/api-discovery`)
- API Abuse Prevention (`/api-abuse-prevention`, non-free, antibot)
- API Specifications (`/api-specifications`, flag: `apiSpecsEnabled`) — labeled "Spec Enforcement" on Security Edge free tier
- OpenAPI Testing (`/security-testing`, flag: `openAPIEnabled`)
- Attacks Library (flag: `attacksLibraryEnabled`)

### Security controls (icon: `shield-lightning`)

- IP Lists (`/ip-lists`, when API Sessions disabled)
- IP & Session Lists (`/session-control`, when API Sessions enabled — replaces IP Lists)
- Triggers (`/triggers`, not Security Edge free tier)
- Rules (`/rules`)
- Rules Testing Lab (`/http-inspector`, flag: `httpInspectorEnabled`)
- Mitigation Controls (flag: `mitigationControlsEnabled`)
- Credential Stuffing (flag: `credStuffingEnabled`)
- BOLA Protection (flag: `isBolaPageEnabled`, conditional)

### Security Testing (icon: `check-braces`) — only when at least one flag is on

- Threat Replay (`/threat-replay-testing`, flag)
- Schema-Based (`/schema-based-testing`, flag: `isApiTestPatrolEnabled`)
- Security Issues (`/security-issues`) — appears here too in single-security-issues mode
- Rogue MCP (flag: `isRogueMcpEnabled`)

### AASM — when `isAASMOnly` mode

(Renders a separate AASM nav cluster — not detailed in audit; revisit when needed.)

### Configuration (icon: `admin-alt-tools`)

- Nodes (platform feature)
- Data Export Allowlist (flag)
- Security Edge (`/security-edge`)
- Integrations (platform / attack_surface feature)
- Settings (link → settings cluster)

### Footer

- Subscription limit indicator (`Limit` component, platform feature)

## Settings cluster (separate area, accessed from Configuration → Settings)

Renders as its own navigation tree, with icons per item.

- Profile (`/settings`, icon: `person`) — non-playground
- General (`/settings/general`, icon: `cog`, platform feature)
- License (`/settings/license`, icon: `grid`, when on-premise) — OR Subscriptions (`/settings/subscriptions`, icon: `grid`)
- Applications (`/settings/applications`, icon: `stack`, platform feature)
- Users (`/settings/users`, icon: `persons-1`)
- Groups (`/settings/groups`, icon: `corporate`, IAM primary client)
- API Tokens (`/settings/api-tokens`, icon: `key`, platform feature)
- Activity Log (`/settings/journal`, icon: `logs`, platform feature)

### Admin zone — super-admin only

- Customer Settings (`/admin/customer-settings`, icon: `person-check`)
- System Configuration (`/admin/system-config`, icon: `switch-on`)
- BOLA Triggers (`/admin/triggers`, icon: `lightning`, flag)

### Experiments

- Experiments (`/admin/experiments`, icon: `flask`) — super admin or super readonly

## Routes outside the sidebar

These exist in the route table but don't surface in the menu (or surface elsewhere):

- Auth: `login`, `signup/*`, `expired`, `activate/*`, `restore`, `setup`, `trial-renew`
- Onboarding: `onboarding/*`, `welcome`
- Standalone: `/playground` (redirect), `/nodes/pilot`, `/nodes/filter`
- Detail/redirect: `/object/:id/*` (vuln redirect), `/dashboard` (→ `/`), `/api-leaks` (→ `/security-issues`), `/ip-lists` ↔ `/session-control` (toggle redirects depending on flag)
- BI sub-flows: `/dashboards/:id`, `/dashboards/:id/print`, `/dashboards/create`

## Conditional logic — what shapes what users see

Driven primarily by `useFeatureEnableability()` (flags) and `useUser()` (role/permissions). Notable conditional gates:

- **Tier gates:** `isFreeTier`, `isPlatformFeatureEnabled`, `securityEdgeFreeTier`, `withSubscriptions`
- **Mode gates:** `isAASMOnly`, `isSingleSecurityIssuesFeature`, `isPlayground`, `onpremiseEnabled`
- **Feature flags:** `apiDiscoveryEnabled`, `apiSpecsEnabled`, `openAPIEnabled`, `antibotEnabled`, `apiSessionsEnabled`, `attacksLibraryEnabled`, `credStuffingEnabled`, `mitigationControlsEnabled`, `httpInspectorEnabled`, `threatReplayTestingEnabled`, `isApiTestPatrolEnabled`, `isRogueMcpEnabled`, `owasp2023Enabled`, `sbfDashboardEnabled`, `biDashboardsEnabled`, `newAttacksEnabled`, `isBolaPageEnabled`, `isNewAPIDiscoveryFlagEnabled`, `isAttackSurfaceFeatureEnabled`, `isSecurityIssuesEnabled`, `securityEdgeEnabled`, `dataExportAllowlistEnabled`
- **Roles:** `isSuperAdmin`, `isSuperReadonly`, `isIamPrimaryClient`

The prototype should expose a small flag panel in dev so we can toggle key states (free tier, AASM-only, super admin, on-prem) and see how the nav reshapes. Mirrors how the real product shapeshifts today.

## Observations for the redesign

1. **The current sidebar already does a lot of work** — 6 group labels, ~30 visible items, a separate Settings cluster, and an Admin zone. Adding three more products (Discovery, Gateway, Hypervisor) on top of this in one column is a non-starter.
2. **Many groups already overlap with platform pillars.** Today's "API Security" + "Security controls" + "Security Testing" map roughly onto Wallarm Console's contribution to the Discovery + Gateway pillars. Worth asking: which of today's groups *belong* to which platform pillar, and which stay as Wallarm Console functionality?
3. **Settings is structurally separate** today (different visual mode, distinct routes). Worth preserving — it sets a precedent for how other "global" surfaces (workspace, account) might sit outside the per-product nav.
4. **Conditional logic is heavy.** The new model needs a clear story for how flag-gated items appear and disappear without making the nav feel inconsistent across customer types.
5. **There is no app switcher today** — adding one is the biggest visible change. Where it lives (top bar, left rail, dropdown under brand mark) is the central design question.
6. **Icons exist for every group and most settings items** — they're available via `@wallarm/ui/components/icon` (or whatever WADS exposes). Don't reinvent.
