import type { ComponentType, ReactNode } from 'react';
import { Shell as V0Shell } from './v0/shell';
import { Shell as V2Shell } from './v2/shell';

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
    label: 'Manifest-driven shell',
    blurb:
      'The baseline. Manifest-defined products, scope drilldowns, ⌘K palette, recents rail, AI assistant push panel.',
    Shell: V0Shell,
  },
  {
    slug: 'v2',
    label: 'Icon rail with hover-expand',
    blurb:
      'Same data, lighter chrome. Rail collapses to icons; hover or pin to reveal labels. Recent stays a one-click dropdown.',
    Shell: V2Shell,
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
