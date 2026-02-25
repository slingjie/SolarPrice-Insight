import React, { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TariffData } from '../../types';
import { getTypeColor } from '../../constants';

interface PwaPriceDetailProps {
  history: TariffData[];
  province: string;
  category: string;
  voltageLevel: string;
  comprehensivePriceMap: Record<string, number | null>;
  annualAverage: number | null;
}

type HistoryView = 'curve' | 'table';
type TooltipValue = number | string | null | undefined;

interface PwaTooltipEntry {
  name?: string | number;
  value?: TooltipValue;
  color?: string;
}

interface PwaTooltipContentProps {
  active?: boolean;
  payload?: PwaTooltipEntry[];
  label?: string | number;
}

const compareMonthAsc = (a: string, b: string): number => {
  const matchA = a.match(/^(\d{4})-(\d{1,2})$/);
  const matchB = b.match(/^(\d{4})-(\d{1,2})$/);

  if (matchA && matchB) {
    const ay = Number.parseInt(matchA[1], 10);
    const am = Number.parseInt(matchA[2], 10);
    const by = Number.parseInt(matchB[1], 10);
    const bm = Number.parseInt(matchB[2], 10);
    return ay * 100 + am - (by * 100 + bm);
  }

  return a.localeCompare(b);
};

const formatPrice = (value: number | null | undefined): string =>
  typeof value === 'number' ? value.toFixed(6) : '--';

const normalizeTouPrice = (value: number | undefined): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value === 0) {
    return null;
  }
  return value;
};

const toNumericValue = (value: TooltipValue): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

export const sortTooltipPayloadByValue = (payload: PwaTooltipEntry[]): PwaTooltipEntry[] => {
  return [...payload].sort((left, right) => {
    const leftValue = toNumericValue(left.value);
    const rightValue = toNumericValue(right.value);

    if (leftValue === null && rightValue === null) return 0;
    if (leftValue === null) return 1;
    if (rightValue === null) return -1;

    return rightValue - leftValue;
  });
};

