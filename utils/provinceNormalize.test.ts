import { describe, expect, it } from 'vitest';

import { normalizeProvinceName, provinceMatches } from './provinceNormalize';

describe('provinceNormalize', () => {
  it('normalizes common suffixes', () => {
    expect(normalizeProvinceName('江苏省')).toBe('江苏');
    expect(normalizeProvinceName('北京市')).toBe('北京');
    expect(normalizeProvinceName('内蒙古自治区')).toBe('内蒙古');
    expect(normalizeProvinceName('广西壮族自治区')).toBe('广西');
  });

  it('treats 全部 as reserved wildcard', () => {
    expect(normalizeProvinceName(' 全部 ')).toBe('全部');
  });

  it('matches normalized names', () => {
    expect(provinceMatches('江苏省', '江苏')).toBe(true);
    expect(provinceMatches('北京', '北京市')).toBe(true);
  });
});
