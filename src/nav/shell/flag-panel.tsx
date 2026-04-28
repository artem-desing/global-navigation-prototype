'use client';

import { Switch } from '@wallarm-org/design-system/Switch';
import { Text } from '@wallarm-org/design-system/Text';
import { Button } from '@wallarm-org/design-system/Button';
import { useFlags, setFlag, resetFlags, type FlagState } from '@/nav/flags';

export function FlagPanel() {
  const flags = useFlags();
  if (!flags.debugMode) return null;

  return (
    <aside
      aria-label="Debug flag panel"
      className="fixed bottom-16 right-16 z-50 flex flex-col gap-12 rounded-md border p-16 shadow-lg"
      style={{
        backgroundColor: 'var(--color-bg-surface-1)',
        borderColor: 'var(--color-border-primary)',
        minWidth: '240px',
      }}
    >
      <header className="flex items-center justify-between gap-8">
        <Text size="xs" weight="medium" color="secondary">
          DEBUG FLAGS
        </Text>
        <Button variant="ghost" size="small" onClick={() => resetFlags()}>
          Reset
        </Button>
      </header>

      <FlagToggle
        flag="securityEdgeUnlocked"
        label="Security Edge unlocked"
        description="Edge → Configuration"
      />
    </aside>
  );
}

function FlagToggle({
  flag,
  label,
  description,
}: {
  flag: keyof FlagState;
  label: string;
  description?: string;
}) {
  const flags = useFlags();
  const checked = Boolean(flags[flag]);

  return (
    <div className="flex items-start justify-between gap-12">
      <div className="flex flex-col">
        <Text size="sm" color="primary">
          {label}
        </Text>
        {description ? (
          <Text size="xs" color="secondary">
            {description}
          </Text>
        ) : null}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={(details) => setFlag(flag, details.checked)}
        aria-label={label}
      />
    </div>
  );
}
