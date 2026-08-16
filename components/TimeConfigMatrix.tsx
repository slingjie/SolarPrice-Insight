import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Save,
  Sparkles,
  BatteryCharging,
  Zap,
  Calendar,
  Camera,
  FileSpreadsheet,
  Check,
  RotateCcw,
  Copy,
  Paintbrush
} from 'lucide-react';
import { TimeConfig, TimeType } from '../types';
import { getTypeColor, getTypeLabel } from '../constants';
import { rulesToGrid, gridToRules } from '../utils/timeUtils';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

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
  const matrixCaptureRef = useRef<HTMLDivElement>(null);
  const [matrix, setMatrix] = useState<Record<number, TimeType[]>>({});
  const [activeType, setActiveType] = useState<TimeType>('valley');
  const [isDragging, setIsDragging] = useState(false);
  const [highlightedMonth, setHighlightedMonth] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<{ title: string; desc: string } | null>(null);
  const monthRowRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const showToast = (title: string, desc: string) => {
    setToastMsg({ title, desc });
    setTimeout(() => setToastMsg(null), 3500);
  };

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
    showToast('配置已保存', `已成功保存 ${selectedProvince} ${selectedYear} 年度分时规则`);
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
      const tipCount = row.filter((t) => t === 'tip' || (t as string) === 'sharp').length;
      const peakCount = row.filter((t) => t === 'peak').length;
      const valleyCount = row.filter((t) => t === 'valley' || t === 'deep').length;

      totalTipHours += tipCount;
      totalPeakHours += peakCount;
      totalValleyHours += valleyCount;

      if (tipCount > 0) tipMonthsCount++;

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

  // 🌟 功能 1：下载 12×24 全景矩阵高清长图 (PNG)
  const handleCaptureMatrix = async () => {
    if (!matrixCaptureRef.current) return;
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(matrixCaptureRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${selectedProvince}_${selectedYear}年_12个月分时时段规则全景矩阵图.png`;
      link.href = imgData;
      link.click();
      showToast('矩阵长图已导出', `已成功保存 ${selectedProvince} 12×24 分时全景矩阵长图 (PNG)`);
    } catch (err) {
      console.error(err);
      alert('矩阵长图生成失败');
    } finally {
      setIsCapturing(false);
    }
  };

  // 🌟 功能 2：导出 12 个月 24 小时分时规则表 (Excel)
  const handleExportMatrixExcel = () => {
    const rows: Record<string, any>[] = [];

    MONTHS.forEach((m) => {
      const mStr = `${selectedYear}-${String(m).padStart(2, '0')}`;
      const rowData = matrix[m] || Array(24).fill('valley');

      const tipCount = rowData.filter((t) => t === 'tip' || (t as string) === 'sharp').length;
      const peakCount = rowData.filter((t) => t === 'peak').length;
      const flatCount = rowData.filter((t) => t === 'flat').length;
      const valleyCount = rowData.filter((t) => t === 'valley').length;
      const deepCount = rowData.filter((t) => t === 'deep').length;

      const row: Record<string, any> = {
        省份: selectedProvince,
        年份: selectedYear,
        月份: mStr,
        '尖峰(h)': tipCount,
        '高峰(h)': peakCount,
        '平段(h)': flatCount,
        '低谷(h)': valleyCount,
        '深谷(h)': deepCount,
      };

      for (let h = 0; h < 24; h++) {
        const startH = h.toString().padStart(2, '0');
        const endH = (h + 1).toString().padStart(2, '0');
        const rangeKey = `${startH}:00~${endH}:00`;
        row[rangeKey] = getTypeLabel(rowData[h]);
      }
      rows.push(row);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, '全年分时时段规则');

    const fileName = `${selectedProvince}_${selectedYear}年_12个月分时时段规则矩阵表.xlsx`;
    XLSX.writeFile(wb, fileName);
    showToast('规则表已导出', `已成功生成 ${selectedProvince} 全年 12 个月分时时段 Excel 矩阵表`);
  };

  return (
    <div className="space-y-6">
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

      {/* 🌟 1. 4 大年度宏观时段统计看板卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel glass-panel-hover p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">尖峰执行月数</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
              尖峰覆盖
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {yearStats.tipMonthsCount}
            </span>
            <span className="text-xs font-medium text-slate-400">个月</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            全年累计 <b className="text-rose-600 tabular-nums">{yearStats.totalTipHours}</b> 小时尖峰
          </div>
          <div className="absolute -right-3 -bottom-3 w-14 h-14 bg-rose-500/5 rounded-full blur-lg pointer-events-none"></div>
        </div>

        <div className="glass-panel glass-panel-hover p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">低谷累计时长</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
              谷电基准
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {yearStats.totalValleyHours}
            </span>
            <span className="text-xs font-medium text-slate-400">小时/年</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            日均低谷约 <b className="text-emerald-600 tabular-nums">{(yearStats.totalValleyHours / 12).toFixed(1)}h</b> (占比 {((yearStats.totalValleyHours / (12 * 24)) * 100).toFixed(0)}%)
          </div>
          <div className="absolute -right-3 -bottom-3 w-14 h-14 bg-emerald-500/5 rounded-full blur-lg pointer-events-none"></div>
        </div>

        <div className="glass-panel glass-panel-hover p-4 rounded-2xl relative overflow-hidden border-indigo-200/80 bg-gradient-to-b from-white/90 to-indigo-50/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">两充两放黄金月</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
              储能窗口
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-indigo-600 tracking-tight tabular-nums">
              {yearStats.twoChargeMonthsCount}
            </span>
            <span className="text-xs font-medium text-slate-400">个月</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            具备午间低谷充/傍晚尖峰放
          </div>
          <div className="absolute -right-3 -bottom-3 w-14 h-14 bg-indigo-500/10 rounded-full blur-lg pointer-events-none"></div>
        </div>

        <div className="glass-panel glass-panel-hover p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">全年规则状态</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
              12月在册
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              100%
            </span>
            <span className="text-xs font-medium text-slate-400">完整度</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {selectedProvince} · {selectedYear} 年度基准规则
          </div>
          <div className="absolute -right-3 -bottom-3 w-14 h-14 bg-blue-500/5 rounded-full blur-lg pointer-events-none"></div>
        </div>
      </div>

      {/* 🌟 2. 核心 12×24 全景矩阵大画板 */}
      <div
        ref={matrixCaptureRef}
        className="glass-panel p-6 rounded-2xl space-y-5 bg-white border border-slate-200/90 shadow-sm select-none"
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* 顶部标题、调色盘笔刷与操作按钮 */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar size={16} className="text-indigo-600" />
                <span>{selectedProvince} · {selectedYear} 年 12个月×24h 分时时段全景大矩阵</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                支持画笔涂抹、鼠标拖拽批量绘制，可导出长图与 Excel 规则表
              </p>
            </div>

            {/* 调色盘笔刷工具栏 */}
            <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 text-xs">
              {(['tip', 'peak', 'flat', 'valley', 'deep'] as TimeType[]).map((type) => {
                const isActive = activeType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setActiveType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-white shadow text-slate-900 ring-1 ring-slate-200'
                        : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getTypeColor(type) }} />
                    <span>{getTypeLabel(type)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* 截图长图下载 */}
            <button
              onClick={handleCaptureMatrix}
              disabled={isCapturing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 text-xs font-semibold transition-all shadow-sm group"
              title="下载 12×24 全景矩阵高清长图"
            >
              <Camera size={14} className="text-slate-500 group-hover:text-indigo-600" />
              <span>{isCapturing ? '生成中...' : '下载矩阵长图'}</span>
            </button>

            {/* 导出 Excel 规则表 */}
            <button
              onClick={handleExportMatrixExcel}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-emerald-200 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 shadow-sm transition-all group"
              title="导出 12 个月 24 小时分时规则表"
            >
              <FileSpreadsheet size={14} />
              <span>导出规则 (Excel)</span>
            </button>

            {/* 保存配置 */}
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95"
            >
              <Save size={14} />
              <span>保存配置</span>
            </button>
          </div>
        </div>

        {/* 12×24 矩阵画板主体 */}
        <div className="space-y-2">
          {/* 顶部 24 小时连续刻度尺 (00-01 ~ 23-24) */}
          <div className="flex items-center gap-2 pl-14 pr-24">
            <div className="grid grid-cols-24 gap-1 w-full" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
              {HOURS.map((h) => {
                const startH = String(h).padStart(2, '0');
                const endH = String(h + 1).padStart(2, '0');
                return (
                  <div key={h} className="text-center text-[10px] font-bold text-slate-400 tabular-nums tracking-tighter">
                    {startH}-{endH}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 1~12 月行矩阵 */}
          <div className="space-y-1.5">
            {MONTHS.map((month) => {
              const row = matrix[month] || Array(24).fill('valley');
              const isHighlighted = highlightedMonth === month;

              const tipCount = row.filter((t) => t === 'tip' || (t as string) === 'sharp').length;
              const peakCount = row.filter((t) => t === 'peak').length;
              const flatCount = row.filter((t) => t === 'flat').length;
              const valleyCount = row.filter((t) => t === 'valley' || t === 'deep').length;

              return (
                <div
                  key={month}
                  ref={(el) => {
                    monthRowRefs.current[month] = el;
                  }}
                  className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all ${
                    isHighlighted
                      ? 'bg-indigo-50 border-indigo-400 shadow-md ring-2 ring-indigo-300/50'
                      : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-indigo-200'
                  }`}
                >
                  {/* 月份标题 */}
                  <div className="w-12 text-center text-xs font-bold text-slate-700 tabular-nums flex-shrink-0">
                    {String(month).padStart(2, '0')}月
                  </div>

                  {/* 24 个时间块 */}
                  <div
                    className="grid grid-cols-24 gap-1 flex-1 h-7"
                    style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}
                  >
                    {HOURS.map((h) => {
                      const type = row[h];
                      const startH = String(h).padStart(2, '0');
                      const endH = String(h + 1).padStart(2, '0');
                      const rangeText = `${startH}:00~${endH}:00`;
                      const label = getTypeLabel(type);

                      return (
                        <div
                          key={h}
                          title={`${month}月 ${h}:00 - ${h + 1}:00: ${label}`}
                          onMouseDown={() => {
                            setIsDragging(true);
                            handleCellClick(month, h);
                          }}
                          onMouseEnter={() => handleMouseEnter(month, h)}
                          className="group relative h-full rounded-md cursor-pointer transition-transform hover:scale-110 hover:z-20 shadow-xs border border-black/5 flex items-center justify-center"
                          style={{ backgroundColor: getTypeColor(type) }}
                        >
                          {/* 悬浮 Tooltip 气泡 */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none w-28">
                            <div className="bg-slate-900 text-white text-[10px] py-1.5 px-2 rounded-lg shadow-xl text-center whitespace-nowrap">
                              <div className="font-bold text-slate-200">{String(month).padStart(2, '0')}月 · {rangeText}</div>
                              <div className="text-indigo-300 font-extrabold mt-0.5">[{label}]</div>
                            </div>
                            <div className="w-2 h-2 bg-slate-900 transform rotate-45 -mt-1"></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 右侧微型操作与结构徽章 (快捷整行铺色、复制上一月) */}
                  <div className="flex items-center gap-1 w-20 flex-shrink-0 justify-end">
                    <button
                      onClick={() => applyRow(month)}
                      className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-200/80 transition-colors"
                      title="按当前画笔铺满整月"
                    >
                      <Paintbrush size={13} />
                    </button>
                    {month > 1 && (
                      <button
                        onClick={() => copyPrevMonth(month)}
                        className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-200/80 transition-colors"
                        title="复制上一月时段规则"
                      >
                        <Copy size={13} />
                      </button>
                    )}
                    <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                      {tipCount > 0 ? `尖${tipCount}` : `峰${peakCount}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
