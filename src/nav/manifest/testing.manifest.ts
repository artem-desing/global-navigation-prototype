import type { ProductManifest } from './types';

// Artificial Feature names per v0-plan.md M5 (Testing's real list hasn't been
// shared yet — these are placeholders so the Manifest renders).
export const testingManifest: ProductManifest = {
  type: 'product',
  id: 'testing',
  label: 'Testing',
  shortLabel: 'TESTING',
  icon: 'skull',
  defaultLandingId: 'overview',
  sidebar: [
    { type: 'feature', id: 'overview', label: 'Overview' },
    {
      type: 'group',
      id: 'test-suites',
      label: 'Test Suites',
      collapsed: true,
      children: [
        { type: 'feature', id: 'test-suites-active', label: 'Active' },
        { type: 'feature', id: 'test-suites-archived', label: 'Archived' },
        {
          type: 'group',
          id: 'test-suites-templates',
          label: 'Templates',
          collapsed: true,
          children: [
            { type: 'feature', id: 'test-suites-templates-owasp', label: 'OWASP' },
            { type: 'feature', id: 'test-suites-templates-pci', label: 'PCI DSS' },
            { type: 'feature', id: 'test-suites-templates-internal', label: 'Internal' },
          ],
        },
      ],
    },
    { type: 'feature', id: 'schedules', label: 'Schedules' },
    { type: 'feature', id: 'results', label: 'Results' },
    { type: 'feature', id: 'coverage', label: 'Coverage' },
    { type: 'feature', id: 'settings', label: 'Settings' },
  ],
};
