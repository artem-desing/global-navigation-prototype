import type { PlatformUtilityManifest } from './types';

// Stub Platform utility per v0-plan M7. The rail item renders as an initials
// avatar (no icon, no label below) — derived from `label` via getInitials().
export const userManifest: PlatformUtilityManifest = {
  type: 'platform-utility',
  id: 'user',
  label: 'Artem Miskevich',
  shortLabel: 'Artem Miskevich',
  // `icon` is required by the type but ignored for the user rail item, which
  // renders as an initials avatar derived from `label`.
  icon: 'circle',
  defaultLandingId: 'profile',
  previewMode: 'dropdown',
  sidebar: [
    { type: 'feature', id: 'profile', label: 'Profile', icon: 'user' },
    { type: 'feature', id: 'theme', label: 'Theme', icon: 'sun' },
    { type: 'feature', id: 'sign-out', label: 'Sign out', icon: 'arrow-right' },
  ],
};
