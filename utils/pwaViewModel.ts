import { TariffData } from '../types';

export type PwaMonthFallbackReason = 'none' | 'missing_current_month' | 'invalid_selected_month';

export interface PwaFilterDraft {
  province: string;
  category: string;
  voltage: string;
  month: string;
}

export interface PwaFilterOptions {
  provinces: string[];
  categories: string[];
  voltages: string[];
  months: string[];
}

export interface PwaFilterResolution {
  selection: PwaFilterDraft;
  options: PwaFilterOptions;
  history: TariffData[];
  selectedTariff: TariffData | null;
  monthFallbackReason: PwaMonthFallbackReason;
}

const sortZh = (values: string[]): string[] => values.sort((a, b) => a.localeCompare(b, 'zh-CN'));

const getUnique = (values: string[]): string[] => Array.from(new Set(values.filter(Boolean)));

const toTimestamp = (value: string): number => {
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? ts : 0;
};

const compareMonthDesc = (a: string, b: string): number => {
  const matchA = a.match(/^(\d{4})-(\d{1,2})$/);
  const matchB = b.match(/^(\d{4})-(\d{1,2})$/);

  if (matchA && matchB) {
    const ay = Number.parseInt(matchA[1], 10);
    const am = Number.parseInt(matchA[2], 10);
    const by = Number.parseInt(matchB[1], 10);
    const bm = Number.parseInt(matchB[2], 10);
    return by * 100 + bm - (ay * 100 + am);
  }

  return b.localeCompare(a);
};

const pickLatestRecord = (items: TariffData[]): TariffData => {
  return [...items].sort((a, b) => {
    const tsCompare = toTimestamp(b.last_modified) - toTimestamp(a.last_modified);
    if (tsCompare !== 0) return tsCompare;
    return b.id.localeCompare(a.id);
  })[0];
};

export const getCurrentSystemMonth = (now: Date = new Date()): string => {
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
};

export const buildCombinationHistory = (
  tariffs: TariffData[],
  province: string,
  category: string,
  voltage: string,
): TariffData[] => {
  const matched = tariffs.filter(
    (item) => item.province === province && item.category === category && item.voltage_level === voltage,
  );

  const grouped = new Map<string, TariffData[]>();
  for (const item of matched) {
    const list = grouped.get(item.month);
    if (list) {
      list.push(item);
    } else {
      grouped.set(item.month, [item]);
    }
  }

  return Array.from(grouped.entries())
    .map(([, items]) => pickLatestRecord(items))
    .sort((a, b) => compareMonthDesc(a.month, b.month));
};

const pickValidValue = (candidate: string, options: string[]): string => {
  if (candidate && options.includes(candidate)) {
    return candidate;
  }
  return options[0] ?? '';
};

export const resolvePwaFilters = (params: {
  tariffs: TariffData[];
  draft: PwaFilterDraft;
  currentSystemMonth: string;
  monthTouched: boolean;
}): PwaFilterResolution => {
  const { tariffs, draft, currentSystemMonth, monthTouched } = params;

  const provinces = sortZh(getUnique(tariffs.map((item) => item.province)));
  const province = pickValidValue(draft.province, provinces);

  const categoryPool = tariffs
    .filter((item) => item.province === province)
    .map((item) => item.category);
  const categories = sortZh(getUnique(categoryPool));
  const category = pickValidValue(draft.category, categories);

  const voltagePool = tariffs
    .filter((item) => item.province === province && item.category === category)
    .map((item) => item.voltage_level);
  const voltages = sortZh(getUnique(voltagePool));
  const voltage = pickValidValue(draft.voltage, voltages);

  const history = buildCombinationHistory(tariffs, province, category, voltage);
  const months = history.map((item) => item.month);

  const hasCurrentMonth = months.includes(currentSystemMonth);
  let month = '';
  let monthFallbackReason: PwaMonthFallbackReason = 'none';

  if (months.length > 0) {
    if (monthTouched) {
      if (months.includes(draft.month)) {
        month = draft.month;
      } else if (hasCurrentMonth) {
        month = currentSystemMonth;
        monthFallbackReason = 'invalid_selected_month';
      } else {
        month = months[0];
        monthFallbackReason = 'missing_current_month';
      }
    } else if (hasCurrentMonth) {
      month = currentSystemMonth;
    } else {
      month = months[0];
      monthFallbackReason = 'missing_current_month';
    }
  }

  const selectedTariff = history.find((item) => item.month === month) ?? null;

  return {
    selection: {
      province,
      category,
      voltage,
      month,
    },
    options: {
      provinces,
      categories,
      voltages,
      months,
    },
    history,
    selectedTariff,
    monthFallbackReason,
  };
};
