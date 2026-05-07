'use client';

import { Card } from '@wallarm-org/design-system/Card';
import { Switch } from '@wallarm-org/design-system/Switch';
import { Text } from '@wallarm-org/design-system/Text';
import { Heading } from '@wallarm-org/design-system/Heading';
import { Badge } from '@wallarm-org/design-system/Badge';
import { SettingsPageTemplate } from './_template';

interface Experiment {
  id: string;
  name: string;
  description: string;
  stage: 'alpha' | 'beta' | 'preview';
  enabled: boolean;
}

const experiments: Experiment[] = [
  {
    id: 'fast-search',
    name: 'Fast search index',
    description: 'Vector-based recall on top of keyword matching. Rebuilds nightly.',
    stage: 'beta',
    enabled: true,
  },
  {
    id: 'auto-policy',
    name: 'Auto-policy suggestions',
    description: 'Surface suggested policies based on detected traffic patterns.',
    stage: 'alpha',
    enabled: false,
  },
  {
    id: 'unified-timeline',
    name: 'Unified incident timeline',
    description: 'Cross-product timeline view stitching events across surfaces.',
    stage: 'preview',
    enabled: false,
  },
];

const stageColor: Record<Experiment['stage'], 'red' | 'w-orange' | 'gray'> = {
  alpha: 'red',
  beta: 'w-orange',
  preview: 'gray',
};

export function ExperimentsPage() {
  return (
    <SettingsPageTemplate
      title="Experiments"
      subtitle="Opt into unreleased features. Each may change or disappear without notice."
    >
      {/* PM: add a per-experiment detail page (changelog, feedback link,
         metrics) and a way to scope an experiment to a subset of users. */}
      <ul className="flex flex-col gap-12">
        {experiments.map((x) => (
          <li key={x.id}>
            <Card>
              <div className="flex items-start justify-between gap-24 p-16">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-8">
                    <Heading size="md" weight="medium">
                      {x.name}
                    </Heading>
                    <Badge type="secondary" color={stageColor[x.stage]}>
                      {x.stage}
                    </Badge>
                  </div>
                  <Text size="sm" color="secondary">
                    {x.description}
                  </Text>
                </div>
                <Switch defaultChecked={x.enabled} />
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </SettingsPageTemplate>
  );
}
