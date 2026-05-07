'use client';

import { Card } from '@wallarm-org/design-system/Card';
import { Badge } from '@wallarm-org/design-system/Badge';
import { Button } from '@wallarm-org/design-system/Button';
import { Heading } from '@wallarm-org/design-system/Heading';
import { Text } from '@wallarm-org/design-system/Text';
import { mockPlans } from '@/lib/fixtures/settings';
import { SettingsPageTemplate } from './_template';

export function SubscriptionsPage() {
  return (
    <SettingsPageTemplate
      title="Subscriptions"
      subtitle="Plan, billing details, and invoice history."
    >
      {/* PM: replace mockPlans with real billing data. Add a Billing tab
         (invoice history, payment method, billing address) when scope grows. */}
      <ul className="grid grid-cols-3 gap-16">
        {mockPlans.map((plan) => (
          <li key={plan.id}>
            <Card className="h-full">
              <div className="flex flex-col gap-12 p-16">
                <div className="flex items-center justify-between">
                  <Heading size="lg" weight="medium">
                    {plan.name}
                  </Heading>
                  {plan.current ? (
                    <Badge type="secondary" color="green">
                      Current
                    </Badge>
                  ) : null}
                </div>
                <Text size="xl" weight="medium" color="primary">
                  {plan.price}
                </Text>
                <ul className="flex flex-col gap-4">
                  {plan.features.map((f) => (
                    <li key={f}>
                      <Text size="sm" color="secondary">
                        — {f}
                      </Text>
                    </li>
                  ))}
                </ul>
                <Button variant={plan.current ? 'secondary' : 'primary'} disabled={plan.current}>
                  {plan.current ? 'Current plan' : `Switch to ${plan.name}`}
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </SettingsPageTemplate>
  );
}
