import type { CommonDictionary } from '../../i18n/dictionaries';

export interface NavItem {
  to: string;
  icon: string;
  /** Key into `common.json`'s `nav` object — resolved by each nav component with its own `t()`. */
  labelKey: keyof CommonDictionary['nav'];
}

/**
 * Icons and destinations are read off `design/Shopbook_Daily.html` with Playwright, not guessed
 * — see the F2 PR body for the getComputedStyle pass that confirmed each icon ligature.
 *
 * The desktop sidebar and the mobile bottom bar draw different lists on purpose, because the
 * export does (checked directly): Notes has a sidebar row but no bottom-bar tab — on a phone it
 * is reached from within Today instead, which is F5's screen to build, not this shell's.
 */
export const SIDEBAR_NAV_ITEMS: readonly NavItem[] = [
  { to: '/', icon: 'today', labelKey: 'today' },
  { to: '/record', icon: 'receipt_long', labelKey: 'record' },
  { to: '/notes', icon: 'sticky_note_2', labelKey: 'notes' },
  { to: '/reports', icon: 'bar_chart', labelKey: 'reports' },
];

export const BOTTOM_NAV_ITEMS: readonly NavItem[] = [
  { to: '/', icon: 'today', labelKey: 'today' },
  { to: '/record', icon: 'receipt_long', labelKey: 'record' },
  { to: '/reports', icon: 'bar_chart', labelKey: 'reports' },
];

/** Settings on desktop, "Account" on mobile — the export labels the same destination
 *  differently by width, so this is one route with two label keys rather than two items. */
export const SETTINGS_ROUTE = '/settings';
