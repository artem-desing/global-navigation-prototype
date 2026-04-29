'use client';

import { Heading } from '@wallarm-org/design-system/Heading';
import { Text } from '@wallarm-org/design-system/Text';
import { Tabs } from '@wallarm-org/design-system/Tabs';
import { TabsList } from '@wallarm-org/design-system/Tabs';
import { TabsTrigger } from '@wallarm-org/design-system/Tabs';
import { TabsContent } from '@wallarm-org/design-system/Tabs';

export function RolesPage() {
  return (
    <section className="flex flex-col gap-24 p-32">
      <header className="flex flex-col gap-4">
        <Heading size="2xl" weight="medium">
          Roles
        </Heading>
        <Text color="secondary">
          Manage which actions members can perform across the workspace.
        </Text>
      </header>

      <Tabs defaultValue="predefined">
        <TabsList>
          <TabsTrigger value="predefined">Predefined</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
        <TabsContent value="predefined">
          <div className="flex flex-col gap-12 pt-16">
            <Text color="secondary">
              Built-in roles shipped by Wallarm. Read-only — clone one to start
              a custom role.
            </Text>
            <RoleList
              rows={[
                { name: 'Admin', summary: 'Full access to every workspace surface.' },
                { name: 'Editor', summary: 'Manage policies, rules, and integrations.' },
                { name: 'Viewer', summary: 'Read-only across products and findings.' },
                { name: 'Auditor', summary: 'Read-only with extra access to audit logs.' },
              ]}
            />
          </div>
        </TabsContent>
        <TabsContent value="custom">
          <div className="flex flex-col gap-12 pt-16">
            <Text color="secondary">
              Roles defined by your team. Edit permissions per-action or clone
              from a predefined role.
            </Text>
            <RoleList
              rows={[
                { name: 'On-call responder', summary: 'Triage and acknowledge incidents only.' },
                { name: 'Compliance officer', summary: 'Audit log + reports access.' },
              ]}
            />
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

function RoleList({ rows }: { rows: { name: string; summary: string }[] }) {
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
                Role
              </Text>
            </th>
            <th className="px-16 py-12">
              <Text size="xs" weight="medium" color="secondary">
                Summary
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
                  {r.summary}
                </Text>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
