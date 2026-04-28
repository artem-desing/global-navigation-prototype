'use client';

import Link from 'next/link';
import { Heading } from '@wallarm-org/design-system/Heading';
import { Text } from '@wallarm-org/design-system/Text';
import { Card } from '@wallarm-org/design-system/Card';
import { homeSummary, recentActivity, type ActivityEvent } from '@/lib/mock-data/home-summary';

export default function HomePage() {
  return (
    <section className="flex flex-col gap-32 p-32">
      <header className="flex flex-col gap-4">
        <Heading size="2xl" weight="medium">
          Home — hi artem
        </Heading>
        <Text color="secondary">
          Cross-Product summary. Click any card to drill into a Product.
        </Text>
      </header>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
        <SummaryCard
          href="/edge/overview"
          title="Edge"
          metrics={[
            { label: 'Data planes', value: homeSummary.edge.activeDataPlanes, sub: 'all active' },
            { label: 'Services', value: homeSummary.edge.totalServices },
            { label: 'Routes', value: homeSummary.edge.totalRoutes },
            { label: 'Policies', value: homeSummary.edge.totalPolicies },
          ]}
          accent={`${homeSummary.edge.attacksLast24h} attacks blocked · last 24h`}
        />

        <SummaryCard
          href="/ai-hypervisor/heatmap"
          title="AI Hypervisor"
          metrics={[
            { label: 'Monitored assets', value: homeSummary.aiHypervisor.totalAssets.toLocaleString() },
            { label: 'Categories', value: homeSummary.aiHypervisor.categories },
            { label: 'Shadow AI', value: homeSummary.aiHypervisor.shadowAiFindings, sub: 'findings' },
          ]}
          accent="Heatmap updated 3m ago"
        />

        <SummaryCard
          href="/testing/results"
          title="Testing"
          metrics={[
            { label: 'Coverage', value: `${homeSummary.testing.coveragePercent}%` },
            { label: 'Pass rate', value: `${homeSummary.testing.passRate}%` },
          ]}
          accent={`Last run ${homeSummary.testing.lastRunHoursAgo}h ago`}
        />
      </div>

      <ActivityFeed events={recentActivity} />
    </section>
  );
}

interface Metric {
  label: string;
  value: string | number;
  sub?: string;
}

function SummaryCard({
  href,
  title,
  metrics,
  accent,
}: {
  href: string;
  title: string;
  metrics: Metric[];
  accent: string;
}) {
  return (
    <Link href={href} className="block transition-colors">
      <Card className="h-full">
        <div className="flex flex-col gap-16 p-20">
          <div className="flex items-baseline justify-between gap-8">
            <Text size="lg" weight="medium" color="primary">
              {title}
            </Text>
            <Text size="xs" color="secondary">
              {accent}
            </Text>
          </div>
          <div className="grid grid-cols-2 gap-12">
            {metrics.map((m) => (
              <div key={m.label} className="flex flex-col gap-2">
                <Text size="xs" color="secondary">
                  {m.label}
                </Text>
                <div className="flex items-baseline gap-6">
                  <Text size="xl" weight="medium" color="primary">
                    {m.value}
                  </Text>
                  {m.sub ? (
                    <Text size="xs" color="secondary">
                      {m.sub}
                    </Text>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  );
}

function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <section className="flex flex-col gap-12">
      <Text size="sm" weight="medium" color="primary">
        Recent activity
      </Text>
      <Card>
        <ul className="flex flex-col">
          {events.map((event, idx) => (
            <li
              key={event.id}
              style={{
                borderTop: idx === 0 ? 'none' : '1px solid var(--color-border-primary-light)',
              }}
            >
              {event.href ? (
                <Link
                  href={event.href}
                  className="flex items-center gap-12 px-16 py-12 transition-colors hover:bg-[var(--color-bg-light-primary)]"
                >
                  <ActivityRow event={event} />
                </Link>
              ) : (
                <div className="flex items-center gap-12 px-16 py-12">
                  <ActivityRow event={event} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

function ActivityRow({ event }: { event: ActivityEvent }) {
  return (
    <>
      <Text size="xs" color="secondary">
        {event.timeAgo}
      </Text>
      <Text size="sm" color="primary" grow>
        {event.event}
      </Text>
      <span
        className="rounded px-8 py-2 text-[10px] font-medium uppercase"
        style={{
          backgroundColor: 'var(--color-bg-light-primary)',
          color: 'var(--color-text-secondary)',
        }}
      >
        {event.surface}
      </span>
    </>
  );
}
