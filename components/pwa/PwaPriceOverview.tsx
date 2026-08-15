import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getTypeColor, getTypeLabel } from '../../constants';
import { TariffData, TimeRule, TimeType } from '../../types';
import { PwaAnnualConfig, PwaAnnualMetrics } from '../../utils/pwaAnnualPrice';
import { EffectiveRuleSource } from '../../utils/pwaTariffResolver';
import { PwaMonthFallbackReason } from '../../utils/pwaViewModel';

interface PwaPriceOverviewProps {
  tariff: TariffData | null;
  effectiveRules: TimeRule[];
  ruleSource: EffectiveRuleSource;
  comprehensivePrice: number | null | undefined;
  monthFallbackReason: PwaMonthFallbackReason;
  currentSystemMonth: string;
  annualConfig: PwaAnnualConfig;
  annualMetrics: PwaAnnualMetrics;
}

const parseHour = (value: string): number => {
  const [hourStr] = value.split(':');
  const hour = Number.parseInt(hourStr, 10);
  return Number.isFinite(hour) && hour >= 0 && hour <= 24 ? hour : 0;
};

const buildHourlyTypes = (rules: TimeRule[]): TimeType[] => {
  const result: TimeType[] = Array(24).fill('flat');

  for (const rule of rules) {
    const start = parseHour(rule.start) % 24;
    const end = parseHour(rule.end) % 24;

    if (start === end) continue;

    let cursor = start;
    let guard = 0;

    while (cursor !== end && guard < 24) {
      result[cursor] = rule.type;
      cursor = (cursor + 1) % 24;
      guard += 1;
    }
  }

  return result;
};

const formatPrice = (value: number | null | undefined): string =>
  typeof value === 'number' ? value.toFixed(6) : '--';

const getAnnualScopeLabel = (annualConfig: PwaAnnualConfig, annualMetrics: PwaAnnualMetrics): string => {
  if (annualConfig.mode === 'rolling12') {
    return `近12个月（锚点：${annualConfig.anchorMonth}）｜有效 ${annualMetrics.effectiveCount}/12`;
  }

  return `自定义月份｜有效 ${annualMetrics.effectiveCount}/${annualMetrics.configuredMonths.length}`;
};

