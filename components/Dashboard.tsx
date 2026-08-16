import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  RotateCcw,
  Filter,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
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
  ArrowRight,
  Camera,
  FileSpreadsheet,
  Check,
  Calendar,
  X,
  Maximize2,
  ExternalLink,
  Minus
} from 'lucide-react';
import { TariffData, ComprehensiveResult, TimeRule, TimeType } from '../types';
import { getTypeColor, getTypeLabel, PROVINCES } from '../constants';
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
import { normalizeProvinceName, provinceMatches } from '../utils/provinceNormalize';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

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

// 区域分组与Tab
const REGION_TABS = ['全部', '常用', '华东', '华南', '华北', '华中', '西南', '西北', '东北'];
const REGION_GROUPS: Record<string, string[]> = {
  常用: ['江苏', '浙江', '广东', '山东', '安徽', '上海', '北京'],
  华东: ['上海', '江苏', '浙江', '安徽', '福建', '江西', '山东'],
  华南: ['广东', '广西', '海南'],
  华北: ['北京', '天津', '河北', '冀北', '山西', '内蒙古'],
  华中: ['河南', '湖北', '湖南'],
  西南: ['重庆', '四川', '贵州', '云南', '西藏'],
  西北: ['陕西', '甘肃', '青海', '宁夏', '新疆'],
  东北: ['辽宁', '吉林', '黑龙江'],
};

