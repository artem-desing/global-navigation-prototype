import type { ReactNode } from 'react';
import { ShellLayout } from '@/nav/shell/shell-layout';

export default function WithNavLayout({ children }: { children: ReactNode }) {
  return <ShellLayout>{children}</ShellLayout>;
}