export const PwaPriceOverview: React.FC<PwaPriceOverviewProps> = ({
  tariff,
  effectiveRules,
  ruleSource,
  comprehensivePrice,
  monthFallbackReason,
  currentSystemMonth,
  annualConfig,
  annualMetrics,
}) => {
  const chartData = useMemo(() => {
    if (!tariff || effectiveRules.length === 0) {
      return [];
    }

    const hourlyTypes = buildHourlyTypes(effectiveRules);
    return hourlyTypes.map((type, hour) => {
      let effectiveType = type;
      if (effectiveType === 'tip' && (tariff.prices.tip === undefined || tariff.prices.tip === null)) {
        effectiveType = 'peak';
      }
      if (effectiveType === 'deep' && (tariff.prices.deep === undefined || tariff.prices.deep === null)) {
        effectiveType = 'valley';
      }
      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        value: tariff.prices[effectiveType] ?? 0,
        type: effectiveType,
        fill: getTypeColor(effectiveType),
      };
    });
  }, [tariff, effectiveRules]);

  const touSummary = useMemo(() => {
    if (!tariff || chartData.length === 0) return [];

    const typeMap: Record<string, { type: TimeType; hours: number[]; count: number; price: number | null }> = {};

    for (let h = 0; h < chartData.length; h++) {
      const item = chartData[h];
      const t = item.type as TimeType;
      if (!typeMap[t]) {
        typeMap[t] = {
          type: t,
          hours: [],
          count: 0,
          price: tariff.prices[t] ?? null,
        };
      }
      typeMap[t].hours.push(h);
      typeMap[t].count += 1;
    }

    const order: TimeType[] = ['tip', 'peak', 'flat', 'valley', 'deep'];

    return order
      .filter((t) => typeMap[t] && typeMap[t].count > 0 && typeMap[t].price !== null)
      .map((t) => {
        const info = typeMap[t];
        const ranges: string[] = [];
        let start = info.hours[0];
        let prev = info.hours[0];
        for (let i = 1; i < info.hours.length; i++) {
          const curr = info.hours[i];
          if (curr === prev + 1) {
            prev = curr;
          } else {
            ranges.push(`${start.toString().padStart(2, '0')}:00-${(prev + 1).toString().padStart(2, '0')}:00`);
            start = curr;
            prev = curr;
          }
        }
        ranges.push(`${start.toString().padStart(2, '0')}:00-${(prev + 1).toString().padStart(2, '0')}:00`);

        return {
          type: t,
          label: getTypeLabel(t),
          color: getTypeColor(t),
          price: info.price,
          count: info.count,
          rangesText: ranges.join('、'),
        };
      });
  }, [tariff, chartData]);

  if (!tariff) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-500">
        当前筛选组合暂无电价数据。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {monthFallbackReason === 'missing_current_month' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-600">
          当前组合在 {currentSystemMonth} 无数据，已自动回退到最新月份 {tariff.month}。
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">电价水平</h2>
        <p className="mt-1 text-xs text-slate-500">
          执行月份
          <span className="ml-2 font-semibold text-slate-700">{tariff.month}</span>
        </p>

        <div className="mt-3 h-56">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 10, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="hour" interval={3} stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  formatter={(value: number, _: string, item: { payload?: { type?: string } }) => [
                    value.toFixed(4),
                    `${getTypeLabel(item?.payload?.type || 'flat')}电价`,
                  ]}
                />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.hour} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-500">暂无可绘制的分时规则。</div>
          )}
        </div>

        {ruleSource === 'time_configs' && (
          <p className="mt-2 text-xs text-slate-500">时段规则来源：时段配置库。</p>
        )}
        {ruleSource === 'tariff' && (
          <p className="mt-2 text-xs text-slate-500">时段规则来源：电价记录自身规则。</p>
        )}
        {ruleSource === 'none' && (
          <p className="mt-2 text-xs text-slate-500">该记录未配置时段规则，图表按空态展示。</p>
        )}

        {touSummary.length > 0 && (
          <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {touSummary.map((item) => (
              <div
                key={item.type}
                className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: item.color }}>
                    <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.label}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {item.count}小时
                  </span>
                </div>
                <div className="mt-1 font-mono text-base font-bold text-slate-900">
                  {item.price !== null ? item.price.toFixed(4) : '--'}
                  <span className="ml-0.5 text-[10px] font-normal text-slate-500 font-sans">元</span>
                </div>
                <div className="mt-0.5 text-[10px] text-slate-500 truncate" title={item.rangesText}>
                  {item.rangesText}
                </div>
              </div>
            ))}
          </div>
        )}

        {(tariff.float_rules?.special_period_note || tariff.float_rules?.formula_note || tariff.policy_code || tariff.is_market_based || tariff.market_notes) && (
          <div className="mt-3.5 rounded-xl border border-blue-100 bg-blue-50/40 p-3 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900 flex items-center gap-1">
                <span>📋</span> 政策依据与特殊时段说明
              </span>
              {tariff.policy_code && (
                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-800">
                  {tariff.policy_code}
                </span>
              )}
            </div>

            {tariff.float_rules?.special_period_note && (
              <div className="mt-2 flex items-start gap-1 rounded bg-amber-50 border border-amber-200/60 p-2 text-amber-900">
                <span className="shrink-0 font-bold text-amber-700">⏱️ 特殊时段:</span>
                <span>{tariff.float_rules.special_period_note}</span>
              </div>
            )}

            {tariff.is_market_based && (
              <div className="mt-2 flex items-start gap-1 rounded bg-yellow-50 border border-yellow-200/60 p-2 text-yellow-900">
                <span className="shrink-0 font-bold text-yellow-800">⚡ 市场化省份:</span>
                <span>{tariff.market_notes || '该省已进入电力现货市场，分时电价随现货出清动态波动。'}</span>
              </div>
            )}

            {tariff.float_rules?.formula_note && (
              <div className="mt-2 text-[11px] text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-700">📐 计算公式：</span>
                {tariff.float_rules.formula_note}
              </div>
            )}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">当月综合电价</h3>
              <span className="text-xs text-slate-500">元/千瓦时</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{formatPrice(comprehensivePrice)}</div>
          </div>

          <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">年度平均综合电价</h3>
              <span className="text-xs text-slate-500">元/千瓦时</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-blue-700">{formatPrice(annualMetrics.average)}</div>
            <p className="mt-1 text-[11px] text-slate-500">{getAnnualScopeLabel(annualConfig, annualMetrics)}</p>
            {annualMetrics.average === null && (
              <p className="mt-1 text-[11px] text-amber-600">所选窗口无可用综合电价数据。</p>
            )}
          </div>
        </div>

        <div className="my-4 h-px bg-slate-200" />

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">电度用电价格</h3>
          <span className="text-xs text-slate-500">元/千瓦时</span>
        </div>

        <div className="mt-2 text-2xl font-bold text-slate-900">{formatPrice(tariff.prices.energy_usage)}</div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] text-slate-500">代理购电价格</p>
            <p className="mt-1 font-mono text-sm font-semibold text-slate-700">
              {formatPrice(tariff.prices.purchase_agent)}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] text-slate-500">电度输配电价</p>
            <p className="mt-1 font-mono text-sm font-semibold text-slate-700">
              {formatPrice(tariff.prices.transmission_distribution)}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
