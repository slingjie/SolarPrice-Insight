import { describe, it, expect } from 'vitest';
import { resolveTimeConfigForMonth } from './timeConfigResolver';
import { TimeConfig, TimeType } from '../types';

describe('timeConfigResolver', () => {
  const createConfig = (id: string, province: string, monthPattern: string, lastModified: string): TimeConfig => ({
    id,
    province,
    month_pattern: monthPattern,
    time_rules: [
      { start: '08:00', end: '12:00', type: 'peak' as TimeType },
      { start: '12:00', end: '20:00', type: 'flat' as TimeType },
      { start: '20:00', end: '24:00', type: 'valley' as TimeType },
      { start: '00:00', end: '08:00', type: 'valley' as TimeType },
    ],
    last_modified: lastModified,
  });

  it('should parse month_pattern "All" (case-insensitive)', () => {
    const configs = [
      createConfig('cfg1', '江苏', 'All', '2024-01-01'),
      createConfig('cfg2', '浙江', 'all', '2024-01-01'),
      createConfig('cfg3', '广东', 'ALL', '2024-01-01'),
    ];

    expect(resolveTimeConfigForMonth(configs, '江苏', 6)).not.toBeNull();
    expect(resolveTimeConfigForMonth(configs, '浙江', 12)).not.toBeNull();
    expect(resolveTimeConfigForMonth(configs, '广东', 1)).not.toBeNull();
  });

  it('should parse comma-separated month_pattern', () => {
    const configs = [createConfig('cfg1', '江苏', '6,7,8', '2024-01-01')];

    expect(resolveTimeConfigForMonth(configs, '江苏', 7)).not.toBeNull();
    expect(resolveTimeConfigForMonth(configs, '江苏', 8)).not.toBeNull();
    expect(resolveTimeConfigForMonth(configs, '江苏', 1)).toBeNull(); // not in pattern
  });

  it('should ignore invalid tokens in month_pattern', () => {
    const configs = [createConfig('cfg1', '江苏', '6,invalid,7,99,-1', '2024-01-01')];

    const result = resolveTimeConfigForMonth(configs, '江苏', 6);
    expect(result).not.toBeNull();
    expect(resolveTimeConfigForMonth(configs, '江苏', 7)).not.toBeNull();
    expect(resolveTimeConfigForMonth(configs, '江苏', 99)).toBeNull();
  });

  it('should prioritize province exact + month match', () => {
    const configs = [
      createConfig('fallback', '全部', 'All', '2024-01-01'),
      createConfig('exact', '江苏', '6,7,8', '2024-01-01'),
    ];

    const result = resolveTimeConfigForMonth(configs, '江苏', 7);
    expect(result).not.toBeNull();
    expect(result!.timeRules).toEqual(configs[1].time_rules);
  });

  it('should fallback to province exact + All', () => {
    const configs = [
      createConfig('fallback', '全部', 'All', '2024-01-01'),
      createConfig('provinceAll', '江苏', 'All', '2024-01-01'),
      createConfig('provinceSpecific', '江苏', '6,7,8', '2024-01-01'),
    ];

    const result = resolveTimeConfigForMonth(configs, '江苏', 1);
    expect(result).not.toBeNull();
    expect(result!.timeRules).toEqual(configs[1].time_rules); // provinceAll, not fallback
  });

  it('should fallback to "全部" + month', () => {
    const configs = [
      createConfig('globalAll', '全部', 'All', '2024-01-01'),
      createConfig('globalSummer', '全部', '6,7,8', '2024-01-01'),
    ];

    const result = resolveTimeConfigForMonth(configs, '未知省份', 7);
    expect(result).not.toBeNull();
    expect(result!.timeRules).toEqual(configs[1].time_rules);
  });

  it('should fallback to "全部" + All (lowest priority)', () => {
    const configs = [createConfig('globalAll', '全部', 'All', '2024-01-01')];

    const result = resolveTimeConfigForMonth(configs, '未知省份', 1);
    expect(result).not.toBeNull();
    expect(result!.timeRules).toEqual(configs[0].time_rules);
  });

  it('should resolve conflict by last_modified (newest wins)', () => {
    const configs = [
      createConfig('old', '江苏', 'All', '2024-01-01'),
      createConfig('new', '江苏', 'All', '2024-12-31'),
      createConfig('mid', '江苏', 'All', '2024-06-01'),
    ];

    const result = resolveTimeConfigForMonth(configs, '江苏', 1);
    expect(result!.timeRules).toEqual(configs[1].time_rules); // newest
  });

  it('should resolve conflict by id (lexicographic smallest) if last_modified same', () => {
    const configs = [
      createConfig('cfg3', '江苏', 'All', '2024-01-01'),
      createConfig('cfg1', '江苏', 'All', '2024-01-01'),
      createConfig('cfg2', '江苏', 'All', '2024-01-01'),
    ];

    const result = resolveTimeConfigForMonth(configs, '江苏', 1);
    expect(result!.timeRules).toEqual(configs[1].time_rules); // cfg1 (smallest id)
  });

  it('should return null if no match found', () => {
    const configs = [createConfig('cfg1', '江苏', '6,7,8', '2024-01-01')];

    expect(resolveTimeConfigForMonth(configs, '浙江', 1)).toBeNull();
    expect(resolveTimeConfigForMonth(configs, '江苏', 1)).toBeNull();
  });

  it('should generate touGrid from time_rules via rulesToGrid', () => {
    const configs = [createConfig('cfg1', '江苏', 'All', '2024-01-01')];

    const result = resolveTimeConfigForMonth(configs, '江苏', 1);
    expect(result).not.toBeNull();
    expect(result!.touGrid).toHaveLength(24);
    expect(result!.touGrid[8]).toBe('peak'); // 08:00-12:00
    expect(result!.touGrid[12]).toBe('flat'); // 12:00-20:00
    expect(result!.touGrid[20]).toBe('valley'); // 20:00-24:00
    expect(result!.touGrid[0]).toBe('valley'); // 00:00-08:00
  });
});