export const PwaPriceDetail: React.FC<PwaPriceDetailProps> = ({
  history,
  province,
  category,
  voltageLevel,
  comprehensivePriceMap,
  annualAverage,
}) => {
  const [historyView, setHistoryView] = useState<HistoryView>('curve');
  const [showAnnualLine, setShowAnnualLine] = useState(true);

  const chartData = useMemo(() => {
    return [...history]
      .sort((a, b) => compareMonthAsc(a.month, b.month))
      .map((item) => ({
        month: item.month,
        comprehensivePrice: comprehensivePriceMap[item.id] ?? null,
        tip: normalizeTouPrice(item.prices.tip),
        peak: normalizeTouPrice(item.prices.peak),
        flat: normalizeTouPrice(item.prices.flat),
        valley: normalizeTouPrice(item.prices.valley),
        deep: normalizeTouPrice(item.prices.deep),
      }));
  }, [history, comprehensivePriceMap]);

  const showDeep = useMemo(() => history.some((item) => normalizeTouPrice(item.prices.deep) !== null), [history]);
  const hasAnnualAverage = typeof annualAverage === 'number' && Number.isFinite(annualAverage);
  const legendOrder = useMemo<Record<string, number>>(
    () => ({
      综合电价: 0,
      尖峰: 1,
      高峰: 2,
      平段: 3,
      低谷: 4,
      深谷: 5,
    }),
    [],
  );

  const renderLegend = (props: { payload?: Array<{ value?: string; color?: string }> }) => {
    const entries = (props.payload || [])
      .filter((entry) => {
        if (!showDeep && entry.value === '深谷') return false;
        return Boolean(entry.value);
      })
      .sort((a, b) => {
        const left = legendOrder[a.value || ''] ?? 99;
        const right = legendOrder[b.value || ''] ?? 99;
        return left - right;
      });

    return (
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
        {entries.map((entry, index) => (
          <span key={`${entry.value}-${index}`} className="inline-flex items-center gap-1.5" style={{ color: entry.color }}>
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.value}
          </span>
        ))}
      </div>
    );
  };

  const renderTooltipContent = ({ active, payload, label }: PwaTooltipContentProps) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }

    const sortedPayload = sortTooltipPayloadByValue(payload).filter((item) => Boolean(item.name));

    return (
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <p className="mb-1 text-xs font-semibold text-slate-700">{String(label || '')}</p>
        <div className="space-y-1">
          {sortedPayload.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex items-center justify-between gap-4 text-xs">
              <span className="inline-flex items-center gap-1.5" style={{ color: item.color || '#334155' }}>
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: item.color || '#334155' }} />
                {String(item.name)}
              </span>
              <span className="font-mono text-slate-700">{formatPrice(toNumericValue(item.value))}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-500">
        当前组合暂无历史数据。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">历史趋势</h2>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <button
              onClick={() => setHistoryView('curve')}
              className={historyView === 'curve' ? 'border-b-2 border-blue-600 pb-1 text-blue-600' : 'pb-1 text-slate-500'}
            >
              曲线
            </button>
            <button
              onClick={() => setHistoryView('table')}
              className={historyView === 'table' ? 'border-b-2 border-blue-600 pb-1 text-blue-600' : 'pb-1 text-slate-500'}
            >
              列表
            </button>
          </div>
        </div>

        <p className="mt-2 text-xs text-slate-500">
          {province} · {category} · {voltageLevel}
        </p>

        {historyView === 'curve' && hasAnnualAverage && (
          <div className="mt-2 flex items-center justify-end">
            <button
              onClick={() => setShowAnnualLine((prev) => !prev)}
              className={`rounded-md border px-2 py-1 text-xs font-semibold ${
                showAnnualLine
                  ? 'border-violet-500 bg-violet-50 text-violet-600'
                  : 'border-slate-200 bg-white text-slate-500'
              }`}
            >
              年度平均线
            </button>
          </div>
        )}

        {historyView === 'curve' ? (
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, left: -18, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  content={renderTooltipContent}
                />
                <Legend content={renderLegend} />
                {hasAnnualAverage && showAnnualLine && (
                  <ReferenceLine
                    y={annualAverage}
                    stroke="#7c3aed"
                    strokeDasharray="4 4"
                    ifOverflow="extendDomain"
                    label={{ value: `年均 ${annualAverage.toFixed(4)}`, fill: '#7c3aed', fontSize: 10, position: 'right' }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="comprehensivePrice"
                  name="综合电价"
                  stroke="#d97706"
                  strokeDasharray="6 3"
                  dot={false}
                  strokeWidth={2}
                />
                <Line type="monotone" dataKey="tip" name="尖峰" stroke={getTypeColor('tip')} dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="peak" name="高峰" stroke={getTypeColor('peak')} dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="flat" name="平段" stroke={getTypeColor('flat')} dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="valley" name="低谷" stroke={getTypeColor('valley')} dot={false} strokeWidth={2} />
                {showDeep && (
                  <Line
                    type="monotone"
                    dataKey="deep"
                    name="深谷"
                    stroke={getTypeColor('deep')}
                    dot={false}
                    strokeWidth={2}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <th className="border border-slate-200 px-2 py-2 font-medium">月份</th>
                  <th className="border border-slate-200 px-2 py-2 font-medium">综合电价</th>
                  <th className="border border-slate-200 px-2 py-2 font-medium">尖峰</th>
                  <th className="border border-slate-200 px-2 py-2 font-medium">高峰</th>
                  <th className="border border-slate-200 px-2 py-2 font-medium">平段</th>
                  <th className="border border-slate-200 px-2 py-2 font-medium">低谷</th>
                  {showDeep && <th className="border border-slate-200 px-2 py-2 font-medium">深谷</th>}
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={`${item.id}-${item.month}`} className="text-slate-700">
                    <td className="border border-slate-200 px-2 py-2 text-center">{item.month}</td>
                    <td className="border border-slate-200 px-2 py-2 text-center font-mono">
                      {formatPrice(comprehensivePriceMap[item.id])}
                    </td>
                    <td className="border border-slate-200 px-2 py-2 text-center font-mono">{formatPrice(normalizeTouPrice(item.prices.tip))}</td>
                    <td className="border border-slate-200 px-2 py-2 text-center font-mono">{formatPrice(normalizeTouPrice(item.prices.peak))}</td>
                    <td className="border border-slate-200 px-2 py-2 text-center font-mono">{formatPrice(normalizeTouPrice(item.prices.flat))}</td>
                    <td className="border border-slate-200 px-2 py-2 text-center font-mono">{formatPrice(normalizeTouPrice(item.prices.valley))}</td>
                    {showDeep && (
                      <td className="border border-slate-200 px-2 py-2 text-center font-mono">
                        {formatPrice(normalizeTouPrice(item.prices.deep))}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
