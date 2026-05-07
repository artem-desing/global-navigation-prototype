import type { Manifest, ProductManifest, PlatformUtilityManifest, SidebarNode, FeatureNode } from './types';
import { edgeManifest } from './edge.manifest';
import { aiHypervisorManifest } from './ai-hypervisor.manifest';
import { infraDiscoveryManifest } from './infra-discovery.manifest';
import { testingManifest } from './testing.manifest';
import { settingsManifest } from './settings.manifest';
import { docsManifest } from './docs.manifest';
import { userManifest } from './user.manifest';

const manifests: Manifest[] = [
  edgeManifest,
  aiHypervisorManifest,
  infraDiscoveryManifest,
  testingManifest,
  // Platform utilities — render in the bottom rail stack:
  docsManifest,
  settingsManifest,
  userManifest,
];

const manifestsById: Record<string, Manifest> = Object.fromEntries(
  manifests.map((m) => [m.id, m]),
);

export function getManifest(id: string): Manifest | undefined {
  return manifestsById[id];
}

export function getProductManifests(): ProductManifest[] {
  return manifests.filter((m): m is ProductManifest => m.type === 'product');
}

export function getPlatformUtilityManifests(): PlatformUtilityManifest[] {
  return manifests.filter((m): m is PlatformUtilityManifest => m.type === 'platform-utility');
}

/** Platform utilities that render in the rail (default). Excludes top-bar utilities. */
export function getRailUtilityManifests(): PlatformUtilityManifest[] {
  return getPlatformUtilityManifests().filter((m) => (m.placement ?? 'rail') === 'rail');
}

/** Platform utilities that render as icon buttons in the top bar (e.g. Docs / Quick help). */
export function getTopBarUtilityManifests(): PlatformUtilityManifest[] {
  return getPlatformUtilityManifests().filter((m) => m.placement === 'top-bar');
}

/**
 * Walk a sidebar tree and return a flat list of all FeatureNodes.
 * Useful for resolving a Feature by id from a URL segment.
 */
export function flattenFeatures(nodes: SidebarNode[]): FeatureNode[] {
  const out: FeatureNode[] = [];
  for (const node of nodes) {
    if (node.type === 'feature') {
      out.push(node);
      if (node.children) {
        out.push(...flattenFeatures(node.children));
      }
    } else if (node.type === 'group') {
      out.push(...flattenFeatures(node.children));
    }
    // CategoryNode contributes nothing — it's a plain divider.
  }
  return out;
}

export function findFeature(manifestId: string, featureId: string): FeatureNode | undefined {
  const m = getManifest(manifestId);
  if (!m) return undefined;
  return flattenFeatures(m.sidebar).find((f) => f.id === featureId);
}
