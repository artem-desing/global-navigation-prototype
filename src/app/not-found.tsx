import Link from 'next/link';
import { Heading } from '@wallarm-org/design-system/Heading';
import { Text } from '@wallarm-org/design-system/Text';

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-16 p-32">
      <Heading size="3xl" weight="medium">
        Not found
      </Heading>
      <Text color="secondary">
        That route doesn&apos;t exist in this prototype.
      </Text>
      <Link href="/" className="hover:underline" style={{ color: 'var(--color-text-link-default)' }}>
        <Text color="inherit">← Back to Home</Text>
      </Link>
    </main>
  );
}
