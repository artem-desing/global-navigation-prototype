import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { getAllVariants, getVariant } from '@/nav/variants/registry';
import { VariantProvider } from '@/nav/variant-context';

interface LayoutParams {
  variant: string;
}

export async function generateStaticParams(): Promise<LayoutParams[]> {
  return getAllVariants().map((v) => ({ variant: v.slug }));
}

export default async function VariantLayout({
  params,
  children,
}: {
  params: Promise<LayoutParams>;
  children: ReactNode;
}) {
  const { variant: slug } = await params;
  const variant = getVariant(slug);
  if (!variant) notFound();

  const Shell = variant.Shell;
  return (
    <VariantProvider slug={slug}>
      <Shell>{children}</Shell>
    </VariantProvider>
  );
}
