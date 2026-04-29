import Link from 'next/link';
import type { ReactNode } from 'react';
import { Heading } from '@wallarm-org/design-system/Heading';
import { Text } from '@wallarm-org/design-system/Text';
import { Button } from '@wallarm-org/design-system/Button';
import { Plus } from '@wallarm-org/design-system/icons';

export interface PickerColumn<T> {
  key: string;
  label: string;
  render: (item: T) => ReactNode;
}

export interface ScopePickerProps<T> {
  title: string;
  subtitle: string;
  items: T[];
  columns: PickerColumn<T>[];
  /** When omitted, rows render as static cells (no link, no hover treatment). */
  rowHref?: (item: T) => string;
  addLabel?: string;
  emptyMessage?: string;
}

export function ScopePicker<T>({
  title,
  subtitle,
  items,
  columns,
  rowHref,
  addLabel,
  emptyMessage = 'Nothing here yet.',
}: ScopePickerProps<T>) {
  const interactive = !!rowHref;
  return (
    <section className="flex flex-col gap-24 p-32">
      <header className="flex items-start justify-between gap-16">
        <div className="flex flex-col gap-4">
          <Heading size="2xl" weight="medium">
            {title}
          </Heading>
          <Text color="secondary">{subtitle}</Text>
        </div>
        {addLabel ? (
          <Button>
            <Plus size="sm" aria-hidden /> {addLabel}
          </Button>
        ) : null}
      </header>

      <div
        className="overflow-hidden rounded-md border"
        style={{
          backgroundColor: 'var(--color-bg-surface-1)',
          borderColor: 'var(--color-border-primary-light)',
        }}
      >
        {items.length === 0 ? (
          <div className="p-24">
            <Text color="secondary">{emptyMessage}</Text>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border-primary-light)' }}>
                {columns.map((col) => (
                  <th key={col.key} className="px-16 py-12">
                    <Text size="xs" weight="medium" color="secondary">
                      {col.label}
                    </Text>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, rowIdx) => {
                const href = interactive ? rowHref!(item) : null;
                return (
                  <tr
                    key={(item as { id?: string }).id ?? rowIdx}
                    style={{ borderTop: '1px solid var(--color-border-primary-light)' }}
                    className={
                      interactive
                        ? 'transition-colors hover:bg-[var(--color-bg-light-primary)]'
                        : ''
                    }
                  >
                    {columns.map((col, colIdx) => (
                      <td key={col.key} className="px-16 py-12">
                        {colIdx === 0 && href ? (
                          <Link href={href} className="hover:underline">
                            {col.render(item)}
                          </Link>
                        ) : (
                          col.render(item)
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export function StatusPill({ status }: { status: 'active' | 'inactive' }) {
  const isActive = status === 'active';
  return (
    <span
      className="inline-flex items-center gap-6 rounded-full px-8 py-2"
      style={{
        backgroundColor: isActive ? 'var(--color-bg-light-success)' : 'var(--color-bg-light-primary)',
      }}
    >
      <span
        className="h-6 w-6 rounded-full"
        style={{
          backgroundColor: isActive
            ? 'var(--color-bg-fill-success)'
            : 'var(--color-bg-strong-primary)',
        }}
        aria-hidden
      />
      <Text size="xs" color={isActive ? 'inherit' : 'secondary'}>
        {isActive ? 'Active' : 'Inactive'}
      </Text>
    </span>
  );
}

export function MethodPill({ method }: { method: 'GET' | 'POST' | 'PUT' | 'DELETE' }) {
  const colors: Record<typeof method, string> = {
    GET: 'var(--color-bg-light-info)',
    POST: 'var(--color-bg-light-success)',
    PUT: 'var(--color-bg-light-warning)',
    DELETE: 'var(--color-bg-light-danger)',
  };
  return (
    <span
      className="inline-flex items-center rounded px-6 py-2 font-mono"
      style={{ backgroundColor: colors[method] }}
    >
      <Text size="xs" weight="medium" color="primary">
        {method}
      </Text>
    </span>
  );
}
