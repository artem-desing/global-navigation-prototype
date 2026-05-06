/**
 * Lightweight nav-event bridge. Lets decoupled chrome (e.g. the global-search
 * action list) trigger UI that lives elsewhere (e.g. the tenant placeholder
 * dialog mounted in TopBar) without prop drilling or a shared store.
 */

export const NAV_EVENTS = {
  OpenTenantDialog: 'nav:open-tenant-dialog',
} as const;

export type NavEventName = (typeof NAV_EVENTS)[keyof typeof NAV_EVENTS];

export function dispatchNavEvent(name: NavEventName) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(name));
}

export function onNavEvent(name: NavEventName, handler: () => void) {
  window.addEventListener(name, handler);
  return () => window.removeEventListener(name, handler);
}
