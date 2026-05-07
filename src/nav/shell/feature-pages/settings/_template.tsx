'use client';

import type { ReactNode } from 'react';
import { Heading } from '@wallarm-org/design-system/Heading';
import { Text } from '@wallarm-org/design-system/Text';

// Shared shell for every Settings stub page. PMs: keep using this so headers
// stay consistent across sections, then drop your real content as `children`.
//
// If your section legitimately needs a different layout (full-width tabs at
// the top, a left sub-nav, etc.) you can drop the template and write the
// section bare — but mention the divergence in your MR description.

export function SettingsPageTemplate({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-24 p-32">
      <header className="flex flex-col gap-4">
        <Heading size="2xl" weight="medium">
          {title}
        </Heading>
        {subtitle ? <Text color="secondary">{subtitle}</Text> : null}
      </header>
      {children}
    </section>
  );
}

// Helper: a basic table row pattern matching `roles.tsx`. PMs can copy this
// inline into their page or import as-is.
export function SimpleTable<T>({
  rows,
  columns,
  rowKey,
}: {
  rows: T[];
  columns: { header: string; cell: (row: T) => ReactNode }[];
  rowKey: (row: T) => string;
}) {
  return (
    <div
      className="overflow-hidden rounded-md border"
      style={{
        backgroundColor: 'var(--color-bg-surface-1)',
        borderColor: 'var(--color-border-primary-light)',
      }}
    >
      <table className="w-full text-left">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border-primary-light)' }}>
            {columns.map((c) => (
              <th key={c.header} className="px-16 py-12">
                <Text size="xs" weight="medium" color="secondary">
                  {c.header}
                </Text>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={rowKey(r)}
              style={{ borderTop: '1px solid var(--color-border-primary-light)' }}
            >
              {columns.map((c) => (
                <td key={c.header} className="px-16 py-12">
                  {c.cell(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Helper: a labeled key/value row, useful for read-only profile-style pages.
export function KeyValueRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div
      className="flex items-center gap-16 px-16 py-12"
      style={{ borderTop: '1px solid var(--color-border-primary-light)' }}
    >
      <div className="w-160">
        <Text size="sm" color="secondary">
          {label}
        </Text>
      </div>
      <div className="flex-1">
        {typeof value === 'string' ? (
          <Text size="sm" color="primary">
            {value}
          </Text>
        ) : (
          value
        )}
      </div>
    </div>
  );
}
