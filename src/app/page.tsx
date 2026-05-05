'use client';

import Link from 'next/link';
import { Heading } from '@wallarm-org/design-system/Heading';
import { Text } from '@wallarm-org/design-system/Text';
import { Card } from '@wallarm-org/design-system/Card';
import { Badge } from '@wallarm-org/design-system/Badge';
import { ChevronRight } from '@wallarm-org/design-system/icons';
import { getAllVariants, type Variant } from '@/nav/variants/registry';
import { variantHomePath } from '@/nav/variant-context';

export default function PickerPage() {
  const variants = getAllVariants();
  const preferred = variants.filter((v) => v.preferred);
  const others = variants.filter((v) => !v.preferred);

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

        <ul className="grid grid-cols-2 gap-8">
          {preferred.map((v) => (
            <VariantCard key={v.slug} variant={v} />
          ))}
        </ul>

        {others.length > 0 ? (
          <>
            <div
              role="separator"
              aria-orientation="horizontal"
              className="h-[1px] w-full"
              style={{ backgroundColor: 'var(--color-border-primary-light)' }}
            />
            <div className="flex flex-col gap-16">
              <span className="uppercase tracking-wide">
                <Text size="xs" weight="medium" color="secondary">
                  Other variants
                </Text>
              </span>
              <ul className="flex flex-col gap-8">
                {others.map((v) => (
                  <VariantCard key={v.slug} variant={v} />
                ))}
              </ul>
            </div>
          </>
        ) : null}

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

function VariantCard({ variant }: { variant: Variant }) {
  return (
    <li className="h-full">
      <Link href={variantHomePath(variant.slug)} className="block h-full">
        <Card className="h-full transition-colors hover:bg-[var(--color-bg-light-primary)]">
          <div className="flex h-full items-center gap-12 px-16">
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-baseline gap-8">
                <Text size="md" weight="medium" color="primary">
                  {variant.label}
                </Text>
                <Text size="xs" color="secondary">
                  /v/{variant.slug}/
                </Text>
                {variant.tag ? (
                  <Badge type="secondary" color="w-orange">
                    {variant.tag}
                  </Badge>
                ) : null}
              </div>
              <Text size="xs" color="secondary">
                {variant.blurb}
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
  );
}
