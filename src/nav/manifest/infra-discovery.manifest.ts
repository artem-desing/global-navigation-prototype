import type { ProductManifest } from './types';

// Artificial Feature names per v0-plan.md M5 (Infra Discovery's real list
// hasn't been shared yet — these are placeholders so the Manifest renders).
export const infraDiscoveryManifest: ProductManifest = {
  type: 'product',
  id: 'infra-discovery',
  label: 'Infra Discovery',
  shortLabel: 'INFRA',
  icon: 'layers-3',
  defaultLandingId: 'overview',
  sidebar: [
    { type: 'feature', id: 'overview', label: 'Overview' },
    {
      type: 'group',
      id: 'inventory',
      label: 'Inventory',
      collapsed: true,
      children: [
        { type: 'feature', id: 'inventory-all', label: 'All assets' },
        { type: 'feature', id: 'inventory-untagged', label: 'Untagged' },
        {
          type: 'group',
          id: 'inventory-by-source',
          label: 'By source',
          collapsed: true,
          children: [
            { type: 'feature', id: 'inventory-source-cloud', label: 'Cloud accounts' },
            { type: 'feature', id: 'inventory-source-k8s', label: 'Kubernetes' },
            { type: 'feature', id: 'inventory-source-vcs', label: 'Source control' },
          ],
        },
      ],
    },
    { type: 'feature', id: 'topology', label: 'Topology' },
    { type: 'feature', id: 'findings', label: 'Findings' },
    { type: 'feature', id: 'risks', label: 'Risks' },
    { type: 'feature', id: 'integrations', label: 'Integrations' },
    { type: 'feature', id: 'settings', label: 'Settings' },
  ],
};
