'use client';

import { createContext, useContext, type ReactNode } from 'react';

export interface VariantContextValue {
  slug: string;
}

const VariantContext = createContext<VariantContextValue | null>(null);

export function VariantProvider({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  return <VariantContext.Provider value={{ slug }}>{children}</VariantContext.Provider>;
}

export function useVariant(): VariantContextValue {
  const ctx = useContext(VariantContext);
  if (!ctx) {
    throw new Error(
      'useVariant called outside a VariantProvider — variant chrome must render under /v/<slug>/.',
    );
  }
  return ctx;
}

/**
 * Prepend `/v/<slug>` to an absolute app path. Idempotent on paths that
 * already start with `/v/`. Relative paths pass through unchanged so callers
 * can mix in chip/segment fragments without special-casing.
 */
export function withVariantPrefix(slug: string, path: string): string {
  if (!path.startsWith('/')) return path;
  if (path.startsWith('/v/')) return path;
  return `/v/${slug}${path}`;
}

/** Canonical home for a variant — the variant's `(with-nav)` index page. */
export function variantHomePath(slug: string): string {
  return `/v/${slug}/`;
}
