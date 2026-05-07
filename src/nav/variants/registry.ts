import type { ComponentType, ReactNode } from 'react';
import { Shell as V0Shell } from './v0/shell';
import { Shell as V2Shell } from './v2/shell';
import { Shell as V3Shell } from './v3/shell';
import { Shell as V4Shell } from './v4/shell';
import { Shell as V5Shell } from './v5/shell';
import { Shell as V6Shell } from './v6/shell';
import { Shell as V7Shell } from './v7/shell';
import { Shell as V8Shell } from './v8/shell';

export interface Variant {
  slug: string;
  label: string;
  blurb: string;
  /** Renders the variant's chrome around `children`. */
  Shell: ComponentType<{ children: ReactNode }>;
  /**
   * Surfaces this variant in the top group on the picker. Other variants
   * stay listed below as alternates for comparison.
   */
  preferred?: boolean;
  /**
   * Optional small badge rendered inside the card (e.g. "Preferred").
   * Independent of `preferred` — used to highlight a single recommended
   * card visually.
   */
  tag?: string;
}

const variants: Variant[] = [
  {
    slug: 'v8',
    label: 'Auto-collapsing rail',
    blurb:
      "Expanded on the home page so first-timers can read product names; collapsed inside any product so its tree can lead. One rule, no toggle.",
    Shell: V8Shell,
    preferred: true,
    tag: 'Final',
  },
  {
    slug: 'v6',
    label: 'User-controlled rail',
    blurb:
      'Choose how the rail behaves — expanded, collapsed, or expand on hover. Preference sticks per browser.',
    Shell: V6Shell,
    preferred: true,
    tag: 'Preferred',
  },
  {
    slug: 'v0',
    label: 'Always-open sidebar',
    blurb:
      "Two columns, always visible. Every product on the left rail; the current product's tree to the right.",
    Shell: V0Shell,
    preferred: true,
  },
  {
    slug: 'v7',
    label: 'v0/v6 combination → wide-labels toggle',
    blurb:
      "Same baseline as v0 — every product on the rail, the current product's tree to the right. One ⌘B toggle widens the rail with persistent labels next to icons. No mode menu, no hover-overlay. Synthesis verdict from the v0-vs-v6 stress test, made clickable.",
    Shell: V7Shell,
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
