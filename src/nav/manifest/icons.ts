import {
  Folder,
  Home,
  Settings,
  CircleHelp,
  Circle,
  ChevronDown,
  ChevronRight,
} from '@wallarm-org/design-system/icons';

export const iconRegistry = {
  folder: Folder,
  home: Home,
  settings: Settings,
  help: CircleHelp,
  circle: Circle,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
} as const;

export type IconKey = keyof typeof iconRegistry;

export function resolveIcon(key: IconKey | undefined) {
  return key ? iconRegistry[key] : undefined;
}
