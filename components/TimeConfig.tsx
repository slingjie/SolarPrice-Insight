import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  Library,
  MapPin,
  Plus,
  Search,
  CheckCircle2,
  Circle,
  X,
  Sparkles,
  Info,
  ShieldCheck,
  Zap,
  ChevronDown,
  Calendar,
  Layers,
  ArrowRight,
  Trash2,
  Check,
  Clock,
  Edit3
} from 'lucide-react';
import { TariffData, TimeConfig, TimeType } from '../types';
import { PROVINCES, getTypeColor, getTypeLabel } from '../constants';
import { TimeConfigMatrix } from './TimeConfigMatrix';
import { Card, ConfirmModal, Toast } from './UI';
import { resolveTimeConfigForMonth } from '../utils/timeConfigResolver';
import { rulesToGrid, gridToRules } from '../utils/timeUtils';
import { normalizeProvinceName, provinceMatches } from '../utils/provinceNormalize';
import { parseSpecialPeriodsFromTariffs, ParsedSpecialPeriod } from '../utils/specialPeriodParser';

interface TimeConfigProps {
  configs: TimeConfig[];
  tariffs?: TariffData[];
  onSave?: (configs: TimeConfig[]) => void;
  readOnly?: boolean;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const currentYear = new Date().getFullYear();

const normalizeProvinceLabel = (value: string) => value.trim();

interface SpecialEditorState {
  id: string;
  startDate: string;
  endDate: string;
  year: number;
  grid: TimeType[];
}

const emptyGrid = (): TimeType[] => Array(24).fill('valley');

export const MiniGrid: React.FC<{ grid: TimeType[] | null }> = ({ grid }) => {
  if (!grid) {
    return <div className="text-xs text-slate-400">未配置</div>;
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="grid grid-cols-[repeat(24,minmax(0,1fr))] gap-px bg-slate-200 border border-slate-200 rounded overflow-hidden h-5">
        {grid.map((type, hour) => (
          <div
            key={hour}
            className="h-full"
            style={{ background: getTypeColor(type) }}
            title={`${hour}:00 - ${hour + 1}:00 ${getTypeLabel(type)}`}
          />
        ))}
      </div>
    </div>
  );
};

export const TimeConfigView: React.FC<TimeConfigProps> = ({ configs, tariffs = [], onSave, readOnly = false }) => {
  const [selectedProvince, setSelectedProvince] = useState<string | null>('江苏省');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'configured' | 'unconfigured'>('all');
  const [deleteConfirmProvince, setDeleteConfirmProvince] = useState<string | null>(null);
  const [selectedEditYear, setSelectedEditYear] = useState<number>(currentYear);

  const [specialStartDateInput, setSpecialStartDateInput] = useState('');
  const [specialEndDateInput, setSpecialEndDateInput] = useState('');
  const [specialEditor, setSpecialEditor] = useState<SpecialEditorState | null>(null);
  const [specialActiveType, setSpecialActiveType] = useState<TimeType>('valley');
  const [specialDragging, setSpecialDragging] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const toastMessage = useRef('操作成功');

  // 自动从 tariffs 政策中解析出的特殊日期时段规则
  const detectedPolicySpecialPeriods = useMemo(() => {
    if (!selectedProvince || !tariffs || tariffs.length === 0) return [];
    return parseSpecialPeriodsFromTariffs(tariffs, selectedProvince, selectedEditYear);
  }, [tariffs, selectedProvince, selectedEditYear]);

  // 一键同步/应用官方政策特殊日期时段
  const handleSyncPolicyPeriod = (item: ParsedSpecialPeriod) => {
    if (!onSave || !selectedProvince) return;

    const existing = configs.find(
      (c) =>
        (c.province === selectedProvince || provinceMatches(c.province, selectedProvince)) &&
        c.config_type === 'special_date' &&
        c.special_date?.startsWith(item.startDate) &&
        (c.special_date_end || c.special_date)?.startsWith(item.endDate) &&
        !c._deleted,
    );

    if (existing) {
      toastMessage.current = '该政策特殊时段已生效于规则库中';
      setShowToast(true);
      return;
    }

    const newSpecialConfig: TimeConfig = {
      id: `tc-sp-${normalizeProvinceName(selectedProvince)}-${item.startDate}-${crypto.randomUUID().slice(0, 6)}`,
      province: selectedProvince,
      year: item.year,
      config_type: 'special_date',
      month_pattern: '',
      special_date: item.startDate,
      special_date_end: item.endDate,
      time_rules: item.timeRules,
      market_notes: item.rawNote,
      policy_code: item.policyCode,
      updated_at: new Date().toISOString(),
      last_modified: new Date().toISOString(),
    };

    onSave([...configs, newSpecialConfig]);
    toastMessage.current = `已自动同步并生效「${item.title}」`;
    setShowToast(true);
  };

  // 省份配置状态映射
  const provinceStatus = useMemo(() => {
    const status: Record<string, boolean> = {};
    configs.forEach((config) => {
      if (config.province && !config._deleted) {
        const raw = config.province.trim();
        const norm = normalizeProvinceName(raw);
        status[raw] = true;
        if (norm) status[norm] = true;
        const matchStandard = PROVINCES.find((p) => normalizeProvinceName(p) === norm);
        if (matchStandard) {
          status[matchStandard] = true;
        }
      }
    });
    return status;
  }, [configs]);

  // 31 省份全量选项（去重并兼容自定义省份）
  const derivedProvinceOptions = useMemo(() => {
    const standardNormSet = new Set(PROVINCES.map((p) => normalizeProvinceName(p)));
    const customProvinces = Array.from(
      new Set(
        configs
          .map((config) => config.province?.trim())
          .filter((p): p is string => Boolean(p) && !standardNormSet.has(normalizeProvinceName(p))),
      ),
    ).sort((a: string, b: string) => a.localeCompare(b, 'zh-Hans-CN'));

    return [...PROVINCES, ...customProvinces];
  }, [configs]);

  const configuredCount = useMemo(
    () => derivedProvinceOptions.filter((p) => provinceStatus[p]).length,
    [derivedProvinceOptions, provinceStatus],
  );
  const unconfiguredCount = derivedProvinceOptions.length - configuredCount;

  const trimmedSearchTerm = normalizeProvinceLabel(searchTerm);
  const isTrimmedDuplicate = useMemo(() => {
    if (!trimmedSearchTerm) return false;
    const norm = normalizeProvinceName(trimmedSearchTerm);
    return derivedProvinceOptions.some(
      (p) => p === trimmedSearchTerm || (norm && normalizeProvinceName(p) === norm),
    );
  }, [trimmedSearchTerm, derivedProvinceOptions]);

  const filteredProvinces = useMemo(() => {
    let list = derivedProvinceOptions;
    if (statusFilter === 'configured') {
      list = list.filter((p) => provinceStatus[p]);
    } else if (statusFilter === 'unconfigured') {
      list = list.filter((p) => !provinceStatus[p]);
    }

    if (!searchTerm.trim()) return list;
    const term = searchTerm.trim();
    const normTerm = normalizeProvinceName(term);
    return list.filter((province) =>
      province.includes(term) || (normTerm && normalizeProvinceName(province).includes(normTerm)),
    );
  }, [derivedProvinceOptions, searchTerm, statusFilter, provinceStatus]);

  // 当前选中省份的所有配置
  const selectedProvinceConfigs = useMemo(() => {
    if (!selectedProvince) return [];
    return configs.filter(
      (config) =>
        (config.province === selectedProvince || provinceMatches(config.province, selectedProvince)) &&
        !config._deleted,
    );
  }, [configs, selectedProvince]);

  // 可用年份列表
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    selectedProvinceConfigs.forEach((config) => {
      if (config.config_type === 'monthly' && Number.isFinite(config.year)) {
        years.add(config.year);
      }
    });

    if (years.size === 0) {
      years.add(currentYear);
    }

    return Array.from(years).sort((a, b) => a - b);
  }, [selectedProvinceConfigs]);

  useEffect(() => {
    if (!availableYears.includes(selectedEditYear)) {
      setSelectedEditYear(availableYears[availableYears.length - 1]);
    }
  }, [availableYears, selectedEditYear]);

  // 特殊日期配置列表
  const specialConfigs = useMemo(() => {
    const parseRangeForSort = (config: TimeConfig) => {
      const dates = (config.special_date?.match(/\d{4}-\d{2}-\d{2}/g) ?? []).slice(0, 2);
      const start = (dates[0] || config.special_date?.slice(0, 10) || '').trim();
      const endRaw = (dates[1] || config.special_date_end || start).trim();
      return start <= endRaw ? { start, end: endRaw } : { start: endRaw, end: start };
    };

    return selectedProvinceConfigs
      .filter((config) => config.config_type === 'special_date' && config.special_date)
      .sort((a, b) => {
        const aRange = parseRangeForSort(a);
        const bRange = parseRangeForSort(b);
        if (aRange.start !== bRange.start) return aRange.start.localeCompare(bRange.start);
        return aRange.end.localeCompare(bRange.end);
      });
  }, [selectedProvinceConfigs]);

  const handleCreateProvince = () => {
    if (!trimmedSearchTerm || isTrimmedDuplicate) return;
    setSearchTerm('');
    setSelectedProvince(trimmedSearchTerm);
  };

  const handleMatrixSave = (province: string, newConfigs: TimeConfig[]) => {
    const keepConfigs = configs.filter(
      (config) =>
        !(
          (config.province === province || provinceMatches(config.province, province)) &&
          config.config_type === 'monthly' &&
          config.year === selectedEditYear
        ),
    );

    const normalized = newConfigs.map((config) => ({
      ...config,
      province,
      year: selectedEditYear,
      config_type: 'monthly' as const,
      special_date: undefined,
    }));

    onSave?.([...keepConfigs, ...normalized]);
  };

  const clearProvinceConfig = () => {
    if (!deleteConfirmProvince) return;
    const updatedList = configs.filter((config) => !provinceMatches(config.province, deleteConfirmProvince));
    const wasSelected = selectedProvince && provinceMatches(selectedProvince, deleteConfirmProvince);

    onSave?.(updatedList);
    setDeleteConfirmProvince(null);

    if (wasSelected) {
      setSelectedProvince(null);
    }
    toastMessage.current = `已清空 ${deleteConfirmProvince} 的全部配置`;
    setShowToast(true);
  };

  const parseSpecialRangeInput = () => {
    const start = specialStartDateInput.trim();
    const end = specialEndDateInput.trim() || start;
    if (!start) return null;
    const s = start <= end ? start : end;
    const e = start <= end ? end : start;
    const matchYear = s.match(/^(\d{4})/);
    const year = matchYear ? Number.parseInt(matchYear[1], 10) : selectedEditYear;
    return { start: s, end: e, year };
  };

  const startNewSpecialDateRange = () => {
    const range = parseSpecialRangeInput();
    if (!range) return;

    setSpecialEditor({
      id: crypto.randomUUID(),
      startDate: range.start,
      endDate: range.end,
      year: range.year,
      grid: emptyGrid(),
    });
  };

  const saveSpecialEditor = () => {
    if (!specialEditor || !selectedProvince) return;
    const { startDate, endDate, year, grid } = specialEditor;
    const timeRules = gridToRules(grid);
    const existingIndex = configs.findIndex((c) => c.id === specialEditor.id);

    const updatedConfig: TimeConfig = {
      id: specialEditor.id,
      province: selectedProvince,
      year,
      config_type: 'special_date',
      month_pattern: '',
      special_date: startDate,
      special_date_end: endDate,
      time_rules: timeRules,
      updated_at: new Date().toISOString(),
      last_modified: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      const next = [...configs];
      next[existingIndex] = updatedConfig;
      onSave?.(next);
    } else {
      onSave?.([...configs, updatedConfig]);
    }

    setSpecialEditor(null);
    setSpecialStartDateInput('');
    setSpecialEndDateInput('');
    toastMessage.current = `已保存 ${startDate} 至 ${endDate} 特殊日期区间规则`;
    setShowToast(true);
  };

  const startEditSpecialConfig = (cfg: TimeConfig) => {
    const dates = (cfg.special_date?.match(/\d{4}-\d{2}-\d{2}/g) ?? []).slice(0, 2);
    const start = dates[0] || cfg.special_date?.slice(0, 10) || '';
    const end = dates[1] || cfg.special_date_end || start;
    const grid = rulesToGrid(cfg.time_rules);
    const matchYear = start.match(/^(\d{4})/);
    const year = matchYear ? Number.parseInt(matchYear[1], 10) : selectedEditYear;

    setSpecialEditor({
      id: cfg.id,
      startDate: start,
      endDate: end,
      year,
      grid,
    });
  };

  const deleteSpecialConfig = (id: string) => {
    onSave?.(configs.filter((c) => c.id !== id));
    toastMessage.current = '已删除特殊日期规则';
    setShowToast(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* 🌟 1. 顶部 Header */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Library size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">分时时段规则与全景矩阵</h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                12×24 画板
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              直观查看与调配全国各省全年 12 个月 × 24 小时分时电价时段规则
            </p>
          </div>
        </div>

        {selectedProvince && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">当前省份:</span>
            <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
              {selectedProvince}
            </span>
          </div>
        )}
      </div>

      {/* 🌟 2. 左右双栏布局：左侧紧凑省份选择器 (3列) + 右侧宽幅 12×24 矩阵与特殊时段 (9列) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧：省份选择与快速检索 (3.5列) */}
        <div className="lg:col-span-3 glass-panel p-4 rounded-2xl flex flex-col h-[780px] overflow-hidden space-y-3 border border-slate-200/80 shadow-sm">
          {/* 搜索框与新增自定义省份 */}
          <div className="space-y-2">
            <div className="relative">
              <Search size={14} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索省份..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <X size={12} />
                </button>
              )}
            </div>

            {trimmedSearchTerm && !isTrimmedDuplicate && (
              <button
                onClick={handleCreateProvince}
                className="w-full py-1.5 px-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Plus size={13} />
                <span>新增 "{trimmedSearchTerm}"</span>
              </button>
            )}
          </div>

          {/* 状态筛选切换 */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl text-[11px] text-center font-semibold text-slate-500">
            <button
              onClick={() => setStatusFilter('all')}
              className={`py-1 rounded-lg transition-all ${statusFilter === 'all' ? 'bg-white text-indigo-600 shadow-sm font-bold' : 'hover:text-slate-800'}`}
            >
              全部 ({derivedProvinceOptions.length})
            </button>
            <button
              onClick={() => setStatusFilter('configured')}
              className={`py-1 rounded-lg transition-all ${statusFilter === 'configured' ? 'bg-white text-emerald-600 shadow-sm font-bold' : 'hover:text-slate-800'}`}
            >
              已配 ({configuredCount})
            </button>
            <button
              onClick={() => setStatusFilter('unconfigured')}
              className={`py-1 rounded-lg transition-all ${statusFilter === 'unconfigured' ? 'bg-white text-slate-700 shadow-sm font-bold' : 'hover:text-slate-800'}`}
            >
              未配 ({unconfiguredCount})
            </button>
          </div>

          {/* 省份纵向列表 */}
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
            {filteredProvinces.map((province) => {
              const isSelected = selectedProvince === province || provinceMatches(selectedProvince || '', province);
              const isConfigured = provinceStatus[province];

              return (
                <div
                  key={province}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20'
                      : 'hover:bg-slate-100/80 text-slate-700'
                  }`}
                >
                  <button
                    onClick={() => setSelectedProvince(province)}
                    className="flex-1 text-left flex items-center gap-2 truncate"
                  >
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        isSelected ? 'bg-white' : isConfigured ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                    <span className="truncate">{province}</span>
                  </button>

                  {isConfigured && !readOnly && (
                    <button
                      title="清空配置"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmProvince(province);
                      }}
                      className={`p-1 rounded-lg transition-colors ${
                        isSelected ? 'text-white/80 hover:text-white hover:bg-white/20' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 右侧：宽幅大画板与特殊时段 (9列) */}
        <div className="lg:col-span-9 space-y-6">
          {selectedProvince ? (
            <>
              {/* 年份选择胶囊 */}
              <div className="glass-panel p-3.5 rounded-2xl flex items-center justify-between gap-4 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-2 text-xs">
                  <Calendar size={15} className="text-indigo-600" />
                  <span className="font-bold text-slate-800">编辑年度:</span>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    {availableYears.map((year) => {
                      const isSelected = selectedEditYear === year;
                      return (
                        <button
                          key={year}
                          onClick={() => setSelectedEditYear(year)}
                          className={`px-3 py-1 rounded-lg font-bold transition-all ${
                            isSelected ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {year} 年度
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="text-xs text-slate-400">
                  {selectedProvince} · {selectedEditYear} 年分时规则画板
                </div>
              </div>

              {/* 12×24 矩阵画板 */}
              <TimeConfigMatrix
                configs={configs}
                selectedProvince={selectedProvince}
                selectedYear={selectedEditYear}
                onSave={handleMatrixSave}
              />

              {/* 发改委特殊日期区间总览与创建器 */}
              <div className="glass-panel p-6 rounded-2xl space-y-5 bg-white border border-slate-200/90 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles size={16} className="text-indigo-600" />
                      <span>发改委特殊日期时段区间管理</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        迎峰度夏/度冬
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      针对特定日期区间（如 7/15~8/31 尖峰、节假日深谷等）独立配置特殊分时规则
                    </p>
                  </div>
                </div>

                {/* 智能检测到的政策特殊时段 */}
                {detectedPolicySpecialPeriods.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Zap size={14} className="text-indigo-600" />
                      <span>官方政策中检测到的特殊时段建议</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {detectedPolicySpecialPeriods.map((item, idx) => {
                        const isSynced = configs.some(
                          (c) =>
                            (c.province === selectedProvince || provinceMatches(c.province, selectedProvince)) &&
                            c.config_type === 'special_date' &&
                            c.special_date?.startsWith(item.startDate) &&
                            (c.special_date_end || c.special_date)?.startsWith(item.endDate) &&
                            !c._deleted,
                        );

                        const grid = rulesToGrid(item.timeRules);

                        return (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-indigo-200 transition-all space-y-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">{item.title}</span>
                              {isSynced ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <Check size={12} /> 已在规则库生效
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleSyncPolicyPeriod(item)}
                                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition-all flex items-center gap-1"
                                >
                                  <Zap size={12} />
                                  <span>一键同步生效</span>
                                </button>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-semibold">
                              {item.startDate} 至 {item.endDate}
                            </div>
                            <MiniGrid grid={grid} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 手动创建特殊日期区间表单 */}
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Edit3 size={14} className="text-indigo-600" />
                    <span>新建特殊日期时段区间</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <label htmlFor="special-start-date" className="text-slate-500 font-medium">特殊日期开始</label>
                      <input
                        id="special-start-date"
                        type="date"
                        aria-label="特殊日期开始"
                        value={specialStartDateInput}
                        onChange={(e) => setSpecialStartDateInput(e.target.value)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <label htmlFor="special-end-date" className="text-slate-500 font-medium">特殊日期结束</label>
                      <input
                        id="special-end-date"
                        type="date"
                        aria-label="特殊日期结束"
                        value={specialEndDateInput}
                        onChange={(e) => setSpecialEndDateInput(e.target.value)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                      />
                    </div>
                    <button
                      onClick={startNewSpecialDateRange}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      新增特殊日期区间
                    </button>
                  </div>

                  {/* 特殊日期画板编辑器 */}
                  {specialEditor && (
                    <div className="p-4 rounded-xl bg-white border border-indigo-200 space-y-3 animate-in fade-in duration-150">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
                          <span>特殊日期区间:</span>
                          <input
                            type="date"
                            aria-label="编辑特殊日期开始"
                            value={specialEditor.startDate}
                            onChange={(e) => setSpecialEditor({ ...specialEditor, startDate: e.target.value })}
                            className="p-1 rounded border border-indigo-200 text-xs text-slate-800"
                          />
                          <span>至</span>
                          <input
                            type="date"
                            aria-label="编辑特殊日期结束"
                            value={specialEditor.endDate}
                            onChange={(e) => setSpecialEditor({ ...specialEditor, endDate: e.target.value })}
                            className="p-1 rounded border border-indigo-200 text-xs text-slate-800"
                          />
                        </div>
                        <button
                          onClick={saveSpecialEditor}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                        >
                          保存特殊日期区间规则
                        </button>
                      </div>

                      {/* 笔刷 */}
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                        {(['tip', 'peak', 'flat', 'valley', 'deep'] as TimeType[]).map((type) => (
                          <button
                            key={type}
                            onClick={() => setSpecialActiveType(type)}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 ${
                              specialActiveType === type ? 'bg-white shadow text-slate-900' : 'text-slate-500'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getTypeColor(type) }} />
                            <span>{getTypeLabel(type)}</span>
                          </button>
                        ))}
                      </div>

                      {/* 24 小时拖拽网格 */}
                      <div
                        className="grid grid-cols-24 gap-1 h-8 rounded-lg overflow-hidden border border-slate-200"
                        style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}
                        onMouseUp={() => setSpecialDragging(false)}
                        onMouseLeave={() => setSpecialDragging(false)}
                      >
                        {HOURS.map((h) => (
                          <div
                            key={h}
                            onMouseDown={() => {
                              setSpecialDragging(true);
                              setSpecialEditor((prev) => {
                                if (!prev) return null;
                                const next = [...prev.grid];
                                next[h] = specialActiveType;
                                return { ...prev, grid: next };
                              });
                            }}
                            onMouseEnter={() => {
                              if (!specialDragging) return;
                              setSpecialEditor((prev) => {
                                if (!prev) return null;
                                const next = [...prev.grid];
                                next[h] = specialActiveType;
                                return { ...prev, grid: next };
                              });
                            }}
                            className="cursor-pointer transition-transform hover:scale-105"
                            style={{ backgroundColor: getTypeColor(specialEditor.grid[h]) }}
                            title={`${h}:00 [${getTypeLabel(specialEditor.grid[h])}]`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 已保存的特殊日期规则列表 */}
                {specialConfigs.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700">已保存的特殊日期时段列表:</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {specialConfigs.map((cfg) => {
                        const dates = (cfg.special_date?.match(/\d{4}-\d{2}-\d{2}/g) ?? []).slice(0, 2);
                        const start = dates[0] || cfg.special_date?.slice(0, 10) || '';
                        const end = dates[1] || cfg.special_date_end || start;
                        const grid = rulesToGrid(cfg.time_rules);

                        return (
                          <div key={cfg.id} className="p-3 rounded-xl border border-slate-200 bg-white space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-800">{start} 至 {end}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => startEditSpecialConfig(cfg)}
                                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-0.5 rounded hover:bg-indigo-50"
                                >
                                  编辑
                                </button>
                                <button
                                  onClick={() => deleteSpecialConfig(cfg.id)}
                                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                                  title="删除该规则"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                            <MiniGrid grid={grid} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="glass-panel p-16 text-center text-slate-400 rounded-2xl">
              请在左侧选择省份进行配置
            </div>
          )}
        </div>
      </div>

      {/* 删除确认弹窗 */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmProvince)}
        title="清空省份配置"
        message={`确定要清空 ${deleteConfirmProvince} 的全部配置吗？此操作不可恢复。`}
        confirmText="清空"
        onConfirm={clearProvinceConfig}
        onCancel={() => setDeleteConfirmProvince(null)}
      />

      <Toast message={toastMessage.current} isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
};
