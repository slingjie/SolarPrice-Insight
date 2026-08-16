import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  Edit3,
  Clock,
  Camera,
  FileSpreadsheet,
  Check,
  BatteryCharging,
  Layers,
  Sparkles,
  ChevronRight,
  TrendingDown,
  SunMedium
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  Cell
} from 'recharts';
import { TariffData, PriceSchema, TimeRule, TimeType } from '../types';
import { getTypeColor, getTypeLabel } from '../constants';
import { resolveEffectiveTimeRules } from '../utils/pwaTariffResolver';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

interface AnalysisProps {
  tariffs: TariffData[];
  target: { province: string; category: string; voltage: string };
  onBack: () => void;
  onUpdateTariffs: (tariffs: TariffData[]) => void;
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

export const AnalysisView: React.FC<AnalysisProps> = ({ tariffs, target, onBack, onUpdateTariffs }) => {
  // 截图容器引用与状态
  const trendCaptureRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<{ title: string; desc: string } | null>(null);

  const showToast = (title: string, desc: string) => {
    setToastMsg({ title, desc });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 1. 过滤并基于 month 去重，按月份正序排列
  const seriesData = useMemo(() => {
    const matched = tariffs
      .filter(
        (t) =>
          t.province === target.province &&
          t.category === target.category &&
          t.voltage_level === target.voltage,
      )
      .sort((a, b) => a.month.localeCompare(b.month));

    // 基于月份去重（保留最新记录）
    const monthMap = new Map<string, TariffData>();
    matched.forEach((item) => {
      monthMap.set(item.month, item);
    });

    return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [tariffs, target]);

  // 可选年份列表
  const availableYears = useMemo(() => {
    return Array.from(
      new Set(seriesData.map((item) => item.month.match(/^(\d{4})-/)?.[1] || '').filter(Boolean)),
    ).sort();
  }, [seriesData]);

  const [selectedYears, setSelectedYears] = useState<string[]>([]);

  useEffect(() => {
    setSelectedYears(availableYears);
  }, [availableYears]);

  // 按年份过滤的序列数据
  const filteredSeriesData = useMemo(() => {
    if (selectedYears.length === 0) return seriesData;
    return seriesData.filter((item) => {
      const year = item.month.match(/^(\d{4})-/)?.[1] || '';
      return selectedYears.includes(year);
    });
  }, [seriesData, selectedYears]);

  // 趋势图数据结构
  const filteredTrendData = useMemo(() => {
    return filteredSeriesData.map((t) => ({
      month: t.month,
      year: t.month.match(/^(\d{4})-/)?.[1] || '--',
      tip: t.prices.tip ?? null,
      peak: t.prices.peak ?? null,
      flat: t.prices.flat ?? null,
      valley: t.prices.valley ?? null,
      deep: t.prices.deep ?? null,
    }));
  }, [filteredSeriesData]);

  // 当前选中的月份
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null);

  useEffect(() => {
    if (filteredSeriesData.length > 0) {
      if (!selectedMonthId || !filteredSeriesData.some((t) => t.id === selectedMonthId)) {
        // 默认聚焦最新一条
        setSelectedMonthId(filteredSeriesData[filteredSeriesData.length - 1].id);
      }
    }
  }, [filteredSeriesData, selectedMonthId]);

  const selectedTariff = filteredSeriesData.find((t) => t.id === selectedMonthId) || filteredSeriesData[filteredSeriesData.length - 1] || null;

  // 2. 计算 4 大年度宏观统计指标
  const annualMetrics = useMemo(() => {
    if (filteredSeriesData.length === 0) {
      return { maxTip: 0, minValley: 0, maxSpread: 0, goldenMonths: 0 };
    }
    let maxTip = 0;
    let minValley = Infinity;
    let maxSpread = 0;
    let goldenMonths = 0;

    filteredSeriesData.forEach((t) => {
      const p = t.prices;
      if (p.tip && p.tip > maxTip) maxTip = p.tip;
      if (p.peak && !p.tip && p.peak > maxTip) maxTip = p.peak;
      if (p.valley !== undefined && p.valley !== null && p.valley < minValley) minValley = p.valley;

      const valid = [p.tip, p.peak, p.flat, p.valley, p.deep].filter((v): v is number => typeof v === 'number' && v > 0);
      if (valid.length >= 2) {
        const spread = Math.max(...valid) - Math.min(...valid);
        if (spread > maxSpread) maxSpread = spread;
        if (spread >= 0.7) goldenMonths += 1;
      }
    });

    return {
      maxTip,
      minValley: minValley === Infinity ? 0 : minValley,
      maxSpread,
      goldenMonths,
    };
  }, [filteredSeriesData]);

  // 3. 当前选中月份的 24H 连续谱带与曲线数据
  const selectedHourlyData = useMemo(() => {
    if (!selectedTariff) return [];
    const { rules } = resolveEffectiveTimeRules(selectedTariff, []);
    const hourlyTypes = buildHourlyTypes(rules);

    return hourlyTypes.map((type, hour) => {
      let effType = type;
      if (effType === 'tip' && (selectedTariff.prices.tip === undefined || selectedTariff.prices.tip === null)) {
        effType = 'peak';
      }
      if (effType === 'deep' && (selectedTariff.prices.deep === undefined || selectedTariff.prices.deep === null)) {
        effType = 'valley';
      }
      const startH = hour.toString().padStart(2, '0');
      const endH = (hour + 1).toString().padStart(2, '0');
      return {
        hour: `${startH}:00`,
        range: `${startH}:00~${endH}:00`,
        shortRange: `${startH}-${endH}`,
        value: selectedTariff.prices[effType] ?? 0,
        type: effType,
        color: getTypeColor(effType),
        label: getTypeLabel(effType),
      };
    });
  }, [selectedTariff]);

  // 价格行内微调保存
  const handlePriceChange = (id: string, type: keyof PriceSchema, value: string) => {
    const numVal = parseFloat(value);
    if (isNaN(numVal)) return;
    const updated = tariffs.map((t) => (t.id === id ? { ...t, prices: { ...t.prices, [type]: numVal } } : t));
    onUpdateTariffs(updated);
  };

  // 🌟 功能 1：一键截图导出年度趋势图 (PNG)
  const handleCaptureTrend = async () => {
    if (!trendCaptureRef.current) return;
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(trendCaptureRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${target.province}_${target.category}_年度多轨电价走势图.png`;
      link.href = imgData;
      link.click();
      showToast('趋势图已导出', `已成功保存 ${target.province} 年度电价趋势图 (PNG)`);
    } catch (err) {
      console.error(err);
      alert('截图生成失败');
    } finally {
      setIsCapturing(false);
    }
  };

  // 🌟 功能 2：导出该省全量历史月度分时数据 (Excel)
  const handleExportProvinceExcel = () => {
    if (seriesData.length === 0) {
      alert('暂无数据可供导出');
      return;
    }

    // Sheet 1: 历史各月电价与成本分项
    const monthlySummary = seriesData.map((t) => {
      const p = t.prices;
      const valid = [p.tip, p.peak, p.flat, p.valley, p.deep].filter((v): v is number => typeof v === 'number' && v > 0);
      const maxSpread = valid.length >= 2 ? (Math.max(...valid) - Math.min(...valid)).toFixed(4) : '';

      return {
        省份: t.province,
        执行月份: t.month,
        用电类别: t.category,
        电压等级: t.voltage_level,
        '尖峰电价(元/kWh)': p.tip !== undefined && p.tip !== null ? p.tip.toFixed(4) : '无',
        '高峰电价(元/kWh)': p.peak !== undefined && p.peak !== null ? p.peak.toFixed(4) : '',
        '平段电价(元/kWh)': p.flat !== undefined && p.flat !== null ? p.flat.toFixed(4) : '',
        '低谷电价(元/kWh)': p.valley !== undefined && p.valley !== null ? p.valley.toFixed(4) : '',
        '深谷电价(元/kWh)': p.deep !== undefined && p.deep !== null ? p.deep.toFixed(4) : '无',
        '最大峰谷价差(元/kWh)': maxSpread,
        '代理购电/上网(元/kWh)': p.purchase_agent ?? '',
        '输配电价(元/kWh)': p.transmission_distribution ?? '',
        '上网线损(元/kWh)': p.line_loss ?? '',
        '系统运行费(元/kWh)': p.system_cost ?? '',
        '政府性基金及附加(元/kWh)': p.government_funds ?? '',
        政策文号: t.policy_code ?? '',
      };
    });

    // Sheet 2: 历史各月 24H 逐时时段表
    const hourly24Months: Record<string, any>[] = [];
    seriesData.forEach((t) => {
      const { rules } = resolveEffectiveTimeRules(t, []);
      const types = buildHourlyTypes(rules);

      const typeRow: Record<string, any> = { 省份: t.province, 执行月份: t.month, 数据类型: '分时类型' };
      const priceRow: Record<string, any> = { 省份: t.province, 执行月份: t.month, 数据类型: '小时电价(元/kWh)' };

      for (let h = 0; h < 24; h++) {
        const startH = h.toString().padStart(2, '0');
        const endH = (h + 1).toString().padStart(2, '0');
        const rangeKey = `${startH}:00~${endH}:00`;

        let effType = types[h];
        if (effType === 'tip' && (t.prices.tip === undefined || t.prices.tip === null)) effType = 'peak';
        if (effType === 'deep' && (t.prices.deep === undefined || t.prices.deep === null)) effType = 'valley';

        typeRow[rangeKey] = getTypeLabel(effType);
        priceRow[rangeKey] = t.prices[effType] ? t.prices[effType]?.toFixed(4) : '';
      }
      hourly24Months.push(typeRow);
      hourly24Months.push(priceRow);
    });

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(monthlySummary);
    XLSX.utils.book_append_sheet(wb, ws1, '历史月度分时电价与成本');
    const ws2 = XLSX.utils.json_to_sheet(hourly24Months);
    XLSX.utils.book_append_sheet(wb, ws2, '历史月度24小时逐时时段');

    const fileName = `${target.province}_${target.category}_全量历史分时电价数据表.xlsx`;
    XLSX.writeFile(wb, fileName);
    showToast('Excel 数据已导出', `已成功生成 ${target.province} 历史月度完整分时电价表`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Toast 提示浮窗 */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 glass-panel px-4 py-3 rounded-2xl shadow-xl border border-emerald-200 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
            <Check size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">{toastMsg.title}</div>
            <div className="text-[11px] text-slate-500">{toastMsg.desc}</div>
          </div>
        </div>
      )}

      {/* 🌟 1. 顶部现代化导航与标题栏 */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-xs font-semibold text-slate-700 shadow-sm transition-all group"
          >
            <ArrowLeft size={16} className="text-slate-400 group-hover:text-indigo-600" />
            <span>返回工作台</span>
          </button>

          <div className="h-5 w-px bg-slate-200"></div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                {target.province} · 年度分时电价深度穿透分析
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                深度穿透
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span className="font-medium bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">{target.category}</span>
              <span className="font-medium bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">{target.voltage}</span>
              <span className="text-[11px] text-slate-400">共收录 {seriesData.length} 个历史执行月份</span>
            </div>
          </div>
        </div>

        {/* 顶部右侧导出按钮 */}
        <button
          onClick={handleExportProvinceExcel}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-emerald-200 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 shadow-sm transition-all group"
          title="导出该省份全部历史月份分时电价与时段数据表"
        >
          <div className="w-4 h-4 rounded bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <FileSpreadsheet size={12} />
          </div>
          <span>导出该省全量历史数据 (Excel)</span>
        </button>
      </div>

      {/* 🌟 2. 4 大年度宏观统计指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">全年最高尖峰电价</span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
              峰值
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {annualMetrics.maxTip > 0 ? annualMetrics.maxTip.toFixed(4) : '--'}
            </span>
            <span className="text-xs font-medium text-slate-400">元/kWh</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>夏/冬季最高尖峰时段</span>
            <span className="text-rose-600 font-semibold flex items-center gap-0.5">
              <TrendingUp size={12} /> 尖峰高位
            </span>
          </div>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-rose-500/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">全年最低低谷电价</span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
              谷值
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {annualMetrics.minValley > 0 ? annualMetrics.minValley.toFixed(4) : '--'}
            </span>
            <span className="text-xs font-medium text-slate-400">元/kWh</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>夜间/春季深谷低谷</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingDown size={12} /> 谷电基准
            </span>
          </div>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden border-indigo-200/80 bg-gradient-to-b from-white/90 to-indigo-50/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">全年最大峰谷套利空间</span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
              储能极限
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-indigo-600 tracking-tight tabular-nums">
              {annualMetrics.maxSpread > 0 ? annualMetrics.maxSpread.toFixed(4) : '--'}
            </span>
            <span className="text-xs font-medium text-slate-400">元/kWh</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">套利黄金月份数</span>
            <span className="text-indigo-600 font-bold">{annualMetrics.goldenMonths} 个月 &gt; 0.7元</span>
          </div>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>
        </div>

        <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">月度连续样本总数</span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
              样本完整
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {filteredSeriesData.length}
            </span>
            <span className="text-xs font-medium text-slate-400">个自然月</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>跨度: {filteredSeriesData[0]?.month || '--'} ~ {filteredSeriesData[filteredSeriesData.length - 1]?.month || '--'}</span>
            <span className="text-blue-600 font-semibold">100% 去重</span>
          </div>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none"></div>
        </div>
      </div>

      {/* 🌟 3. 年度多轨电价走势大卡片 */}
      <div ref={trendCaptureRef} className="glass-panel p-6 rounded-2xl space-y-5 bg-white border border-slate-200/90 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-600" />
              <span>年度多轨电价变迁走势 (Annual Multi-Track Trends)</span>
            </h3>
            {/* 年份切换胶囊 */}
            <div className="flex items-center gap-1.5">
              {availableYears.map((year) => {
                const enabled = selectedYears.includes(year);
                return (
                  <button
                    key={year}
                    onClick={() => {
                      setSelectedYears((prev) =>
                        prev.includes(year) ? prev.filter((item) => item !== year) : [...prev, year].sort(),
                      );
                    }}
                    className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${
                      enabled
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm'
                        : 'bg-slate-100 text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {year} 年度
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 图例 */}
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e11d48]"></span> 尖峰
              </span>
              <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]"></span> 高峰
              </span>
              <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]"></span> 平段
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]"></span> 谷段
              </span>
            </div>

            {/* 截图按钮 */}
            <button
              onClick={handleCaptureTrend}
              disabled={isCapturing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 text-xs font-semibold transition-all shadow-sm group"
              title="下载年度走势高清图"
            >
              <Camera size={14} className="text-slate-500 group-hover:text-indigo-600" />
              <span>{isCapturing ? '生成中...' : '下载趋势截图'}</span>
            </button>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => v.toFixed(2)} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl space-y-1">
                        <div className="font-bold text-slate-200 pb-1 border-b border-slate-700 mb-1">{label} 电价走势</div>
                        {payload.map((entry: any, i: number) => {
                          if (entry.value === null || entry.value === undefined) return null;
                          return (
                            <div key={i} className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5 text-slate-300">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span>{entry.name}:</span>
                              </span>
                              <span className="font-bold text-white tabular-nums">{Number(entry.value).toFixed(4)} 元/kWh</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line type="monotone" dataKey="tip" name="尖峰" stroke="#e11d48" strokeWidth={2.5} dot={{ r: 4, fill: '#e11d48' }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="peak" name="高峰" stroke="#d97706" strokeWidth={2.5} dot={{ r: 4, fill: '#d97706' }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="flat" name="平段" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="valley" name="低谷" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4, fill: '#16a34a' }} activeDot={{ r: 6 }} />
              {filteredTrendData.some((d) => d.deep !== null) && (
                <Line type="monotone" dataKey="deep" name="深谷" stroke="#9333ea" strokeWidth={2.5} dot={{ r: 4, fill: '#9333ea' }} activeDot={{ r: 6 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🌟 4. 下半区两栏：左栏月度明细与调价 + 右栏 24H 连续谱带与 6+2 成本拆解 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左栏：月度电价明细与微调 (5列) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl flex flex-col h-[560px] overflow-hidden space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Edit3 size={16} className="text-indigo-600" />
              <span>月度电价明细与调价记录</span>
            </h3>
            <span className="text-[11px] text-slate-400">点击行联动右侧 24H 谱带</span>
          </div>

          <div className="flex-1 overflow-auto rounded-xl border border-slate-200/80 custom-scrollbar">
            <table className="w-full text-xs text-left relative border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 z-10 shadow-sm border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">月份</th>
                  <th className="py-2.5 px-2 text-right text-rose-600">尖峰</th>
                  <th className="py-2.5 px-2 text-right text-amber-600">高峰</th>
                  <th className="py-2.5 px-2 text-right text-blue-600">平段</th>
                  <th className="py-2.5 px-2 text-right text-emerald-600">低谷</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSeriesData.map((t) => {
                  const isSelected = selectedTariff && selectedTariff.id === t.id;
                  return (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedMonthId(t.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-50/90 font-bold border-l-4 border-indigo-600'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold text-slate-800 tabular-nums">{t.month}</td>
                      {['tip', 'peak', 'flat', 'valley'].map((type) => (
                        <td key={type} className="py-2 px-1 text-right">
                          <input
                            type="number"
                            step="0.0001"
                            value={t.prices[type as keyof PriceSchema] ?? ''}
                            onChange={(e) => handlePriceChange(t.id, type as keyof PriceSchema, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-16 text-right bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:outline-none px-1 py-0.5 rounded text-xs tabular-nums"
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 右栏：选中月份 24H 连续谱带与 6+2 成本拆解 (7列) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl flex flex-col h-[560px] overflow-y-auto custom-scrollbar space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock size={16} className="text-indigo-600" />
              <span>{selectedTariff ? selectedTariff.month : '--'} 分时谱带与 6+2 成本拆解</span>
            </h3>
            {selectedTariff && (
              <span className="text-xs font-semibold text-indigo-600">
                {target.province} · {selectedTariff.category}
              </span>
            )}
          </div>

          {selectedTariff ? (
            <div className="space-y-4">
              {/* 24H 连续分时谱带 (00-01 ~ 23-24) */}
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center justify-between">
                  <span>24H 连续时段谱带 (00:00~01:00 至 23:00~24:00)</span>
                  <span className="text-[11px] text-slate-400 font-normal">悬浮查看该小时区间详情</span>
                </div>

                <div
                  className="grid grid-cols-24 gap-1 p-2 rounded-xl bg-slate-100/80 border border-slate-200/70"
                  style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}
                >
                  {selectedHourlyData.map((item, idx) => {
                    const isSharp = item.type === 'tip' || (item.type as string) === 'sharp';
                    const isPeak = item.type === 'peak';
                    const isFlat = item.type === 'flat';
                    const isValley = item.type === 'valley';
                    const isDeep = item.type === 'deep';

                    let bgClass = 'bg-slate-200 border-slate-300';
                    let textClass = 'text-slate-700';
                    if (isSharp) {
                      bgClass = 'bg-rose-100 border-rose-200 hover:bg-rose-200';
                      textClass = 'text-rose-700';
                    } else if (isPeak) {
                      bgClass = 'bg-amber-100 border-amber-200 hover:bg-amber-200';
                      textClass = 'text-amber-700';
                    } else if (isFlat) {
                      bgClass = 'bg-blue-100 border-blue-200 hover:bg-blue-200';
                      textClass = 'text-blue-700';
                    } else if (isValley) {
                      bgClass = 'bg-emerald-100 border-emerald-200 hover:bg-emerald-200';
                      textClass = 'text-emerald-700';
                    } else if (isDeep) {
                      bgClass = 'bg-purple-100 border-purple-200 hover:bg-purple-200';
                      textClass = 'text-purple-700';
                    }

                    return (
                      <div
                        key={idx}
                        className={`group relative flex flex-col items-center justify-center py-2 px-0.5 rounded-lg border ${bgClass} hover:scale-105 hover:z-20 hover:shadow-lg transition-all cursor-pointer`}
                      >
                        <span className="text-[10px] font-bold tabular-nums tracking-tighter leading-tight text-slate-700">
                          {item.shortRange}
                        </span>
                        <span className={`text-[9px] ${textClass} font-bold mt-0.5 leading-none`}>
                          {item.label}
                        </span>

                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none w-28">
                          <div className="bg-slate-900 text-white text-[10px] py-1.5 px-2 rounded-lg shadow-xl text-center whitespace-nowrap">
                            <div className="font-bold text-slate-200">{item.range}</div>
                            <div className="text-indigo-300 font-extrabold mt-0.5">{item.value.toFixed(4)} 元/kWh</div>
                            <div className="text-[9px] text-slate-400 font-medium mt-0.5">{item.label}时段</div>
                          </div>
                          <div className="w-2 h-2 bg-slate-900 transform rotate-45 -mt-1"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 24H 走势曲线 (带分色圆点) */}
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selectedHourlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={2} tickLine={false} />
                    <YAxis
                      domain={[0, 'auto']}
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      tickFormatter={(v) => v.toFixed(2)}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-xl">
                              <div className="font-bold text-slate-200 mb-1">{d.range}</div>
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                <span className="text-slate-300">[{d.label}]</span>
                                <span className="font-bold text-white tabular-nums">{Number(d.value).toFixed(4)} 元/kWh</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={(props: any) => {
                        const { cx, cy, payload } = props;
                        return (
                          <circle
                            key={`dot-${cx}-${cy}`}
                            cx={cx}
                            cy={cy}
                            r={3.5}
                            fill={payload.color}
                            stroke="#ffffff"
                            strokeWidth={1.5}
                          />
                        );
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* 6+2 成本构成拆解表 */}
              <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-2.5">费用分项</th>
                      <th className="py-2 px-2">单价 (元/kWh)</th>
                      <th className="py-2 px-2.5">费用分项</th>
                      <th className="py-2 px-2">单价 (元/kWh)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-2 px-2.5 font-medium text-slate-500">代理购电/上网</td>
                      <td className="py-2 px-2 tabular-nums font-bold">{selectedTariff.prices.purchase_agent ?? '--'}</td>
                      <td className="py-2 px-2.5 font-medium text-slate-500">输配电价</td>
                      <td className="py-2 px-2 tabular-nums font-bold">{selectedTariff.prices.transmission_distribution ?? '--'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2.5 font-medium text-slate-500">上网线损</td>
                      <td className="py-2 px-2 tabular-nums font-bold">{selectedTariff.prices.line_loss ?? '--'}</td>
                      <td className="py-2 px-2.5 font-medium text-slate-500">系统运行费</td>
                      <td className="py-2 px-2 tabular-nums font-bold">{selectedTariff.prices.system_cost ?? '--'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2.5 font-medium text-slate-500">政府基金附加</td>
                      <td className="py-2 px-2 tabular-nums font-bold">{selectedTariff.prices.government_funds ?? '--'}</td>
                      <td className="py-2 px-2.5 font-medium text-slate-500">政策文号</td>
                      <td className="py-2 px-2 text-slate-400 truncate max-w-[120px]" title={selectedTariff.policy_code || ''}>
                        {selectedTariff.policy_code || '--'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              请选择月份查看详细分时与成本
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
