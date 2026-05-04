import type { ComponentType, ReactNode } from 'react';
import { Shell as V0Shell } from './v0/shell';
import { Shell as V2Shell } from './v2/shell';
import { Shell as V3Shell } from './v3/shell';
import { Shell as V4Shell } from './v4/shell';
import { Shell as V5Shell } from './v5/shell';
import { Shell as V6Shell } from './v6/shell';

export interface Variant {
  slug: string;
  label: string;
  blurb: string;
  /** Renders the variant's chrome around `children`. */
  Shell: ComponentType<{ children: ReactNode }>;
}

const variants: Variant[] = [
  {
    slug: 'v0',
    label: 'Always-open sidebar',
    blurb:
      "The classic console layout. A wide left sidebar lists every product's sections at all times, and a second column shows the current product's tree. Nothing is hidden — everything is one click away.",
    Shell: V0Shell,
  },
  {
    slug: 'v6',
    label: 'User-controlled rail',
    blurb:
      'You decide how the first rail behaves: always expanded, icons-only with tooltips and keyboard shortcuts, or expand on hover. A small control snapped to the bottom of the rail switches modes; preference persists per browser.',
    Shell: V6Shell,
  },
  {
    slug: 'v2',
    label: 'Hover to expand',
    blurb:
      'A thin icon strip by default — hover or pin to reveal the full sidebar with labels. Frees up screen real estate when you are focused on the page, with everything still one motion away.',
    Shell: V2Shell,
  },
  {
    slug: 'v3',
    label: 'Icons only, with tooltips',
    blurb:
      'Always a thin icon strip; labels appear as small tooltips on hover, never as a column. The most space-efficient option. Drilling into a section works the same as in “Hover to expand”.',
    Shell: V3Shell,
  },
  {
    slug: 'v4',
    label: 'Pop-out menus, expand on demand',
    blurb:
      "Hover any product icon to see its sections in a floating menu — no fixed second column. Press ⌘B to swap the strip for one merged sidebar that lists every product's sections at once. Settings and drilled-into scopes still get a dedicated second column.",
    Shell: V4Shell,
  },
  {
    slug: 'v5',
    label: 'Workbench with tabs',
    blurb:
      'A workbench layout: a thin icon column on the left, a resizable explorer with the full nav tree, and a main pane with tabs so you can keep several pages open and switch between them without losing your place.',
    Shell: V5Shell,
  },
];

const variantsBySlug: Record<string, Variant> = Object.fromEntries(
  variants.map((v) => [v.slug, v]),
);

export function getAllVariants(): Variant[] {
  return variants;
}

export function getVariant(slug: string): Variant | undefined {
  return variantsBySlug[slug];
}
