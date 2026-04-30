import { getAllVariants } from '@/nav/variants/registry';
import { VariantHomeClient } from './home-client';

interface PageParams {
  variant: string;
}

export async function generateStaticParams(): Promise<PageParams[]> {
  return getAllVariants().map((v) => ({ variant: v.slug }));
}

export default async function VariantHomePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  await params;
  return <VariantHomeClient />;
}
