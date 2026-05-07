## What

<!-- One or two lines on what this PR changes. The PR title is the headline; this is the recap. -->

## Why

<!-- The motivation. If it's tied to a docs/decisions.md entry, link it. -->

## Checklist

- [ ] Renders correctly in **v8** (`/v/v8/...`) — verified locally with `pnpm dev`
- [ ] `pnpm build` runs clean (no TypeScript or ESLint errors)
- [ ] No new embargoed pillar names in visible artifacts (page titles, labels, manifest entries) — see `CONTRIBUTING.md` § Ground rules
- [ ] Mock data only — no real API calls, no real customer data, no real screenshots
- [ ] No `@ts-ignore` / `// eslint-disable` to silence warnings
- [ ] WADS components used for chrome (no raw Tailwind for buttons / cards / form fields)

## Notes for the reviewer

<!-- Anything unusual: a deliberate manifest reorder, a new fixture file, a v8-specific behaviour to verify. -->
