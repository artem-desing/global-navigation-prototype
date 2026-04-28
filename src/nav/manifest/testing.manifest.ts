import type { ProductManifest } from './types';

// Artificial Feature names per v0-plan.md M5 (Testing's real list hasn't been
// shared yet — these are placeholders so the Manifest renders).
export const testingManifest: ProductManifest = {
  type: 'product',
  id: 'testing',
  label: 'Testing',
  shortLabel: 'TESTING',
  icon: 'folder',
  defaultLandingId: 'overview',
  sidebar: [
    { type: 'feature', id: 'overview', label: 'Overview' },
    { type: 'feature', id: 'test-suites', label: 'Test Suites' },
    { type: 'feature', id: 'schedules', label: 'Schedules' },
    { type: 'feature', id: 'results', label: 'Results' },
    { type: 'feature', id: 'coverage', label: 'Coverage' },
    { type: 'feature', id: 'settings', label: 'Settings' },
  ],
};
