import type { ProductManifest } from './types';

// Artificial Feature names per v0-plan.md M5 (Infra Discovery's real list
// hasn't been shared yet — these are placeholders so the Manifest renders).
export const infraDiscoveryManifest: ProductManifest = {
  type: 'product',
  id: 'infra-discovery',
  label: 'Infra Discovery',
  shortLabel: 'INFRA',
  icon: 'folder',
  defaultLandingId: 'overview',
  sidebar: [
    { type: 'feature', id: 'overview', label: 'Overview' },
    { type: 'feature', id: 'inventory', label: 'Inventory' },
    { type: 'feature', id: 'topology', label: 'Topology' },
    { type: 'feature', id: 'findings', label: 'Findings' },
    { type: 'feature', id: 'risks', label: 'Risks' },
    { type: 'feature', id: 'integrations', label: 'Integrations' },
    { type: 'feature', id: 'settings', label: 'Settings' },
  ],
};
