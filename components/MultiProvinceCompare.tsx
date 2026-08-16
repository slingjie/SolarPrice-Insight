import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  GitCompare,
  Layers,
  Sparkles,
  Download,
  RotateCcw,
  CheckSquare,
  Square,
  TrendingUp,
  BatteryCharging,
  Zap,
  Info,
  Calendar,
  Filter,
} from 'lucide-react';
import { TariffData, TimeRule, TimeType } from '../types';
import { Card } from './UI';
import { getTypeColor, getTypeLabel } from '../constants.tsx';
import { resolveEffectiveTimeRules } from '../utils/pwaTariffResolver';

interface MultiProvinceCompareProps {
  tariffs: TariffData[];
  calcCompPrice: (t: TariffData, startTime?: string, endTime?: string) => number | null;
  onNavigate?: (view: any) => void;
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

// 跨省对比分配的高辨识度调色板
const PROVINCE_COLORS = [
  '#2563eb', // 蓝色 (蓝)
  '#ea580c', // 橙色 (橙)
  '#7c3aed', // 紫色 (紫)
  '#059669', // 绿色 (绿)
  '#db2777', // 玫红 (粉)
  '#0891b2', // 青色 (青)
  '#d97706', // 琥珀黄
  '#4f46e5', // 靛蓝
  '#dc2626', // 红色
  '#0d9488', // 墨绿
  '#9333ea', // 亮紫
  '#475569', // 蓝灰
];

// 快捷区域预设
const REGIONAL_PRESETS: { name: string; provinces: string[] }[] = [
  { name: '江浙沪皖', provinces: ['浙江省', '江苏省', '安徽省', '上海市'] },
  { name: '华东主干', provinces: ['浙江省', '安徽省', '江苏省', '山东省', '福建省'] },
  { name: '华南沿海', provinces: ['广东省', '广西壮族自治区', '海南省', '福建省'] },
  { name: '华北华中', provinces: ['河北省', '河南省', '湖北省', '湖南省', '北京市'] },
  { name: '西北西南', provinces: ['四川省', '重庆市', '陕西省', '甘肃省', '新疆维吾尔自治区'] },
];

export const MultiProvinceCompare: React.FC<MultiProvinceCompareProps> = ({
  tariffs,
  calcCompPrice,
  onNavigate,
}) => {
  // 全部可选省份与维度
  const allProvinces = useMemo(
    () => Array.from(new Set(tariffs.map((t) => t.province))).sort(),
    [tariffs],
  );
  const allCategories = useMemo(
    () => Array.from(new Set(tariffs.map((t) => t.category))).filter(Boolean).sort(),
    [tariffs],
  );
  const allVoltages = useMemo(
    () => Array.from(new Set(tariffs.map((t) => t.voltage_level))).filter(Boolean).sort(),
    [tariffs],
  );
  const allMonths = useMemo(
    () => Array.from(new Set(tariffs.map((t) => t.month))).filter(Boolean).sort().reverse(),
    [tariffs],
  );

  // 默认筛选状态：预选前 3 个热门省份（如浙江、安徽、江苏），最新月份，大工业，1-10kV
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>(() => {
    const initial = ['浙江省', '安徽省', '江苏省'].filter((p) => allProvinces.includes(p));
    return initial.length > 0 ? initial : allProvinces.slice(0, 3);
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('两部制-大工业');
  const [selectedVoltage, setSelectedVoltage] = useState<string>('1-10kV');
  const [selectedMonth, setSelectedMonth] = useState<string>(allMonths[0] || '2026-08');

  // 图表呈现类型：折线图 vs 分组柱状图
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  // 综合电价计算时间窗口 (默认 08:00 - 16:00)
  const [compStartTime, setCompStartTime] = useState<string>('08:00');
  const [compEndTime, setCompEndTime] = useState<string>('16:00');

  // 排序维度（用于底部横向明细表）
  const [sortField, setSortField] = useState<string>('maxSpread');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // 切换省份多选
  const handleToggleProvince = (prov: string) => {
    if (selectedProvinces.includes(prov)) {
      if (selectedProvinces.length > 1) {
        setSelectedProvinces(selectedProvinces.filter((p) => p !== prov));
      }
    } else {
      setSelectedProvinces([...selectedProvinces, prov]);
    }
  };

  // 应用区域预设
  const handleApplyPreset = (presetProvinces: string[]) => {
    const available = presetProvinces.filter((p) => allProvinces.includes(p));
    if (available.length > 0) {
      setSelectedProvinces(available);
    }
  };

  // 全选 / 清空
  const handleSelectAll = () => setSelectedProvinces([...allProvinces]);
  const handleResetProvinces = () => {
    const initial = ['浙江省', '安徽省', '江苏省'].filter((p) => allProvinces.includes(p));
    setSelectedProvinces(initial.length > 0 ? initial : allProvinces.slice(0, 2));
  };

  // 为每个选中省份匹配最佳 Tariff 数据
  const comparedProvinceData = useMemo(() => {
    return selectedProvinces.map((prov, index) => {
      // 优先匹配月份 + 分类 + 电压
      let match = tariffs.find(
        (t) =>
          t.province === prov &&
          (!selectedMonth || t.month === selectedMonth) &&
          (!selectedCategory || t.category === selectedCategory) &&
          (!selectedVoltage || t.voltage_level === selectedVoltage),
      );

      // 次优匹配：月份 + 分类
      if (!match) {
        match = tariffs.find(
          (t) =>
            t.province === prov &&
            (!selectedMonth || t.month === selectedMonth) &&
            (!selectedCategory || t.category === selectedCategory),
        );
      }

      // 再次优匹配：仅月份
      if (!match) {
        match = tariffs.find(
          (t) => t.province === prov && (!selectedMonth || t.month === selectedMonth),
        );
      }

      // 保底匹配：该省最新记录
      if (!match) {
        match = tariffs.find((t) => t.province === prov);
      }

      const color = PROVINCE_COLORS[index % PROVINCE_COLORS.length];

      if (!match) {
        return {
          province: prov,
          color,
          tariff: null,
          hourly: Array(24).fill(0).map((_, h) => ({ hour: h, price: 0, type: 'flat' as TimeType, color: '#94a3b8' })),
          avgPrice: 0,
          maxPrice: 0,
          minPrice: 0,
          maxSpread: 0,
          mode: '一充一放',
          arbitrage: 0,
          compPrice: null,
        };
      }

      const { rules } = resolveEffectiveTimeRules(match, []);
      const hourlyTypes = buildHourlyTypes(rules);
      const hourly = hourlyTypes.map((type, hour) => {
        let eff = type;
        if (eff === 'tip' && (match!.prices.tip === undefined || match!.prices.tip === null)) eff = 'peak';
        if (eff === 'deep' && (match!.prices.deep === undefined || match!.prices.deep === null)) eff = 'valley';
        return {
          hour,
          type: eff,
          color: getTypeColor(eff),
          price: match!.prices[eff] ?? 0,
        };
      });

      const pricesList = hourly.map((h) => h.price).filter((p) => p > 0);
      const avgPrice = pricesList.length > 0 ? pricesList.reduce((a, b) => a + b, 0) / pricesList.length : 0;
      const maxPrice = pricesList.length > 0 ? Math.max(...pricesList) : 0;
      const minPrice = pricesList.length > 0 ? Math.min(...pricesList) : 0;
      const maxSpread = maxPrice > 0 && minPrice > 0 ? maxPrice - minPrice : 0;

      // 储能套利与模式判断
      const valleyHours = hourly.filter((h) => h.type === 'valley' || h.type === 'deep');
      const peakHours = hourly.filter((h) => h.type === 'peak' || h.type === 'tip');
      const hasMiddayValley = hourly.some((h) => h.hour >= 11 && h.hour <= 14 && (h.type === 'valley' || h.type === 'deep'));
      const mode = (valleyHours.length >= 4 && peakHours.length >= 4) || hasMiddayValley ? '两充两放' : '一充一放';
      const arbitrage = mode === '两充两放' ? maxSpread * 1.6 : maxSpread;
      const compPrice = calcCompPrice(match, compStartTime, compEndTime);

      return {
        province: prov,
        color,
        tariff: match,
        hourly,
        avgPrice,
        maxPrice,
        minPrice,
        maxSpread,
        mode,
        arbitrage,
        compPrice,
      };
    });
  }, [
    selectedProvinces,
    tariffs,
    selectedMonth,
    selectedCategory,
    selectedVoltage,
    compStartTime,
    compEndTime,
    calcCompPrice,
  ]);

  // 组装 24 小时曲线图表数据 (X 轴：00:00 ~ 23:00)
  const chart24hData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map((hour) => {
      const row: Record<string, any> = {
        hour: `${String(hour).padStart(2, '0')}:00`,
        hourNum: hour,
      };

      comparedProvinceData.forEach((provItem) => {
        const hData = provItem.hourly[hour];
        if (hData) {
          row[provItem.province] = hData.price;
          row[`${provItem.province}_type`] = hData.type;
        }
      });

      return row;
    });
  }, [comparedProvinceData]);

  // 排序后的横向穿透数据明细表
  const sortedTableData = useMemo(() => {
    return [...comparedProvinceData].sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (sortField === 'province') return sortAsc ? a.province.localeCompare(b.province) : b.province.localeCompare(a.province);
      if (sortField === 'maxSpread') { valA = a.maxSpread; valB = b.maxSpread; }
      else if (sortField === 'compPrice') { valA = a.compPrice ?? 0; valB = b.compPrice ?? 0; }
      else if (sortField === 'avgPrice') { valA = a.avgPrice; valB = b.avgPrice; }
      else if (sortField === 'tip') { valA = a.tariff?.prices.tip ?? 0; valB = b.tariff?.prices.tip ?? 0; }
      else if (sortField === 'peak') { valA = a.tariff?.prices.peak ?? 0; valB = b.tariff?.prices.peak ?? 0; }
      else if (sortField === 'flat') { valA = a.tariff?.prices.flat ?? 0; valB = b.tariff?.prices.flat ?? 0; }
      else if (sortField === 'valley') { valA = a.tariff?.prices.valley ?? 0; valB = b.tariff?.prices.valley ?? 0; }
      else if (sortField === 'trans') { valA = a.tariff?.prices.transmission_distribution ?? 0; valB = b.tariff?.prices.transmission_distribution ?? 0; }

      return sortAsc ? valA - valB : valB - valA;
    });
  }, [comparedProvinceData, sortField, sortAsc]);

  // 导出对比 CSV
  const handleExportCSV = () => {
    if (comparedProvinceData.length === 0) return;
    const headers = [
      '省份',
      '执行月份',
      '用电分类',
      '电压等级',
      `综合电价(${compStartTime}-${compEndTime})`,
      '最大峰谷价差',
      '24h平均电价',
      '尖峰单价',
      '高峰单价',
      '平段单价',
      '低谷单价',
      '深谷单价',
      '代理购电价',
      '输配电价',
      '上网线损',
      '系统运行费',
      '政府性基金',
      '需量电价',
      '容量电价',
      '推荐储能模式',
      '政策依据文号',
    ];

    const rows = comparedProvinceData.map((item) => {
      const t = item.tariff;
      return [
        item.province,
        t?.month ?? '',
        t?.category ?? '',
        t?.voltage_level ?? '',
        item.compPrice !== null ? item.compPrice.toFixed(4) : '',
        item.maxSpread.toFixed(4),
        item.avgPrice.toFixed(4),
        t?.prices.tip !== undefined && t?.prices.tip !== null ? t.prices.tip.toFixed(4) : '',
        t?.prices.peak !== undefined && t?.prices.peak !== null ? t.prices.peak.toFixed(4) : '',
        t?.prices.flat !== undefined && t?.prices.flat !== null ? t.prices.flat.toFixed(4) : '',
        t?.prices.valley !== undefined && t?.prices.valley !== null ? t.prices.valley.toFixed(4) : '',
        t?.prices.deep !== undefined && t?.prices.deep !== null ? t.prices.deep.toFixed(4) : '',
        t?.prices.purchase_agent ?? '',
        t?.prices.transmission_distribution ?? '',
        t?.prices.line_loss ?? '',
        t?.prices.system_cost ?? '',
        t?.prices.government_funds ?? '',
        t?.prices.demand_charge ?? '',
        t?.prices.capacity_charge ?? '',
        item.mode,
        t?.policy_code ?? '',
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `跨省分时电价横向对比_${selectedMonth || '全部'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 顶部标题与快速动作区 */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GitCompare size={20} />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                跨省 24h 分时与电价横向对比工作台
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  专业横向研判
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                多省 24h 连续分时谱带 · 多曲线同屏叠加走势 · 储能套利模式 · 6+2 成本构成横向穿透
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            <Download size={14} />
            导出对比报表 (CSV)
          </button>
        </div>
      </div>

      {/* 筛选与省份多选选择器 */}
      <Card className="p-6 bg-white border border-slate-200/80 shadow-sm space-y-5">
        {/* 区域预设与快捷操作 */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles size={15} className="text-amber-500" />
              快捷区域预设选择
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 hover:bg-blue-50 rounded transition-colors"
              >
                全选全部省份 ({allProvinces.length})
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={handleResetProvinces}
                className="text-xs text-slate-500 hover:text-slate-700 font-semibold px-2 py-1 hover:bg-slate-100 rounded transition-colors flex items-center gap-1"
              >
                <RotateCcw size={12} />
                恢复默认
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {REGIONAL_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleApplyPreset(preset.provinces)}
                className="px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200/80 hover:border-blue-300 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Layers size={13} className="text-blue-500" />
                {preset.name}
                <span className="text-[10px] text-slate-400 font-mono">
                  ({preset.provinces.filter((p) => allProvinces.includes(p)).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 省份标签勾选阵列 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              已选择对比省份：<strong className="text-blue-600 font-mono text-sm">{selectedProvinces.length}</strong> / {allProvinces.length} 个
            </span>
            <span className="text-[11px] text-slate-400">点击省份标签可增减对比目标</span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50/70 rounded-xl border border-slate-100">
            {allProvinces.map((prov) => {
              const isSelected = selectedProvinces.includes(prov);
              const provIndex = selectedProvinces.indexOf(prov);
              const badgeColor = isSelected ? PROVINCE_COLORS[provIndex % PROVINCE_COLORS.length] : undefined;

              return (
                <button
                  key={prov}
                  onClick={() => handleToggleProvince(prov)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-300 font-bold'
                      : 'bg-transparent text-slate-500 hover:bg-slate-200/60 border border-transparent'
                  }`}
                >
                  {isSelected ? (
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-sm"
                      style={{ backgroundColor: badgeColor }}
                    />
                  ) : (
                    <Square size={12} className="text-slate-300 shrink-0" />
                  )}
                  {prov}
                </button>
              );
            })}
          </div>
        </div>

        {/* 统一对比基准：分类、电压等级、执行月份、综合电价窗口 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              对比月份
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {allMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              用电分类
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {allCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              电压等级
            </label>
            <select
              value={selectedVoltage}
              onChange={(e) => setSelectedVoltage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {allVoltages.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              综合电价测算窗口
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="time"
                value={compStartTime}
                onChange={(e) => setCompStartTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-mono text-slate-700"
              />
              <span className="text-slate-400 text-xs">至</span>
              <input
                type="time"
                value={compEndTime}
                onChange={(e) => setCompEndTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-mono text-slate-700"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* 板块一：24 小时分时电价多曲线同屏叠加对比 */}
      <Card className="p-6 bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              跨省 24h 分时电价同屏叠加走势
            </h2>
            <span className="text-xs text-slate-400">
              （{selectedMonth} ｜ {selectedCategory} ｜ {selectedVoltage}）
            </span>
          </div>

          {/* 折线图 vs 柱状图切换 */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                chartType === 'line'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📈 多省平滑折线对比
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                chartType === 'bar'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📊 24h 分组柱状对比
            </button>
          </div>
        </div>

        {/* 24 小时图表 */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chart24hData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  domain={[0, 'auto']}
                  unit="元"
                />
                <Tooltip
                  formatter={(value: any, name: any, item: any) => {
                    const prov = String(name);
                    const type = item?.payload?.[`${prov}_type`];
                    const typeText = type ? ` ｜ ${getTypeLabel(type)}` : '';
                    return [`${Number(value).toFixed(4)} 元/kWh${typeText}`, prov];
                  }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                {comparedProvinceData.map((item) => (
                  <Line
                    key={item.province}
                    type="monotone"
                    dataKey={item.province}
                    stroke={item.color}
                    strokeWidth={2.5}
                    dot={{ r: 2 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            ) : (
              <BarChart data={chart24hData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  domain={[0, 'auto']}
                  unit="元"
                />
                <Tooltip
                  formatter={(value: any, name: any) => [`${Number(value).toFixed(4)} 元/kWh`, String(name)]}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="rect" wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                {comparedProvinceData.map((item) => (
                  <Bar
                    key={item.province}
                    dataKey={item.province}
                    fill={item.color}
                    radius={[2, 2, 0, 0]}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* 各省 24h 关键指标横向速览卡片阵列 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pt-2">
          {comparedProvinceData.map((item) => (
            <div
              key={item.province}
              className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-3.5 space-y-2 relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 bottom-0 w-1.5"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex items-center justify-between pl-1">
                <span className="font-bold text-slate-800 text-sm">{item.province}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  {item.mode}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pl-1">
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <div className="text-[10px] text-slate-400">最大峰谷价差</div>
                  <div className="font-mono font-bold text-blue-700 text-sm">
                    {item.maxSpread.toFixed(4)} <span className="text-[10px] font-normal text-slate-500">元</span>
                  </div>
                </div>

                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <div className="text-[10px] text-slate-400">综合电价(8-16h)</div>
                  <div className="font-mono font-bold text-emerald-700 text-sm">
                    {item.compPrice !== null ? item.compPrice.toFixed(4) : '-'} <span className="text-[10px] font-normal text-slate-500">元</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600">
                  最高电价：<strong className="font-mono">{item.maxPrice.toFixed(4)}</strong>
                </div>
                <div className="text-[11px] text-slate-600">
                  最低电价：<strong className="font-mono">{item.minPrice.toFixed(4)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 板块二：跨省 24 小时时段结构横向连续谱带 */}
      <Card className="p-6 bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              跨省 24h 分时时段结构横向连续谱带
            </h2>
            <span className="text-xs text-slate-400">
              （直观对比午间低谷、早晚高峰及夏冬季尖峰执行区间）
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-600 inline-block"/>尖峰</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-orange-500 inline-block"/>高峰</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-yellow-500 inline-block"/>平段</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-600 inline-block"/>低谷</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-purple-600 inline-block"/>深谷</span>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {/* 统一时间标尺 */}
          <div className="flex items-center gap-3 px-1 text-[11px] text-slate-400 font-mono">
            <div className="w-28 shrink-0 font-sans font-bold text-slate-600">省份地区</div>
            <div className="flex-1 flex justify-between px-0.5">
              <span>00:00</span>
              <span>03:00</span>
              <span>06:00</span>
              <span>09:00</span>
              <span>12:00</span>
              <span>15:00</span>
              <span>18:00</span>
              <span>21:00</span>
              <span>24:00</span>
            </div>
            <div className="w-36 shrink-0 text-right font-sans font-bold text-slate-600">最大峰谷价差</div>
          </div>

          {/* 各省彩色谱带行 */}
          {comparedProvinceData.map((item) => (
            <div
              key={item.province}
              className="flex items-center gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors"
            >
              <div className="w-28 shrink-0">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  {item.province}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {item.tariff?.category || selectedCategory}
                </div>
              </div>

              {/* 24 小时任意值网格 (确保 24 列横向展开不塌陷) */}
              <div className="flex-1 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-px bg-slate-200 rounded-lg overflow-hidden h-8 shadow-inner">
                {item.hourly.map((h) => (
                  <div
                    key={h.hour}
                    className="h-full relative group transition-opacity hover:opacity-80 cursor-pointer"
                    style={{ backgroundColor: h.color }}
                    title={`${item.province} · ${String(h.hour).padStart(2, '0')}:00 ｜ ${getTypeLabel(h.type)} ｜ ${h.price.toFixed(4)}元/kWh`}
                  />
                ))}
              </div>

              <div className="w-36 shrink-0 text-right flex items-center justify-end gap-1.5">
                <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
                  价差 {item.maxSpread.toFixed(4)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 板块三：跨省电价分项与 6+2 成本构成横向穿透对比表 */}
      <Card className="p-6 bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              跨省分项电价构成与综合电价横向穿透表
            </h2>
            <span className="text-xs text-slate-400">（单位：元/kWh ｜ 按列支持升降序）</span>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                <th className="py-3 px-3">省份</th>
                <th className="py-3 px-3">执行月份</th>
                <th className="py-3 px-3 cursor-pointer hover:bg-slate-100" onClick={() => { setSortField('compPrice'); setSortAsc(!sortAsc); }}>
                  综合电价(8-16h) {sortField === 'compPrice' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-3 cursor-pointer hover:bg-slate-100" onClick={() => { setSortField('maxSpread'); setSortAsc(!sortAsc); }}>
                  最大价差 {sortField === 'maxSpread' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-3">尖峰单价</th>
                <th className="py-3 px-3">高峰单价</th>
                <th className="py-3 px-3">平段单价</th>
                <th className="py-3 px-3">低谷单价</th>
                <th className="py-3 px-3">代理购电</th>
                <th className="py-3 px-3">输配电价</th>
                <th className="py-3 px-3">上网线损</th>
                <th className="py-3 px-3">系统运行费</th>
                <th className="py-3 px-3">政府基金</th>
                <th className="py-3 px-3">储能推荐</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedTableData.map((item) => {
                const t = item.tariff;
                return (
                  <tr key={item.province} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      {item.province}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">{t?.month || selectedMonth}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                      {item.compPrice !== null ? item.compPrice.toFixed(4) : '-'}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">
                      {item.maxSpread.toFixed(4)}
                    </td>
                    <td className="py-3 px-3 font-mono text-red-600">
                      {t?.prices.tip !== undefined && t?.prices.tip !== null ? t.prices.tip.toFixed(4) : '-'}
                    </td>
                    <td className="py-3 px-3 font-mono text-orange-600">
                      {t?.prices.peak !== undefined && t?.prices.peak !== null ? t.prices.peak.toFixed(4) : '-'}
                    </td>
                    <td className="py-3 px-3 font-mono text-yellow-600">
                      {t?.prices.flat !== undefined && t?.prices.flat !== null ? t.prices.flat.toFixed(4) : '-'}
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-600">
                      {t?.prices.valley !== undefined && t?.prices.valley !== null ? t.prices.valley.toFixed(4) : '-'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {t?.prices.purchase_agent !== undefined && t?.prices.purchase_agent !== null ? Number(t.prices.purchase_agent).toFixed(4) : '-'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {t?.prices.transmission_distribution !== undefined && t?.prices.transmission_distribution !== null ? Number(t.prices.transmission_distribution).toFixed(4) : '-'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {t?.prices.line_loss !== undefined && t?.prices.line_loss !== null ? Number(t.prices.line_loss).toFixed(4) : '-'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {t?.prices.system_cost !== undefined && t?.prices.system_cost !== null ? Number(t.prices.system_cost).toFixed(4) : '-'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {t?.prices.government_funds !== undefined && t?.prices.government_funds !== null ? Number(t.prices.government_funds).toFixed(4) : '-'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {item.mode}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
