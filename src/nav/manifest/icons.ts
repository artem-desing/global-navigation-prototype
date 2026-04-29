import {
  Folder,
  Home,
  Settings,
  CircleHelp,
  Circle,
  ChevronDown,
  ChevronRight,
  GlobeLock,
  Activity,
  Layers3,
  Skull,
  ArrowRight,
} from '@wallarm-org/design-system/icons';
import { User, Sun, Memory } from './custom-icons';

export const iconRegistry = {
  folder: Folder,
  home: Home,
  settings: Settings,
  help: CircleHelp,
  circle: Circle,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  'globe-lock': GlobeLock,
  activity: Activity,
  'layers-3': Layers3,
  skull: Skull,
  'arrow-right': ArrowRight,
  user: User,
  sun: Sun,
  memory: Memory,
} as const;

export type IconKey = keyof typeof iconRegistry;

export function resolveIcon(key: IconKey | undefined) {
  return key ? iconRegistry[key] : undefined;
}
