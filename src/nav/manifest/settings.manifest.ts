import type { PlatformUtilityManifest } from './types';

// Mirrors the existing Wallarm Console Settings cluster from current-ia.md
// (lines 80-101). Per D8 we DON'T include the "Main menu" item that appeared
// in the wireframe — that was a carry-over from the previous platform.
//
// Distributed Settings rule (D13): only cross-cutting items live here. Tool-
// specific settings (e.g. Edge → Configuration → Nodes, Edge → Data planes →
// <plane> → Settings) co-locate inside their owning Product.
export const settingsManifest: PlatformUtilityManifest = {
  type: 'platform-utility',
  id: 'settings',
  label: 'Settings',
  shortLabel: 'Settings',
  icon: 'settings',
  defaultLandingId: 'profile',
  sidebar: [
    { type: 'feature', id: 'profile', label: 'Profile' },
    { type: 'feature', id: 'general', label: 'General' },
    { type: 'feature', id: 'subscriptions', label: 'Subscriptions' },
    { type: 'feature', id: 'applications', label: 'Applications' },
    { type: 'feature', id: 'users', label: 'Users' },
    { type: 'feature', id: 'groups', label: 'Groups' },
    { type: 'feature', id: 'api-tokens', label: 'API Tokens' },
    { type: 'feature', id: 'activity-log', label: 'Activity Log' },
    {
      type: 'group',
      id: 'admin-zone',
      label: 'Admin Zone',
      children: [
        { type: 'feature', id: 'customer-settings', label: 'Customer Settings' },
        { type: 'feature', id: 'system-configuration', label: 'System Configuration' },
        { type: 'feature', id: 'bola-triggers', label: 'BOLA Triggers' },
        { type: 'feature', id: 'experiments', label: 'Experiments' },
      ],
    },
  ],
};
