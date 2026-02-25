import { describe, expect, it } from 'vitest';
import {
  detectMobileOrTablet,
  detectStandaloneMode,
  parseEntryModeFromSearch,
  resolveEntryMode,
} from './entryMode';

const createMatchMedia = (map: Record<string, boolean>) => {
  return (query: string) => ({
    matches: map[query] ?? false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
};

describe('entryMode', () => {
  it('parses entry mode from URL search', () => {
    expect(parseEntryModeFromSearch('?entry=pwa')).toBe('pwa');
    expect(parseEntryModeFromSearch('?entry=web')).toBe('web');
    expect(parseEntryModeFromSearch('?entry=unknown')).toBeNull();
  });

  it('uses URL mode with highest priority', () => {
    const mode = resolveEntryMode({
      search: '?entry=web',
      storedPreference: 'pwa',
      isStandalone: true,
      isMobileOrTablet: true,
    });

    expect(mode).toBe('web');
  });

  it('uses stored preference when URL mode is absent', () => {
    const mode = resolveEntryMode({
      search: '',
      storedPreference: 'web',
      isStandalone: true,
      isMobileOrTablet: true,
    });

    expect(mode).toBe('web');
  });

  it('falls back to standalone mode', () => {
    const mode = resolveEntryMode({
      search: '',
      storedPreference: null,
      isStandalone: true,
      isMobileOrTablet: false,
    });

    expect(mode).toBe('pwa');
  });

  it('falls back to mobile/tablet detection', () => {
    const mode = resolveEntryMode({
      search: '',
      storedPreference: null,
      isStandalone: false,
      isMobileOrTablet: true,
    });

    expect(mode).toBe('pwa');
  });

  it('uses web as default mode', () => {
    const mode = resolveEntryMode({
      search: '',
      storedPreference: null,
      isStandalone: false,
      isMobileOrTablet: false,
    });

    expect(mode).toBe('web');
  });

  it('detects standalone mode by media query', () => {
    const result = detectStandaloneMode({
      navigator: { userAgent: 'Mozilla/5.0' } as Navigator,
      matchMedia: createMatchMedia({ '(display-mode: standalone)': true }),
    });

    expect(result).toBe(true);
  });

  it('detects standalone mode on iOS navigator.standalone', () => {
    const result = detectStandaloneMode({
      navigator: { userAgent: 'Mozilla/5.0', standalone: true } as Navigator & { standalone: boolean },
      matchMedia: createMatchMedia({}),
    });

    expect(result).toBe(true);
  });

  it('detects mobile/tablet by UA', () => {
    const result = detectMobileOrTablet({
      navigator: { userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)' } as Navigator,
      matchMedia: createMatchMedia({}),
    });

    expect(result).toBe(true);
  });

  it('detects mobile/tablet by coarse pointer + viewport', () => {
    const result = detectMobileOrTablet({
      navigator: { userAgent: 'Mozilla/5.0 Desktop' } as Navigator,
      matchMedia: createMatchMedia({
        '(pointer: coarse)': true,
        '(max-width: 1024px)': true,
      }),
    });

    expect(result).toBe(true);
  });
});
