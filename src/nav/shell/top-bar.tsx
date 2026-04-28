import { Search, Globe, ChevronDown, Activity } from '@wallarm-org/design-system/icons';
import { Kbd } from '@wallarm-org/design-system/Kbd';
import { Text } from '@wallarm-org/design-system/Text';

export function TopBar() {
  return (
    <header
      className="flex h-48 shrink-0 items-center justify-between gap-16 border-b px-16"
      style={{
        backgroundColor: 'var(--color-bg-surface-1)',
        borderColor: 'var(--color-border-primary-light)',
      }}
    >
      <div className="flex items-center gap-8">
        <Text size="md" weight="bold" color="primary">
          Wallarm
        </Text>
      </div>

      <div className="flex flex-1 max-w-md items-center justify-center">
        <button
          type="button"
          aria-label="Open global search"
          className="flex w-full items-center gap-8 rounded-md border px-12 py-6 text-left transition-colors"
          style={{
            backgroundColor: 'var(--color-bg-light-primary)',
            borderColor: 'var(--color-border-primary-light)',
          }}
        >
          <Search size="sm" aria-hidden style={{ color: 'var(--color-icon-secondary)' }} />
          <Text size="sm" color="secondary" grow>
            Global search
          </Text>
          <Kbd size="small">⌘K</Kbd>
        </button>
      </div>

      <div className="flex items-center gap-12">
        <button
          type="button"
          className="flex items-center gap-6 rounded-md px-8 py-4 transition-colors"
          aria-label="Switch tenant"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <Globe size="sm" aria-hidden />
          <Text size="sm" color="secondary">
            tenant
          </Text>
          <ChevronDown size="xs" aria-hidden />
        </button>

        <div
          className="flex items-center gap-6 rounded-md px-8 py-4"
          aria-label="Usage limits"
          style={{ color: 'var(--color-text-warning)' }}
        >
          <Activity size="sm" aria-hidden />
          <Text size="sm" color="inherit">
            limits
          </Text>
        </div>
      </div>
    </header>
  );
}
