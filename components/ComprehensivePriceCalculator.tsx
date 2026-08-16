import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Calculator,
  Calendar,
  ArrowRight,
  Save,
  Trash2,
  Clock,
  TrendingUp,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Sun,
  Building,
  BatteryCharging,
  Globe,
  FileSpreadsheet,
  Camera,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { TariffData, SavedTimeRange, ComprehensiveResult, TimeConfig, TimeRule, TimeType } from '../types';
import { PROVINCES, getTypeColor, getTypeLabel } from '../constants';
import { getDatabase } from '../services/db';
import { calculateAveragePrice, CalculationResult } from '../services/priceCalculator';
import { resolveTimeConfigForMonth } from '../utils/timeConfigResolver';
import { normalizeProvinceName, provinceMatches } from '../utils/provinceNormalize';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  Cell
} from 'recharts';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

interface ComprehensivePriceCalculatorProps {
  tariffs: TariffData[];
  timeConfigs: TimeConfig[];
  onNavigate: (view: string) => void;
}

interface PriceResult extends CalculationResult {}

// 快捷时段预设
const PRESET_TIME_RANGES = [
  { label: '光伏黄金消纳', icon: Sun, start: '08:00', end: '16:00', desc: '8小时光伏自用黄金窗口' },
  { label: '工商业全日生产', icon: Building, start: '08:00', end: '18:00', desc: '日间10小时典型生产时段' },
  { label: '晚高峰放电', icon: BatteryCharging, start: '18:00', end: '22:00', desc: '晚间4小时储能放电窗口' },
  { label: '全天24小时', icon: Globe, start: '00:00', end: '24:00', desc: '全日24小时算术加权' },
];

