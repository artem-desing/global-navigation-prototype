# Competitive benchmarking — v0 vs v6

Lane 6 of the v0-vs-v6 stress test. Scope: vendor precedent and convergence
only — IA, visual, and interaction grading are handled by other lanes.

## Always-expanded full-rail (v0 pattern) — vendor precedent

- **Datadog.** Their 2024–25 nav redesign explicitly invested in *"expanding
  the characters that can fit in the sidebar"* so favorites and product names
  read at a glance. It is shipped as an always-on labeled rail with search +
  recents at the top and a quick-nav shortcut as a complement, not a
  replacement. Reference: [A closer look at our navigation
  redesign](https://www.datadoghq.com/blog/datadog-navigation-redesign/) and
  the Datadog DRUIDS [SidebarLayout
  spec](https://druids.datadoghq.com/components/layout/SidebarLayout).
- **Kong Konnect.** Categorized labeled left rail, persistent across the
  product (see our `project_kong_konnect_ia` memory). Same primitives as v0:
  group headers, scope-gated drill, breadcrumb scope chips. No collapsed mode
  shipped as of last review.
- **New Relic (post–"Symphony" / 2025 modernization).** Labeled left
  navigation with a personalized launchpad, pinned items, and an "Add data"
  CTA in the rail. Operator-grade console that ships labels at all times.
  Reference: [Modernize Your Observability
  Experience](https://newrelic.com/blog/news/modernize-your-observability-experience)
  and the [New navigation UI transition
  guide](https://docs.newrelic.com/docs/new-relic-solutions/new-relic-one/new-navigation-transition-guide/).
- **Sentry.** 2024 *"new navigation"* rolled out as the default — a labeled
  left rail with collapsible sections inside the rail, not a collapsed-rail
  toggle. References: [Sentry's bold new
  look](https://blog.sentry.io/sentry-has-a-bold-new-look/), [Sentry's new
  Navigation and Issue Views](https://sentry.io/changelog/new-nav-issue-views-ga/).

## User-controlled rail mode (v6 pattern) — vendor precedent

- **Linear.** The [Collapsible
  Sidebar](https://linear.app/changelog/unpublished-collapsible-sidebar)
  changelog ships an expanded ↔ hidden toggle (`Ctrl/Cmd+Shift+L`) with the
  preference persisted per user. Linear is the canonical reference for "user
  picks rail mode," which is why it is named in our brief.
- **AWS Management Console.** Per-service nav pane is documented as
  collapsible, added explicitly to give the table region more room. See
  [Usability improvements and navigation bar
  enhancements](https://aws.amazon.com/about-aws/whats-new/2023/09/aws-management-console-usability-navigation-bar/).
  Two-state user toggle, persisted per service.
- **Vercel.** The 2026 dashboard redesign explicitly shipped a
  *"resizable sidebar that can be hidden when not needed"*, replacing the
  old horizontal tabs. Two-state toggle (visible / hidden), with width also
  user-controlled. Reference: [New dashboard navigation
  available](https://vercel.com/changelog/new-dashboard-navigation-available)
  and [The New Side of Vercel](https://vercel.com/try/new-dashboard).
- **Notion.** `Cmd/Ctrl+\\` collapses the sidebar entirely; the chevron
  re-expands. Two-state, persisted. Reference: [Navigate with the
  sidebar](https://www.notion.com/help/navigate-with-the-sidebar).
- **shadcn/ui sidebar primitive** — the pattern most new operator consoles
  are built on in 2025–26. Ships three `collapsible` modes — `offcanvas`,
  `icon`, `none` — and persists state via cookie. Reference: [Sidebar —
  shadcn/ui](https://ui.shadcn.com/docs/components/radix/sidebar). This is
  the closest direct analogue to v6's three-mode picker, but note: shadcn
  exposes the modes to the *developer*, not to the end user; the user
  typically sees one chosen mode plus a single toggle.

## Hover-overlay rail — vendor precedent and reception

The "rail collapsed at rest, flies wider on hover" pattern (v6's `hover`
mode) shows up most often as a *Material navigation drawer* rather than as
a shipped operator console. Direct vendor evidence is thin and the writeups
are mostly negative:

- **Material Design** ships rail+drawer as a documented pattern but
  pairs icons with persistent labels in the expanded state — the receptive
  literature on the icon-rail half is critical: [Material Design and the
  Mystery Meat Navigation
  Problem](https://www.freecodecamp.org/news/material-design-and-the-mystery-meat-navigation-problem-65425fb5b52e).
- **Junji Zhi / UX Collective** — [Why the hover-and-expand navigation menu
  is bad for
  accessibility](https://uxdesign.cc/hover-and-expand-navigation-menu-is-bad-for-accessibility-23fecd2b655) —
  hover reveals are inaccessible to keyboard and touch users.
- **Smashing Magazine** — [User-Friendly Mega-Dropdowns: When Hover Menus
  Fail](https://www.smashingmagazine.com/2021/05/frustrating-design-patterns-mega-dropdown-hover-menus/) —
  diagonal-cursor problem, accidental open/close.
- **NN/G** — [Timing Guidelines for Exposing Hidden
  Content](https://www.nngroup.com/articles/timing-exposing-content/) —
  hover reveals are brittle and have to be tuned per direction.

I could not find a major operator-grade console (Datadog, New Relic, Wiz,
Snyk, Cloudflare, Sentry, GitHub, Kong Konnect, HCP, AWS) that ships
hover-overlay-rail as the *default* nav. Linear, Notion, AWS, Vercel are
all two-state (visible / hidden), not three-state with a hover-overlay
mode in between.

## Convergent vs divergent

- **Always-expanded labeled rail (v0):** *Convergent.* Datadog, New Relic,
  Konnect, Sentry, Kong, GitHub repo nav, HCP, Wiz, Snyk all ship a labeled
  rail as the default operator-console chrome. This is the modal pattern
  for security/observability/dev-platform consoles in 2025–26.
- **User toggle between expanded and one collapsed state:** *Convergent at
  the two-state level.* Linear, Notion, AWS, Vercel, shadcn-built apps all
  expose at least one user-controlled collapse. v6 inherits this lineage.
- **Three-mode rail (expanded + collapsed-icon + hover-overlay) exposed to
  the user:** *Rare → divergent.* I did not find an operator-console peer
  that exposes three rail modes to the end user from a single picker. The
  closest is shadcn-ui, but its modes are a developer choice, not a runtime
  user preference.

## Reframe check — is v6 the superset of v0?

**Yes, by vendor evidence.** Every console I surveyed that ships a
collapsed mode (Linear, Notion, AWS, Vercel) also has expanded as a state
of the same component — not as a separate product. Nobody ships
"always-expanded rail" and "user-toggleable rail" as competing apps; they
ship one component with one or more user-controlled states. The market
treats the collapse toggle as an *add-on* to the labeled rail, not as an
alternative to it.

This means v0 vs v6 is, on the surface, a category error: v6's `expanded`
mode *is* v0. The legitimate question is narrower — *should the
collapsed and hover modes ship at all, and as user preference or as
developer choice?* That is a feature scope question, not a "which rail
wins" question.

## Lane verdict

**v0 is the stronger precedent for the default state; v6's user-controlled
collapse is the stronger precedent for the optional preference.** The
labeled always-on rail is what Datadog, New Relic, Konnect, and Sentry ship
as the default operator chrome — calm, scannable, no minesweeping. The
2025–26 *additions* to that pattern at Vercel, Linear, AWS, and Notion are
collapse toggles, not separate apps. The right framing for the team is
therefore: **ship v0's labeled rail as the default, and add v6's
collapse/hover only if user research shows a real density complaint that
the rail width is causing.** Hover-overlay specifically has no operator-
console peer and a hostile usability literature — it should be the last
mode added, behind a flag, not part of the v1 cut.
