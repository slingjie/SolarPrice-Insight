import React, { useState, useMemo, useEffect } from 'react';
import {
  RotateCcw,
  Filter,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Download,
  Clock,
  TrendingUp,
  MapPin,
  Search,
  Sliders,
  DollarSign,
  FileText,
  Layers,
  BatteryCharging,
  Zap,
  ArrowRight
} from 'lucide-react';
import { TariffData, ComprehensiveResult, TimeRule, TimeType } from '../types';
import { getTypeColor, getTypeLabel } from '../constants';
import { Card } from './UI';
import { ChinaMap } from './ChinaMap';
import { getDatabase } from '../services/db';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { resolveEffectiveTimeRules } from '../utils/pwaTariffResolver';

interface DashboardProps {
  tariffs: TariffData[];
  calcCompPrice: (t: TariffData, startTime?: string, endTime?: string) => number | null;
  onOpenAnalysis: (tariff: TariffData) => void;
  onNavigate: (view: any) => void;
  viewMode: 'map' | 'list';
  onViewModeChange: (mode: 'map' | 'list') => void;
  selectedProvinces: string[];
  onSelectedProvincesChange: (provinces: string[]) => void;
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

export const Dashboard: React.FC<DashboardProps> = ({
  tariffs,
  onOpenAnalysis,
  onNavigate,
  selectedProvinces,
  onSelectedProvincesChange,
  calcCompPrice
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedVoltages, setSelectedVoltages] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [focusedTariffId, setFocusedTariffId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState<boolean>(false);

  // 默认综合电价时间窗口：08:00 - 16:00 (光伏日间消纳黄金窗口)
  const [compStartTime, setCompStartTime] = useState<string>('08:00');
  const [compEndTime, setCompEndTime] = useState<string>('16:00');

  // 基础统计列表
  const uniqueProvinces = useMemo(() => Array.from(new Set(tariffs.map((t) => t.province))).sort(), [tariffs]);
  const uniqueCategories = useMemo(() => Array.from(new Set(tariffs.map((t) => t.category))).filter(Boolean).sort(), [tariffs]);
  const uniqueVoltages = useMemo(() => Array.from(new Set(tariffs.map((t) => t.voltage_level))).filter(Boolean).sort(), [tariffs]);
  const uniqueMonths = useMemo(() => Array.from(new Set(tariffs.map((t) => t.month))).filter(Boolean).sort().reverse(), [tariffs]);
  const uniqueYears = useMemo(() => {
    return Array.from(
      new Set(
        tariffs
          .map((tariff) => {
            const match = tariff.month.match(/^(\d{4})-/);
            return match ? match[1] : '';
          })
          .filter(Boolean),
      ),
    ).sort();
  }, [tariffs]);

  // 省份记录计数
  const provinceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tariffs.forEach((t) => {
      counts[t.province] = (counts[t.province] || 0) + 1;
    });
    return counts;
  }, [tariffs]);

  // 多维交叉过滤后的电价数据
  const filteredTariffs = useMemo(() => {
    const kw = searchKeyword.trim().toLowerCase();
    return tariffs
      .filter((t) => {
        const matchProvince = selectedProvinces.length === 0 || selectedProvinces.includes(t.province);
        const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(t.category);
        const matchVoltage = selectedVoltages.length === 0 || selectedVoltages.includes(t.voltage_level);
        const year = t.month.match(/^(\d{4})-/)?.[1] || '';
        const matchYear = selectedYears.length === 0 || selectedYears.includes(year);
        const matchMonth = selectedMonths.length === 0 || selectedMonths.includes(t.month);
        const matchKw =
          !kw ||
          t.province.toLowerCase().includes(kw) ||
          t.category.toLowerCase().includes(kw) ||
          t.voltage_level.toLowerCase().includes(kw) ||
          t.month.toLowerCase().includes(kw) ||
          (t.policy_code && t.policy_code.toLowerCase().includes(kw));

        return matchProvince && matchCategory && matchVoltage && matchYear && matchMonth && matchKw;
      })
      .sort((a, b) => b.month.localeCompare(a.month) || a.province.localeCompare(b.province));
  }, [tariffs, selectedProvinces, selectedCategories, selectedVoltages, selectedYears, selectedMonths, searchKeyword]);

