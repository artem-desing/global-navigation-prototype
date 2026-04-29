'use client';

import { useRouter } from 'next/navigation';
import {
  DropdownMenuItem,
  DropdownMenuItemContent,
  DropdownMenuItemDescription,
  DropdownMenuItemIcon,
  DropdownMenuItemText,
} from '@wallarm-org/design-system/DropdownMenu';
import { Text } from '@wallarm-org/design-system/Text';
import { resolveIcon } from '@/nav/manifest/icons';
import { useRecents } from './store';

interface RecentsMenuItemsProps {
  onItemSelect: () => void;
}

export function RecentsMenuItems({ onItemSelect }: RecentsMenuItemsProps) {
  const router = useRouter();
  const recents = useRecents();

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
    <>
      {recents.map((entry) => {
        const Icon = resolveIcon(entry.productIcon);
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
            <DropdownMenuItemContent>
              <DropdownMenuItemText>{entry.pageLabel}</DropdownMenuItemText>
              <DropdownMenuItemDescription>
                {entry.containerLabel
                  ? `${entry.containerLabel} · ${entry.productLabel}`
                  : entry.productLabel}
              </DropdownMenuItemDescription>
            </DropdownMenuItemContent>
          </DropdownMenuItem>
        );
      })}
    </>
  );
}
