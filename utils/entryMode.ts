import { AppEntryMode } from '../types';

export const ENTRY_PREFERENCE_KEY = 'spi_entry_preference';

export interface EntryModeResolutionInput {
  search: string;
  storedPreference: AppEntryMode | null;
  isStandalone: boolean;
  isMobileOrTablet: boolean;
  defaultMode?: AppEntryMode;
}

export const parseEntryModeFromSearch = (search: string): AppEntryMode | null => {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  const entry = params.get('entry');
  if (entry === 'pwa' || entry === 'web') {
    return entry;
  }
  return null;
};

export const resolveEntryMode = ({
  search,
  storedPreference,
  isStandalone,
  isMobileOrTablet,
  defaultMode = 'web',
}: EntryModeResolutionInput): AppEntryMode => {
  const queryMode = parseEntryModeFromSearch(search);
  if (queryMode) {
    return queryMode;
  }

  if (storedPreference) {
    return storedPreference;
  }

  if (isStandalone || isMobileOrTablet) {
    return 'pwa';
  }

  return defaultMode;
};

export const detectStandaloneMode = (
  win: Pick<Window, 'matchMedia' | 'navigator'> = window,
): boolean => {
  const nav = win.navigator as Navigator & { standalone?: boolean };
  return Boolean(win.matchMedia?.('(display-mode: standalone)').matches || nav.standalone === true);
};

export const detectMobileOrTablet = (
  win: Pick<Window, 'matchMedia' | 'navigator'> = window,
): boolean => {
  const ua = win.navigator.userAgent || '';
  const mobileUa = /(android|iphone|ipad|ipod|mobile|tablet|silk|kindle|playbook|bb10|windows phone)/i.test(ua);

  const coarsePointer = Boolean(win.matchMedia?.('(pointer: coarse)').matches);
  const mediumViewport = Boolean(win.matchMedia?.('(max-width: 1024px)').matches);

  return mobileUa || (coarsePointer && mediumViewport);
};

export const getStoredEntryPreference = (storage: Storage = localStorage): AppEntryMode | null => {
  try {
    const value = storage.getItem(ENTRY_PREFERENCE_KEY);
    return value === 'pwa' || value === 'web' ? value : null;
  } catch {
    return null;
  }
};

export const setStoredEntryPreference = (
  mode: AppEntryMode,
  storage: Storage = localStorage,
): void => {
  try {
    storage.setItem(ENTRY_PREFERENCE_KEY, mode);
  } catch {
    // Ignore storage errors (private mode / quota issues)
  }
};

export const resolveRuntimeEntryMode = (
  win: Pick<Window, 'location' | 'matchMedia' | 'navigator' | 'localStorage'> = window,
): AppEntryMode => {
  return resolveEntryMode({
    search: win.location.search,
    storedPreference: getStoredEntryPreference(win.localStorage),
    isStandalone: detectStandaloneMode(win),
    isMobileOrTablet: detectMobileOrTablet(win),
    defaultMode: 'web',
  });
};

export const buildEntryUrl = (currentHref: string, mode: AppEntryMode): string => {
  const url = new URL(currentHref);
  url.searchParams.set('entry', mode);
  return url.toString();
};
