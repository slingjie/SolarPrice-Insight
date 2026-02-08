import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { TimeConfig, TimeType, TimeRule } from '../types';
import { getTypeColor, getTypeLabel, PROVINCES } from '../constants';
import { rulesToGrid, gridToRules } from '../utils/timeUtils';
import { Card, ConfirmModal, Toast, Badge } from './UI';

interface TimeConfigMatrixProps {
    configs: TimeConfig[];
    selectedProvince: string;
    onSave: (province: string, newConfigs: TimeConfig[]) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

type DayKind = 'weekday' | 'weekend';

export const TimeConfigMatrix: React.FC<TimeConfigMatrixProps> = ({ configs, selectedProvince, onSave }) => {
    const [activeDay, setActiveDay] = useState<DayKind>('weekday');
    const [matrix, setMatrix] = useState<Record<DayKind, Record<number, TimeType[]>>>({
        weekday: {},
        weekend: {},
    });
    const [activeType, setActiveType] = useState<TimeType>('valley');
    const [isDragging, setIsDragging] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const toastMessage = useRef("保存成功");

    // 初始化矩阵数据
    useEffect(() => {
        if (!selectedProvince) return;

        const initialWeekday: Record<number, TimeType[]> = {};
        const initialWeekend: Record<number, TimeType[]> = {};
        MONTHS.forEach(m => {
            initialWeekday[m] = Array(24).fill('valley');
            initialWeekend[m] = Array(24).fill('valley');
        });

        // 从 configs 中填充数据
        const provinceConfigs = configs.filter(c => c.province === selectedProvince);

        provinceConfigs.forEach(cfg => {
            const weekdayGrid = rulesToGrid(cfg.time_rules);
            const weekendGrid = rulesToGrid((cfg.weekend_time_rules && cfg.weekend_time_rules.length > 0) ? cfg.weekend_time_rules : cfg.time_rules);

            if (cfg.month_pattern === 'All') {
                MONTHS.forEach(m => {
                    initialWeekday[m] = [...weekdayGrid];
                    initialWeekend[m] = [...weekendGrid];
                });
            } else {
                // 解析 "1,2,3" 这种格式
                const targetMonths = cfg.month_pattern.split(',')
                    .map(s => parseInt(s.trim()))
                    .filter(n => !isNaN(n) && n >= 1 && n <= 12);

                targetMonths.forEach(m => {
                    initialWeekday[m] = [...weekdayGrid];
                    initialWeekend[m] = [...weekendGrid];
                });
            }
        });

        setMatrix({ weekday: initialWeekday, weekend: initialWeekend });
    }, [selectedProvince, configs]);

    // 鼠标交互处理
    const handleCellClick = (month: number, hour: number) => {
        setMatrix(prev => {
            const current = prev[activeDay];
            const newRow = [...(current[month] ?? Array(24).fill('valley'))];
            newRow[hour] = activeType;
            return { ...prev, [activeDay]: { ...current, [month]: newRow } };
        });
    };

    const handleMouseEnter = (month: number, hour: number) => {
        if (isDragging) {
            handleCellClick(month, hour);
        }
    };

    const handleSave = () => {
        // 1. 将矩阵转换为 Rules 并分组
        // key: JSON.stringify(rules), value: month[]
        const groups: Record<string, number[]> = {};

        MONTHS.forEach(m => {
            const weekdayGrid = matrix.weekday[m];
            const weekendGrid = matrix.weekend[m];

            const weekdayRules = gridToRules(weekdayGrid);
            const weekendRules = gridToRules(weekendGrid);

            const weekdayKey = JSON.stringify(weekdayRules);
            const weekendKey = JSON.stringify(weekendRules);

            const key = JSON.stringify({
                weekday: weekdayRules,
                weekend: weekendKey === weekdayKey ? null : weekendRules,
            });

            if (!groups[key]) groups[key] = [];
            groups[key].push(m);
        });

        // 2. 生成新的 TimeConfigs
        const newConfigs: TimeConfig[] = [];

        // 检查是否所有月份规则都相同
        const uniqueKeys = Object.keys(groups);
        if (uniqueKeys.length === 1 && groups[uniqueKeys[0]].length === 12) {
            // 全年统一
            const parsed = JSON.parse(uniqueKeys[0]) as { weekday: TimeRule[]; weekend: TimeRule[] | null };
            newConfigs.push({
                id: crypto.randomUUID(),
                province: selectedProvince,
                month_pattern: 'All',
                time_rules: parsed.weekday,
                ...(parsed.weekend ? { weekend_time_rules: parsed.weekend } : {}),
                updated_at: new Date().toISOString(),
                last_modified: new Date().toISOString()
            });
        } else {
            // 分组保存
            Object.entries(groups).forEach(([rulesJson, months]) => {
                const parsed = JSON.parse(rulesJson) as { weekday: TimeRule[]; weekend: TimeRule[] | null };
                if (parsed.weekday.length === 0) return;

                // 排序月份并生成 "1,2,5" 字符串
                const pattern = months.sort((a, b) => a - b).join(',');

                newConfigs.push({
                    id: crypto.randomUUID(),
                    province: selectedProvince,
                    month_pattern: pattern,
                    time_rules: parsed.weekday,
                    ...(parsed.weekend ? { weekend_time_rules: parsed.weekend } : {}),
                    updated_at: new Date().toISOString(),
                    last_modified: new Date().toISOString()
                });
            });
        }

        console.log('[Matrix] Generated configs:', newConfigs);
        onSave(selectedProvince, newConfigs);
        toastMessage.current = `已保存 ${selectedProvince} 的配置`;
        setShowToast(true);
    };

    // 批量应用整行
    const applyRow = (month: number) => {
        setMatrix(prev => ({
            ...prev,
            [activeDay]: {
                ...prev[activeDay],
                [month]: Array(24).fill(activeType),
            },
        }));
    };

    // 复制上一月
    const copyPrevMonth = (currentMonth: number) => {
        if (currentMonth === 1) return;
        setMatrix(prev => ({
            ...prev,
            [activeDay]: {
                ...prev[activeDay],
                [currentMonth]: [...prev[activeDay][currentMonth - 1]],
            },
        }));
    };

    const copyWeekdayToWeekend = () => {
        setMatrix(prev => ({
            ...prev,
            weekend: { ...prev.weekday },
        }));
    };

    return (
        <Card className="flex-1 flex flex-col overflow-hidden h-full">
            {/* 顶部工具栏 */}
            <div className="p-4 border-b flex justify-between items-center bg-white z-10">
                <div className="flex items-center gap-6">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        {selectedProvince}
                        <span className="text-xs font-normal text-slate-400 px-2 py-0.5 bg-slate-100 rounded">12个月全量编辑模式</span>
                    </h3>

                    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveDay('weekday')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeDay === 'weekday'
                                ? 'bg-white shadow text-slate-800 ring-1 ring-slate-200'
                                : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                                }`}
                        >
                            工作日
                        </button>
                        <button
                            onClick={() => setActiveDay('weekend')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeDay === 'weekend'
                                ? 'bg-white shadow text-slate-800 ring-1 ring-slate-200'
                                : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                                }`}
                        >
                            周末
                        </button>
                    </div>

