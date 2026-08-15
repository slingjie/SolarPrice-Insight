import { calculateAveragePrice } from '../services/priceCalculator';
import { ComprehensiveResult, TariffData, TimeConfig, TimeRule } from '../types';
import { resolveTimeConfigForMonth } from './timeConfigResolver';

export type EffectiveRuleSource = 'time_configs' | 'tariff' | 'none';

export interface EffectiveRuleResolution {
  rules: TimeRule[];
  source: EffectiveRuleSource;
}

export const parseYearMonth = (monthValue: string): { year: number; month: number; normalized: string } | null => {
  const match = monthValue.trim().match(/^(\d{4})-(\d{1,2})$/);
  if (!match) return null;

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return null;
  }

  return {
    year,
    month,
    normalized: `${year}-${month.toString().padStart(2, '0')}`,
  };
};

export const extractMonthToken = (monthValue: string): string | null => {
  const parsed = parseYearMonth(monthValue);
  if (parsed) {
    return parsed.month.toString().padStart(2, '0');
  }

  const direct = monthValue.trim().match(/^(\d{1,2})$/);
  if (!direct) return null;

  const month = Number.parseInt(direct[1], 10);
  if (!Number.isFinite(month) || month < 1 || month > 12) return null;

  return month.toString().padStart(2, '0');
};

export const isMonthIncludedInSavedResult = (tariffMonth: string, savedMonths: string[]): boolean => {
  if (!Array.isArray(savedMonths) || savedMonths.length === 0) {
    return false;
  }

  const trimmedTariffMonth = tariffMonth.trim();
  const parsedTariff = parseYearMonth(trimmedTariffMonth);
  const tariffToken = extractMonthToken(trimmedTariffMonth);

  return savedMonths.some((savedMonth) => {
    const trimmedSaved = savedMonth.trim();
    if (trimmedSaved === trimmedTariffMonth) {
      return true;
    }

    const parsedSaved = parseYearMonth(trimmedSaved);
    if (parsedTariff && parsedSaved && parsedTariff.normalized === parsedSaved.normalized) {
      return true;
    }

    const savedToken = extractMonthToken(trimmedSaved);
    return Boolean(tariffToken && savedToken && tariffToken === savedToken);
  });
};

export const resolveEffectiveTimeRules = (
  tariff: TariffData,
  timeConfigs: TimeConfig[],
): EffectiveRuleResolution => {
  if (Array.isArray(tariff.time_rules) && tariff.time_rules.length > 0) {
    return {
      rules: tariff.time_rules,
      source: 'tariff',
    };
  }

  const parsed = parseYearMonth(tariff.month);
  if (parsed) {
    const resolved = resolveTimeConfigForMonth(timeConfigs, tariff.province, parsed.month, parsed.year);
    if (resolved && resolved.timeRules.length > 0) {
      return {
        rules: resolved.timeRules,
        source: 'time_configs',
      };
    }
  }

  return {
    rules: [],
    source: 'none',
  };
};

const getModifiedTs = (item: ComprehensiveResult): number => {
  const ts = new Date(item.last_modified).getTime();
  return Number.isFinite(ts) ? ts : 0;
};

export const pickLatestComprehensiveResultsByProvince = (
  results: ComprehensiveResult[],
): Record<string, ComprehensiveResult> => {
  const map: Record<string, ComprehensiveResult> = {};

  for (const item of results) {
    const current = map[item.province];
    if (!current) {
      map[item.province] = item;
      continue;
    }

    const currentTs = getModifiedTs(current);
    const nextTs = getModifiedTs(item);

    if (nextTs > currentTs || (nextTs === currentTs && item.id.localeCompare(current.id) > 0)) {
      map[item.province] = item;
    }
  }

  return map;
};

export const buildComprehensivePriceMap = (params: {
  tariffs: TariffData[];
  timeConfigs: TimeConfig[];
  resultsByProvince: Record<string, ComprehensiveResult>;
}): Record<string, number | null> => {
  const { tariffs, timeConfigs, resultsByProvince } = params;
  const map: Record<string, number | null> = {};

  for (const tariff of tariffs) {
    const saved = resultsByProvince[tariff.province];
    if (!saved?.start_time || !saved?.end_time) {
      map[tariff.id] = null;
      continue;
    }

    if (!isMonthIncludedInSavedResult(tariff.month, saved.months || [])) {
      map[tariff.id] = null;
      continue;
    }

    const { rules } = resolveEffectiveTimeRules(tariff, timeConfigs);
    if (rules.length === 0) {
      map[tariff.id] = null;
      continue;
    }

    const normalized = {
      ...tariff,
      time_rules: rules,
    };

    const results = calculateAveragePrice([normalized], [tariff.month], saved.start_time, saved.end_time);
    map[tariff.id] = results.length > 0 ? results[0].avgPrice : null;
  }

  return map;
};
