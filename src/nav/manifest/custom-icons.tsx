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
