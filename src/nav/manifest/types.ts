import type { IconKey } from './icons';

export type Manifest = ProductManifest | PlatformUtilityManifest;

export interface ProductManifest {
  type: 'product';
  id: string;
  label: string;
  shortLabel?: string;
  icon: IconKey;
  defaultLandingId: string;
  sidebar: SidebarNode[];
}

export interface PlatformUtilityManifest {
  type: 'platform-utility';
  id: string;
  label: string;
  shortLabel?: string;
  icon: IconKey;
  defaultLandingId: string;
  sidebar: SidebarNode[];
  /**
   * If set, the rail item renders as an external `<a target="_blank">` and the
   * shell's second column never opens for this utility (Docs pattern).
   * `defaultLandingId` and `sidebar` are unused when this is set — declare them
   * as empty placeholders for type compatibility.
   */
  externalUrl?: string;
  /**
   * Visual treatment for the rail-item hover affordance. Default behavior (when
   * unset) is the full-height flyout that mirrors the second column. `dropdown`
   * renders a compact menu instead — appropriate for small utilities (User,
   * with Profile/Theme/Sign out) where a flyout would be over-scaled.
   */
  previewMode?: 'dropdown';
  /**
   * Where the utility surfaces in the chrome. Default is `'rail'` (bottom of
   * the product rail). `'top-bar'` removes it from the rail and renders it as
   * an icon button in the global top bar — useful for utilities that read as
   * cross-cutting hooks rather than rail items (Docs / quick help).
   */
  placement?: 'rail' | 'top-bar';
}

export type SidebarNode = FeatureNode | GroupNode | CategoryNode;

export interface FeatureNode {
  type: 'feature';
  id: string;
  label: string;
  icon?: IconKey;
  badge?: string;
  scopeRequirement?: string;
  children?: SidebarNode[];
  locked?: boolean;
  /**
   * Name of a runtime flag (in `src/nav/flags.ts`) that, when truthy, unlocks
   * this Feature. Used by the dev flag panel to demonstrate entitlement-driven
   * shapeshift. Has no effect when `locked` is unset.
   */
  unlockFlag?: string;
}

export interface GroupNode {
  type: 'group';
  id: string;
  label: string;
  collapsed?: boolean;
  children: SidebarNode[];
}

export interface CategoryNode {
  type: 'category';
  id: string;
  label: string;
}
