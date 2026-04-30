import { getProductManifests, getPlatformUtilityManifests } from '@/nav/manifest/registry';
import type {
  ProductManifest,
  PlatformUtilityManifest,
  SidebarNode,
} from '@/nav/manifest/types';
import type { IconKey } from '@/nav/manifest/icons';

export interface SearchItem {
  id: string;
  label: string;
  productLabel: string;
  productIcon: IconKey;
  featureIcon?: IconKey;
  /** Path of labels from product down to this item, inclusive. */
  breadcrumb: string[];
  href: string;
  /** Pre-lowercased combined string for cheap matching. */
  keywords: string;
}

/** Top-level products + utilities — used as the empty-state "Suggested" list. */
export function getProductRoots(items: SearchItem[]): SearchItem[] {
  return items.filter((item) => item.breadcrumb.length === 1);
}

/**
 * Build the search index for a given variant. Hrefs are emitted with the
 * `/v/<slug>` prefix already baked in so result-row clicks navigate inside
 * the variant rather than escaping to the picker.
 */
export function buildSearchIndex(variantSlug: string): SearchItem[] {
  const items: SearchItem[] = [];
  const prefix = `/v/${variantSlug}`;

  for (const product of getProductManifests()) {
    items.push(buildProductItem(product, prefix));
    walkSidebar(product, product.sidebar, [`${prefix}/${product.id}`], [product.label], items);
  }

  for (const utility of getPlatformUtilityManifests()) {
    if (utility.externalUrl) continue;
    items.push(buildProductItem(utility, prefix));
    walkSidebar(utility, utility.sidebar, [`${prefix}/${utility.id}`], [utility.label], items);
  }

  return items;
}

function buildProductItem(
  p: ProductManifest | PlatformUtilityManifest,
  prefix: string,
): SearchItem {
  return {
    id: p.id,
    label: p.label,
    productLabel: p.label,
    productIcon: p.icon,
    breadcrumb: [p.label],
    href: `${prefix}/${p.id}/${p.defaultLandingId}`,
    keywords: p.label.toLowerCase(),
  };
}

function walkSidebar(
  product: ProductManifest | PlatformUtilityManifest,
  nodes: SidebarNode[],
  pathSoFar: string[],
  breadcrumbSoFar: string[],
  out: SearchItem[],
) {
  for (const node of nodes) {
    if (node.type === 'category') continue;
    if (node.type === 'group') {
      walkSidebar(product, node.children, pathSoFar, breadcrumbSoFar, out);
      continue;
    }
    const path = [...pathSoFar, node.id];
    const breadcrumb = [...breadcrumbSoFar, node.label];
    out.push({
      id: path.join('/'),
      label: node.label,
      productLabel: product.label,
      productIcon: product.icon,
      featureIcon: node.icon,
      breadcrumb,
      href: path.join('/'),
      keywords: breadcrumb.join(' ').toLowerCase(),
    });
    // Children of a scope-gated feature need a scope id in the URL between
    // the parent and the child — they're not reachable as standalone hrefs,
    // so we skip them in the index.
    if (node.children && !node.scopeRequirement) {
      walkSidebar(product, node.children, path, breadcrumb, out);
    }
  }
}

export function filterAndRank(items: SearchItem[], rawQuery: string): SearchItem[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);

  const scored: { item: SearchItem; score: number }[] = [];
  for (const item of items) {
    const s = scoreItem(item, q, tokens);
    if (s > 0) scored.push({ item, score: s });
  }
  scored.sort((a, b) => b.score - a.score || a.item.label.length - b.item.label.length);
  return scored.map((s) => s.item);
}

function scoreItem(item: SearchItem, fullQuery: string, tokens: string[]): number {
  const label = item.label.toLowerCase();
  const keywords = item.keywords;

  for (const t of tokens) {
    if (!keywords.includes(t)) return 0;
  }

  let score = 0;
  if (label === fullQuery) score += 1000;
  else if (label.startsWith(fullQuery)) score += 200;
  else if (label.includes(fullQuery)) score += 100;
  else if (keywords.includes(fullQuery)) score += 40;
  else score += 10;

  for (const t of tokens) {
    if (label.startsWith(t)) score += 20;
    else if (label.includes(t)) score += 10;
  }
  return score;
}
