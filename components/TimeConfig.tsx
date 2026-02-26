import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Library, MapPin, Plus, Search } from 'lucide-react';
import { TimeConfig, TimeType } from '../types';
import { PROVINCES, getTypeColor, getTypeLabel } from '../constants.tsx';
import { TimeConfigMatrix } from './TimeConfigMatrix';
import { Card, ConfirmModal, Toast } from './UI';
import { resolveTimeConfigForMonth } from '../utils/timeConfigResolver';
import { rulesToGrid, gridToRules } from '../utils/timeUtils';

interface TimeConfigProps {
  configs: TimeConfig[];
  onSave?: (configs: TimeConfig[]) => void;
  readOnly?: boolean;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const normalizeProvinceLabel = (value: string) => value.trim();

interface SpecialEditorState {
  id: string;
  startDate: string;
  endDate: string;
  year: number;
  grid: TimeType[];
}

const emptyGrid = (): TimeType[] => Array(24).fill('valley');

const currentYear = new Date().getFullYear();

const getGridSegments = (grid: TimeType[]) => {
  if (!grid || grid.length === 0) return [];
  const segments: { start: number; end: number; type: TimeType }[] = [];
  let currentStart = 0;
  let currentType = grid[0];

  for (let i = 1; i < grid.length; i++) {
    if (grid[i] !== currentType) {
      segments.push({ start: currentStart, end: i, type: currentType });
      currentStart = i;
      currentType = grid[i];
    }
  }
  segments.push({ start: currentStart, end: grid.length, type: currentType });
  return segments;
};

const TimeSegmentSummary: React.FC<{ grid: TimeType[] }> = ({ grid }) => {
  const segments = useMemo(() => getGridSegments(grid), [grid]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1 text-[10px] text-slate-500 leading-tight">
      {segments.map((seg, idx) => (
        <span
          key={idx}
          className={`cursor-default transition-colors px-1 rounded flex items-center ${
            hoveredIndex === idx ? 'bg-slate-100 text-slate-800 font-medium' : ''
          }`}
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
          title={`${seg.start}:00 - ${seg.end}:00 ${getTypeLabel(seg.type)}`}
        >
          <span
            className="w-1.5 h-1.5 rounded-full mr-1"
            style={{ backgroundColor: getTypeColor(seg.type) }}
          />
          {seg.start}-{seg.end} {getTypeLabel(seg.type).replace('时段', '')}
        </span>
      ))}
    </div>
  );
};

export const MiniGrid: React.FC<{ grid: TimeType[] | null }> = ({ grid }) => {
  if (!grid) {
    return <div className="text-xs text-slate-400">未配置</div>;
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="grid grid-cols-[repeat(24,minmax(0,1fr))] gap-px bg-slate-200 border border-slate-200 rounded overflow-hidden h-6">
        {grid.map((type, hour) => (
          <div
            key={hour}
            className="h-full"
            style={{ background: getTypeColor(type) }}
            title={`${hour}:00 - ${hour + 1}:00 ${getTypeLabel(type)}`}
          />
        ))}
      </div>
      <TimeSegmentSummary grid={grid} />
    </div>
  );
};

export const TimeConfigView: React.FC<TimeConfigProps> = ({ configs, onSave, readOnly = false }) => {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmProvince, setDeleteConfirmProvince] = useState<string | null>(null);
  const [selectedEditYear, setSelectedEditYear] = useState<number>(currentYear);
  const [visibleYears, setVisibleYears] = useState<number[]>([]);
  const [newYearInput, setNewYearInput] = useState('');
  const [specialStartDateInput, setSpecialStartDateInput] = useState('');
  const [specialEndDateInput, setSpecialEndDateInput] = useState('');
  const [specialEditor, setSpecialEditor] = useState<SpecialEditorState | null>(null);
  const [specialActiveType, setSpecialActiveType] = useState<TimeType>('valley');
  const [specialDragging, setSpecialDragging] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [focusMonth, setFocusMonth] = useState<number | null>(null);
  const [monthsCollapsed, setMonthsCollapsed] = useState(true);
  const matrixContainerRef = useRef<HTMLDivElement | null>(null);
  const toastMessage = useRef('操作成功');

