import { getProductManifests, getPlatformUtilityManifests } from '@/nav/manifest/registry';
import type {
  ProductManifest,
  PlatformUtilityManifest,
  SidebarNode,
} from '@/nav/manifest/types';
import type { IconKey } from '@/nav/manifest/icons';
import { NAV_EVENTS, dispatchNavEvent } from '@/nav/events';
import type { RecentEntry } from '@/nav/recents/store';

export interface SearchItem {
  kind: 'nav';
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

export interface ActionItem {
  kind: 'action';
  id: string;
  label: string;
  description: string;
  icon: IconKey;
  onSelect: () => void;
}

export type PaletteItem = SearchItem | ActionItem;

/** Static action list — logic is stubbed; wire later. */
export function getActions(): ActionItem[] {
  return [
    {
      kind: 'action',
      id: 'action:create',
      label: 'Create',
      description: 'Action',
      icon: 'plus',
      onSelect: () => console.log('[GlobalSearch] action: create'),
    },
    {
      kind: 'action',
      id: 'action:switch-tenant',
      label: 'Switch tenant',
      description: 'Action',
      icon: 'arrow-right-left',
      onSelect: () => dispatchNavEvent(NAV_EVENTS.OpenTenantDialog),
    },
  ];
}

/** Top-level products + utilities — used as the empty-state "Suggested" list. */
export function getProductRoots(items: SearchItem[]): SearchItem[] {
  return items.filter((item) => item.breadcrumb.length === 1);
}

/**
 * Adapt a stored RecentEntry to a palette nav item. Breadcrumb is
 * product-first (consistent with manifest-derived items) so the row's
 * subtitle matches the "Go to" results visually.
 */
export function recentToSearchItem(entry: RecentEntry): SearchItem {
  const breadcrumb = entry.containerLabel
    ? [entry.productLabel, entry.containerLabel, entry.pageLabel]
    : [entry.productLabel, entry.pageLabel];
  return {
    kind: 'nav',
    id: `recent:${entry.path}`,
    label: entry.pageLabel,
    productLabel: entry.productLabel,
    productIcon: entry.productIcon ?? 'circle',
    breadcrumb,
    href: entry.path,
    keywords: breadcrumb.join(' ').toLowerCase(),
  };
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
    kind: 'nav',
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
      kind: 'nav',
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
