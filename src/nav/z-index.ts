// Stacking contract for floating layers in the prototype shell. Use these
// instead of magic numbers in `style={{ zIndex }}`. WADS portals (Dialog,
// DropdownMenu) manage their own stacking — these constants only govern the
// layers we render ourselves.
export const Z_RAIL_OVERLAY = 20;
export const Z_HOVER_PREVIEW = 25; // v0's hover-preview surface
export const Z_DROPDOWN = 30; // Recent / utility dropdowns
export const Z_SCOPE_SWAP_MENU = 35; // breadcrumb scope-chip popover
export const Z_AI_PUSH_PANEL = 40; // AI assistant
export const Z_FLAG_PANEL = 45; // dev flag panel
export const Z_DIALOG = 50; // ⌘K, tenant dialog, etc