  const provinceStatus = useMemo(() => {
    const status: Record<string, boolean> = {};
    configs.forEach((config) => {
      if (config.province) {
        status[config.province] = true;
      }
    });
    return status;
  }, [configs]);

  const derivedProvinceOptions = useMemo(() => {
    const configuredProvinces = configs.map((config) => config.province);
    const uniqueCustomProvinces = Array.from(new Set<string>(configuredProvinces))
      .filter((province) => !PROVINCES.includes(province))
      .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));

    return [...PROVINCES, ...uniqueCustomProvinces];
  }, [configs]);

  const normalizedDerivedProvinceOptions = useMemo(
    () => derivedProvinceOptions.map(normalizeProvinceLabel).filter(Boolean),
    [derivedProvinceOptions],
  );

  const trimmedSearchTerm = normalizeProvinceLabel(searchTerm);
  const isTrimmedDuplicate = trimmedSearchTerm
    ? normalizedDerivedProvinceOptions.includes(trimmedSearchTerm)
    : false;

  const filteredProvinces = useMemo(() => {
    if (!searchTerm) return derivedProvinceOptions;
    return derivedProvinceOptions.filter((province) => province.includes(searchTerm));
  }, [derivedProvinceOptions, searchTerm]);

  const selectedProvinceConfigs = useMemo(() => {
    if (!selectedProvince) return [];
    return configs.filter((config) => config.province === selectedProvince && !config._deleted);
  }, [configs, selectedProvince]);

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
    setVisibleYears(availableYears);
    setSelectedEditYear((prev) => (availableYears.includes(prev) ? prev : availableYears[availableYears.length - 1]));
  }, [availableYears]);

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
        const aStart = aRange.start;
        const bStart = bRange.start;
        if (aStart !== bStart) return aStart.localeCompare(bStart);
        const aEnd = aRange.end;
        const bEnd = bRange.end;
        return aEnd.localeCompare(bEnd);
      });
  }, [selectedProvinceConfigs]);

  const displayYears = useMemo(() => {
    const set = new Set(visibleYears);
    const years = availableYears.filter((year) => set.has(year));
    return years.length > 0 ? years : availableYears;
  }, [availableYears, visibleYears]);

  const getMonthlyGrid = (month: number, year: number): TimeType[] | null => {
    if (!selectedProvince) return null;
    const resolved = resolveTimeConfigForMonth(configs, selectedProvince, month, year);
    return resolved?.touGrid ?? null;
  };

  /** Group months with identical grids across all displayYears into one row */
  const monthGroups = useMemo(() => {
    const fingerprint = (month: number): string => {
      return displayYears.map((year) => {
        const grid = selectedProvince
          ? resolveTimeConfigForMonth(configs, selectedProvince, month, year)?.touGrid
          : null;
        return grid ? grid.join(',') : 'null';
      }).join('|');
    };

    const groups: { months: number[]; fp: string }[] = [];
    for (const month of MONTHS) {
      const fp = fingerprint(month);
      const last = groups[groups.length - 1];
      if (last && last.fp === fp) {
        last.months.push(month);
      } else {
        groups.push({ months: [month], fp });
      }
    }
    return groups;
  }, [configs, selectedProvince, displayYears]);

  const handleCreateProvince = () => {
    if (!trimmedSearchTerm || isTrimmedDuplicate) return;
    setSearchTerm('');
    setSelectedProvince(trimmedSearchTerm);
  };

  const handleMatrixSave = (province: string, newConfigs: TimeConfig[]) => {
    const keepConfigs = configs.filter(
      (config) =>
        !(config.province === province && config.config_type === 'monthly' && config.year === selectedEditYear),
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

    const updatedList = configs.filter((config) => config.province !== deleteConfirmProvince);
    const wasSelected = selectedProvince === deleteConfirmProvince;

    onSave?.(updatedList);
    setDeleteConfirmProvince(null);

    if (wasSelected) {
      setSelectedProvince(null);
    }
  };

  const toggleVisibleYear = (year: number) => {
    setVisibleYears((prev) => {
      if (prev.includes(year)) {
        return prev.filter((item) => item !== year);
      }
      return [...prev, year].sort((a, b) => a - b);
    });
  };

  const handleAddYear = () => {
    const parsed = Number.parseInt(newYearInput.trim(), 10);
    if (!Number.isFinite(parsed) || parsed < 2000 || parsed > 2100) {
      toastMessage.current = '年份需在 2000-2100 之间';
      setShowToast(true);
      return;
    }

    setVisibleYears((prev) => (prev.includes(parsed) ? prev : [...prev, parsed].sort((a, b) => a - b)));
    setSelectedEditYear(parsed);
    setNewYearInput('');
  };

  const normalizeDateRange = (startInput: string, endInput?: string): { start: string; end: string } | null => {
    const inlineDates = (startInput.match(/\d{4}-\d{2}-\d{2}/g) ?? []).slice(0, 2);

    let start = '';
    let end = '';

    if (inlineDates.length >= 2) {
      [start, end] = inlineDates;
    } else {
      start = (inlineDates[0] || startInput.slice(0, 10) || '').trim();
      const endInline = (endInput?.match(/\d{4}-\d{2}-\d{2}/g) ?? [])[0];
      end = (endInline || endInput?.slice(0, 10) || start).trim();
    }

    if (!start) return null;
    if (!end) end = start;

    return start <= end ? { start, end } : { start: end, end: start };
  };

  const getConfigDateRange = (config: TimeConfig): { start: string; end: string } | null => {
    if (!config.special_date) return null;
    return normalizeDateRange(config.special_date, config.special_date_end);
  };

  const isRangeOverlapping = (a: { start: string; end: string }, b: { start: string; end: string }) => {
    return a.start <= b.end && b.start <= a.end;
  };

  const openSpecialEditor = (config?: TimeConfig) => {
    if (!selectedProvince) return;

    if (config && config.special_date) {
      const range = getConfigDateRange(config);
      if (!range) return;
      setSpecialEditor({
        id: config.id,
        startDate: range.start,
        endDate: range.end,
        year: config.year,
        grid: rulesToGrid(config.time_rules),
      });
      return;
    }

    const selectedRange = normalizeDateRange(specialStartDateInput, specialEndDateInput || specialStartDateInput);
    if (!selectedRange) {
      toastMessage.current = '请先选择开始日期';
      setShowToast(true);
      return;
    }

    const overlapped = specialConfigs.find((item) => {
      const range = getConfigDateRange(item);
      if (!range) return false;
      return isRangeOverlapping(selectedRange, range);
    });

    if (overlapped) {
      openSpecialEditor(overlapped);
      toastMessage.current = '该日期区间与现有规则重叠，已打开该规则进行编辑';
      setShowToast(true);
      return;
    }

    setSpecialEditor({
      id: crypto.randomUUID(),
      startDate: selectedRange.start,
      endDate: selectedRange.end,
      year: Number.parseInt(selectedRange.start.slice(0, 4), 10),
      grid: emptyGrid(),
    });
  };

  const saveSpecialEditor = () => {
    if (!selectedProvince || !specialEditor) return;

    const dateRange = normalizeDateRange(specialEditor.startDate, specialEditor.endDate);
    if (!dateRange) return;

    const rules = gridToRules(specialEditor.grid);
    const now = new Date().toISOString();

    const conflicts = configs.filter(
      (config) => {
        if (config.province !== selectedProvince) return false;
        if (config.config_type !== 'special_date') return false;
        if (config.id === specialEditor.id) return false;
        const range = getConfigDateRange(config);
        if (!range) return false;
        return isRangeOverlapping(dateRange, range);
      },
    );

    const keep = configs.filter(
      (config) => {
        if (config.province !== selectedProvince) return true;
        if (config.config_type !== 'special_date') return true;
        if (config.id === specialEditor.id) return false;
        const range = getConfigDateRange(config);
        if (!range) return true;
        return !isRangeOverlapping(dateRange, range);
      },
    );

    const encodedSpecialDate =
      dateRange.start === dateRange.end ? dateRange.start : `${dateRange.start}~${dateRange.end}`;

    const next: TimeConfig = {
      id: specialEditor.id,
      province: selectedProvince,
      year: Number.parseInt(dateRange.start.slice(0, 4), 10),
      config_type: 'special_date',
      month_pattern: 'Special',
      special_date: encodedSpecialDate,
      special_date_end: dateRange.end,
      time_rules: rules,
      updated_at: now,
      last_modified: now,
    };

    onSave?.([...keep, next]);
    setSpecialEditor(null);
    setSpecialStartDateInput('');
    setSpecialEndDateInput('');

    toastMessage.current = conflicts.length > 0 ? '存在区间重叠，已覆盖冲突规则' : '特殊日期区间规则已保存';
    setShowToast(true);
  };

  const deleteSpecialConfig = (id: string) => {
    onSave?.(configs.filter((config) => config.id !== id));
  };

  const updateSpecialCell = (hour: number) => {
    if (!specialEditor) return;
    const next = [...specialEditor.grid];
    next[hour] = specialActiveType;
    setSpecialEditor({ ...specialEditor, grid: next });
  };

  const handleSpecialMouseEnter = (hour: number) => {
    if (!specialDragging) return;
    updateSpecialCell(hour);
  };

  const formatDateRange = (start?: string, end?: string) => {
    if (!start) return '';
    const range = normalizeDateRange(start, end);
    if (!range) return start;
    return range.start === range.end ? range.start : `${range.start} 至 ${range.end}`;
  };

  const handleEditMonth = (month: number, year: number) => {
    setSelectedEditYear(year);
    setFocusMonth(month);
    requestAnimationFrame(() => {
      matrixContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] gap-6 animate-in slide-in-from-right-4 duration-500">
        <div className="w-full lg:w-1/4 flex flex-col gap-4 overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b bg-slate-50">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800 mb-3">
              <Library className="text-blue-600" /> 省份列表
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="搜索省份..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              {readOnly ? '选择省份查看分时规则' : '输入不存在的省份名称后，列表底部会出现"新增\u0022省份名\u0022"按钮。'}
            </p>
          </div>

          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {filteredProvinces.map((province) => {
              const hasConfig = provinceStatus[province];
              const isSelected = selectedProvince === province;

              return (
                <div
                  key={province}
                  className={`w-full flex items-center justify-between transition-all hover:bg-slate-50 border-l-4 group ${
                    isSelected
                      ? 'border-l-blue-600 bg-blue-50 text-blue-700 font-bold'
                      : 'border-l-transparent text-slate-600'
                  }`}
                >
                  <button
                    onClick={() => setSelectedProvince(province)}
                    className="flex-1 px-4 py-3 flex items-center gap-3 text-left"
                  >
                    <MapPin size={16} className={hasConfig ? 'text-blue-500' : 'text-slate-300'} />
                    <span>{province}</span>
                  </button>

                  {hasConfig && (
                    <div className="pr-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                      {!readOnly && (
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setDeleteConfirmProvince(province);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="清空配置"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {!readOnly && searchTerm &&
              trimmedSearchTerm &&
              !filteredProvinces.includes(searchTerm) &&
              !provinceStatus[trimmedSearchTerm] &&
              !isTrimmedDuplicate && (
                <button
                  onClick={handleCreateProvince}
                  className="w-full px-4 py-3 flex items-center gap-3 text-slate-500 hover:bg-blue-50 hover:text-blue-600 border-l-4 border-l-transparent border-t border-slate-100 group"
                >
                  <div className="bg-slate-100 p-1 rounded group-hover:bg-blue-200 text-slate-400 group-hover:text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                  </div>
                  <span>新增 "{searchTerm}"</span>
                </button>
              )}
          </div>
        </div>

        <div className="w-full lg:w-3/4 flex flex-col overflow-hidden">
          {!selectedProvince ? (
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-slate-400">
              <Library size={64} className="mb-4 opacity-10" />
              <p className="text-lg">{readOnly ? '请在左侧选择省份查看分时规则' : '请在左侧选择省份进行配置'}</p>
              <p className="text-sm mt-2 opacity-60">{readOnly ? '支持按月份展示多年份规则和特殊日期' : '支持按月份展示多年份规则和特殊日期覆盖'}</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              <Card className="p-4 border border-slate-200">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={16} className="text-blue-600" />
                    <span className="text-sm font-bold text-slate-700">年份显示控制</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {availableYears.map((year) => (
                      <button
                        key={year}
                        onClick={() => toggleVisibleYear(year)}
                        className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                          displayYears.includes(year)
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-white text-slate-500 border-slate-200'
                        }`}
                      >
                        {year}年
                      </button>
                    ))}
                    {!readOnly && (
                    <>
                    <input
                      type="number"
                      min={2000}
                      max={2100}
                      placeholder="新增年份"
                      value={newYearInput}
                      onChange={(event) => setNewYearInput(event.target.value)}
                      className="w-24 px-2 py-1 text-xs border rounded"
                    />
                    <button onClick={handleAddYear} className="text-xs px-2.5 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">
                      <Plus size={12} className="inline-block mr-1" />新增
                    </button>
                    </>
                    )}
                  </div>
                </div>
                {!readOnly && (
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <span>当前编辑年份：</span>
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {selectedEditYear} 年
                  </span>
                </div>
                )}
              </Card>

              {/* Month collapse toggle */}
              {monthGroups.length < 12 && (
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => setMonthsCollapsed((prev) => !prev)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-1.5"
                  >
                    {monthsCollapsed ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        展开全部月份（{12}个）
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                        合并相同月份（{monthGroups.length}组）
                      </>
                    )}
                  </button>
                </div>
              )}

              {monthsCollapsed && monthGroups.length < 12 ? (
                /* Collapsed: grouped months */
                monthGroups.map((group) => (
                  <Card key={`group-${group.months.join(',')}`} className="p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-slate-700">
                        {group.months.length === 1
                          ? `${group.months[0]}月`
                          : group.months.length <= 4
                            ? group.months.map((m) => `${m}月`).join('、')
                            : `${group.months[0]}月-${group.months[group.months.length - 1]}月（${group.months.length}个月）`}
                      </h3>
                      {group.months.length > 1 && (
                        <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                          相同配置
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {displayYears.map((year) => {
                        const grid = getMonthlyGrid(group.months[0], year);
                        return (
                          <div key={`group-${group.months[0]}-${year}`} className={`grid ${readOnly ? 'grid-cols-[72px,1fr]' : 'grid-cols-[72px,1fr,66px]'} gap-3 items-center`}>
                            <span className="text-xs font-medium text-slate-500">{year}年</span>
                            <MiniGrid grid={grid} />
                            {!readOnly && (
                            <button
                              onClick={() => handleEditMonth(group.months[0], year)}
                              className={`text-xs px-2 py-1 rounded border ${
                                selectedEditYear === year
                                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                                  : 'bg-white border-slate-200 text-slate-500 hover:text-blue-600'
                              }`}
                            >
                              编辑
                            </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                ))
              ) : (
                /* Expanded: individual months */
                MONTHS.map((month) => (
                <Card key={month} className="p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-700">{month}月</h3>
                    <span className="text-xs text-slate-400">按年份分层展示</span>
                  </div>
                  <div className="space-y-2">
                    {displayYears.map((year) => {
                      const grid = getMonthlyGrid(month, year);
                      return (
                        <div key={`${month}-${year}`} className={`grid ${readOnly ? 'grid-cols-[72px,1fr]' : 'grid-cols-[72px,1fr,66px]'} gap-3 items-center`}>
                          <span className="text-xs font-medium text-slate-500">{year}年</span>
                          <MiniGrid grid={grid} />
                          {!readOnly && (
                          <button
                            onClick={() => handleEditMonth(month, year)}
                            className={`text-xs px-2 py-1 rounded border ${
                              selectedEditYear === year
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : 'bg-white border-slate-200 text-slate-500 hover:text-blue-600'
                            }`}
                          >
                            编辑
                          </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))
              )}

              <Card className="p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-700">特殊日期区间总览</h3>
                  {!readOnly && (
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <input
                      type="date"
                      aria-label="特殊日期开始"
                      value={specialStartDateInput}
                      onChange={(event) => setSpecialStartDateInput(event.target.value)}
                      className="px-2 py-1 text-xs border rounded"
                    />
                    <span className="text-xs text-slate-400">至</span>
                    <input
                      type="date"
                      aria-label="特殊日期结束"
                      value={specialEndDateInput}
                      onChange={(event) => setSpecialEndDateInput(event.target.value)}
                      className="px-2 py-1 text-xs border rounded"
                    />
                    <button onClick={() => openSpecialEditor()} className="text-xs px-2.5 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">
                      新增特殊日期区间
                    </button>
                  </div>
                  )}
                </div>

                <div className="space-y-2">
                  {specialConfigs.length === 0 && <p className="text-xs text-slate-400">暂无特殊日期区间规则</p>}
                  {specialConfigs.map((config) => (
                    <div key={config.id} className={`grid ${readOnly ? 'grid-cols-[130px,1fr]' : 'grid-cols-[130px,1fr,120px]'} gap-3 items-center p-2 rounded border border-slate-100`}>
                      <div className="text-xs text-slate-600 font-medium">{formatDateRange(config.special_date, config.special_date_end)}</div>
                      <MiniGrid grid={rulesToGrid(config.time_rules)} />
                      {!readOnly && (
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openSpecialEditor(config)} className="text-xs text-blue-600 hover:text-blue-700">编辑</button>
                        <button onClick={() => deleteSpecialConfig(config.id)} className="text-xs text-red-500 hover:text-red-600">删除</button>
                      </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {!readOnly && specialEditor && (
                <Card className="p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-700">编辑特殊日期区间：{formatDateRange(specialEditor.startDate, specialEditor.endDate)}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSpecialEditor(null)} className="text-xs px-2.5 py-1 rounded border border-slate-200">取消</button>
                      <button onClick={saveSpecialEditor} className="text-xs px-2.5 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">保存特殊日期区间规则</button>
                    </div>
                  </div>

                  <div className="mb-3 flex items-center gap-2 flex-wrap">
                    <input
                      type="date"
                      aria-label="编辑特殊日期开始"
                      value={specialEditor.startDate}
                      onChange={(event) => setSpecialEditor({ ...specialEditor, startDate: event.target.value })}
                      className="px-2 py-1 text-xs border rounded"
                    />
                    <span className="text-xs text-slate-400">至</span>
                    <input
                      type="date"
                      aria-label="编辑特殊日期结束"
                      value={specialEditor.endDate}
                      onChange={(event) => setSpecialEditor({ ...specialEditor, endDate: event.target.value })}
                      className="px-2 py-1 text-xs border rounded"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {(['tip', 'peak', 'flat', 'valley', 'deep'] as TimeType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSpecialActiveType(type)}
                        className={`px-2 py-1 text-xs rounded border flex items-center gap-1.5 ${
                          specialActiveType === type
                            ? 'bg-white text-slate-800 ring-1 ring-slate-200'
                            : 'bg-slate-50 text-slate-500'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: getTypeColor(type) }} />
                        {getTypeLabel(type)}
                      </button>
                    ))}
                  </div>

                  <div
                    className="grid grid-cols-[repeat(24,minmax(0,1fr))] gap-px bg-slate-200 border border-slate-200 rounded overflow-hidden h-8"
                    onMouseUp={() => setSpecialDragging(false)}
                    onMouseLeave={() => setSpecialDragging(false)}
                  >
                    {specialEditor.grid.map((type, hour) => (
                      <div
                        key={hour}
                        style={{ background: getTypeColor(type) }}
                        className="h-full cursor-crosshair"
                        onMouseDown={() => {
                          setSpecialDragging(true);
                          updateSpecialCell(hour);
                        }}
                        onMouseEnter={() => handleSpecialMouseEnter(hour)}
                        title={`${hour}:00 - ${hour + 1}:00 ${getTypeLabel(type)}`}
                      />
                    ))}
                  </div>
                </Card>
              )}

              {!readOnly && (
              <div ref={matrixContainerRef}>
                <TimeConfigMatrix
                  configs={configs}
                  selectedProvince={selectedProvince}
                  selectedYear={selectedEditYear}
                  focusMonth={focusMonth}
                  onSave={handleMatrixSave}
                />
              </div>
              )}
            </div>
          )}
        </div>

        {!readOnly && (
        <ConfirmModal
          isOpen={deleteConfirmProvince !== null}
          title="确认清空"
          message={`确定要清空 ${deleteConfirmProvince} 的所有配置吗？此操作不可撤销。`}
          onConfirm={clearProvinceConfig}
          onCancel={() => setDeleteConfirmProvince(null)}
          confirmText="清空"
          danger
        />
        )}
      </div>

      {showToast && <Toast message={toastMessage.current} onClose={() => setShowToast(false)} />}
    </div>
  );
};
