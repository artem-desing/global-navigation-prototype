import type { PlatformUtilityManifest } from './types';

// External-link Platform utility — clicking opens a new tab and never enters
// the shell's second column. Matches the FigJam annotation: "new tab → doc
// center". Real URL TBD; using a placeholder anchor for v0.
export const docsManifest: PlatformUtilityManifest = {
  type: 'platform-utility',
  id: 'docs',
  label: 'Docs',
  shortLabel: 'Docs',
  icon: 'help',
  externalUrl: 'https://docs.wallarm.com',
  defaultLandingId: '',
  sidebar: [],
};
