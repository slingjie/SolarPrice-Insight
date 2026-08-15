import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Save, Sparkles, BatteryCharging, Zap, Calendar } from 'lucide-react';
import { TimeConfig, TimeType } from '../types';
import { getTypeColor, getTypeLabel } from '../constants';
import { rulesToGrid, gridToRules } from '../utils/timeUtils';
import { Card, Toast } from './UI';

interface TimeConfigMatrixProps {
  configs: TimeConfig[];
  selectedProvince: string;
  selectedYear?: number;
  focusMonth?: number | null;
  onSave: (province: string, newConfigs: TimeConfig[]) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export const TimeConfigMatrix: React.FC<TimeConfigMatrixProps> = ({
  configs,
  selectedProvince,
  selectedYear = new Date().getFullYear(),
  focusMonth = null,
  onSave,
}) => {
  const [matrix, setMatrix] = useState<Record<number, TimeType[]>>({});
  const [activeType, setActiveType] = useState<TimeType>('valley');
  const [isDragging, setIsDragging] = useState(false);
  const [highlightedMonth, setHighlightedMonth] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const toastMessage = useRef('保存成功');
  const monthRowRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const activeProvinceConfig = configs.find(
    (c) => c.province === selectedProvince && (c.is_market_based || c.market_notes || c.policy_code),
  );

  useEffect(() => {
    if (!selectedProvince) return;

    const initial: Record<number, TimeType[]> = {};
    MONTHS.forEach((month) => {
      initial[month] = Array(24).fill('valley');
    });

    const provinceConfigs = configs.filter(
      (config) =>
        config.province === selectedProvince &&
        config.config_type === 'monthly' &&
        config.year === selectedYear,
    );

    provinceConfigs.forEach((config) => {
      const grid = rulesToGrid(config.time_rules);
      const monthSet =
        config.month_pattern.trim().toLowerCase() === 'all'
          ? MONTHS
          : config.month_pattern
              .split(',')
              .map((token) => Number.parseInt(token.trim(), 10))
              .filter((month) => Number.isFinite(month) && month >= 1 && month <= 12);

      monthSet.forEach((month) => {
        initial[month] = [...grid];
      });
    });

    setMatrix(initial);
  }, [configs, selectedProvince, selectedYear]);

  useEffect(() => {
    if (!focusMonth || focusMonth < 1 || focusMonth > 12) return;
    const target = monthRowRefs.current[focusMonth];
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightedMonth(focusMonth);
    const timer = window.setTimeout(() => setHighlightedMonth(null), 1500);
    return () => window.clearTimeout(timer);
  }, [focusMonth, selectedYear]);

  const handleCellClick = (month: number, hour: number) => {
    setMatrix((prev) => {
      const row = [...(prev[month] ?? Array(24).fill('valley'))];
      row[hour] = activeType;
      return { ...prev, [month]: row };
    });
  };

  const handleMouseEnter = (month: number, hour: number) => {
    if (!isDragging) return;
    handleCellClick(month, hour);
  };

  const applyRow = (month: number) => {
    setMatrix((prev) => ({
      ...prev,
      [month]: Array(24).fill(activeType),
    }));
  };

  const copyPrevMonth = (month: number) => {
    if (month <= 1) return;
    setMatrix((prev) => ({
      ...prev,
      [month]: [...(prev[month - 1] ?? Array(24).fill('valley'))],
    }));
  };

  const handleSave = () => {
    const groups: Record<string, number[]> = {};

    MONTHS.forEach((month) => {
      const rules = gridToRules(matrix[month] ?? Array(24).fill('valley'));
      const key = JSON.stringify(rules);
      if (!groups[key]) groups[key] = [];
      groups[key].push(month);
    });

    const now = new Date().toISOString();
    const newConfigs: TimeConfig[] = Object.entries(groups).map(([rulesJson, months]) => ({
      id: crypto.randomUUID(),
      province: selectedProvince,
      year: selectedYear,
      config_type: 'monthly',
      month_pattern: months.length === 12 ? 'All' : months.sort((a, b) => a - b).join(','),
      time_rules: JSON.parse(rulesJson),
      updated_at: now,
      last_modified: now,
    }));

    onSave(selectedProvince, newConfigs);
    toastMessage.current = `已保存 ${selectedProvince} ${selectedYear} 年配置`;
    setShowToast(true);
  };

  // 全年时段宏观统计
  const yearStats = useMemo(() => {
    let totalTipHours = 0;
    let totalPeakHours = 0;
    let totalValleyHours = 0;
    let tipMonthsCount = 0;
    let twoChargeMonthsCount = 0;

    MONTHS.forEach((m) => {
      const row = matrix[m] || Array(24).fill('valley');
      const tipCount = row.filter((t) => t === 'tip').length;
      const peakCount = row.filter((t) => t === 'peak').length;
      const valleyCount = row.filter((t) => t === 'valley' || t === 'deep').length;

      totalTipHours += tipCount;
      totalPeakHours += peakCount;
      totalValleyHours += valleyCount;

      if (tipCount > 0) tipMonthsCount++;

      // 判断是否有午间低谷 (10-15h)
      const middayValley = row.slice(10, 15).some((t) => t === 'valley' || t === 'deep');
      if (middayValley && valleyCount >= 8) twoChargeMonthsCount++;
    });

    return {
      totalTipHours,
      totalPeakHours,
      totalValleyHours,
      tipMonthsCount,
      twoChargeMonthsCount,
    };
  }, [matrix]);

  return (
    <Card className="flex-1 flex flex-col overflow-hidden h-full bg-white border border-slate-200 shadow-sm">
      {/* 顶部标题与刷子工具栏 */}
      <div className="p-4 border-b flex flex-wrap justify-between items-center bg-white z-10 gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            {selectedProvince}
            <span className="text-xs font-normal text-slate-500 px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200/60">
              {selectedYear}年 12个月×24h 分时规则全景大矩阵
            </span>
          </h3>

          {/* 刷子工具条 */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {(['tip', 'peak', 'flat', 'valley', 'deep'] as TimeType[]).map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeType === type
                    ? 'bg-white shadow text-slate-800 ring-1 ring-slate-200'
                    : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: getTypeColor(type) }} />
                {getTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 flex items-center gap-1.5 text-xs font-bold shadow-md shadow-blue-200 transition-all active:scale-95"
        >
          <Save size={15} /> 保存配置
        </button>
      </div>

      {/* 全年时段宏观统计看板卡 */}
      <div className="mx-6 mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-red-100 bg-red-50/50 p-2.5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            尖
          </div>
          <div>
            <div className="text-[10px] text-slate-400">尖峰执行月数</div>
            <div className="text-sm font-mono font-bold text-red-900">
              {yearStats.tipMonthsCount} 个月 <span className="text-[10px] text-slate-500 font-sans font-normal">({yearStats.totalTipHours}h)</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-2.5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            谷
          </div>
          <div>
            <div className="text-[10px] text-slate-400">低谷总计小时</div>
            <div className="text-sm font-mono font-bold text-emerald-900">
              {yearStats.totalValleyHours} 小时 <span className="text-[10px] text-slate-500 font-sans font-normal">(占比 {((yearStats.totalValleyHours / (12 * 24)) * 100).toFixed(0)}%)</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-2.5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Zap size={14} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400">两充两放黄金月</div>
            <div className="text-sm font-mono font-bold text-blue-900">
              {yearStats.twoChargeMonthsCount} 个月 <span className="text-[10px] text-slate-500 font-sans font-normal">（午间谷充）</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0">
            <Calendar size={14} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400">政策状态</div>
            <div className="text-xs font-semibold text-slate-800 truncate">
              {activeProvinceConfig?.policy_code || '发改委标准分时'}
            </div>
          </div>
        </div>
      </div>

      {activeProvinceConfig && (activeProvinceConfig.is_market_based || activeProvinceConfig.market_notes) && (
        <div className="mx-6 mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold">⚠️ 市场化/动态时段提示：</span>
            <span>{activeProvinceConfig.market_notes || '该省执行现货市场化出清，分时时段按交易中心动态调整。'}</span>
          </div>
          {activeProvinceConfig.policy_code && (
            <span className="text-[11px] text-amber-600 font-normal">{activeProvinceConfig.policy_code}</span>
          )}
        </div>
      )}

      {/* 12 个月 × 24 小时大矩阵网格 */}
      <div
        className="flex-1 overflow-auto p-6"
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <div className="min-w-[960px] select-none">
          {/* 小时标头 (00 - 23) */}
          <div className="flex mb-2">
            <div className="w-28 shrink-0"></div>
            <div className="flex-1 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-px">
              {HOURS.map((hour) => (
                <div key={hour} className="text-[10px] text-slate-400 font-mono text-center border-l border-slate-100 pb-1">
                  {hour.toString().padStart(2, '0')}
                </div>
              ))}
            </div>
            <div className="w-64 shrink-0 pl-3 text-[10px] text-slate-400 font-medium">各月时段时长汇总</div>
          </div>

          {/* 12 个月逐行矩阵 */}
          <div className="space-y-1.5">
            {MONTHS.map((month) => {
              const row = matrix[month] ?? Array(24).fill('valley');
              const tipH = row.filter((t) => t === 'tip').length;
              const peakH = row.filter((t) => t === 'peak').length;
              const flatH = row.filter((t) => t === 'flat').length;
              const valleyH = row.filter((t) => t === 'valley').length;
              const deepH = row.filter((t) => t === 'deep').length;
              const hasMiddayV = row.slice(10, 15).some((t) => t === 'valley' || t === 'deep');

              return (
                <div
                  key={month}
                  ref={(el) => {
                    monthRowRefs.current[month] = el;
                  }}
                  className={`flex items-center hover:bg-slate-50/80 rounded-xl p-1.5 transition-colors group ${
                    highlightedMonth === month ? 'ring-2 ring-blue-400 bg-blue-50/60 shadow-sm' : ''
                  }`}
                >
                  <div className="w-28 shrink-0 font-bold text-slate-700 text-xs flex items-center justify-between pr-2">
                    <span className="flex items-center gap-1">
                      <span>{month}月</span>
                      {tipH > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block" title="含尖峰时段" />
                      )}
                    </span>
                    {month > 1 && (
                      <button
                        onClick={() => copyPrevMonth(month)}
                        className="text-[10px] text-blue-500 hover:text-blue-700 font-normal opacity-0 group-hover:opacity-100 transition-opacity"
                        title="复制上月配置"
                      >
                        同上月
                      </button>
                    )}
                  </div>

                  {/* 24 小时色块条 */}
                  <div
                    className="flex-1 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden cursor-crosshair h-7 shadow-inner"
                    onMouseDown={() => setIsDragging(true)}
                  >
                    {row.map((type, hour) => (
                      <div
                        key={hour}
                        className="h-full transition-colors relative hover:opacity-90"
                        style={{ background: getTypeColor(type) }}
                        onMouseDown={() => handleCellClick(month, hour)}
                        onMouseEnter={() => handleMouseEnter(month, hour)}
                        title={`${month}月 ${hour}:00 - ${hour + 1}:00: ${getTypeLabel(type)}`}
                      />
                    ))}
                  </div>

                  {/* 右侧时段时长结构小徽章 */}
                  <div className="w-64 shrink-0 pl-3 flex items-center gap-1.5 text-[10px] font-mono">
                    {tipH > 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-red-50 text-red-700 border border-red-200 font-bold">
                        尖{tipH}h
                      </span>
                    )}
                    {peakH > 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-orange-50 text-orange-700 border border-orange-200">
                        峰{peakH}h
                      </span>
                    )}
                    {flatH > 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-yellow-50 text-yellow-800 border border-yellow-200">
                        平{flatH}h
                      </span>
                    )}
                    {valleyH > 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        谷{valleyH}h
                      </span>
                    )}
                    {deepH > 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                        深{deepH}h
                      </span>
                    )}
                    {hasMiddayV && (
                      <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-sans text-[9px]">
                        2充2放
                      </span>
                    )}
                    <button
                      onClick={() => applyRow(month)}
                      className="ml-auto text-[10px] text-slate-400 hover:text-blue-600 font-sans opacity-0 group-hover:opacity-100 transition-opacity"
                      title={`将${month}月全部设为${getTypeLabel(activeType)}`}
                    >
                      全涂
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showToast && <Toast message={toastMessage.current} onClose={() => setShowToast(false)} />}
    </Card>
  );
};