export const ComprehensivePriceCalculator: React.FC<ComprehensivePriceCalculatorProps> = ({
  tariffs: allTariffs,
  timeConfigs,
  onNavigate,
}) => {
  const chartCaptureRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<{ title: string; desc: string } | null>(null);

  const showToast = (title: string, desc: string) => {
    setToastMsg({ title, desc });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 可用省份列表（去重与归一化）
  const activeProvinces = useMemo(() => {
    return Array.from(new Set(allTariffs.map((t) => t.province))).sort();
  }, [allTariffs]);

  const [formData, setFormData] = useState({
    province: activeProvinces[0] || '江苏',
    category: '',
    voltage: '',
    months: [] as string[],
    startTime: '08:00',
    endTime: '16:00',
  });

  // 当前省份的数据
  const provinceTariffs = useMemo(() => {
    return allTariffs.filter((t) => provinceMatches(t.province, formData.province));
  }, [allTariffs, formData.province]);

  // 动态级联可用选项
  const availableCategories = useMemo(() => {
    return Array.from(new Set(provinceTariffs.map((t) => t.category))).filter(Boolean).sort();
  }, [provinceTariffs]);

  const availableVoltages = useMemo(() => {
    return Array.from(
      new Set(provinceTariffs.filter((t) => t.category === formData.category).map((t) => t.voltage_level)),
    ).filter(Boolean).sort();
  }, [provinceTariffs, formData.category]);

  const availableMonths = useMemo(() => {
    return Array.from(
      new Set(
        provinceTariffs
          .filter((t) => t.category === formData.category && t.voltage_level === formData.voltage)
          .map((t) => t.month),
      ),
    ).sort().reverse();
  }, [provinceTariffs, formData.category, formData.voltage]);

  // 智能自动初始化与级联保护
  useEffect(() => {
    if (activeProvinces.length > 0 && !activeProvinces.some((p) => provinceMatches(p, formData.province))) {
      setFormData((prev) => ({ ...prev, province: activeProvinces[0] }));
    }
  }, [activeProvinces, formData.province]);

  useEffect(() => {
    if (availableCategories.length > 0 && (!formData.category || !availableCategories.includes(formData.category))) {
      setFormData((prev) => ({ ...prev, category: availableCategories[0] }));
    }
  }, [availableCategories, formData.category]);

  useEffect(() => {
    if (availableVoltages.length > 0 && (!formData.voltage || !availableVoltages.includes(formData.voltage))) {
      setFormData((prev) => ({ ...prev, voltage: availableVoltages[0] }));
    }
  }, [availableVoltages, formData.voltage]);

  useEffect(() => {
    if (availableMonths.length > 0 && formData.months.length === 0) {
      // 默认全选该组合的所有月份
      setFormData((prev) => ({ ...prev, months: availableMonths }));
    }
  }, [availableMonths, formData.months.length]);

  const [results, setResults] = useState<PriceResult[]>([]);
  const [calcMsg, setCalcMsg] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);

  // 执行综合电价计算
  const handleCalculate = () => {
    setCalcMsg(null);
    if (formData.months.length === 0) {
      setCalcMsg({ type: 'error', msg: '请至少选择一个执行月份' });
      return;
    }

    const selectedMonthSet = new Set(formData.months);
    const filteredTariffs = provinceTariffs.filter((t) => {
      if (t.category !== formData.category || t.voltage_level !== formData.voltage) return false;
      return selectedMonthSet.has(t.month);
    });

    if (filteredTariffs.length === 0) {
      setCalcMsg({ type: 'error', msg: '在所选参数与月份下未找到有效电价规则' });
      return;
    }

    const normalizedTariffs = filteredTariffs.map((tariff) => {
      if (Array.isArray(tariff.time_rules) && tariff.time_rules.length > 0) return tariff;
      const monthMatch = tariff.month.match(/-(\d{1,2})$/);
      const monthNum = monthMatch ? parseInt(monthMatch[1], 10) : 1;
      const yearMatch = tariff.month.match(/^(\d{4})-/);
      const yearNum = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();

      const resolved = resolveTimeConfigForMonth(timeConfigs, tariff.province, monthNum, yearNum);
      if (!resolved || resolved.timeRules.length === 0) return tariff;
      return { ...tariff, time_rules: resolved.timeRules };
    });

    const monthsToCalculate = Array.from(new Set<string>(normalizedTariffs.map((t) => t.month))).sort();
    const calcResults = calculateAveragePrice(
      normalizedTariffs,
      monthsToCalculate,
      formData.startTime,
      formData.endTime,
    );

    if (calcResults.length === 0) {
      setCalcMsg({ type: 'error', msg: '在所选时段内未找到有效的电价时段规则' });
    }
    setResults(calcResults);
  };

  // 依赖变动时自动触发计算
  useEffect(() => {
    if (formData.category && formData.voltage && formData.months.length > 0) {
      handleCalculate();
    }
  }, [formData.province, formData.category, formData.voltage, formData.months, formData.startTime, formData.endTime]);

  // 宏观统计结果
  const totalAvgPrice = useMemo(() => {
    if (results.length === 0) return 0;
    const totalValueSum = results.reduce((acc, curr) => acc + curr.avgPrice * curr.totalHours, 0);
    const totalHoursSum = results.reduce((acc, curr) => acc + curr.totalHours, 0);
    return totalHoursSum > 0 ? totalValueSum / totalHoursSum : 0;
  }, [results]);

  const averageHours = useMemo(() => {
    if (results.length === 0) return 0;
    return results.reduce((acc, curr) => acc + curr.totalHours, 0) / results.length;
  }, [results]);

  // 🌟 功能 1：一键截图导出综合电价图表 (PNG)
  const handleCaptureChart = async () => {
    if (!chartCaptureRef.current) return;
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(chartCaptureRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${formData.province}_${formData.category}_综合电价测算走势图.png`;
      link.href = imgData;
      link.click();
      showToast('测算图表已导出', `已成功保存 ${formData.province} 综合电价走势图 (PNG)`);
    } catch (err) {
      console.error(err);
      alert('图表截图生成失败');
    } finally {
      setIsCapturing(false);
    }
  };

  // 🌟 功能 2：导出月度综合电价测算明细报告 (Excel)
  const handleExportExcelReport = () => {
    if (results.length === 0) {
      alert('当前没有测算结果可供导出');
      return;
    }

    const reportRows = results.map((r) => {
      const details = r.details || [];
      const tipHours = details.filter((d) => d.type === 'tip').reduce((sum, d) => sum + d.hours, 0);
      const peakHours = details.filter((d) => d.type === 'peak').reduce((sum, d) => sum + d.hours, 0);
      const flatHours = details.filter((d) => d.type === 'flat').reduce((sum, d) => sum + d.hours, 0);
      const valleyHours = details.filter((d) => d.type === 'valley' || d.type === 'deep').reduce((sum, d) => sum + d.hours, 0);

      return {
        省份: formData.province,
        执行月份: r.month,
        用电类别: formData.category,
        电压等级: formData.voltage,
        测算时间窗口: `${formData.startTime} ~ ${formData.endTime}`,
        日均窗口时长: `${r.totalHours} 小时`,
        '月度综合加权电价(元/kWh)': r.avgPrice.toFixed(4),
        '尖峰时段时长(h)': tipHours,
        '高峰时段时长(h)': peakHours,
        '平段时段时长(h)': flatHours,
        '低谷/深谷时段时长(h)': valleyHours,
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(reportRows);
    XLSX.utils.book_append_sheet(wb, ws, '月度综合电价测算结果');

    const fileName = `${formData.province}_${formData.category}_综合电价(${formData.startTime}-${formData.endTime})测算报表.xlsx`;
    XLSX.writeFile(wb, fileName);
    showToast('测算报告已导出', `已成功生成 ${formData.province} 综合电价 Excel 测算报告`);
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

      {/* 🌟 1. 顶部 Header 与控制条 */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Calculator size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">月度综合电价测算引擎</h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                加权测算
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              支持按光伏消纳、企业生产、储能放电等自定义时间窗口进行精确加权计算
            </p>
          </div>
        </div>

        <button
          onClick={handleExportExcelReport}
          disabled={results.length === 0}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-emerald-200 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all group"
          title="导出当前综合电价测算明细报表"
        >
          <div className="w-4 h-4 rounded bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <FileSpreadsheet size={12} />
          </div>
          <span>导出测算结果 (Excel)</span>
        </button>
      </div>

      {/* 🌟 2. 4 大核心测算结果指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden border-indigo-200/80 bg-gradient-to-b from-white/90 to-indigo-50/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">加权综合电价</span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
              综合单价
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-indigo-600 tracking-tight tabular-nums">
              {totalAvgPrice > 0 ? totalAvgPrice.toFixed(4) : '--'}
            </span>
            <span className="text-xs font-medium text-slate-400">元/kWh</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">测算窗口: {formData.startTime} ~ {formData.endTime}</span>
            <span className="text-indigo-600 font-bold">全期均值</span>
          </div>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>
        </div>

        <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">日均测算时长</span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
              窗口覆盖
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {averageHours > 0 ? averageHours.toFixed(1) : '--'}
            </span>
            <span className="text-xs font-medium text-slate-400">小时/天</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>全天 24 小时占比</span>
            <span className="text-blue-600 font-semibold">{((averageHours / 24) * 100).toFixed(1)}%</span>
          </div>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">测算月份跨度</span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
              样本数
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {results.length}
            </span>
            <span className="text-xs font-medium text-slate-400">个自然月</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>{results[0]?.month || '--'} ~ {results[results.length - 1]?.month || '--'}</span>
            <span className="text-emerald-600 font-semibold">100% 规则覆盖</span>
          </div>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">最高/最低月单价</span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
              波动极差
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {results.length > 0 ? (Math.max(...results.map((r) => r.avgPrice)) - Math.min(...results.map((r) => r.avgPrice))).toFixed(4) : '--'}
            </span>
            <span className="text-xs font-medium text-slate-400">元/kWh</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>峰值月: {results.length > 0 ? Math.max(...results.map((r) => r.avgPrice)).toFixed(4) : '--'}</span>
            <span className="text-amber-600 font-semibold">谷值月: {results.length > 0 ? Math.min(...results.map((r) => r.avgPrice)).toFixed(4) : '--'}</span>
          </div>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
        </div>
      </div>

      {/* 🌟 3. 主操作区：左侧参数与时段窗口配置 + 右侧月度综合电价走势图 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧：参数与时间窗口 (5列) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-600 rounded-full"></span>
              <span>测算参数设置</span>
            </h3>
            <span className="text-[11px] text-slate-400">自动级联匹配</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* 省份选择 */}
            <div>
              <label className="font-bold text-slate-700 mb-1.5 block">目标省份</label>
              <select
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value, category: '', voltage: '', months: [] })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-indigo-500 focus:outline-none font-bold text-slate-800"
              >
                {activeProvinces.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* 用电类别与电压等级 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 mb-1.5 block">用电类别</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value, voltage: '', months: [] })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-indigo-500 focus:outline-none text-slate-800"
                >
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1.5 block">电压等级</label>
                <select
                  value={formData.voltage}
                  onChange={(e) => setFormData({ ...formData, voltage: e.target.value, months: [] })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-indigo-500 focus:outline-none text-slate-800"
                >
                  {availableVoltages.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 🌟 快捷时间窗口预设 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-700">测算时间窗口预设</label>
                <span className="text-[10px] text-indigo-600 font-semibold">一键应用</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_TIME_RANGES.map((preset) => {
                  const isMatch = formData.startTime === preset.start && formData.endTime === preset.end;
                  return (
                    <button
                      key={preset.label}
                      onClick={() => setFormData({ ...formData, startTime: preset.start, endTime: preset.end })}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isMatch
                          ? 'bg-indigo-50/90 text-indigo-700 border-indigo-200 font-bold shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <preset.icon size={13} className={isMatch ? 'text-indigo-600' : 'text-slate-400'} />
                        <span className="text-xs">{preset.label}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 tabular-nums">
                        {preset.start} ~ {preset.end}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 自定义时间输入 */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 mb-1 block">起始时间</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold tabular-nums focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 mb-1 block">结束时间</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold tabular-nums focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* 月份多选与快捷按钮 */}
            {availableMonths.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">执行月份筛选 ({formData.months.length}/{availableMonths.length})</label>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      onClick={() => setFormData({ ...formData, months: availableMonths })}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold"
                    >
                      全选
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, months: [] })}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                    >
                      清空
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto custom-scrollbar p-1">
                  {availableMonths.map((m) => {
                    const isSelected = formData.months.includes(m);
                    return (
                      <button
                        key={m}
                        onClick={() => {
                          if (isSelected) {
                            setFormData({ ...formData, months: formData.months.filter((x) => x !== m) });
                          } else {
                            setFormData({ ...formData, months: [...formData.months, m].sort() });
                          }
                        }}
                        className={`px-2.5 py-1 text-xs rounded-lg font-semibold tabular-nums transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：月度走势图与测算明细表 (7列) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 月度综合电价走势组合图 (Bar + Line) */}
          <div ref={chartCaptureRef} className="glass-panel p-6 rounded-2xl space-y-4 bg-white border border-slate-200/90 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 size={16} className="text-indigo-600" />
                  <span>月度综合加权电价走势</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {formData.province} · {formData.category} ({formData.startTime} ~ {formData.endTime})
                </p>
              </div>

              <button
                onClick={handleCaptureChart}
                disabled={isCapturing || results.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 text-xs font-semibold transition-all shadow-sm group"
                title="下载测算图表截图"
              >
                <Camera size={14} className="text-slate-500 group-hover:text-indigo-600" />
                <span>{isCapturing ? '生成中...' : '下载图表截图'}</span>
              </button>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={results} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
                  <YAxis
                    domain={[0, 'auto']}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickFormatter={(v) => v.toFixed(2)}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as PriceResult;
                        return (
                          <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl space-y-1">
                            <div className="font-bold text-slate-200 pb-1 border-b border-slate-700 mb-1">{label} 测算结果</div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-slate-300">加权综合电价:</span>
                              <span className="font-extrabold text-indigo-300 tabular-nums">{data.avgPrice.toFixed(4)} 元/kWh</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-slate-300">窗口有效时长:</span>
                              <span className="font-bold text-white tabular-nums">{data.totalHours} 小时/日</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="avgPrice" name="综合电价" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={28} />
                  <Line type="monotone" dataKey="avgPrice" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 4, fill: '#4f46e5' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 测算明细与时段构成拆解表 */}
          <div className="glass-panel p-6 rounded-2xl space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers size={16} className="text-indigo-600" />
                <span>月度测算明细与时段构成</span>
              </h3>
              <span className="text-xs text-slate-400">共 {results.length} 个月份样本</span>
            </div>

            <div className="overflow-x-auto max-h-64 custom-scrollbar rounded-xl border border-slate-200/80">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">执行月份</th>
                    <th className="py-2.5 px-3 text-right">加权综合单价</th>
                    <th className="py-2.5 px-2 text-right text-rose-600">尖峰(h)</th>
                    <th className="py-2.5 px-2 text-right text-amber-600">高峰(h)</th>
                    <th className="py-2.5 px-2 text-right text-blue-600">平段(h)</th>
                    <th className="py-2.5 px-2 text-right text-emerald-600">低谷(h)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {results.map((r) => {
                    const details = r.details || [];
                    const tipHours = details.filter((d) => d.type === 'tip').reduce((sum, d) => sum + d.hours, 0);
                    const peakHours = details.filter((d) => d.type === 'peak').reduce((sum, d) => sum + d.hours, 0);
                    const flatHours = details.filter((d) => d.type === 'flat').reduce((sum, d) => sum + d.hours, 0);
                    const valleyHours = details.filter((d) => d.type === 'valley' || d.type === 'deep').reduce((sum, d) => sum + d.hours, 0);

                    return (
                      <tr key={r.month} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-800 tabular-nums">{r.month}</td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-indigo-600 tabular-nums">
                          {r.avgPrice.toFixed(4)} <span className="text-[10px] text-slate-400 font-normal">元</span>
                        </td>
                        <td className="py-2.5 px-2 text-right tabular-nums font-semibold text-rose-600">{tipHours > 0 ? `${tipHours}h` : '-'}</td>
                        <td className="py-2.5 px-2 text-right tabular-nums font-semibold text-amber-600">{peakHours > 0 ? `${peakHours}h` : '-'}</td>
                        <td className="py-2.5 px-2 text-right tabular-nums font-semibold text-blue-600">{flatHours > 0 ? `${flatHours}h` : '-'}</td>
                        <td className="py-2.5 px-2 text-right tabular-nums font-semibold text-emerald-600">{valleyHours > 0 ? `${valleyHours}h` : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
