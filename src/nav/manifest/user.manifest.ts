import type { PlatformUtilityManifest } from './types';

// Stub Platform utility per v0-plan M7. WADS doesn't ship a User/Person icon
// yet (see M1 notes), so we use 'circle' as a placeholder avatar shape.
export const userManifest: PlatformUtilityManifest = {
  type: 'platform-utility',
  id: 'user',
  label: 'User',
  shortLabel: 'USER',
  icon: 'circle',
  defaultLandingId: 'profile',
  previewMode: 'dropdown',
  sidebar: [
    { type: 'feature', id: 'profile', label: 'Profile', icon: 'user' },
    { type: 'feature', id: 'theme', label: 'Theme', icon: 'sun' },
    { type: 'feature', id: 'sign-out', label: 'Sign out', icon: 'arrow-right' },
  ],
};
