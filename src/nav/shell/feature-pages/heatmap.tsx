import { Heading } from '@wallarm-org/design-system/Heading';
import { Text } from '@wallarm-org/design-system/Text';
import { aiHypervisorAssetCategories } from '@/lib/mock-data/ai-hypervisor-assets';

export function HeatmapPage() {
  return (
    <section className="flex flex-col gap-24 p-32">
      <header className="flex items-baseline gap-12">
        <Heading size="2xl" weight="medium">
          Heatmap
        </Heading>
        <Text size="sm" color="secondary">
          Risk Matrix · Full Stack
        </Text>
      </header>

      <Text color="secondary">
        Mock placeholder of the AI Hypervisor heatmap (see screenshot in
        `docs/assets/`). Real content lives in the Hypervisor team&apos;s mock data
        — these rows just populate the structure.
      </Text>

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
                  Asset / Risk
                </Text>
              </th>
              <th className="px-16 py-12 text-center">
                <Text size="xs" weight="medium" color="secondary">
                  Shadow AI
                </Text>
              </th>
            </tr>
          </thead>
          <tbody>
            {aiHypervisorAssetCategories.map((cat) => (
              <tr
                key={cat.id}
                style={{ borderTop: '1px solid var(--color-border-primary-light)' }}
              >
                <td className="px-16 py-12">
                  <div className="flex flex-col">
                    <Text size="sm" weight="medium" color="primary">
                      {cat.label}
                    </Text>
                    <Text size="xs" color="secondary">
                      {cat.count.toLocaleString()} assets
                    </Text>
                  </div>
                </td>
                <td className="px-16 py-12 text-center">
                  <Text size="lg" weight="medium" color="primary">
                    {cat.shadowAi}
                  </Text>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
