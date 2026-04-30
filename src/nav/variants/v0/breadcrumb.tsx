'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronRight, ChevronDown, Check } from '@wallarm-org/design-system/icons';
import { Text } from '@wallarm-org/design-system/Text';
import { Popover } from '@wallarm-org/design-system/Popover';
import { PopoverTrigger } from '@wallarm-org/design-system/Popover';
import { PopoverContent } from '@wallarm-org/design-system/Popover';
import { resolveShellContext, type BreadcrumbStep } from '@/nav/url';
import { useVariant } from '@/nav/variant-context';
import { dataPlanes } from '@/lib/mock-data/data-planes';

export function Breadcrumb() {
  const pathname = usePathname();
  const { slug: variantSlug } = useVariant();
  const ctx = resolveShellContext(pathname, { variantPrefix: `/v/${variantSlug}` });

  if (ctx.mode !== 'product') return null;
  if (ctx.breadcrumb.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-6 px-32 pt-16">
      {ctx.breadcrumb.map((step, idx) => (
        <BreadcrumbStepRenderer
          key={`${step.kind}-${idx}`}
          step={step}
          showSeparator={idx > 0}
        />
      ))}
    </nav>
  );
}

function BreadcrumbStepRenderer({ step, showSeparator }: { step: BreadcrumbStep; showSeparator: boolean }) {
  return (
    <span className="flex items-center gap-6">
      {showSeparator ? (
        <ChevronRight size="xs" aria-hidden style={{ color: 'var(--color-icon-secondary)' }} />
      ) : null}
      {step.kind === 'product' ? (
        <Link href={step.href} className="transition-colors hover:underline">
          <Text size="sm" color="secondary">
            {step.label}
          </Text>
        </Link>
      ) : step.kind === 'feature' ? (
        step.current ? (
          <Text size="sm" weight="medium" color="primary">
            {step.label}
          </Text>
        ) : (
          <Link href={step.href} className="transition-colors hover:underline">
            <Text size="sm" color="secondary">
              {step.label}
            </Text>
          </Link>
        )
      ) : step.kind === 'group' ? (
        <Text size="sm" color="secondary">
          {step.label}
        </Text>
      ) : (
        <ScopeChip step={step} />
      )}
    </span>
  );
}

function ScopeChip({ step }: { step: Extract<BreadcrumbStep, { kind: 'scope-chip' }> }) {
  return (
    <span
      className="flex items-center gap-4 rounded-md border px-8 py-2"
      style={{
        backgroundColor: 'var(--color-bg-light-primary)',
        borderColor: 'var(--color-border-primary-light)',
      }}
    >
      <ScopeChipBody step={step} />
    </span>
  );
}

/**
 * Chip body. For scope types we know how to enumerate (data planes today),
 * the body opens a popover with the swap menu. Other scope types fall back to
 * the link-to-default-landing behavior so navigation still works.
 */
function ScopeChipBody({ step }: { step: Extract<BreadcrumbStep, { kind: 'scope-chip' }> }) {
  if (step.scopeRequirement === 'dataplane-id') {
    return <DataPlaneSwapMenu step={step} />;
  }

  // Fallback for not-yet-wired scope types (service-id / route-id / policy-id):
  // clicking the chip body navigates to that scope's level-N+1 default landing.
  return (
    <Link href={step.href} className="flex items-center gap-4">
      <Text size="sm" color="primary" weight="medium">
        {step.label}
      </Text>
      <ChevronDown
        size="xs"
        aria-hidden
        style={{ color: 'var(--color-icon-secondary)' }}
      />
    </Link>
  );
}

function DataPlaneSwapMenu({ step }: { step: Extract<BreadcrumbStep, { kind: 'scope-chip' }> }) {
  const router = useRouter();
  const pathname = usePathname();

  const swapTo = (newId: string): string => {
    const segments = pathname.split('/').filter(Boolean);
    segments[step.scopeSegmentIndex] = newId;
    return '/' + segments.join('/');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Swap ${step.label} scope`}
          className="flex cursor-pointer items-center gap-4 transition-colors hover:underline"
        >
          <Text size="sm" color="primary" weight="medium">
            {step.label}
          </Text>
          <ChevronDown
            size="xs"
            aria-hidden
            style={{ color: 'var(--color-icon-secondary)' }}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent minWidth="240px">
        <ul className="flex flex-col py-4" role="menu">
          {dataPlanes.map((plane) => {
            const isCurrent = plane.id === step.resourceId;
            return (
              <li key={plane.id} role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    if (isCurrent) return;
                    router.push(swapTo(plane.id));
                  }}
                  className="flex w-full items-center justify-between gap-12 px-12 py-8 text-left transition-colors hover:bg-[var(--color-bg-light-primary)]"
                  style={{
                    backgroundColor: isCurrent ? 'var(--color-bg-primary)' : 'transparent',
                  }}
                >
                  <span className="flex flex-col">
                    <Text size="sm" weight="medium" color="primary">
                      {plane.name}
                    </Text>
                    <Text size="xs" color="secondary">
                      {plane.region}
                    </Text>
                  </span>
                  {isCurrent ? (
                    <Check size="xs" aria-label="Current scope" style={{ color: 'var(--color-icon-secondary)' }} />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
