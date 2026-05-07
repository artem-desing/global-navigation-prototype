import type { ComponentProps } from 'react';

type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'inherit';
type IconProps = Omit<ComponentProps<'svg'>, 'children'> & { size?: IconSize };

function sizeClass(size?: IconSize): string {
  return `icon-${size ?? 'inherit'}`;
}

const STROKE_PROPS = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export function User({ size, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable={false}
      className={[sizeClass(size), className].filter(Boolean).join(' ')}
      {...STROKE_PROPS}
      {...rest}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  );
}
User.displayName = 'UserIcon';

export function Sparkles({ size, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable={false}
      className={[sizeClass(size), className].filter(Boolean).join(' ')}
      {...STROKE_PROPS}
      {...rest}
    >
      <path d="M9.5 3 11 7l4 1.5-4 1.5-1.5 4L8 10 4 8.5 8 7Z" />
      <path d="M18 3v4" />
      <path d="M16 5h4" />
      <path d="M18 17v4" />
      <path d="M16 19h4" />
    </svg>
  );
}
Sparkles.displayName = 'SparklesIcon';

export function Memory({ size, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable={false}
      className={[sizeClass(size), className].filter(Boolean).join(' ')}
      {...STROKE_PROPS}
      {...rest}
    >
      <path d="M6 19v-3" />
      <path d="M10 19v-3" />
      <path d="M14 19v-3" />
      <path d="M18 19v-3" />
      <path d="M8 11V9" />
      <path d="M16 11V9" />
      <path d="M12 11V9" />
      <path d="M2 15h20" />
      <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1.1a2 2 0 0 0 0 3.837V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5.1a2 2 0 0 0 0-3.837Z" />
    </svg>
  );
}
Memory.displayName = 'MemoryIcon';

export function Sun({ size, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable={false}
      className={[sizeClass(size), className].filter(Boolean).join(' ')}
      {...STROKE_PROPS}
      {...rest}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}
Sun.displayName = 'SunIcon';

export function PanelLeftDashed({ size, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable={false}
      className={[sizeClass(size), className].filter(Boolean).join(' ')}
      {...STROKE_PROPS}
      {...rest}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 14v1" />
      <path d="M9 19v2" />
      <path d="M9 3v2" />
      <path d="M9 9v1" />
    </svg>
  );
}
PanelLeftDashed.displayName = 'PanelLeftDashedIcon';

export function Bell({ size, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable={false}
      className={[sizeClass(size), className].filter(Boolean).join(' ')}
      {...STROKE_PROPS}
      {...rest}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
Bell.displayName = 'BellIcon';

export function ArrowRightLeft({ size, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable={false}
      className={[sizeClass(size), className].filter(Boolean).join(' ')}
      {...STROKE_PROPS}
      {...rest}
    >
      <path d="m16 3 4 4-4 4" />
      <path d="M20 7H4" />
      <path d="m8 21-4-4 4-4" />
      <path d="M4 17h16" />
    </svg>
  );
}
ArrowRightLeft.displayName = 'ArrowRightLeftIcon';
