import React, { useState, useEffect, useRef } from 'react';
import { Save } from 'lucide-react';
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

  return (
    <Card className="flex-1 flex flex-col overflow-hidden h-full">
      <div className="p-4 border-b flex justify-between items-center bg-white z-10">
        <div className="flex items-center gap-6">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            {selectedProvince}
            <span className="text-xs font-normal text-slate-400 px-2 py-0.5 bg-slate-100 rounded">
              {selectedYear}年 12个月全量编辑模式
            </span>
          </h3>

          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {(['tip', 'peak', 'flat', 'valley', 'deep'] as TimeType[]).map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${
                  activeType === type
                    ? 'bg-white shadow text-slate-800 ring-1 ring-slate-200'
                    : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                }`}
              >
                <div className="w-3 h-3 rounded-full" style={{ background: getTypeColor(type) }} />
                {getTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium shadow-sm transition-all active:scale-95"
        >
          <Save size={18} /> 保存配置
        </button>
      </div>

      <div
        className="flex-1 overflow-auto p-6"
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <div className="min-w-[800px] select-none">
          <div className="flex mb-2">
            <div className="w-24 shrink-0"></div>
            <div className="flex-1 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-px">
              {HOURS.map((hour) => (
                <div key={hour} className="text-[10px] text-slate-400 text-center border-l border-slate-100 pb-1">
                  {hour}
                </div>
              ))}
            </div>
            <div className="w-20 shrink-0"></div>
          </div>

          <div className="space-y-1">
            {MONTHS.map((month) => (
              <div
                key={month}
                ref={(el) => {
                  monthRowRefs.current[month] = el;
                }}
                className={`flex items-center hover:bg-slate-50 rounded-lg p-1 transition-colors group ${
                  highlightedMonth === month ? 'ring-2 ring-blue-300 bg-blue-50/40' : ''
                }`}
              >
                <div className="w-24 shrink-0 font-bold text-slate-600 text-sm flex flex-col justify-center">
                  <span>{month}月</span>
                  {month > 1 && (
                    <button
                      onClick={() => copyPrevMonth(month)}
                      className="text-[10px] text-blue-400 hover:text-blue-600 font-normal opacity-0 group-hover:opacity-100 transition-opacity text-left"
                      title="复制上月配置"
                    >
                      同上月
                    </button>
                  )}
                </div>

                <div
                  className="flex-1 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-px bg-slate-200 border border-slate-200 rounded overflow-hidden cursor-crosshair h-8"
                  onMouseDown={() => setIsDragging(true)}
                >
                  {(matrix[month] ?? Array(24).fill('valley')).map((type, hour) => (
                    <div
                      key={hour}
                      className="h-full transition-colors"
                      style={{ background: getTypeColor(type) }}
                      onMouseDown={() => handleCellClick(month, hour)}
                      onMouseEnter={() => handleMouseEnter(month, hour)}
                      title={`${month}月 ${hour}:00 - ${hour + 1}:00: ${getTypeLabel(type)}`}
                    />
                  ))}
                </div>

                <div className="w-20 shrink-0 pl-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => applyRow(month)}
                    className="text-xs text-slate-400 hover:text-blue-600 underline"
                    title={`将当前行全部设为${getTypeLabel(activeType)}`}
                  >
                    全涂
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showToast && <Toast message={toastMessage.current} onClose={() => setShowToast(false)} />}
    </Card>
  );
};