export const Dashboard: React.FC<DashboardProps> = ({
  tariffs,
  onOpenAnalysis,
  onNavigate,
  selectedProvinces,
  onSelectedProvincesChange,
  calcCompPrice,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedVoltages, setSelectedVoltages] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [focusedTariffId, setFocusedTariffId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState<boolean>(false);

  // 下拉菜单浮层开闭状态
  const [openDropdown, setOpenDropdown] = useState<'province' | 'month' | 'category' | 'voltage' | null>(null);
  const [provinceSearch, setProvinceSearch] = useState<string>('');
  const [selectedRegionTab, setSelectedRegionTab] = useState<string>('全部');
  const [monthYearPicker, setMonthYearPicker] = useState<number>(() => new Date().getFullYear());

  // 截图区域引用与状态
  const captureZoneRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<{ title: string; desc: string } | null>(null);

  // 默认综合电价时间窗口：08:00 - 16:00 (光伏日间消纳黄金窗口)
  const [compStartTime, setCompStartTime] = useState<string>('08:00');
  const [compEndTime, setCompEndTime] = useState<string>('16:00');

  // 全局点击自动关闭所有下拉浮层
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const showToast = (title: string, desc: string) => {
    setToastMsg({ title, desc });
    setTimeout(() => {
      setToastMsg(null);
    }, 3500);
  };

  // 基础统计列表
  const uniqueProvinces = useMemo(() => Array.from(new Set(tariffs.map((t) => t.province))).sort(), [tariffs]);
  const uniqueCategories = useMemo(
    () => Array.from(new Set(tariffs.map((t) => t.category))).filter(Boolean).sort(),
    [tariffs],
  );
  const uniqueVoltages = useMemo(
    () => Array.from(new Set(tariffs.map((t) => t.voltage_level))).filter(Boolean).sort(),
    [tariffs],
  );
  const uniqueMonths = useMemo(
    () => Array.from(new Set(tariffs.map((t) => t.month))).filter(Boolean).sort().reverse(),
    [tariffs],
  );
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

  // 多维交叉过滤后的电价数据
  const filteredTariffs = useMemo(() => {
    const kw = searchKeyword.trim().toLowerCase();
    return tariffs
      .filter((t) => {
        const matchProvince =
          selectedProvinces.length === 0 ||
          selectedProvinces.some((sp) => provinceMatches(t.province, sp));
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
      const startH = hour.toString().padStart(2, '0');
      const endH = (hour + 1).toString().padStart(2, '0');
      return {
        hour: `${startH}:00`,
        range: `${startH}:00~${endH}:00`,
        shortRange: `${startH}-${endH}`,
        value: focusedTariff.prices[effectiveType] ?? 0,
        type: effectiveType,
        color: getTypeColor(effectiveType),
        label: getTypeLabel(effectiveType),
      };
    });
  }, [focusedTariff]);

  // 聚焦 Tariff 的最大峰谷价差
  const focusedMaxSpread = useMemo(() => {
    if (!focusedTariff) return null;
    const p = focusedTariff.prices;
    const valid = [p.tip, p.peak, p.flat, p.valley, p.deep].filter((v): v is number => typeof v === 'number' && v > 0);
    if (valid.length < 2) return null;
    return Math.max(...valid) - Math.min(...valid);
  }, [focusedTariff]);

  // 聚焦 Tariff 的综合电价计算（默认 08:00 - 16:00）
  const focusedCompPrice = useMemo(() => {
    if (!focusedTariff) return null;
    return calcCompPrice(focusedTariff, compStartTime, compEndTime);
  }, [focusedTariff, compStartTime, compEndTime, calcCompPrice]);

  // 储能充放电策略排程
  const storageStrategy = useMemo(() => {
    if (!focusedTariff || focusedHourlyData.length === 0) return null;

    const valleyBlocks: { start: number; end: number; type: TimeType; price: number }[] = [];
    const peakBlocks: { start: number; end: number; type: TimeType; price: number }[] = [];

    let cur: { start: number; end: number; kind: 'valley' | 'peak' | 'other'; type: TimeType; price: number } | null = null;

    for (let h = 0; h < 24; h++) {
      const item = focusedHourlyData[h];
      const isValley = item.type === 'valley' || item.type === 'deep';
      const isPeak = item.type === 'tip' || item.type === 'peak' || (item.type as string) === 'sharp';
      const kind = isValley ? 'valley' : isPeak ? 'peak' : 'other';

      if (!cur || cur.kind !== kind || cur.type !== item.type) {
        if (cur) {
          if (cur.kind === 'valley') valleyBlocks.push({ start: cur.start, end: cur.end, type: cur.type, price: cur.price });
          else if (cur.kind === 'peak') peakBlocks.push({ start: cur.start, end: cur.end, type: cur.type, price: cur.price });
        }
        cur = { start: h, end: h + 1, kind, type: item.type as TimeType, price: item.value };
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

  // 🌟 功能 1：24H 连续谱带与曲线图一键高清截图下载
  const handleCaptureSpectrumChart = async () => {
    if (!captureZoneRef.current) return;
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(captureZoneRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const provName = focusedTariff ? focusedTariff.province : '全部省份';
      const monthStr = focusedTariff ? focusedTariff.month : '分时电价';
      link.download = `${provName}_${monthStr}_24小时分时电价走势谱带图.png`;
      link.href = imgData;
      link.click();
      showToast('图表截图已导出', `已成功保存 ${provName} 24H 高清谱带与分色圆点走势图 (PNG)`);
    } catch (err) {
      console.error(err);
      alert('图表截图生成失败，请重试');
    } finally {
      setIsCapturing(false);
    }
  };

  // 🌟 功能 2：当前选择省份回溯最近连续 12 个月 Excel 导出
  const handleExportRecent12MonthsExcel = () => {
    if (!focusedTariff) {
      alert('当前没有选中的省份数据可供导出');
      return;
    }

    const province = focusedTariff.province;
    const category = focusedTariff.category;
    const voltage = focusedTariff.voltage_level;

    // 筛选出该省份、类别、电压等级的所有历史记录
    const matchingTariffs = tariffs
      .filter((t) => t.province === province && t.category === category && t.voltage_level === voltage)
      .sort((a, b) => b.month.localeCompare(a.month)); // 最新在前

    // 获取最近的 12 条记录（不足12个月则取全部已有记录），并按月份升序正序排列
    const targetTariffs = matchingTariffs.slice(0, 12).reverse();

    if (targetTariffs.length === 0) {
      alert(`未找到 ${province} 的历史分时电价记录`);
      return;
    }

    const startMonth = targetTariffs[0].month;
    const endMonth = targetTariffs[targetTariffs.length - 1].month;
    const rangeLabel = `${startMonth} ~ ${endMonth}`;

    // 1. 构造 Sheet 1: 12个月电价与成本分项
    const monthlySummary = targetTariffs.map((t) => {
      const p = t.prices;
      const valid = [p.tip, p.peak, p.flat, p.valley, p.deep].filter((v): v is number => typeof v === 'number' && v > 0);
      const maxSpread = valid.length >= 2 ? (Math.max(...valid) - Math.min(...valid)).toFixed(4) : '';
      const comp = calcCompPrice(t, compStartTime, compEndTime);

      return {
        省份: t.province,
        执行月份: t.month,
        用电类别: t.category,
        电压等级: t.voltage_level,
        [`综合电价(${compStartTime}-${compEndTime})`]: comp !== null ? comp.toFixed(4) : '',
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
        '需量电价(元/kW·月)': p.demand_charge ?? '',
        '容量电价(元/kVA·月)': p.capacity_charge ?? '',
        政策文号: t.policy_code ?? '',
      };
    });

    // 2. 构造 Sheet 2: 12个月 24 小时逐小时分时类型与小时电价
    const hourly24Months: Record<string, any>[] = [];
    targetTariffs.forEach((t) => {
      const { rules } = resolveEffectiveTimeRules(t, []);
      const types = buildHourlyTypes(rules);

      const typeRow: Record<string, any> = {
        省份: t.province,
        执行月份: t.month,
        数据类型: '分时类型',
      };
      const priceRow: Record<string, any> = {
        省份: t.province,
        执行月份: t.month,
        数据类型: '小时电价(元/kWh)',
      };

      for (let h = 0; h < 24; h++) {
        const startH = h.toString().padStart(2, '0');
        const endH = (h + 1).toString().padStart(2, '0');
        const rangeKey = `${startH}:00~${endH}:00`;

        let effType = types[h];
        if (effType === 'tip' && (t.prices.tip === undefined || t.prices.tip === null)) effType = 'peak';
        if (effType === 'deep' && (t.prices.deep === undefined || t.prices.deep === null)) effType = 'valley';

        const label = getTypeLabel(effType);
        const price = t.prices[effType] ?? 0;

        typeRow[rangeKey] = label;
        priceRow[rangeKey] = price > 0 ? price.toFixed(4) : '';
      }

      hourly24Months.push(typeRow);
      hourly24Months.push(priceRow);
    });

    // 3. 生成 Excel 工作簿
    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(monthlySummary);
    XLSX.utils.book_append_sheet(wb, ws1, '近12个月电价与成本分项');

    const ws2 = XLSX.utils.json_to_sheet(hourly24Months);
    XLSX.utils.book_append_sheet(wb, ws2, '近12个月24小时逐时时段表');

    const fileName = `${province}_近12个月(${startMonth}至${endMonth})分时电价与时段数据表.xlsx`;
    XLSX.writeFile(wb, fileName);

    showToast('Excel 数据已导出', `已成功生成 ${province} 最近 ${targetTariffs.length} 个月 (${rangeLabel}) 完整电价与时段表`);
  };

  // 重置筛选
  const resetFilters = () => {
    onSelectedProvincesChange([]);
    setSelectedCategories([]);
    setSelectedVoltages([]);
    setSelectedYears([]);
    setSelectedMonths([]);
    setSearchKeyword('');
  };

  // 过滤后的省份网格列表
  const displayedProvinces = useMemo(() => {
    const baseList = uniqueProvinces.length > 0 ? uniqueProvinces : PROVINCES;
    let list = baseList;
    if (selectedRegionTab !== '全部' && REGION_GROUPS[selectedRegionTab]) {
      const groupList = REGION_GROUPS[selectedRegionTab];
      list = baseList.filter((p) => groupList.some((target) => provinceMatches(p, target)));
    }
    if (provinceSearch.trim()) {
      const kw = provinceSearch.trim().toLowerCase();
      list = baseList.filter((p) => p.toLowerCase().includes(kw) || normalizeProvinceName(p).includes(kw));
    }
    return list;
  }, [uniqueProvinces, selectedRegionTab, provinceSearch]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
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

      {/* 🌟 1. 顶部通栏控制条 (全量筛选下拉展开 + 胶囊控件) */}
      <div className="sticky top-0 z-30 glass-panel rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-4 border border-slate-200/80 shadow-sm">
        {/* 左侧筛选下拉组 */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1.1 省份选择器 */}
          <div className="relative dropdown-container">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'province' ? null : 'province')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold shadow-sm transition-all ${
                selectedProvinces.length > 0
                  ? 'bg-indigo-50/90 text-indigo-700 border-indigo-200'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300'
              }`}
            >
              <MapPin size={14} className="text-indigo-600" />
              <span>{selectedProvinces.length === 0 ? '全部省份' : selectedProvinces.join(', ')}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {openDropdown === 'province' && (
              <div className="absolute top-full left-0 mt-2 w-80 glass-panel rounded-2xl p-3 shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="relative mb-2.5">
                  <Search size={14} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={provinceSearch}
                    onChange={(e) => setProvinceSearch(e.target.value)}
                    placeholder="搜索省份..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                  {provinceSearch && (
                    <button onClick={() => setProvinceSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* 区域切换 */}
                {!provinceSearch && (
                  <div className="flex items-center gap-1 pb-2 mb-2 border-b border-slate-100 overflow-x-auto text-[11px]">
                    {REGION_TABS.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setSelectedRegionTab(tab)}
                        className={`px-2 py-0.5 rounded-lg whitespace-nowrap transition-colors ${
                          selectedRegionTab === tab ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                )}

                {/* 全部清除 / 全选 */}
                <div className="flex items-center justify-between px-1 mb-2 text-[11px]">
                  <button
                    onClick={() => {
                      onSelectedProvincesChange([]);
                      setOpenDropdown(null);
                    }}
                    className={`font-semibold ${selectedProvinces.length === 0 ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    全部省份
                  </button>
                  {selectedProvinces.length > 0 && (
                    <button onClick={() => onSelectedProvincesChange([])} className="text-rose-500 hover:underline">
                      清空选择
                    </button>
                  )}
                </div>

                {/* 省份网格 */}
                <div className="max-h-56 overflow-y-auto custom-scrollbar grid grid-cols-3 gap-1.5 p-1 text-xs">
                  {displayedProvinces.map((p) => {
                    const isSelected = selectedProvinces.includes(p);
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          onSelectedProvincesChange([p]);
                          setOpenDropdown(null);
                        }}
                        className={`py-1.5 px-2 rounded-xl text-left truncate transition-all ${
                          isSelected ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 1.2 执行月份选择器 */}
          <div className="relative dropdown-container">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'month' ? null : 'month')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold shadow-sm transition-all ${
                selectedMonths.length > 0
                  ? 'bg-indigo-50/90 text-indigo-700 border-indigo-200'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300'
              }`}
            >
              <Calendar size={14} className="text-indigo-600" />
              <span>{selectedMonths.length === 0 ? '全部月份' : selectedMonths.join(', ')}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {openDropdown === 'month' && (
              <div className="absolute top-full left-0 mt-2 w-72 glass-panel rounded-2xl p-3 shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <button
                    onClick={() => setMonthYearPicker((y) => y - 1)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-xs font-bold text-slate-800">{monthYearPicker} 年度</span>
                  <button
                    onClick={() => setMonthYearPicker((y) => y + 1)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="flex items-center justify-between px-1 mb-2 text-[11px]">
                  <button
                    onClick={() => {
                      setSelectedMonths([]);
                      setOpenDropdown(null);
                    }}
                    className={`font-semibold ${selectedMonths.length === 0 ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    全部月份
                  </button>
                  {selectedMonths.length > 0 && (
                    <button onClick={() => setSelectedMonths([])} className="text-rose-500 hover:underline">
                      清空
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-xs text-center">
                  {Array.from({ length: 12 }, (_, i) => {
                    const mNum = String(i + 1).padStart(2, '0');
                    const monthKey = `${monthYearPicker}-${mNum}`;
                    const hasData = uniqueMonths.includes(monthKey);
                    const isSelected = selectedMonths.includes(monthKey);

                    return (
                      <button
                        key={monthKey}
                        disabled={!hasData}
                        onClick={() => {
                          setSelectedMonths([monthKey]);
                          setOpenDropdown(null);
                        }}
                        className={`py-2 rounded-xl font-medium transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20'
                            : hasData
                            ? 'hover:bg-slate-100 text-slate-700'
                            : 'text-slate-300 cursor-not-allowed'
                        }`}
                      >
                        {mNum}月
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-slate-200"></div>

          {/* 1.3 用电类别下拉 */}
          <div className="relative dropdown-container">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold shadow-sm transition-all ${
                selectedCategories.length > 0
                  ? 'bg-indigo-50/90 text-indigo-700 border-indigo-200'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300'
              }`}
            >
              <span className="text-slate-400 font-normal">类别:</span>
              <span>{selectedCategories.length === 0 ? '全部类别' : selectedCategories.join(', ')}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {openDropdown === 'category' && (
              <div className="absolute top-full left-0 mt-2 w-56 glass-panel rounded-2xl p-2 shadow-2xl border border-slate-200 z-50 space-y-1 text-xs animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl font-semibold flex items-center justify-between ${
                    selectedCategories.length === 0 ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>全部类别</span>
                  {selectedCategories.length === 0 && <Check size={14} />}
                </button>
                {uniqueCategories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategories([cat]);
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl font-semibold flex items-center justify-between ${
                        isSelected ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      {isSelected && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 1.4 电压等级下拉 */}
          <div className="relative dropdown-container">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'voltage' ? null : 'voltage')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold shadow-sm transition-all ${
                selectedVoltages.length > 0
                  ? 'bg-indigo-50/90 text-indigo-700 border-indigo-200'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300'
              }`}
            >
              <span className="text-slate-400 font-normal">电压:</span>
              <span>{selectedVoltages.length === 0 ? '全部电压' : selectedVoltages.join(', ')}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {openDropdown === 'voltage' && (
              <div className="absolute top-full left-0 mt-2 w-52 glass-panel rounded-2xl p-2 shadow-2xl border border-slate-200 z-50 space-y-1 text-xs animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setSelectedVoltages([]);
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl font-semibold flex items-center justify-between ${
                    selectedVoltages.length === 0 ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>全部电压等级</span>
                  {selectedVoltages.length === 0 && <Check size={14} />}
                </button>
                {uniqueVoltages.map((volt) => {
                  const isSelected = selectedVoltages.includes(volt);
                  return (
                    <button
                      key={volt}
                      onClick={() => {
                        setSelectedVoltages([volt]);
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl font-semibold flex items-center justify-between ${
                        isSelected ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="truncate">{volt}</span>
                      {isSelected && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 右侧导出与工具组 */}
        <div className="flex items-center gap-2.5">
          {/* 🌟 核心功能 2：当前省份回溯最近 12 个月 Excel 下载按钮 */}
          <button
            onClick={handleExportRecent12MonthsExcel}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-emerald-200 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 shadow-sm transition-all group"
            title="默认按当前所选月份回溯导出最近连续12个月电价与分时时段数据"
          >
            <div className="w-4 h-4 rounded bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <FileSpreadsheet size={12} />
            </div>
            <span>导出该省近 12 个月数据 (Excel)</span>
          </button>

          <button
            onClick={() => setShowMap(!showMap)}
            className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
              showMap ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="全国电价热力地图"
          >
            <MapPin size={16} />
          </button>

          {(selectedProvinces.length > 0 ||
            selectedCategories.length > 0 ||
            selectedVoltages.length > 0 ||
            selectedMonths.length > 0 ||
            searchKeyword) && (
            <button
              onClick={resetFilters}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="重置所有筛选"
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 地图热力透视（如果开启） */}
      {showMap && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin size={16} className="text-indigo-600" />
              <span>全国分时电价热力地图透视</span>
            </h3>
            <span className="text-xs text-slate-400">点击地图省份可直接联动下方面板</span>
          </div>
          <ChinaMap
            tariffs={tariffs}
            selectedProvince={focusedTariff ? focusedTariff.province : ''}
            onSelectProvince={(p) => {
              onSelectedProvincesChange([p]);
            }}
          />
        </div>
      )}

      {/* 🌟 2. 核心关键指标卡片 (Metric Cards with Glass Effect) */}
      {focusedTariff ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* 卡片 1: 最高尖峰电价 */}
          <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">最高尖峰电价</span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                尖峰
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {focusedTariff.prices.tip !== undefined && focusedTariff.prices.tip !== null
                  ? focusedTariff.prices.tip.toFixed(4)
                  : (focusedTariff.prices.peak ?? 0).toFixed(4)}
              </span>
              <span className="text-xs font-medium text-slate-400">元/kWh</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
              <span>{focusedTariff.province} · {focusedTariff.category}</span>
              <span className="text-rose-600 font-semibold flex items-center gap-0.5">
                <TrendingUp size={12} /> 尖峰执行
              </span>
            </div>
            <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-rose-500/5 rounded-full blur-xl pointer-events-none"></div>
          </div>

          {/* 卡片 2: 最低低谷电价 */}
          <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">最低低谷电价</span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                谷段
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {(focusedTariff.prices.valley ?? 0).toFixed(4)}
              </span>
              <span className="text-xs font-medium text-slate-400">元/kWh</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
              <span>夜间基准谷电</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                <Minus size={12} /> 谷段低谷
              </span>
            </div>
            <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
          </div>

          {/* 卡片 3: 最大峰谷套利价差 */}
          <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden border-indigo-200/80 bg-gradient-to-b from-white/90 to-indigo-50/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">最大峰谷套利价差</span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                储能套利
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-indigo-600 tracking-tight tabular-nums">
                {focusedMaxSpread !== null ? focusedMaxSpread.toFixed(4) : '--'}
              </span>
              <span className="text-xs font-medium text-slate-400">元/kWh</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">
                策略: <b className="text-slate-700">{storageStrategy ? storageStrategy.mode : '--'}</b>
              </span>
              <span className="text-indigo-600 font-bold">
                {focusedMaxSpread && focusedMaxSpread >= 0.7 ? '具备套利空间' : '套利较薄'}
              </span>
            </div>
            <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>
          </div>

          {/* 卡片 4: 综合加权均价 */}
          <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                综合均价 ({compStartTime}-{compEndTime})
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                消纳窗口
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {focusedCompPrice !== null ? focusedCompPrice.toFixed(4) : '--'}
              </span>
              <span className="text-xs font-medium text-slate-400">元/kWh</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
              <span>平段基准: {(focusedTariff.prices.flat ?? 0).toFixed(4)}</span>
              <span className="text-amber-600 font-semibold">自发自用收益</span>
            </div>
            <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-2xl text-center text-slate-400">
          暂无匹配的电价数据，请调整筛选条件
        </div>
      )}

      {/* 🌟 3. 24小时连续分时色谱与走势图主卡片 (支持一键高清截图导出) */}
      {focusedTariff && (
        <div
          ref={captureZoneRef}
          className="glass-panel p-6 rounded-2xl space-y-5 bg-white border border-slate-200/90 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>24小时分时时段色谱与电价走势</span>
                <span className="text-xs font-normal text-slate-400">
                  {focusedTariff.province} · {focusedTariff.month} ({focusedTariff.category} {focusedTariff.voltage_level})
                </span>
              </h2>
            </div>

            {/* 右侧工具栏：图例 + 截图下载 */}
            <div className="flex items-center gap-3">
              {/* 图例 */}
              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e11d48] shadow-sm"></span> 尖峰
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d97706] shadow-sm"></span> 高峰
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb] shadow-sm"></span> 平段
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a] shadow-sm"></span> 谷段
                </span>
                {focusedTariff.prices.deep && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#9333ea] shadow-sm"></span> 深谷
                  </span>
                )}
              </div>

              {/* 🌟 核心功能 1：截图下载按钮 */}
              <button
                onClick={handleCaptureSpectrumChart}
                disabled={isCapturing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 text-xs font-semibold transition-all shadow-sm group"
                title="下载 24H 谱带与走势图高清 PNG 图片"
              >
                <Camera size={14} className="text-slate-500 group-hover:text-indigo-600" />
                <span>{isCapturing ? '生成中...' : '下载图表截图'}</span>
              </button>
            </div>
          </div>

          {/* 🌟 24小时连续时段谱带 (00-01 至 23-24，带 Hover 卡片) */}
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>24H 连续分时状态谱带</span>
                <span className="text-[11px] text-slate-400 font-normal">(按 00:00~01:00 至 23:00~24:00 顺次排列)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">鼠标悬浮可查看完整时段区间与电价</span>
            </div>

            <div
              className="grid grid-cols-24 gap-1 p-2 rounded-xl bg-slate-100/80 border border-slate-200/70"
              style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}
            >
              {focusedHourlyData.map((item, idx) => {
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

                    {/* 悬浮 Tooltip 气泡 */}
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

          {/* 🌟 24小时电价走势曲线图 (圆点颜色匹配分时图例) */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={focusedHourlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#94a3b8' }} interval={2} tickLine={false} />
                <YAxis
                  domain={[0, 'auto']}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(v) => v.toFixed(2)}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-xl">
                          <div className="font-bold text-slate-200 mb-1">{data.range}</div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
                            <span className="text-slate-300">[{data.label}]</span>
                            <span className="font-bold text-white tabular-nums">{Number(data.value).toFixed(4)} 元/kWh</span>
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
                  strokeWidth={2.5}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    return (
                      <circle
                        key={`dot-${cx}-${cy}`}
                        cx={cx}
                        cy={cy}
                        r={4.5}
                        fill={payload.color}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    );
                  }}
                  activeDot={{ r: 7.5, stroke: '#ffffff', strokeWidth: 2.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 🌟 4. 下半区两栏：6+2 成本构成横向穿透 + 储能策略建议 */}
      {focusedTariff && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 6+2 成本构成拆解表 (8列) */}
          <div className="lg:col-span-8 glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>6+2 电价成本横向穿透拆解</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
                    权威锚点
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {focusedTariff.province} · {focusedTariff.category} {focusedTariff.voltage_level} 分项费用 (元/kWh)
                </p>
              </div>
              <button
                onClick={() => onOpenAnalysis(focusedTariff)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>进入深度单省分析</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
                    <th className="py-3 px-3.5 rounded-l-lg">时段类型</th>
                    <th className="py-3 px-3">最终电价</th>
                    <th className="py-3 px-3 text-slate-400">代理购电/上网</th>
                    <th className="py-3 px-3 text-slate-400">输配电价</th>
                    <th className="py-3 px-3 text-slate-400">上网线损</th>
                    <th className="py-3 px-3 text-slate-400">系统运行费</th>
                    <th className="py-3 px-3 text-slate-400 rounded-r-lg">政府基金附加</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {focusedTariff.prices.tip !== undefined && focusedTariff.prices.tip !== null && (
                    <tr className="hover:bg-rose-50/30 transition-colors">
                      <td className="py-3 px-3.5 font-bold text-rose-600 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span> 尖峰时段
                      </td>
                      <td className="py-3 px-3 font-extrabold text-slate-900 tabular-nums text-sm">
                        {focusedTariff.prices.tip.toFixed(4)}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-slate-600">
                        {focusedTariff.prices.purchase_agent ?? '--'}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-slate-600">
                        {focusedTariff.prices.transmission_distribution ?? '--'}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-slate-600">
                        {focusedTariff.prices.line_loss ?? '--'}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-slate-600">
                        {focusedTariff.prices.system_cost ?? '--'}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-slate-600">
                        {focusedTariff.prices.government_funds ?? '--'}
                      </td>
                    </tr>
                  )}
                  {focusedTariff.prices.peak !== undefined && focusedTariff.prices.peak !== null && (
                    <tr className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-3 px-3.5 font-bold text-amber-600 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span> 高峰时段
                      </td>
                      <td className="py-3 px-3 font-extrabold text-slate-900 tabular-nums text-sm">
                        {focusedTariff.prices.peak.toFixed(4)}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-slate-600">
                        {focusedTariff.prices.purchase_agent ?? '--'}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-slate-600">
                        {focusedTariff.prices.transmission_distribution ?? '--'}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-slate-600">
                        {focusedTariff.prices.line_loss ?? '--'}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-slate-600">
                        {focusedTariff.prices.system_cost ?? '--'}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-slate-600">
                        {focusedTariff.prices.government_funds ?? '--'}
                      </td>
                    </tr>
                  )}
                  {focusedTariff.prices.flat !== undefined && focusedTariff.prices.flat !== null && (
                    <tr className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-3.5 font-bold text-blue-600 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> 平段时段
                      </td>
                      <td className="py-3 px-3 font-extrabold text-slate-900 tabular-nums text-sm">
                        {focusedTariff.prices.flat.toFixed(4)}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-slate-600">
                        {focusedTariff.prices.purchase_agent ?? '--'}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-slate-600">
                        {focusedTariff.prices.transmission_distribution ?? '--'}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-slate-600">
                        {focusedTariff.prices.line_loss ?? '--'}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-slate-600">
                        {focusedTariff.prices.system_cost ?? '--'}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-slate-600">
                        {focusedTariff.prices.government_funds ?? '--'}
                      </td>
                    </tr>
                  )}
                  {focusedTariff.prices.valley !== undefined && focusedTariff.prices.valley !== null && (
                    <tr className="hover:bg-emerald-50/30 transition-colors">
                      <td className="py-3 px-3.5 font-bold text-emerald-600 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 谷段时段
                      </td>
                      <td className="py-3 px-3 font-extrabold text-slate-900 tabular-nums text-sm">
                        {focusedTariff.prices.valley.toFixed(4)}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-slate-600">
                        {focusedTariff.prices.purchase_agent ?? '--'}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-slate-600">
                        {focusedTariff.prices.transmission_distribution ?? '--'}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-slate-600">
                        {focusedTariff.prices.line_loss ?? '--'}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-slate-600">
                        {focusedTariff.prices.system_cost ?? '--'}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-slate-600">
                        {focusedTariff.prices.government_funds ?? '--'}
                      </td>
                    </tr>
                  )}
                  {focusedTariff.prices.deep !== undefined && focusedTariff.prices.deep !== null && (
                    <tr className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-3 px-3.5 font-bold text-purple-600 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span> 深谷时段
                      </td>
                      <td className="py-3 px-3 font-extrabold text-slate-900 tabular-nums text-sm">
                        {focusedTariff.prices.deep.toFixed(4)}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-slate-600">
                        {focusedTariff.prices.purchase_agent ?? '--'}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-slate-600">
                        {focusedTariff.prices.transmission_distribution ?? '--'}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-slate-600">
                        {focusedTariff.prices.line_loss ?? '--'}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-slate-600">
                        {focusedTariff.prices.system_cost ?? '--'}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-slate-600">
                        {focusedTariff.prices.government_funds ?? '--'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 储能充放策略排程 (4列) */}
          <div className="lg:col-span-4 glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BatteryCharging size={16} className="text-emerald-600" />
                  <span>工商业储能建议排程</span>
                </h3>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100">
                  {storageStrategy ? storageStrategy.mode : '两充两放'}
                </span>
              </div>
              <p className="text-xs text-slate-400">基于当月分时电价的最优套利窗口</p>
            </div>

            {storageStrategy && (
              <div className="space-y-2 text-xs">
                {storageStrategy.valleyBlocks.slice(0, 2).map((vb, i) => {
                  const pb = storageStrategy.peakBlocks[i] || storageStrategy.peakBlocks[0];
                  const spread = pb ? Math.max(0, pb.price - vb.price) : 0;
                  return (
                    <div key={i} className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-800">第 {i + 1} 充放循环</span>
                        <span className="text-indigo-600 tabular-nums">套利 {spread.toFixed(4)} 元/kWh</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>
                          充: {vb.start.toString().padStart(2, '0')}:00~{vb.end.toString().padStart(2, '0')}:00
                        </span>
                        <span>
                          放: {pb ? `${pb.start.toString().padStart(2, '0')}:00~${pb.end.toString().padStart(2, '0')}:00` : '--'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">累计峰谷套利空间:</span>
              <span className="font-extrabold text-indigo-600 tabular-nums text-sm">
                {storageStrategy ? storageStrategy.totalSpread.toFixed(4) : '--'} 元/kWh
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5. 底部的电价明细列表 */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers size={16} className="text-indigo-600" />
            <span>电价数据检索列表</span>
            <span className="text-xs font-normal text-slate-400">共 {filteredTariffs.length} 条记录</span>
          </h3>
          <span className="text-xs text-slate-400">点击任意行可聚焦查看其 24H 谱带与成本</span>
        </div>

        <div className="overflow-x-auto max-h-80 custom-scrollbar">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">省份</th>
                <th className="py-2.5 px-3">执行月份</th>
                <th className="py-2.5 px-3">用电类别</th>
                <th className="py-2.5 px-3">电压等级</th>
                <th className="py-2.5 px-3">尖峰</th>
                <th className="py-2.5 px-3">高峰</th>
                <th className="py-2.5 px-3">平段</th>
                <th className="py-2.5 px-3">低谷</th>
                <th className="py-2.5 px-3">深谷</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTariffs.map((t) => {
                const isFocused = focusedTariff && focusedTariff.id === t.id;
                return (
                  <tr
                    key={t.id}
                    onClick={() => setFocusedTariffId(t.id)}
                    className={`cursor-pointer transition-colors ${
                      isFocused ? 'bg-indigo-50/70 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-slate-800">{t.province}</td>
                    <td className="py-2.5 px-3 tabular-nums text-slate-600">{t.month}</td>
                    <td className="py-2.5 px-3 text-slate-600">{t.category}</td>
                    <td className="py-2.5 px-3 text-slate-600">{t.voltage_level}</td>
                    <td className="py-2.5 px-3 tabular-nums text-rose-600">
                      {t.prices.tip !== undefined && t.prices.tip !== null ? t.prices.tip.toFixed(4) : '--'}
                    </td>
                    <td className="py-2.5 px-3 tabular-nums text-amber-600">
                      {t.prices.peak !== undefined && t.prices.peak !== null ? t.prices.peak.toFixed(4) : '--'}
                    </td>
                    <td className="py-2.5 px-3 tabular-nums text-blue-600">
                      {t.prices.flat !== undefined && t.prices.flat !== null ? t.prices.flat.toFixed(4) : '--'}
                    </td>
                    <td className="py-2.5 px-3 tabular-nums text-emerald-600">
                      {t.prices.valley !== undefined && t.prices.valley !== null ? t.prices.valley.toFixed(4) : '--'}
                    </td>
                    <td className="py-2.5 px-3 tabular-nums text-purple-600">
                      {t.prices.deep !== undefined && t.prices.deep !== null ? t.prices.deep.toFixed(4) : '--'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAnalysis(t);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs flex items-center justify-end gap-1 ml-auto"
                      >
                        <span>深度分析</span>
                        <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
