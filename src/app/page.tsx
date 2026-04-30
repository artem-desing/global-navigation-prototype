'use client';

import Link from 'next/link';
import { Heading } from '@wallarm-org/design-system/Heading';
import { Text } from '@wallarm-org/design-system/Text';
import { Card } from '@wallarm-org/design-system/Card';
import { ChevronRight } from '@wallarm-org/design-system/icons';
import { getAllVariants } from '@/nav/variants/registry';
import { variantHomePath } from '@/nav/variant-context';

export default function PickerPage() {
  const variants = getAllVariants();

  return (
    <main
      className="flex min-h-screen flex-col items-center px-24 py-64"
      style={{ backgroundColor: 'var(--color-bg-page-bg)' }}
    >
      <div className="flex w-full max-w-3xl flex-col gap-32">
        <header className="flex flex-col gap-8">
          <span className="uppercase tracking-wide">
            <Text size="xs" weight="medium" color="secondary">
              Wallarm — global navigation prototype
            </Text>
          </span>
          <Heading size="3xl" weight="medium">
            Pick a variant
          </Heading>
          <Text color="secondary">
            Each card is a different navigation prototype. They share manifests
            and data — only the chrome and interaction model differ. Click the
            Wallarm wordmark inside any variant to come back here.
          </Text>
        </header>

        <ul className="flex flex-col gap-12">
          {variants.map((v) => (
            <li key={v.slug}>
              <Link href={variantHomePath(v.slug)} className="block">
                <Card className="transition-colors hover:bg-[var(--color-bg-light-primary)]">
                  <div className="flex items-start gap-16 p-20">
                    <div className="flex flex-1 flex-col gap-6">
                      <div className="flex items-baseline gap-12">
                        <Text size="lg" weight="medium" color="primary">
                          {v.label}
                        </Text>
                        <Text size="xs" color="secondary">
                          /v/{v.slug}/
                        </Text>
                      </div>
                      <Text size="sm" color="secondary">
                        {v.blurb}
                      </Text>
                    </div>
                    <ChevronRight
                      size="sm"
                      aria-hidden
                      style={{ color: 'var(--color-icon-secondary)' }}
                    />
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>

        <footer className="flex flex-col gap-4 pt-16">
          <Text size="xs" color="secondary">
            Internal prototype · {variants.length}{' '}
            variant{variants.length === 1 ? '' : 's'} registered.
          </Text>
        </footer>
      </div>
    </main>
  );
}
