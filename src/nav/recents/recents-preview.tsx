'use client';

import { useRouter } from 'next/navigation';
import {
  DropdownMenuItem,
  DropdownMenuItemIcon,
} from '@wallarm-org/design-system/DropdownMenu';
import { Text } from '@wallarm-org/design-system/Text';
import { resolveIcon } from '@/nav/manifest/icons';
import { useVariant } from '@/nav/variant-context';
import { useRecents } from './store';

interface RecentsMenuItemsProps {
  onItemSelect: () => void;
}

const RECENTS_SCROLL_MAX_HEIGHT = 280;

export function RecentsMenuItems({ onItemSelect }: RecentsMenuItemsProps) {
  const router = useRouter();
  const { slug: variantSlug } = useVariant();
  const recents = useRecents(variantSlug);

  if (recents.length === 0) {
    return (
      <div className="px-12 py-8">
        <Text size="sm" color="secondary">
          Nothing recent yet.
        </Text>
      </div>
    );
  }

  return (
    <div
      style={{ maxHeight: RECENTS_SCROLL_MAX_HEIGHT, overflowY: 'auto' }}
    >
      {recents.map((entry) => {
        const Icon = resolveIcon(entry.productIcon);
        const subtitle = entry.containerLabel
          ? `${entry.containerLabel} · ${entry.productLabel}`
          : entry.productLabel;
        return (
          <DropdownMenuItem
            key={entry.path}
            value={entry.path}
            onSelect={() => {
              onItemSelect();
              router.push(entry.path);
            }}
          >
            {Icon ? (
              <DropdownMenuItemIcon>
                <Icon size="sm" aria-hidden />
              </DropdownMenuItemIcon>
            ) : null}
            <div className="flex min-w-0 flex-1 flex-col">
              <Text size="sm" color="primary" truncate>
                {entry.pageLabel}
              </Text>
              <Text size="sm" color="secondary" truncate>
                {subtitle}
              </Text>
            </div>
          </DropdownMenuItem>
        );
      })}
    </div>
  );
}
