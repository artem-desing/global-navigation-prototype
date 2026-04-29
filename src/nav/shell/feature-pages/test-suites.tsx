'use client';

import { Heading } from '@wallarm-org/design-system/Heading';
import { Text } from '@wallarm-org/design-system/Text';
import { Button } from '@wallarm-org/design-system/Button';
import { Tabs } from '@wallarm-org/design-system/Tabs';
import { TabsList } from '@wallarm-org/design-system/Tabs';
import { TabsTrigger } from '@wallarm-org/design-system/Tabs';
import { TabsContent } from '@wallarm-org/design-system/Tabs';
import { Plus } from '@wallarm-org/design-system/icons';

type Suite = {
  name: string;
  scope: string;
  lastRun: string;
  status: 'passing' | 'failing' | 'partial';
};

const ACTIVE: Suite[] = [
  { name: 'Auth flows — production', scope: 'auth.api.acme.com', lastRun: '2h ago', status: 'passing' },
  { name: 'Checkout — pre-release', scope: 'checkout.api.acme.com', lastRun: '4h ago', status: 'partial' },
  { name: 'OWASP Top 10 baseline', scope: 'all production services', lastRun: '1d ago', status: 'passing' },
  { name: 'Mobile API regression', scope: 'mobile.api.acme.com', lastRun: '6h ago', status: 'failing' },
];

const ARCHIVED: Suite[] = [
  { name: 'Legacy v2 endpoints', scope: 'v2.api.acme.com', lastRun: '3 months ago', status: 'partial' },
  { name: 'PCI DSS — Q3 audit', scope: 'payments.api.acme.com', lastRun: '5 months ago', status: 'passing' },
];

export function TestSuitesPage() {
  return (
    <section className="flex flex-col gap-24 p-32">
      <header className="flex items-start justify-between gap-16">
        <div className="flex flex-col gap-4">
          <Heading size="2xl" weight="medium">
            Test Suites
          </Heading>
          <Text color="secondary">
            Run and track API security test suites across your services.
          </Text>
        </div>
        <Button variant="primary" color="brand">
          <Plus size="sm" />
          New suite
        </Button>
      </header>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <div className="flex flex-col gap-12 pt-16">
            <Text color="secondary">
              Suites currently scheduled or available for ad-hoc runs.
            </Text>
            <SuiteTable rows={ACTIVE} />
          </div>
        </TabsContent>
        <TabsContent value="archived">
          <div className="flex flex-col gap-12 pt-16">
            <Text color="secondary">
              Suites taken out of rotation. Restore one to bring it back into Active.
            </Text>
            <SuiteTable rows={ARCHIVED} />
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

const STATUS_COLOR: Record<Suite['status'], string> = {
  passing: 'var(--color-text-success)',
  failing: 'var(--color-text-danger)',
  partial: 'var(--color-text-warning)',
};

const STATUS_LABEL: Record<Suite['status'], string> = {
  passing: 'Passing',
  failing: 'Failing',
  partial: 'Partial',
};

function SuiteTable({ rows }: { rows: Suite[] }) {
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
            <th className="px-16 py-12">
              <Text size="xs" weight="medium" color="secondary">
                Suite
              </Text>
            </th>
            <th className="px-16 py-12">
              <Text size="xs" weight="medium" color="secondary">
                Scope
              </Text>
            </th>
            <th className="px-16 py-12">
              <Text size="xs" weight="medium" color="secondary">
                Last run
              </Text>
            </th>
            <th className="px-16 py-12">
              <Text size="xs" weight="medium" color="secondary">
                Status
              </Text>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.name}
              style={{ borderTop: '1px solid var(--color-border-primary-light)' }}
            >
              <td className="px-16 py-12">
                <Text size="sm" weight="medium" color="primary">
                  {r.name}
                </Text>
              </td>
              <td className="px-16 py-12">
                <Text size="sm" color="secondary">
                  {r.scope}
                </Text>
              </td>
              <td className="px-16 py-12">
                <Text size="sm" color="secondary">
                  {r.lastRun}
                </Text>
              </td>
              <td className="px-16 py-12">
                <Text size="sm" color="inherit" style={{ color: STATUS_COLOR[r.status] }}>
                  {STATUS_LABEL[r.status]}
                </Text>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
