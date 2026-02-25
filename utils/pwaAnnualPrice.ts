import { TariffData } from '../types';

export type PwaAnnualMode = 'rolling12' | 'custom';

export interface PwaAnnualConfig {
  mode: PwaAnnualMode;
  anchorMonth: string;
  customMonths: string[];
}

export interface PwaAnnualMetrics {
  average: number | null;
  configuredMonths: string[];
  validMonths: string[];
  missingMonths: string[];
  effectiveCount: number;
}

const PWA_ANNUAL_CONFIG_STORAGE_KEY = 'spi_pwa_annual_config_by_combo_v1';
const YEAR_MONTH_PATTERN = /^(\d{4})-(\d{1,2})$/;

const parseYearMonth = (value: string): { year: number; month: number } | null => {
  const match = value.trim().match(YEAR_MONTH_PATTERN);
  if (!match) return null;

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return null;
  }

  return { year, month };
};

const formatYearMonth = (year: number, month: number): string =>
  `${year}-${month.toString().padStart(2, '0')}`;

const normalizeYearMonth = (value: string): string | null => {
  const parsed = parseYearMonth(value);
  if (!parsed) return null;
  return formatYearMonth(parsed.year, parsed.month);
};

const shiftYearMonth = (value: string, delta: number): string | null => {
  const parsed = parseYearMonth(value);
  if (!parsed) return null;

  const shifted = new Date(Date.UTC(parsed.year, parsed.month - 1 + delta, 1));
  return formatYearMonth(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1);
};

const compareYearMonthAsc = (a: string, b: string): number => {
  const normalizedA = normalizeYearMonth(a);
  const normalizedB = normalizeYearMonth(b);
  if (!normalizedA || !normalizedB) {
    return a.localeCompare(b);
  }
  return normalizedA.localeCompare(normalizedB);
};

const compareYearMonthDesc = (a: string, b: string): number => compareYearMonthAsc(b, a);

const normalizeMonthList = (months: string[]): string[] => {
  const unique = new Set<string>();
  for (const item of months) {
    const normalized = normalizeYearMonth(item);
    if (normalized) {
      unique.add(normalized);
    }
  }
  return Array.from(unique).sort(compareYearMonthDesc);
};

export const createDefaultPwaAnnualConfig = (currentSystemMonth: string): PwaAnnualConfig => ({
  mode: 'rolling12',
  anchorMonth: normalizeYearMonth(currentSystemMonth) ?? currentSystemMonth,
  customMonths: [],
});

export const buildRollingMonths = (anchorMonth: string, count: number): string[] => {
  if (count <= 0) return [];

  const anchor = normalizeYearMonth(anchorMonth);
  if (!anchor) return [];

  const months: string[] = [];
  for (let index = count - 1; index >= 0; index -= 1) {
    const shifted = shiftYearMonth(anchor, -index);
    if (shifted) {
      months.push(shifted);
    }
  }

  return months;
};

export const buildRolling12Months = (anchorMonth: string): string[] => buildRollingMonths(anchorMonth, 12);

export const sanitizePwaAnnualConfig = (params: {
  config?: Partial<PwaAnnualConfig> | null;
  currentSystemMonth: string;
  availableMonths: string[];
}): PwaAnnualConfig => {
  const { config, currentSystemMonth, availableMonths } = params;
  const normalizedCurrentMonth = normalizeYearMonth(currentSystemMonth) ?? currentSystemMonth;
  const normalizedAvailableMonths = normalizeMonthList(availableMonths);
  const availableSet = new Set(normalizedAvailableMonths);

  const mode: PwaAnnualMode = config?.mode === 'custom' ? 'custom' : 'rolling12';
  const anchorMonth = normalizeYearMonth(config?.anchorMonth || '') ?? normalizedCurrentMonth;
  const requestedCustomMonths = Array.isArray(config?.customMonths) ? config.customMonths : [];
  const customMonths = normalizeMonthList(requestedCustomMonths).filter((month) => availableSet.has(month));

  return {
    mode,
    anchorMonth,
    customMonths,
  };
};