                    {activeDay === 'weekend' && (
                        <button
                            onClick={copyWeekdayToWeekend}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700 underline underline-offset-4"
                            title="将工作日矩阵复制到周末（未配置周末时将视为沿用工作日）"
                        >
                            从工作日复制
                        </button>
                    )}

                    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                        {(['tip', 'peak', 'flat', 'valley', 'deep'] as TimeType[]).map(t => (
                            <button
                                key={t}
                                onClick={() => setActiveType(t)}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeType === t
                                    ? 'bg-white shadow text-slate-800 ring-1 ring-slate-200'
                                    : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                                    }`}
                            >
                                <div className="w-3 h-3 rounded-full" style={{ background: getTypeColor(t) }} />
                                {getTypeLabel(t)}
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

            {/* 矩阵主体 */}
            <div
                className="flex-1 overflow-auto p-6"
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
            >
                <div className="min-w-[800px] select-none">
                    {/* 表头小时刻度 */}
                    <div className="flex mb-2">
                        <div className="w-24 shrink-0"></div>
                        <div className="flex-1 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-px">
                            {HOURS.map(h => (
                                <div key={h} className="text-[10px] text-slate-400 text-center border-l border-slate-100 pb-1">
                                    {h}
                                </div>
                            ))}
                        </div>
                        <div className="w-20 shrink-0"></div>
                    </div>

                    {/* 月份行 */}
                    <div className="space-y-1">
                        {MONTHS.map(m => (
                            <div key={m} className="flex items-center hover:bg-slate-50 rounded-lg p-1 transition-colors group">
                                {/* 月份标签 */}
                                <div className="w-24 shrink-0 font-bold text-slate-600 text-sm flex flex-col justify-center">
                                    <span>{m}月</span>
                                    {m > 1 && (
                                        <button
                                            onClick={() => copyPrevMonth(m)}
                                            className="text-[10px] text-blue-400 hover:text-blue-600 font-normal opacity-0 group-hover:opacity-100 transition-opacity text-left"
                                            title="复制上月配置"
                                        >
                                            同上月
                                        </button>
                                    )}
                                </div>

                                {/* 24小时格子 */}
                                <div
                                    className="flex-1 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-px bg-slate-200 border border-slate-200 rounded overflow-hidden cursor-crosshair h-8"
                                    onMouseDown={() => setIsDragging(true)}
                                >
                                    {matrix[activeDay][m]?.map((type, h) => (
                                        <div
                                            key={h}
                                            className="h-full transition-colors"
                                            style={{ background: getTypeColor(type) }}
                                            onMouseDown={() => handleCellClick(m, h)}
                                            onMouseEnter={() => handleMouseEnter(m, h)}
                                            title={`${m}月 ${h}:00 - ${h + 1}:00: ${getTypeLabel(type)}`}
                                        />
                                    ))}
                                </div>

                                {/* 行操作 */}
                                <div className="w-20 shrink-0 pl-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => applyRow(m)}
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
