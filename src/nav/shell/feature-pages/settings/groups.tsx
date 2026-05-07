'use client';

import { Button } from '@wallarm-org/design-system/Button';
import { Text } from '@wallarm-org/design-system/Text';
import { SettingsPageTemplate, SimpleTable } from './_template';

interface Group {
  id: string;
  name: string;
  members: number;
  description: string;
}

const groups: Group[] = [
  { id: 'g-eng', name: 'Engineering', members: 24, description: 'Backend + frontend engineers.' },
  { id: 'g-sec', name: 'Security', members: 7, description: 'Security operators and incident responders.' },
  { id: 'g-pm', name: 'Product', members: 5, description: 'Product managers and designers.' },
];

export function GroupsPage() {
  return (
    <SettingsPageTemplate
      title="Groups"
      subtitle="Bundle members into groups to assign roles or share resources."
    >
      {/* PM: a Group probably needs a detail view (members, permissions). Add
         it as a separate page when you scope this section. */}
      <div className="flex justify-end">
        <Button variant="primary">New group</Button>
      </div>

      <SimpleTable
        rows={groups}
        rowKey={(g) => g.id}
        columns={[
          {
            header: 'Name',
            cell: (g) => (
              <Text size="sm" weight="medium" color="primary">
                {g.name}
              </Text>
            ),
          },
          {
            header: 'Members',
            cell: (g) => (
              <Text size="sm" color="secondary">
                {g.members}
              </Text>
            ),
          },
          {
            header: 'Description',
            cell: (g) => (
              <Text size="sm" color="secondary">
                {g.description}
              </Text>
            ),
          },
        ]}
      />
    </SettingsPageTemplate>
  );
}
