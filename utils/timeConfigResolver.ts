import { TimeConfig, TimeRule, TimeType } from '../types';
import { rulesToGrid } from './timeUtils';
import { provinceMatches } from './provinceNormalize';

export type DayKind = 'weekday' | 'weekend';

export function parseMonthPattern(pattern: string): Set<number> {
  if (!pattern || pattern.trim() === '') {
    return new Set();
  }

  if (pattern.trim().toLowerCase() === 'all') {
    return new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  }

  const months = new Set<number>();
  const tokens = pattern.split(',');
  for (const token of tokens) {
    const trimmed = token.trim();
    if (trimmed === '') continue;
    const month = Number.parseInt(trimmed, 10);
    if (Number.isFinite(month) && month >= 1 && month <= 12) {
      months.add(month);
    }
  }
  return months;
}

type ResolvedTimeConfig = { timeRules: TimeRule[]; touGrid: TimeType[] };

const normalizeDate = (value: string): string => value.slice(0, 10);

const isWildcardProvince = (province: string): boolean => province.trim() === '全部';

function getSpecialDateRange(config: TimeConfig): { start: string; end: string } | null {
  if (typeof config.special_date !== 'string' || config.special_date.trim() === '') {
    return null;
  }

  const inlineDates = (config.special_date.match(/\d{4}-\d{2}-\d{2}/g) ?? []).slice(0, 2);
  const start = inlineDates[0] ? normalizeDate(inlineDates[0]) : normalizeDate(config.special_date);
  const endRaw = inlineDates[1]
    ? normalizeDate(inlineDates[1])
    : typeof config.special_date_end === 'string' && config.special_date_end.trim() !== ''
      ? normalizeDate(config.special_date_end)
      : start;

  return start <= endRaw ? { start, end: endRaw } : { start: endRaw, end: start };
}

function resolveConflict(candidates: TimeConfig[]): TimeConfig | null {
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  candidates.sort((a, b) => {
    const dateA = new Date(a.last_modified).getTime();
    const dateB = new Date(b.last_modified).getTime();
    if (dateA !== dateB) return dateB - dateA;
    return b.id.localeCompare(a.id);
  });

  return candidates[0];
}

function selectSpecialDateConfig(
  timeConfigs: TimeConfig[],
  provinceName: string,
  date: string,
): TimeConfig | null {
  const targetDate = normalizeDate(date);
  const active = timeConfigs.filter((config) => {
    if (config._deleted) return false;
    if (config.config_type !== 'special_date') return false;
    const range = getSpecialDateRange(config);
    if (!range) return false;
    return range.start <= targetDate && targetDate <= range.end;
  });

  const tier1: TimeConfig[] = [];
  const tier2: TimeConfig[] = [];

  for (const config of active) {
    if (isWildcardProvince(config.province)) {
      tier2.push(config);
      continue;
    }
    if (provinceMatches(config.province, provinceName)) {
      tier1.push(config);
    }
  }

  if (tier1.length > 0) return resolveConflict(tier1);
  if (tier2.length > 0) return resolveConflict(tier2);
  return null;
}

function matchConfigsByTier(
  configs: TimeConfig[],
  provinceName: string,
  month: number,
): TimeConfig | null {
  const tier1: TimeConfig[] = [];
  const tier2: TimeConfig[] = [];
  const tier3: TimeConfig[] = [];
  const tier4: TimeConfig[] = [];

  for (const config of configs) {
    const monthSet = parseMonthPattern(config.month_pattern);
    const isAllPattern = config.month_pattern.trim().toLowerCase() === 'all';
    const wildcard = isWildcardProvince(config.province);
    const provinceMatch = !wildcard && provinceMatches(config.province, provinceName);

    if (provinceMatch) {
      if (monthSet.has(month)) {
        tier1.push(config);
      } else if (isAllPattern) {
        tier2.push(config);
      }
    } else if (wildcard) {
      if (monthSet.has(month)) {
        tier3.push(config);
      } else if (isAllPattern) {
        tier4.push(config);
      }
    }
  }

  if (tier1.length > 0) return resolveConflict(tier1);
  if (tier2.length > 0) return resolveConflict(tier2);
  if (tier3.length > 0) return resolveConflict(tier3);
  if (tier4.length > 0) return resolveConflict(tier4);
  return null;
}

function selectMonthlyConfig(
  timeConfigs: TimeConfig[],
  provinceName: string,
  year: number,
  month: number,
): TimeConfig | null {
  const allMonthly = timeConfigs.filter(
    (c) => !c._deleted && c.config_type === 'monthly',
  );

  // 1. 精确匹配年份
  const exactYear = allMonthly.filter((c) => c.year === year);
  const exactResult = matchConfigsByTier(exactYear, provinceName, month);
  if (exactResult) return exactResult;

  // 2. 回退到最近的年份
  const availableYears = Array.from(new Set(allMonthly.map((c) => c.year)));
  availableYears.sort((a, b) => Math.abs(a - year) - Math.abs(b - year));

  for (const fallbackYear of availableYears) {
    if (fallbackYear === year) continue;
    const fallback = allMonthly.filter((c) => c.year === fallbackYear);
    const result = matchConfigsByTier(fallback, provinceName, month);
    if (result) return result;
  }

  return null;
}

export function resolveTimeConfigForDate(
  timeConfigs: TimeConfig[],
  provinceName: string,
  date: string,
): ResolvedTimeConfig | null {
  const targetDate = new Date(date);
  if (Number.isNaN(targetDate.getTime())) return null;

  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;

  const special = selectSpecialDateConfig(timeConfigs, provinceName, date);
  if (special) {
    return { timeRules: special.time_rules, touGrid: rulesToGrid(special.time_rules) };
  }

  const monthly = selectMonthlyConfig(timeConfigs, provinceName, year, month);
  if (!monthly) return null;

  return { timeRules: monthly.time_rules, touGrid: rulesToGrid(monthly.time_rules) };
}

export function resolveTimeConfigForMonth(
  timeConfigs: TimeConfig[],
  provinceName: string,
  month: number,
  year: number = new Date().getFullYear(),
): ResolvedTimeConfig | null {
  const selected = selectMonthlyConfig(timeConfigs, provinceName, year, month);
  if (!selected) return null;
  return { timeRules: selected.time_rules, touGrid: rulesToGrid(selected.time_rules) };
}

export function resolveTimeConfigForMonthAndDayKind(
  timeConfigs: TimeConfig[],
  provinceName: string,
  month: number,
  _dayKind: DayKind,
  year: number = new Date().getFullYear(),
  date?: string,
): ResolvedTimeConfig | null {
  if (date) {
    const dateResolved = resolveTimeConfigForDate(timeConfigs, provinceName, date);
    if (dateResolved) return dateResolved;
  }
  return resolveTimeConfigForMonth(timeConfigs, provinceName, month, year);
}
