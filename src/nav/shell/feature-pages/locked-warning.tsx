'use client';

import { Text } from '@wallarm-org/design-system/Text';
import { Lock } from '@wallarm-org/design-system/icons';
import { useFlags, isFeatureLocked } from '@/nav/flags';

interface LockedWarningProps {
  unlockFlag?: string;
}

export function LockedWarning({ unlockFlag }: LockedWarningProps) {
  const flags = useFlags();
  const stillLocked = isFeatureLocked(
    { type: 'feature', id: 'synthetic', label: '', locked: true, unlockFlag },
    flags,
  );
  if (!stillLocked) return null;

  return (
    <div
      className="flex items-center gap-8 rounded-md border px-12 py-8"
      style={{
        backgroundColor: 'var(--color-bg-light-warning)',
        borderColor: 'var(--color-border-warning)',
      }}
    >
      <Lock size="sm" aria-hidden style={{ color: 'var(--color-icon-warning)' }} />
      <Text size="sm" color="inherit" style={{ color: 'var(--color-text-warning)' } as React.CSSProperties}>
        This feature is entitlement-gated. Toggle <code>?debug=1</code> →{' '}
        <strong>Security Edge unlocked</strong> to preview without the lock.
      </Text>
    </div>
  );
}
