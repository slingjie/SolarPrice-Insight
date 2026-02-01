import type { TariffData, TimeType } from '../types';

import type { HourlyAlignedRow } from './consumptionAlignedService';

export interface HourlyFinancialRow {
  timeKey: string;
  month: number;
  touType: TimeType;
  unitPrice: number;
  loadKwh: number;
  selfKwh: number;
  gridImportKwh: number;
  gridExportKwh: number;
  baselineCost: number;
  importCost: number;
  exportRevenue: number;
}

export interface FinancialTotals {
  baselineGridCost: number;
  importCost: number;
  exportRevenue: number;
  withPvNetCost: number;
  savingsVsNoPv: number;
}

export interface ConsumptionFinancialResult {
  totals: FinancialTotals;
  byMonth: Record<number, FinancialTotals>;
  byTou: Record<TimeType, FinancialTotals>;
  hourly: HourlyFinancialRow[];
  currencyUnit: string;
  warnings: string[];
}

function parseYearMonth(input: string): { year: number; month: number } | null {
  const raw = input.trim();
  const match = raw.match(/^(\d{4})-(\d{1,2})$/);
  if (!match) return null;
  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return null;
  if (month < 1 || month > 12) return null;
  return { year, month };
}

function compareTariffByParsedMonthDesc(a: TariffData, b: TariffData): number {
  const pa = parseYearMonth(a.month);
  const pb = parseYearMonth(b.month);
  if (pa && pb) {
    if (pa.year !== pb.year) return pb.year - pa.year;
    if (pa.month !== pb.month) return pb.month - pa.month;
  } else if (pa && !pb) {
    return -1;
  } else if (!pa && pb) {
    return 1;
  }

  // Stable tie-break.
  return String(a.id).localeCompare(String(b.id));
}

export function selectTariffForMonth(tariffs: TariffData[], month: number): TariffData | null {
  if (!tariffs.length) return null;

  const candidates = tariffs
    .map((t) => ({ t, parsed: parseYearMonth(t.month) }))
    .filter((x) => x.parsed && x.parsed.month === month)
    .map((x) => x.t);

  if (candidates.length > 0) {
    return [...candidates].sort(compareTariffByParsedMonthDesc)[0] ?? null;
  }

  // Fallback: latest tariff across any month.
  const parseable = tariffs.filter((t) => parseYearMonth(t.month));
  if (parseable.length > 0) {
    return [...parseable].sort(compareTariffByParsedMonthDesc)[0] ?? null;
  }

  // Last resort: deterministic pick.
  return [...tariffs].sort((a, b) => String(a.id).localeCompare(String(b.id)))[0] ?? null;
}

function buildEmptyTotals(): FinancialTotals {
  return {
    baselineGridCost: 0,
    importCost: 0,
    exportRevenue: 0,
    withPvNetCost: 0,
    savingsVsNoPv: 0,
  };
}

function addTotals(acc: FinancialTotals, add: FinancialTotals) {
  acc.baselineGridCost += add.baselineGridCost;
  acc.importCost += add.importCost;
  acc.exportRevenue += add.exportRevenue;
  acc.withPvNetCost += add.withPvNetCost;
  acc.savingsVsNoPv += add.savingsVsNoPv;
}

function finalizeTotals(t: FinancialTotals): FinancialTotals {
  // Re-derive to avoid drift due to different accumulation orders.
  const withPvNetCost = t.importCost - t.exportRevenue;
  const savingsVsNoPv = t.baselineGridCost - withPvNetCost;
  return {
    baselineGridCost: t.baselineGridCost,
    importCost: t.importCost,
    exportRevenue: t.exportRevenue,
    withPvNetCost,
    savingsVsNoPv,
  };
}

function getTouPrice(params: {
  tariff: TariffData;
  touType: TimeType;
  warnings: string[];
  deepFallbackWarned: { value: boolean };
}): number {
  const prices = params.tariff.prices;
  if (params.touType === 'deep') {
    if (typeof prices.deep === 'number' && Number.isFinite(prices.deep)) return prices.deep;
    if (!params.deepFallbackWarned.value) {
      params.warnings.push('电价未提供“深谷(deep)”单价，深谷时段将按“低谷(valley)”单价计价。');
      params.deepFallbackWarned.value = true;
    }
    return typeof prices.valley === 'number' && Number.isFinite(prices.valley) ? prices.valley : 0;
  }

  const raw = prices[params.touType];
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : 0;
}

export function calculateConsumptionFinancials(params: {
  hourly: HourlyAlignedRow[];
  tariffs: TariffData[];
  feedInTariff: number;
}): ConsumptionFinancialResult {
  const warnings: string[] = [];
  const deepFallbackWarned = { value: false };

  const currencyUnits = new Set(params.tariffs.map((t) => t.currency_unit).filter((x) => typeof x === 'string' && x.trim() !== ''));
  const currencyUnit = currencyUnits.size === 1 ? (Array.from(currencyUnits)[0] as string) : currencyUnits.size > 1 ? 'mixed' : '';

  const totals = buildEmptyTotals();
  const byMonth: Record<number, FinancialTotals> = {};
  const byTou: Record<TimeType, FinancialTotals> = {
    tip: buildEmptyTotals(),
    peak: buildEmptyTotals(),
    flat: buildEmptyTotals(),
    valley: buildEmptyTotals(),
    deep: buildEmptyTotals(),
  };

  const hourlyOut: HourlyFinancialRow[] = [];
  const selectedTariffCache = new Map<number, TariffData | null>();

  for (const row of params.hourly) {
    if (!byMonth[row.month]) byMonth[row.month] = buildEmptyTotals();

    let tariff = selectedTariffCache.get(row.month);
    if (tariff === undefined) {
      tariff = selectTariffForMonth(params.tariffs, row.month);
      selectedTariffCache.set(row.month, tariff ?? null);
      if (!tariff) {
        warnings.push(`未提供可用电价数据，月份=${row.month} 的电价将按 0 计。`);
      }
    }

    const unitPrice = tariff
      ? getTouPrice({ tariff, touType: row.touType, warnings, deepFallbackWarned })
      : 0;

    const baselineCost = row.loadKwh * unitPrice;
    const importCost = row.gridImportKwh * unitPrice;
    const exportRevenue = row.gridExportKwh * params.feedInTariff;

    const add: FinancialTotals = {
      baselineGridCost: baselineCost,
      importCost,
      exportRevenue,
      withPvNetCost: 0,
      savingsVsNoPv: 0,
    };

    addTotals(totals, add);
    addTotals(byMonth[row.month], add);
    addTotals(byTou[row.touType], add);

    hourlyOut.push({
      timeKey: row.timeKey,
      month: row.month,
      touType: row.touType,
      unitPrice,
      loadKwh: row.loadKwh,
      selfKwh: row.selfKwh,
      gridImportKwh: row.gridImportKwh,
      gridExportKwh: row.gridExportKwh,
      baselineCost,
      importCost,
      exportRevenue,
    });
  }

  return {
    totals: finalizeTotals(totals),
    byMonth: Object.fromEntries(Object.entries(byMonth).map(([k, v]) => [k, finalizeTotals(v)])),
    byTou: {
      tip: finalizeTotals(byTou.tip),
      peak: finalizeTotals(byTou.peak),
      flat: finalizeTotals(byTou.flat),
      valley: finalizeTotals(byTou.valley),
      deep: finalizeTotals(byTou.deep),
    },
    hourly: hourlyOut,
    currencyUnit,
    warnings,
  };
}
