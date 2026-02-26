import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { TariffData, TimeConfig, TimeRule } from '../../types';
import {
  calculatePwaAnnualMetrics,
  buildPwaAnnualConfigComboKey,
  createDefaultPwaAnnualConfig,
  getStoredPwaAnnualConfig,
  PwaAnnualMode,
  setStoredPwaAnnualConfig,
} from '../../utils/pwaAnnualPrice';
import { EffectiveRuleSource, resolveEffectiveTimeRules } from '../../utils/pwaTariffResolver';
import { PwaPriceOverview } from './PwaPriceOverview';
import { PwaPriceDetail } from './PwaPriceDetail';
import {
  getCurrentSystemMonth,
  PwaFilterDraft,
  resolvePwaFilters,
} from '../../utils/pwaViewModel';

interface PriceInsightPwaShellProps {
  tariffs: TariffData[];
  timeConfigs: TimeConfig[];
  comprehensivePriceMap: Record<string, number | null>;
  onExitToWeb: () => void;
}

type PwaMainTab = 'latest' | 'history';

const EMPTY_DRAFT: PwaFilterDraft = {
  province: '',
  category: '',
  voltage: '',
  month: '',
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

export const PriceInsightPwaShell: React.FC<PriceInsightPwaShellProps> = ({
  tariffs,
  timeConfigs,
  comprehensivePriceMap,
  onExitToWeb,
}) => {
  const [tab, setTab] = useState<PwaMainTab>('latest');
  const [draft, setDraft] = useState<PwaFilterDraft>(EMPTY_DRAFT);
  const [monthTouched, setMonthTouched] = useState(false);
  const [annualConfigExpanded, setAnnualConfigExpanded] = useState(false);
  const [annualConfig, setAnnualConfig] = useState(() => createDefaultPwaAnnualConfig(getCurrentSystemMonth()));
  const [loadedComboKey, setLoadedComboKey] = useState<string | null>(null);

  const currentSystemMonth = useMemo(() => getCurrentSystemMonth(), []);

  const resolved = useMemo(
    () =>
      resolvePwaFilters({
        tariffs,
        draft,
        currentSystemMonth,
        monthTouched,
      }),
    [tariffs, draft, currentSystemMonth, monthTouched],
  );

  const historyMonths = useMemo(() => resolved.history.map((item) => item.month), [resolved.history]);

  const annualComboKey = useMemo(
    () =>
      buildPwaAnnualConfigComboKey({
        province: resolved.selection.province,
        category: resolved.selection.category,
        voltage: resolved.selection.voltage,
      }),
    [resolved.selection.province, resolved.selection.category, resolved.selection.voltage],
  );

  const anchorMonthOptions = useMemo(() => {
    const monthSet = new Set<string>([currentSystemMonth, ...historyMonths]);
    return Array.from(monthSet).sort(compareMonthDesc);
  }, [currentSystemMonth, historyMonths]);

  useEffect(() => {
    const nextConfig = getStoredPwaAnnualConfig({
      comboKey: annualComboKey,
      currentSystemMonth,
      availableMonths: historyMonths,
    });

    setAnnualConfig(nextConfig);
    setLoadedComboKey(annualComboKey);
  }, [annualComboKey, currentSystemMonth, historyMonths]);

  useEffect(() => {
    if (!annualComboKey || loadedComboKey !== annualComboKey) {
      return;
    }

    setStoredPwaAnnualConfig({
      comboKey: annualComboKey,
      config: annualConfig,
      currentSystemMonth,
      availableMonths: historyMonths,
    });
  }, [annualComboKey, annualConfig, currentSystemMonth, historyMonths, loadedComboKey]);

  const annualMetrics = useMemo(
    () =>
      calculatePwaAnnualMetrics({
        history: resolved.history,
        comprehensivePriceMap,
        config: annualConfig,
      }),
    [resolved.history, comprehensivePriceMap, annualConfig],
  );

  const effectiveRuleResolution = useMemo((): { rules: TimeRule[]; source: EffectiveRuleSource } => {
    if (!resolved.selectedTariff) {
      return { rules: [], source: 'none' };
    }
    return resolveEffectiveTimeRules(resolved.selectedTariff, timeConfigs);
  }, [resolved.selectedTariff, timeConfigs]);

  const selectedComprehensivePrice = resolved.selectedTariff
    ? comprehensivePriceMap[resolved.selectedTariff.id]
    : null;

  const isEmpty = tariffs.length === 0;

  const updateDraft = (next: Partial<PwaFilterDraft>, resetMonthTouched: boolean) => {
    setDraft((prev) => ({ ...prev, ...next }));
    if (resetMonthTouched) {
      setMonthTouched(false);
    }
  };

  const handleAnnualModeChange = (mode: PwaAnnualMode) => {
    setAnnualConfig((prev) => ({ ...prev, mode }));
  };

  const handleCustomMonthToggle = (month: string) => {
    setAnnualConfig((prev) => {
      const monthSet = new Set(prev.customMonths);
      if (monthSet.has(month)) {
        monthSet.delete(month);
      } else {
        monthSet.add(month);
      }

      return {
        ...prev,
        customMonths: Array.from(monthSet).sort(compareMonthDesc),
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="w-full px-4 pb-24 pt-4 md:px-6">
        <header className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <h1 className="text-lg font-bold text-slate-900">工商业电价速查</h1>
          <p className="mt-1 text-xs text-slate-500">分时电价洞察 · PWA</p>
        </header>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-900">查询条件</h2>
          <div className="space-y-3 text-xs text-slate-500">
            <label className="block">
              地区
              <select
                value={resolved.selection.province}
                disabled={isEmpty}
                onChange={(e) =>
                  updateDraft(
                    { province: e.target.value, category: '', voltage: '', month: '' },
                    true,
                  )
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 disabled:bg-slate-100"
              >
                {resolved.options.provinces.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              用电分类
              <select
                value={resolved.selection.category}
                disabled={isEmpty || resolved.options.categories.length === 0}
                onChange={(e) => updateDraft({ category: e.target.value, voltage: '', month: '' }, true)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 disabled:bg-slate-100"
              >
                {resolved.options.categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              电压等级
              <select
                value={resolved.selection.voltage}
                disabled={isEmpty || resolved.options.voltages.length === 0}
                onChange={(e) => updateDraft({ voltage: e.target.value, month: '' }, true)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 disabled:bg-slate-100"
              >
                {resolved.options.voltages.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              月份
              <select
                value={resolved.selection.month}
                disabled={isEmpty || resolved.options.months.length === 0}
                onChange={(e) => {
                  setMonthTouched(true);
                  updateDraft({ month: e.target.value }, false);
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 disabled:bg-slate-100"
              >
                {resolved.options.months.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <section className="rounded-lg border border-slate-200 bg-slate-50/60">
              <button
                onClick={() => setAnnualConfigExpanded((prev) => !prev)}
                className="flex w-full items-center justify-between px-3 py-2 text-left"
              >
                <span className="text-sm font-semibold text-slate-700">年度平均配置</span>
                {annualConfigExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {annualConfigExpanded && (
                <div className="space-y-3 border-t border-slate-200 px-3 py-3">
                  <div>
                    <p className="text-[11px] text-slate-500">窗口模式</p>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAnnualModeChange('rolling12')}
                        className={`rounded-md border px-2 py-1.5 text-xs font-semibold ${
                          annualConfig.mode === 'rolling12'
                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        近12个月
                      </button>
                      <button
                        onClick={() => handleAnnualModeChange('custom')}
                        className={`rounded-md border px-2 py-1.5 text-xs font-semibold ${
                          annualConfig.mode === 'custom'
                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        自定义月份
                      </button>
                    </div>
                  </div>

                  <label className="block">
                    锚点月份
                    <select
                      value={annualConfig.anchorMonth}
                      onChange={(e) => setAnnualConfig((prev) => ({ ...prev, anchorMonth: e.target.value }))}
                      disabled={anchorMonthOptions.length === 0 || annualConfig.mode === 'custom'}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 disabled:bg-slate-100"
                    >
                      {anchorMonthOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>

                  {annualConfig.mode === 'custom' && (
                    <div>
                      <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
                        <span>自定义月份</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setAnnualConfig((prev) => ({ ...prev, customMonths: [...historyMonths] }))}
                            className="text-blue-600"
                          >
                            全选
                          </button>
                          <button
                            onClick={() => setAnnualConfig((prev) => ({ ...prev, customMonths: [] }))}
                            className="text-slate-500"
                          >
                            清空
                          </button>
                        </div>
                      </div>

                      {historyMonths.length === 0 ? (
                        <p className="rounded-md border border-dashed border-slate-200 bg-white px-2 py-2 text-center text-xs text-slate-400">
                          当前组合暂无可选月份
                        </p>
                      ) : (
                        <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-slate-200 bg-white p-2">
                          {historyMonths.map((month) => (
                            <label key={month} className="flex items-center gap-2 text-xs text-slate-600">
                              <input
                                type="checkbox"
                                checked={annualConfig.customMonths.includes(month)}
                                onChange={() => handleCustomMonthToggle(month)}
                                className="h-3.5 w-3.5 rounded border-slate-300"
                              />
                              {month}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <p className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-500">
                    计算口径：按月等权平均（缺失月不补算）。
                  </p>
                </div>
              )}
            </section>
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          <div className="grid grid-cols-2">
            <button
              onClick={() => setTab('latest')}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                tab === 'latest'
                  ? 'border border-blue-600 bg-blue-50 text-blue-600'
                  : 'border border-transparent text-slate-500 hover:bg-slate-100'
              }`}
            >
              最新电价
            </button>
            <button
              onClick={() => setTab('history')}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                tab === 'history'
                  ? 'border border-blue-600 bg-blue-50 text-blue-600'
                  : 'border border-transparent text-slate-500 hover:bg-slate-100'
              }`}
            >
              历史趋势
            </button>
          </div>
        </section>

        <main className="mt-4">
          {tab === 'latest' ? (
            <PwaPriceOverview
              tariff={resolved.selectedTariff}
              effectiveRules={effectiveRuleResolution.rules}
              ruleSource={effectiveRuleResolution.source}
              comprehensivePrice={selectedComprehensivePrice}
              monthFallbackReason={resolved.monthFallbackReason}
              currentSystemMonth={currentSystemMonth}
              annualConfig={annualConfig}
              annualMetrics={annualMetrics}
            />
          ) : (
            <PwaPriceDetail
              history={resolved.history}
              province={resolved.selection.province}
              category={resolved.selection.category}
              voltageLevel={resolved.selection.voltage}
              comprehensivePriceMap={comprehensivePriceMap}
              annualAverage={annualMetrics.average}
            />
          )}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex w-full items-center justify-center px-4 py-2 md:px-6">
          <button
            onClick={onExitToWeb}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Globe size={16} />
            切回 Web
          </button>
        </div>
      </nav>
    </div>
  );
};