export const resolveConfiguredMonths = (config: PwaAnnualConfig): string[] => {
  if (config.mode === 'custom') {
    return normalizeMonthList(config.customMonths);
  }
  return buildRolling12Months(config.anchorMonth);
};

export const buildPwaAnnualConfigComboKey = (selection: {
  province: string;
  category: string;
  voltage: string;
}): string | null => {
  const province = selection.province.trim();
  const category = selection.category.trim();
  const voltage = selection.voltage.trim();

  if (!province || !category || !voltage) {
    return null;
  }

  return `${province}__${category}__${voltage}`;
};

const readConfigBucket = (storage: Storage): Record<string, PwaAnnualConfig> => {
  try {
    const raw = storage.getItem(PWA_ANNUAL_CONFIG_STORAGE_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return parsed as Record<string, PwaAnnualConfig>;
  } catch {
    return {};
  }
};

const writeConfigBucket = (storage: Storage, bucket: Record<string, PwaAnnualConfig>): void => {
  try {
    storage.setItem(PWA_ANNUAL_CONFIG_STORAGE_KEY, JSON.stringify(bucket));
  } catch {
    // Ignore storage write failures (private mode / quota)
  }
};

export const getStoredPwaAnnualConfig = (params: {
  comboKey: string | null;
  currentSystemMonth: string;
  availableMonths: string[];
  storage?: Storage;
}): PwaAnnualConfig => {
  const { comboKey, currentSystemMonth, availableMonths, storage = localStorage } = params;
  if (!comboKey) {
    return sanitizePwaAnnualConfig({
      config: null,
      currentSystemMonth,
      availableMonths,
    });
  }

  const bucket = readConfigBucket(storage);
  return sanitizePwaAnnualConfig({
    config: bucket[comboKey],
    currentSystemMonth,
    availableMonths,
  });
};

export const setStoredPwaAnnualConfig = (params: {
  comboKey: string | null;
  config: PwaAnnualConfig;
  currentSystemMonth: string;
  availableMonths: string[];
  storage?: Storage;
}): void => {
  const { comboKey, config, currentSystemMonth, availableMonths, storage = localStorage } = params;
  if (!comboKey) return;

  const bucket = readConfigBucket(storage);
  bucket[comboKey] = sanitizePwaAnnualConfig({
    config,
    currentSystemMonth,
    availableMonths,
  });
  writeConfigBucket(storage, bucket);
};

export const calculatePwaAnnualMetrics = (params: {
  history: TariffData[];
  comprehensivePriceMap: Record<string, number | null>;
  config: PwaAnnualConfig;
}): PwaAnnualMetrics => {
  const { history, comprehensivePriceMap, config } = params;
  const configuredMonths = resolveConfiguredMonths(config);

  const monthPriceMap = new Map<string, number>();
  for (const item of history) {
    const normalizedMonth = normalizeYearMonth(item.month);
    if (!normalizedMonth) continue;

    const value = comprehensivePriceMap[item.id];
    if (typeof value === 'number' && Number.isFinite(value)) {
      monthPriceMap.set(normalizedMonth, value);
    }
  }

  const validMonths = configuredMonths.filter((month) => monthPriceMap.has(month));
  const missingMonths = configuredMonths.filter((month) => !monthPriceMap.has(month));
  const effectiveCount = validMonths.length;

  if (effectiveCount === 0) {
    return {
      average: null,
      configuredMonths,
      validMonths,
      missingMonths,
      effectiveCount,
    };
  }

  const total = validMonths.reduce((sum, month) => sum + (monthPriceMap.get(month) || 0), 0);

  return {
    average: total / effectiveCount,
    configuredMonths,
    validMonths,
    missingMonths,
    effectiveCount,
  };
};
