'use client';

import { Button } from '@wallarm-org/design-system/Button';
import { Text } from '@wallarm-org/design-system/Text';
import { Badge } from '@wallarm-org/design-system/Badge';
import { mockUsers } from '@/lib/fixtures/settings';
import { SettingsPageTemplate, SimpleTable } from './_template';

export function UsersAllPage() {
  return (
    <SettingsPageTemplate
      title="All users"
      subtitle="Members of this workspace, their role, and last activity."
    >
      {/* PM: extend with row actions (suspend / change role / remove), bulk
         operations, or a search filter. mockUsers lives in
         src/lib/fixtures/settings.ts. */}
      <div className="flex justify-end">
        <Button variant="primary">Invite member</Button>
      </div>

      <SimpleTable
        rows={mockUsers}
        rowKey={(u) => u.id}
        columns={[
          {
            header: 'Name',
            cell: (u) => (
              <div className="flex flex-col">
                <Text size="sm" weight="medium" color="primary">
                  {u.name}
                </Text>
                <Text size="xs" color="secondary">
                  {u.email}
                </Text>
              </div>
            ),
          },
          {
            header: 'Role',
            cell: (u) => (
              <Badge type="secondary" color="gray">
                {u.role}
              </Badge>
            ),
          },
          {
            header: 'Last active',
            cell: (u) => (
              <Text size="sm" color="secondary">
                {u.lastActive}
              </Text>
            ),
          },
        ]}
      />
    </SettingsPageTemplate>
  );
}