  // 当前主透视聚焦的 Tariff（默认第一条，或点击行聚焦）
  const focusedTariff = useMemo(() => {
    if (focusedTariffId) {
      const found = filteredTariffs.find((t) => t.id === focusedTariffId);
      if (found) return found;
    }
    return filteredTariffs[0] || null;
  }, [filteredTariffs, focusedTariffId]);

  // 当前聚焦 Tariff 的分时规则与 24h 图表数据
  const focusedHourlyData = useMemo(() => {
    if (!focusedTariff) return [];
    const { rules } = resolveEffectiveTimeRules(focusedTariff, []);
    const hourlyTypes = buildHourlyTypes(rules);

    return hourlyTypes.map((type, hour) => {
      let effectiveType = type;
      if (effectiveType === 'tip' && (focusedTariff.prices.tip === undefined || focusedTariff.prices.tip === null)) {
        effectiveType = 'peak';
      }
      if (effectiveType === 'deep' && (focusedTariff.prices.deep === undefined || focusedTariff.prices.deep === null)) {
        effectiveType = 'valley';
      }
      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        value: focusedTariff.prices[effectiveType] ?? 0,
        type: effectiveType,
        fill: getTypeColor(effectiveType),
      };
    });
  }, [focusedTariff]);

  // 4 大时段速查统计
  const focusedTouSummary = useMemo(() => {
    if (!focusedTariff || focusedHourlyData.length === 0) return [];

    const typeMap: Record<string, { type: TimeType; hours: number[]; count: number; price: number | null }> = {};
    for (let h = 0; h < focusedHourlyData.length; h++) {
      const item = focusedHourlyData[h];
      const t = item.type as TimeType;
      if (!typeMap[t]) {
        typeMap[t] = {
          type: t,
          hours: [],
          count: 0,
          price: focusedTariff.prices[t] ?? null,
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
  }, [focusedTariff, focusedHourlyData]);

  // 储能充放电策略与套利计算
  const storageStrategy = useMemo(() => {
    if (!focusedTariff || focusedHourlyData.length === 0) return null;

    const valleyBlocks: { start: number; end: number; type: TimeType; price: number }[] = [];
    const peakBlocks: { start: number; end: number; type: TimeType; price: number }[] = [];

    let cur: { start: number; end: number; kind: 'valley' | 'peak' | 'other'; type: TimeType; price: number } | null = null;

    for (let h = 0; h < 24; h++) {
      const item = focusedHourlyData[h];
      const isValley = item.type === 'valley' || item.type === 'deep';
      const isPeak = item.type === 'tip' || item.type === 'peak';
      const kind = isValley ? 'valley' : isPeak ? 'peak' : 'other';

      if (!cur || cur.kind !== kind || cur.type !== item.type) {
        if (cur) {
          if (cur.kind === 'valley') valleyBlocks.push({ start: cur.start, end: cur.end, type: cur.type, price: cur.price });
          else if (cur.kind === 'peak') peakBlocks.push({ start: cur.start, end: cur.end, type: cur.type, price: cur.price });
        }
        cur = { start: h, end: h + 1, kind, type: item.type, price: item.value };
      } else {
        cur.end = h + 1;
      }
    }
    if (cur) {
      if (cur.kind === 'valley') valleyBlocks.push({ start: cur.start, end: cur.end, type: cur.type, price: cur.price });
      else if (cur.kind === 'peak') peakBlocks.push({ start: cur.start, end: cur.end, type: cur.type, price: cur.price });
    }

    const hasMiddayValley = valleyBlocks.some((b) => b.start >= 10 && b.end <= 16);
    const mode = (valleyBlocks.length >= 2 && peakBlocks.length >= 2) || hasMiddayValley ? '两充两放' : '一充一放';

    let cycle1Spread = 0;
    let cycle2Spread = 0;
    let totalSpread = 0;

    if (valleyBlocks.length > 0 && peakBlocks.length > 0) {
      const minV = Math.min(...valleyBlocks.map((b) => b.price));
      const maxP = Math.max(...peakBlocks.map((b) => b.price));
      if (mode === '两充两放' && valleyBlocks.length >= 2 && peakBlocks.length >= 2) {
        cycle1Spread = Math.max(0, peakBlocks[0].price - valleyBlocks[0].price);
        cycle2Spread = Math.max(0, peakBlocks[peakBlocks.length - 1].price - valleyBlocks[1].price);
        totalSpread = cycle1Spread + cycle2Spread;
      } else {
        cycle1Spread = maxP - minV;
        totalSpread = maxP - minV;
      }
    }

    return {
      mode,
      valleyBlocks,
      peakBlocks,
      cycle1Spread,
      cycle2Spread,
      totalSpread,
    };
  }, [focusedTariff, focusedHourlyData]);

  // 聚焦 Tariff 的综合电价计算（默认 08:00 - 16:00）
  const focusedCompPrice = useMemo(() => {
    if (!focusedTariff) return null;
    return calcCompPrice(focusedTariff, compStartTime, compEndTime);
  }, [focusedTariff, compStartTime, compEndTime, calcCompPrice]);

  // 聚焦 Tariff 的最大峰谷价差
  const focusedMaxSpread = useMemo(() => {
    if (!focusedTariff) return null;
    const p = focusedTariff.prices;
    const valid = [p.tip, p.peak, p.flat, p.valley, p.deep].filter((v): v is number => typeof v === 'number' && v > 0);
    if (valid.length < 2) return null;
    return Math.max(...valid) - Math.min(...valid);
  }, [focusedTariff]);

  // 聚焦分类与省份的历史 12 个月多轨电价趋势
  const historicalTrendData = useMemo(() => {
    if (!focusedTariff) return [];
    return tariffs
      .filter(
        (t) =>
          t.province === focusedTariff.province &&
          t.category === focusedTariff.category &&
          t.voltage_level === focusedTariff.voltage_level,
      )
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((item) => ({
        month: item.month,
        tip: item.prices.tip ?? null,
        peak: item.prices.peak ?? null,
        flat: item.prices.flat ?? null,
        valley: item.prices.valley ?? null,
        deep: item.prices.deep ?? null,
        compPrice: calcCompPrice(item, compStartTime, compEndTime),
      }));
  }, [focusedTariff, tariffs, compStartTime, compEndTime, calcCompPrice]);

  // 重置筛选
  const resetFilters = () => {
    onSelectedProvincesChange([]);
    setSelectedCategories([]);
    setSelectedVoltages([]);
    setSelectedYears([]);
    setSelectedMonths([]);
    setSearchKeyword('');
  };

  const toggleSelection = (item: string, currentSelections: string[], setSelections: (vals: string[]) => void) => {
    if (currentSelections.includes(item)) {
      setSelections(currentSelections.filter((i) => i !== item));
    } else {
      setSelections([...currentSelections, item]);
    }
  };

  // 导出当前筛选数据为 UTF-8 BOM CSV
  const handleExportCSV = () => {
    if (filteredTariffs.length === 0) return;
    const headers = [
      '省份',
      '执行月份',
      '用电分类',
      '电压等级',
      `综合电价(${compStartTime}-${compEndTime})`,
      '尖峰电价',
      '高峰电价',
      '平段电价',
      '低谷电价',
      '深谷电价',
      '代理购电价',
      '输配电价',
      '上网线损',
      '系统运行费',
      '政府性基金',
      '需量电价',
      '容量电价',
      '政策文号',
    ];

    const rows = filteredTariffs.map((t) => {
      const comp = calcCompPrice(t, compStartTime, compEndTime);
      return [
        t.province,
        t.month,
        t.category,
        t.voltage_level,
        comp !== null ? comp.toFixed(4) : '',
        t.prices.tip !== undefined && t.prices.tip !== null ? t.prices.tip.toFixed(4) : '',
        t.prices.peak !== undefined && t.prices.peak !== null ? t.prices.peak.toFixed(4) : '',
        t.prices.flat !== undefined && t.prices.flat !== null ? t.prices.flat.toFixed(4) : '',
        t.prices.valley !== undefined && t.prices.valley !== null ? t.prices.valley.toFixed(4) : '',
        t.prices.deep !== undefined && t.prices.deep !== null ? t.prices.deep.toFixed(4) : '',
        t.prices.purchase_agent ?? '',
        t.prices.transmission_distribution ?? '',
        t.prices.line_loss ?? '',
        t.prices.system_cost ?? '',
        t.prices.government_funds ?? '',
        t.prices.demand_charge ?? '',
        t.prices.capacity_charge ?? '',
        t.policy_code ?? '',
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `分时电价数据导出_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderFilterGroup = (
    title: string,
    items: string[],
    current: string[],
    setFunc: (vals: string[]) => void,
  ) => {
    const isAll = current.length === 0;
    return (
      <div className="flex flex-col gap-1.5 min-w-[160px] flex-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <span>{title}</span>
            {current.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.2 rounded-full font-semibold">
                {current.length}
              </span>
            )}
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFunc([])}
              className={`text-[11px] transition-colors ${
                isAll ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              全部
            </button>
            {items.length > 0 && current.length > 0 && (
              <button
                onClick={() => setFunc([])}
                className="text-[11px] text-slate-400 hover:text-red-500 transition-colors"
              >
                清空
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto custom-scrollbar p-0.5">
          {items.map((item) => {
            const isSelected = current.includes(item);
            return (
              <button
                key={item}
                onClick={() => toggleSelection(item, current, setFunc)}
                className={`px-2 py-0.5 text-xs rounded-md border transition-all select-none ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-medium'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-16 animate-in fade-in duration-300">
      {/* 顶部标题栏与全局操作 */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200">
              <Layers size={18} />
            </div>
            <h1 className="text-xl font-bold text-slate-900">分时电价与时段洞察服务台</h1>
            <span className="hidden sm:inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
              权威 95598 数据库
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            24小时分时结构穿透 · 储能充放双轨策略 · 08:00-16:00光伏日间综合电价自动测算
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowMap(!showMap)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
              showMap
                ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <MapPin size={14} className={showMap ? 'text-blue-600' : 'text-slate-400'} />
            <span>{showMap ? '收起全国地图' : '展开全国地图'}</span>
            {showMap ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredTariffs.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <Download size={14} className="text-slate-500" />
            <span>导出数据 ({filteredTariffs.length})</span>
          </button>

          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent transition-all"
          >
            <RotateCcw size={14} />
            <span>重置</span>
          </button>
        </div>
      </div>

      {/* 可折叠全国热力地图 */}
      {showMap && (
        <Card className="p-4 bg-white border border-slate-200/80 shadow-md animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">全国省份电价数据热力分布</span>
              <span className="text-[11px] text-slate-400">（点击省份可直接加入上方筛选）</span>
            </div>
            <span className="text-xs font-mono text-slate-500">已录入省份：{uniqueProvinces.length} 个</span>
          </div>
          <div className="h-[420px] w-full">
            <ChinaMap
              dataCounts={provinceCounts}
              onProvinceSelect={(p) => {
                toggleSelection(p, selectedProvinces, onSelectedProvincesChange);
              }}
            />
          </div>
        </Card>
      )}

      {/* 5 维多选交叉筛选器 */}
      <Card className="p-5 bg-white border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-blue-600" />
            <h3 className="font-bold text-slate-800 text-xs tracking-wide">多维交叉筛选器（支持多选联动）</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索省份、文号、分类..."
                className="pl-7 pr-3 py-1 text-xs border border-slate-200 rounded-lg w-48 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
              />
              <Search size={12} className="absolute left-2.5 top-2 text-slate-400" />
            </div>
            <span className="text-xs text-slate-500">
              匹配 <span className="font-mono font-bold text-blue-600">{filteredTariffs.length}</span> 条
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {renderFilterGroup('省份地区', uniqueProvinces, selectedProvinces, onSelectedProvincesChange)}
          {renderFilterGroup('用电分类', uniqueCategories, selectedCategories, setSelectedCategories)}
          {renderFilterGroup('电压等级', uniqueVoltages, selectedVoltages, setSelectedVoltages)}
          {renderFilterGroup('执行月份', uniqueMonths, selectedMonths, setSelectedMonths)}
          {renderFilterGroup('执行年份', uniqueYears, selectedYears, setSelectedYears)}
        </div>
      </Card>

      {/* 跨省对比提示条 (多选省份时提示一键跳转独立跨省对比页) */}
      {selectedProvinces.length > 1 && (
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <div>
              <span className="font-bold text-slate-800 text-sm">
                已选择 {selectedProvinces.length} 个省份：{selectedProvinces.join('、')}
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                当前电价工作台聚焦展示单省电价与分时明细。如需跨省 24h 连续谱带与多曲线同屏叠加对比，可前往专属对比页。
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('compare')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5 shrink-0"
          >
            前往「跨省横向对比」页面 →
          </button>
        </div>
      )}

      {/* 核心双栏看板（左：24h 日分时洞察 + 储能充放双轨；右：综合电价 + 6+2 成本拆解 + 12个月走势） */}
      {focusedTariff ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* 左栏：24小时分时结构看板 (占 7 栏) */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="p-5 bg-white border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600" />
                    {focusedTariff.province} · 24小时分时电价
                  </span>
                  <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-md font-medium">
                    {focusedTariff.category}
                  </span>
                  <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-md font-medium">
                    {focusedTariff.voltage_level}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
                  执行月份：{focusedTariff.month}
                </span>
              </div>

              {/* 24 小时彩色柱状图 */}
              <div className="h-60 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={focusedHourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="hour" interval={2} stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 'auto']} />
                    <Tooltip
                      formatter={(value: number, _: string, item: { payload?: { type?: string } }) => [
                        `${value.toFixed(4)} 元/kWh`,
                        `${getTypeLabel(item?.payload?.type || 'flat')}电价`,
                      ]}
                      contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                    />
                    <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                      {focusedHourlyData.map((entry) => (
                        <Cell key={entry.hour} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* ⭐ 方式一：24h 彩带时间轴 + 储能充放电双轨指示卡片 */}
              {storageStrategy && (
                <div className="rounded-xl border border-slate-200/80 bg-gradient-to-r from-slate-50 via-blue-50/20 to-slate-50 p-3.5 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <BatteryCharging size={16} className="text-blue-600" />
                      24h 分时彩带 ＆ 储能充放电策略对齐轨
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      {storageStrategy.mode}模式 · 理论日套利 {storageStrategy.totalSpread.toFixed(4)} 元/kWh
                    </span>
                  </div>

                  {/* 24h 彩色连续时间轴 */}
                  <div className="space-y-1">
                    <div className="grid grid-cols-[repeat(24,minmax(0,1fr))] gap-px bg-slate-200 rounded-md overflow-hidden h-5 shadow-sm">
                      {focusedHourlyData.map((h, idx) => (
                        <div
                          key={idx}
                          className="h-full relative group cursor-pointer"
                          style={{ backgroundColor: h.fill }}
                          title={`${h.hour} ｜ ${getTypeLabel(h.type)} ｜ ${h.value.toFixed(4)}元`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 font-mono px-0.5">
                      <span>00:00</span>
                      <span>04:00</span>
                      <span>08:00</span>
                      <span>12:00</span>
                      <span>16:00</span>
                      <span>20:00</span>
                      <span>24:00</span>
                    </div>
                  </div>

                  {/* 充放电双轨指示 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* 充电轨道 */}
                    <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-2 flex items-start gap-2">
                      <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <Zap size={12} />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-emerald-900 text-[11px]">⚡ 推荐充电窗口</div>
                        <div className="mt-0.5 text-[11px] text-emerald-700 space-y-0.5">
                          {storageStrategy.valleyBlocks.map((b, idx) => (
                            <div key={idx} className="flex justify-between font-mono">
                              <span>第{idx + 1}充: {b.start.toString().padStart(2, '0')}:00-{b.end.toString().padStart(2, '0')}:00</span>
                              <span className="font-bold">{b.price.toFixed(4)}元</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 放电轨道 */}
                    <div className="bg-red-50/80 border border-red-200 rounded-lg p-2 flex items-start gap-2">
                      <div className="w-5 h-5 rounded-md bg-red-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <BatteryCharging size={12} />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-red-900 text-[11px]">🔋 推荐放电窗口</div>
                        <div className="mt-0.5 text-[11px] text-red-700 space-y-0.5">
                          {storageStrategy.peakBlocks.map((b, idx) => (
                            <div key={idx} className="flex justify-between font-mono">
                              <span>第{idx + 1}放: {b.start.toString().padStart(2, '0')}:00-{b.end.toString().padStart(2, '0')}:00</span>
                              <span className="font-bold">{b.price.toFixed(4)}元</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 四大时段电价速查卡片 (大字号 4 位小数) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {focusedTouSummary.map((item) => (
                  <div
                    key={item.type}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 shadow-sm hover:border-slate-200 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: item.color }}>
                        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.label}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-100">
                        {item.count}h
                      </span>
                    </div>
                    <div className="mt-1.5 font-mono text-base font-bold text-slate-900">
                      {item.price !== null ? item.price.toFixed(4) : '--'}
                      <span className="ml-0.5 text-[10px] font-normal text-slate-500 font-sans">元</span>
                    </div>
                    <div className="mt-1 text-[10px] text-slate-500 truncate" title={item.rangesText}>
                      {item.rangesText}
                    </div>
                  </div>
                ))}
              </div>

              {/* 发改委政策依据与特殊时段说明卡 */}
              {(focusedTariff.float_rules?.special_period_note ||
                focusedTariff.float_rules?.formula_note ||
                focusedTariff.policy_code ||
                focusedTariff.is_market_based ||
                focusedTariff.market_notes) && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3.5 text-xs text-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 flex items-center gap-1.5">
                      <FileText size={14} className="text-blue-600" /> 政策依据与特殊时段说明
                    </span>
                    {focusedTariff.policy_code && (
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-800">
                        {focusedTariff.policy_code}
                      </span>
                    )}
                  </div>

                  {focusedTariff.float_rules?.special_period_note && (
                    <div className="flex items-start gap-1.5 rounded-lg bg-amber-50 border border-amber-200/60 p-2 text-amber-900 text-[11px]">
                      <span className="shrink-0 font-bold text-amber-700">⏱️ 特殊时段:</span>
                      <span>{focusedTariff.float_rules.special_period_note}</span>
                    </div>
                  )}

                  {focusedTariff.is_market_based && (
                    <div className="flex items-start gap-1.5 rounded-lg bg-yellow-50 border border-yellow-200/60 p-2 text-yellow-900 text-[11px]">
                      <span className="shrink-0 font-bold text-yellow-800">⚡ 现货市场:</span>
                      <span>{focusedTariff.market_notes || '该省已进入电力现货市场，分时电价随现货出清动态波动。'}</span>
                    </div>
                  )}

                  {focusedTariff.float_rules?.formula_note && (
                    <div className="text-[11px] text-slate-600 leading-relaxed pt-0.5">
                      <span className="font-semibold text-slate-700">📐 计算公式：</span>
                      {focusedTariff.float_rules.formula_note}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* 右栏：综合电价 + 6+2 拆解 + 储能套利 + 年度走势 (占 5 栏) */}
          <div className="lg:col-span-5 space-y-4">
            {/* 1. 光伏日间综合电价 (默认 08:00 - 16:00) */}
            <Card className="p-4 bg-gradient-to-br from-blue-50/60 via-white to-indigo-50/30 border border-blue-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <DollarSign size={16} className="text-blue-600" />
                  <span className="text-xs font-bold text-slate-800">光伏日间综合电价</span>
                </div>
                <div className="flex items-center gap-1 text-[11px]">
                  <Clock size={12} className="text-slate-400" />
                  <select
                    value={`${compStartTime}-${compEndTime}`}
                    onChange={(e) => {
                      const [s, end] = e.target.value.split('-');
                      setCompStartTime(s);
                      setCompEndTime(end);
                    }}
                    className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  >
                    <option value="08:00-16:00">08:00 - 16:00 (默认8h)</option>
                    <option value="07:00-17:00">07:00 - 17:00 (夏季10h)</option>
                    <option value="09:00-15:00">09:00 - 15:00 (核心6h)</option>
                    <option value="00:00-24:00">00:00 - 24:00 (全天24h)</option>
                  </select>
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <span className="font-mono text-2xl font-bold text-blue-700">
                    {focusedCompPrice !== null ? focusedCompPrice.toFixed(4) : '--'}
                  </span>
                  <span className="ml-1 text-xs text-slate-500 font-sans">元/kWh</span>
                </div>
                {focusedMaxSpread !== null && (
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    最大峰谷差 {focusedMaxSpread.toFixed(4)} 元
                  </span>
                )}
              </div>
            </Card>

            {/* 2. 电价 6+2 成本构成穿透 (元/kWh) */}
            <Card className="p-4 bg-white border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders size={14} className="text-slate-500" /> 6+2 电价成本构成穿透
                </span>
                <span className="text-[11px] text-slate-400">单位：元/kWh</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg bg-slate-50 p-2">
                  <div className="text-[10px] text-slate-400">代理购电</div>
                  <div className="font-mono font-bold text-slate-800 mt-0.5">
                    {focusedTariff.prices.purchase_agent !== undefined && focusedTariff.prices.purchase_agent !== null
                      ? focusedTariff.prices.purchase_agent.toFixed(4)
                      : '--'}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <div className="text-[10px] text-slate-400">输配电价</div>
                  <div className="font-mono font-bold text-slate-800 mt-0.5">
                    {focusedTariff.prices.transmission_distribution !== undefined && focusedTariff.prices.transmission_distribution !== null
                      ? focusedTariff.prices.transmission_distribution.toFixed(4)
                      : '--'}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <div className="text-[10px] text-slate-400">上网线损</div>
                  <div className="font-mono font-bold text-slate-800 mt-0.5">
                    {focusedTariff.prices.line_loss !== undefined && focusedTariff.prices.line_loss !== null
                      ? focusedTariff.prices.line_loss.toFixed(4)
                      : '--'}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <div className="text-[10px] text-slate-400">系统运行费</div>
                  <div className="font-mono font-bold text-slate-800 mt-0.5">
                    {focusedTariff.prices.system_cost !== undefined && focusedTariff.prices.system_cost !== null
                      ? focusedTariff.prices.system_cost.toFixed(4)
                      : '--'}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <div className="text-[10px] text-slate-400">政府性基金</div>
                  <div className="font-mono font-bold text-slate-800 mt-0.5">
                    {focusedTariff.prices.government_funds !== undefined && focusedTariff.prices.government_funds !== null
                      ? focusedTariff.prices.government_funds.toFixed(4)
                      : '--'}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <div className="text-[10px] text-slate-400">需量/容量</div>
                  <div className="font-mono font-bold text-slate-800 mt-0.5">
                    {focusedTariff.prices.demand_charge || focusedTariff.prices.capacity_charge
                      ? `${focusedTariff.prices.demand_charge || '-'}/${focusedTariff.prices.capacity_charge || '-'}`
                      : '--'}
                  </div>
                </div>
              </div>
            </Card>

            {/* 3. 历史 12 个月 5 轨电价年度走势折线图 */}
            <Card className="p-4 bg-white border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-blue-600" /> 历史 12 个月电价走势
                </span>
                <span className="text-[11px] text-slate-400">{focusedTariff.province} · {focusedTariff.category}</span>
              </div>

              <div className="h-44 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tickLine={false} stroke="#64748b" fontSize={10} />
                    <YAxis tickLine={false} stroke="#64748b" fontSize={10} domain={['auto', 'auto']} />
                    <Tooltip
                      formatter={(val: number) => (val !== null ? `${val.toFixed(4)} 元` : '--')}
                      contentStyle={{ borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
                    <Line type="monotone" dataKey="tip" name="尖峰" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} connectNulls />
                    <Line type="monotone" dataKey="peak" name="高峰" stroke="#f97316" strokeWidth={1.8} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="flat" name="平段" stroke="#eab308" strokeWidth={1.8} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="valley" name="低谷" stroke="#10b981" strokeWidth={1.8} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="deep" name="深谷" stroke="#a855f7" strokeWidth={1.8} dot={{ r: 2 }} connectNulls />
                    <Line
                      type="monotone"
                      dataKey="compPrice"
                      name="综合均价"
                      stroke="#2563eb"
                      strokeWidth={2}
                      strokeDasharray="4 2"
                      dot={{ r: 2.5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center bg-white border border-slate-200 text-slate-500">
          当前筛选条件下暂无电价数据，请调整筛选条件。
        </Card>
      )}

      {/* 底部：全国全量数据明细与横向对比表 */}
      <Card className="p-5 bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">电价数据明细与横向对比表</h3>
            <span className="text-xs text-slate-400">（点击任意行可快速切换上方主看板透视）</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">共 {filteredTariffs.length} 条记录</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs text-left text-slate-600">
            <thead className="text-[11px] text-slate-500 uppercase bg-slate-50/80 border-y border-slate-200/80">
              <tr>
                <th className="px-3 py-2.5 font-bold">省份</th>
                <th className="px-3 py-2.5 font-bold">执行月份</th>
                <th className="px-3 py-2.5 font-bold">用电分类</th>
                <th className="px-3 py-2.5 font-bold">电压等级</th>
                <th className="px-3 py-2.5 font-bold text-blue-700">综合电价({compStartTime}-{compEndTime})</th>
                <th className="px-3 py-2.5 font-bold text-red-600">尖峰电价</th>
                <th className="px-3 py-2.5 font-bold text-orange-600">高峰电价</th>
                <th className="px-3 py-2.5 font-bold text-yellow-600">平段电价</th>
                <th className="px-3 py-2.5 font-bold text-emerald-600">低谷电价</th>
                <th className="px-3 py-2.5 font-bold text-purple-600">深谷电价</th>
                <th className="px-3 py-2.5 font-bold">政策文号</th>
                <th className="px-3 py-2.5 font-bold text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTariffs.map((t) => {
                const comp = calcCompPrice(t, compStartTime, compEndTime);
                const isFocused = focusedTariff?.id === t.id;
                return (
                  <tr
                    key={t.id}
                    onClick={() => setFocusedTariffId(t.id)}
                    className={`cursor-pointer transition-colors ${
                      isFocused ? 'bg-blue-50/70 hover:bg-blue-50' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="px-3 py-2.5 font-bold text-slate-900 flex items-center gap-1.5">
                      {isFocused && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />}
                      {t.province}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-slate-500">{t.month}</td>
                    <td className="px-3 py-2.5 font-medium">{t.category}</td>
                    <td className="px-3 py-2.5">{t.voltage_level}</td>
                    <td className="px-3 py-2.5 font-mono font-bold text-blue-700">
                      {comp !== null ? comp.toFixed(4) : '-'}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-red-600">
                      {t.prices.tip !== undefined && t.prices.tip !== null ? t.prices.tip.toFixed(4) : '-'}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-orange-600">
                      {t.prices.peak !== undefined && t.prices.peak !== null ? t.prices.peak.toFixed(4) : '-'}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-yellow-600">
                      {t.prices.flat !== undefined && t.prices.flat !== null ? t.prices.flat.toFixed(4) : '-'}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-emerald-600">
                      {t.prices.valley !== undefined && t.prices.valley !== null ? t.prices.valley.toFixed(4) : '-'}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-purple-600">
                      {t.prices.deep !== undefined && t.prices.deep !== null ? t.prices.deep.toFixed(4) : '-'}
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-slate-500 max-w-[140px] truncate" title={t.policy_code || ''}>
                      {t.policy_code || '-'}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAnalysis(t);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center justify-end gap-0.5 ml-auto"
                      >
                        详情 <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredTariffs.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-slate-400">
                    暂无数据，请调整筛选条件
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
