# Contributing

This prototype is shared with product managers + design + engineering as a discussion artifact. Most contributions are about defining what lives inside Settings (which sections exist, what each page shows). This guide explains how to do that without breaking anything.

## Ground rules

1. **v8 is the canonical prototype.** Verify your changes inside `/v/v8/...`. v0–v7 are frozen — if your manifest edit makes them look slightly off, that's expected and not a blocker.
2. **Mock data only.** No real API calls, no real customer data, no real screenshots. Add fakes to `src/lib/fixtures/` or `src/lib/mock-data/`.
3. **One idea per branch.** Smaller branches merge faster.
4. **WADS components, not raw Tailwind for chrome.** Use `Card`, `Button`, `Heading`, `Text`, etc. The design system imports look like `import { Card } from '@wallarm-org/design-system/Card'` — one component per path, no barrel imports.
5. **Embargo through 2026-06-04.** Don't introduce *new* visible references to "AI Control Platform", "Infrastructure Discovery" (full name), "API Gateway", "AI Gateway" anywhere a user can see them. The existing "AI Hypervisor" label is grandfathered.

## Local setup

```bash
git clone <repo-url>
cd global-navigation-prototype
pnpm install
pnpm dev
```

Open <http://localhost:3000>, click **Auto-collapsing rail** (v8) on the picker.

## Branch + PR workflow

1. Branch off `main`:

   ```bash
   git checkout main
   git pull
   git checkout -b pm/<initials>/<topic>
   # examples:  pm/jd/billing-section   pm/ms/audit-log-page
   ```

2. Make your changes. Run `pnpm dev` and click through them in v8.
3. Run `pnpm build` to confirm the static export still compiles. (CI does this too — but failing locally is faster than failing in CI.)
4. Push the branch and open a pull request.
5. Artem reviews and merges. Direct push to `main` is not allowed.

The PR template will ask you to confirm: renders in v8 ✓, no embargoed terms ✓, mock data only ✓, build is clean ✓.

## Adding a Settings section

This is the most common PM contribution. Three steps:

### 1. Add a manifest entry

Open `src/nav/manifest/settings.manifest.ts`. The `sidebar` array is the second-level nav rendered when a user is inside Settings. Add (or remove, or reorder) entries:

```ts
sidebar: [
  { type: 'feature', id: 'profile',  label: 'Profile' },
  { type: 'feature', id: 'general',  label: 'General' },
  { type: 'feature', id: 'YOUR-NEW-SECTION', label: 'Your label' },
  // …
],
```

`id` is kebab-case and forms the URL slug (`/v/v8/settings/your-new-section`). `label` is what users see in the rail.

You can also add a group (collapsible) or nest features:

```ts
{
  type: 'group',
  id: 'integrations',
  label: 'Integrations',
  collapsed: true,
  children: [
    { type: 'feature', id: 'integrations-slack', label: 'Slack' },
    { type: 'feature', id: 'integrations-pagerduty', label: 'PagerDuty' },
  ],
},
```

### 2. Create the page

Pages for Settings live in `src/nav/shell/feature-pages/settings/`. Copy any existing stub as a starting point — `general.tsx` (toggles), `users-all.tsx` (table), `subscriptions.tsx` (cards), `experiments.tsx` (cards with badges), `users-invites.tsx` (empty state) cover the common patterns.

Filename matches the manifest `id`. For `your-new-section`:

```tsx
// src/nav/shell/feature-pages/settings/your-new-section.tsx
'use client';

import { Card } from '@wallarm-org/design-system/Card';
import { Text } from '@wallarm-org/design-system/Text';
import { SettingsPageTemplate } from './_template';

export function YourNewSectionPage() {
  return (
    <SettingsPageTemplate
      title="Your section"
      subtitle="One-line description of what this page is for."
    >
      <Card>
        <div className="p-16">
          <Text>Your content here.</Text>
        </div>
      </Card>
    </SettingsPageTemplate>
  );
}
```

The `SettingsPageTemplate` wraps every Settings page in a consistent header. Use it. There's also a `SimpleTable` helper in the same `_template.tsx` you can copy.

### 3. Register the page

Open `src/nav/shell/feature-pages/settings/index.ts` and add a line to the registry:

```ts
import { YourNewSectionPage } from './your-new-section';

export const settingsFeaturePages: Record<string, ComponentType> = {
  // …existing entries…
  'your-new-section': YourNewSectionPage,
};
```

The key is the manifest `id`. The value is your page component. Without this line you'll see a generic placeholder instead of your page.

### 4. Click through it

Run `pnpm dev`. Open <http://localhost:3000/v/v8/settings/your-new-section>. The rail collapses (v8 behavior on any second-level nav surface), Settings is highlighted, and your page renders in the main pane.

## Removing a Settings section

Reverse of adding:

1. Delete the manifest entry from `settings.manifest.ts`
2. Delete the registry line in `settings/index.ts`
3. Delete the page file

Order doesn't matter — the build will tell you if you missed one.

## WADS component cheat-sheet

The components you'll reach for most. Each imported from its own path:

```ts
import { Heading } from '@wallarm-org/design-system/Heading';
import { Text } from '@wallarm-org/design-system/Text';
import { Card } from '@wallarm-org/design-system/Card';
import { Button } from '@wallarm-org/design-system/Button';
import { Badge } from '@wallarm-org/design-system/Badge';
import { Switch } from '@wallarm-org/design-system/Switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@wallarm-org/design-system/Tabs';
import { Input } from '@wallarm-org/design-system/Input';
import { Select } from '@wallarm-org/design-system/Select';
import { Field } from '@wallarm-org/design-system/Field';
```

Common props:
- `Button` — `variant`: `primary` / `secondary` / `outline` / `ghost`
- `Badge` — `type`: `secondary` / `solid` / `outline`; `color`: `green` / `red` / `w-orange` / `gray` / etc.
- `Heading` — `size`: `lg` / `xl` / `2xl` / `3xl`; `weight`: `medium` / `semibold`
- `Text` — `size`: `xs` / `sm` / `md`; `color`: `primary` / `secondary` / `inherit`

For colors and spacing in custom containers, use WADS CSS variables (`var(--color-bg-surface-1)`, `var(--color-border-primary-light)`) — no hardcoded hex.

There's a non-obvious WADS Tailwind quirk: in this project, every spacing utility means `Npx`, not `4×N px`. So `gap-4` is 4px, not 16px; `p-16` is 16px, not 64px. Use larger numbers than your muscle memory expects.

## Things to avoid

- Editing v0–v7 chrome. They're frozen.
- Adding `// @ts-ignore` or `// eslint-disable`. Fix the underlying issue.
- Hardcoded colors (`#fff`, `rgb(...)`). Use WADS tokens.
- Real API integration. Mock data only.
- Reordering or renaming product manifests (`edge.manifest.ts`, `ai-hypervisor.manifest.ts`, etc.) — if you think one needs changing, raise it with Artem first.
- `npm install` or `yarn` — pnpm only.
- Skipping `pnpm build` before pushing. The static export catches errors `pnpm dev` doesn't.

## Where to ask

- Slack DM Artem Miskevich for design / IA / "is this the right scope" questions
- File an issue / PR comment on GitHub for code questions
- `docs/` has the project context: `charter.md`, `nav-principles.md`, `current-ia.md`, `decisions.md`, `to-do.md`
