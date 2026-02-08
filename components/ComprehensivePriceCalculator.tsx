import React, { useState, useMemo, useEffect } from 'react';
import { Calculator, Calendar, ArrowRight, Save, Trash2, Clock, TrendingUp, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from './UI';
import { TariffData, SavedTimeRange, ComprehensiveResult, TimeConfig } from '../types';
import { PROVINCES, DEFAULT_TIME_CONFIGS, getTypeColor, getTypeLabel } from '../constants.tsx';
import { getDatabase } from '../services/db';
import { calculateAveragePrice, CalculationResult } from '../services/priceCalculator';
import { resolveTimeConfigForMonth } from '../utils/timeConfigResolver';
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell } from 'recharts';

interface ComprehensivePriceCalculatorProps {
    tariffs: TariffData[];
    timeConfigs: TimeConfig[];
    onNavigate: (view: string) => void;
}


interface PriceResult extends CalculationResult {}

export const ComprehensivePriceCalculator: React.FC<ComprehensivePriceCalculatorProps> = ({ tariffs: allTariffs, timeConfigs, onNavigate }) => {
    const [dbProvinces, setDbProvinces] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [initLoading, setInitLoading] = useState(true);

    const [formData, setFormData] = useState({
        province: PROVINCES[0],
        category: '',
        voltage: '',
        months: [] as string[], // "YYYY-MM"
        startTime: '08:00',
        endTime: '17:00'
    });

    const provinceTariffs = useMemo(() => {
        return allTariffs.filter(t => t.province === formData.province);
    }, [allTariffs, formData.province]);

    const activeProvinces = useMemo(() => {
        return Array.from(new Set(allTariffs.map(t => t.province))).sort();
    }, [allTariffs]);

    // sync dbProvinces with activeProvinces
    useEffect(() => {
        setDbProvinces(activeProvinces);
        setInitLoading(false);
        if (activeProvinces.length > 0 && !activeProvinces.includes(formData.province)) {
            setFormData(prev => ({ ...prev, province: activeProvinces[0] }));
        }
    }, [activeProvinces]);


    const [results, setResults] = useState<PriceResult[]>([]);
    const [savedRanges, setSavedRanges] = useState<SavedTimeRange[]>([]);
    const [newRangeName, setNewRangeName] = useState('');
    const [actionStatus, setActionStatus] = useState<{ type: 'error' | 'success', msg: string } | null>(null);
    const [calcMsg, setCalcMsg] = useState<{ type: 'error' | 'success', msg: string } | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [isSavingResult, setIsSavingResult] = useState(false);


    // Calculate Average over all selected months
    const totalAvgPrice = useMemo(() => {
        if (results.length === 0) return 0;
        const totalValueSum = results.reduce((acc, curr) => acc + (curr.avgPrice * curr.totalHours), 0);
        const totalHoursSum = results.reduce((acc, curr) => acc + curr.totalHours, 0);
        return totalHoursSum > 0 ? totalValueSum / totalHoursSum : 0;
    }, [results]);

    const averageHours = useMemo(() => {
        if (results.length === 0) return 0;
        return results.reduce((acc, curr) => acc + curr.totalHours, 0) / results.length;
    }, [results]);

    // Load saved time ranges
    useEffect(() => {
        const loadSaved = async () => {
            try {
                const db = await getDatabase();
                const ranges = await db.saved_time_ranges.find().exec();
                setSavedRanges(ranges.map(d => d.toJSON()));
            } catch (err) {
                console.error("Failed to load saved ranges:", err);
            }
        };
        loadSaved();
    }, []);

    const [isDetailExpanded, setIsDetailExpanded] = useState(false);


    const handleSaveRange = async () => {
        if (!newRangeName.trim()) {
            setActionStatus({ type: 'error', msg: '请写一个名称' });
            setTimeout(() => setActionStatus(null), 3000);
            return;
        }
        setIsActionLoading(true);
        try {
            const db = await getDatabase();
            const newRange: SavedTimeRange = {
                id: crypto.randomUUID(),
                name: newRangeName,
                startTime: formData.startTime,
                endTime: formData.endTime,
                created_at: new Date().toISOString(),
                last_modified: new Date().toISOString()
            };
            await db.saved_time_ranges.insert(newRange);
            setSavedRanges(prev => [...prev, newRange]);
            setNewRangeName('');
            setActionStatus({ type: 'success', msg: '保存成功' });
            setTimeout(() => setActionStatus(null), 2000);
        } catch (err) {
            console.error("Failed to save range:", err);
            setActionStatus({ type: 'error', msg: '保存失败' });
            setTimeout(() => setActionStatus(null), 3000);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteRange = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (deleteConfirmId !== id) {
            setDeleteConfirmId(id);
            return;
        }

        setIsActionLoading(true);
        try {
            const db = await getDatabase();
            const doc = await db.saved_time_ranges.findOne(id).exec();
            if (doc) {
                await doc.remove();
                setSavedRanges(prev => prev.filter(r => r.id !== id));
            }
            setDeleteConfirmId(null);
        } catch (err) {
            console.error("Failed to delete range:", err);
            setActionStatus({ type: 'error', msg: '删除失败' });
            setTimeout(() => setActionStatus(null), 3000);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleApplyRange = (range: SavedTimeRange) => {
        setFormData(prev => ({
            ...prev,
            startTime: range.startTime,
            endTime: range.endTime
        }));
    };

    const handleSaveResult = async () => {
        if (results.length === 0 || !formData.province) return;

        setIsSavingResult(true);
        try {
            const db = await getDatabase();
            // We use a deterministic ID based on province (if we only want one main result per province)
            // Or use a UUID if we want multiple. For the floating list, let's stick to one main result per province
            // to keep it simple and clean.
            const resultId = `comp-${formData.province}`;

            const newResult: ComprehensiveResult = {
                id: resultId,
                province: formData.province,
                category: formData.category,
                voltage_level: formData.voltage,
                avg_price: totalAvgPrice,
                months: formData.months,
                start_time: formData.startTime,
                end_time: formData.endTime,
                last_modified: new Date().toISOString()
            };

            await db.comprehensive_results.upsert(newResult);

            setActionStatus({ type: 'success', msg: '电价结果已保存到数据中心' });
            setTimeout(() => setActionStatus(null), 3000);
        } catch (err) {
            console.error("Failed to save comprehensive result full error:", err);
            setActionStatus({ type: 'error', msg: `保存失败: ${err instanceof Error ? err.message : '未知错误'}` });
            setTimeout(() => setActionStatus(null), 5000);
        } finally {
            setTimeout(() => setIsSavingResult(false), 1000);
        }

    };


    // Derived options from filtered province tariffs
    const availableCategories = useMemo(() =>
        Array.from(new Set(provinceTariffs.map(t => t.category))), [provinceTariffs]);

    const availableVoltages = useMemo(() =>
        Array.from(new Set(provinceTariffs.filter(t => t.category === formData.category).map(t => t.voltage_level))),
        [provinceTariffs, formData.category]);

    const availableMonths = useMemo(() =>
        Array.from(new Set(provinceTariffs.filter(t =>
            t.category === formData.category &&
            t.voltage_level === formData.voltage
        ).map(t => t.month))).sort(),
        [provinceTariffs, formData.category, formData.voltage]);

    const getMonthToken = (monthValue: string): string => {
        const trimmed = monthValue.trim();
        const directMonthMatch = trimmed.match(/^(\d{1,2})$/);
        if (directMonthMatch) return directMonthMatch[1].padStart(2, '0');

        const yearMonthMatch = trimmed.match(/-(\d{1,2})$/);
        if (yearMonthMatch) return yearMonthMatch[1].padStart(2, '0');

        return trimmed;
    };

    const parseMonthNumber = (monthValue: string): number | null => {
        const monthToken = getMonthToken(monthValue);
        const parsed = Number.parseInt(monthToken, 10);
        if (!Number.isFinite(parsed) || parsed < 1 || parsed > 12) {
            return null;
        }
        return parsed;
    };


    const handleCalculate = () => {
        setCalcMsg(null);
        if (formData.months.length === 0) {
            setCalcMsg({ type: 'error', msg: "请至少选择一个月份" });
            setTimeout(() => setCalcMsg(null), 3000);
            return;
        }

        // Filter tariffs for selected province, category, voltage
        const selectedMonthSet = new Set(formData.months);
        const hasLegacyShortMonthSelection = formData.months.some(m => /^\d{1,2}$/.test(m.trim()));
        const selectedMonthTokenSet = new Set(
            hasLegacyShortMonthSelection ? formData.months.map(getMonthToken) : []
        );

        const filteredTariffs = provinceTariffs.filter((t) => {
            if (t.category !== formData.category || t.voltage_level !== formData.voltage) {
                return false;
            }

            if (selectedMonthSet.has(t.month)) {
                return true;
            }

            if (hasLegacyShortMonthSelection) {
                return selectedMonthTokenSet.has(getMonthToken(t.month));
            }

            return false;
        });

        const normalizedTariffs = filteredTariffs.map((tariff) => {
            if (Array.isArray(tariff.time_rules) && tariff.time_rules.length > 0) {
                return tariff;
            }

            const monthNumber = parseMonthNumber(tariff.month);
            if (!monthNumber) {
                return tariff;
            }

            const resolved = resolveTimeConfigForMonth(timeConfigs, tariff.province, monthNumber);
            if (!resolved || resolved.timeRules.length === 0) {
                return tariff;
            }

            return {
                ...tariff,
                time_rules: resolved.timeRules,
            };
        });

        const monthsToCalculate: string[] = Array.from(new Set<string>(normalizedTariffs.map(t => t.month))).sort();

        if (filteredTariffs.length === 0) {
            setCalcMsg({ type: 'error', msg: "在所选时段内未找到有效的电价规则" });
            setTimeout(() => setCalcMsg(null), 3000);
            return;
        }

        // Call service to calculate average prices
        const calcResults = calculateAveragePrice(
            normalizedTariffs,
            monthsToCalculate,
            formData.startTime,
            formData.endTime
        );

        if (calcResults.length === 0) {
            setCalcMsg({ type: 'error', msg: "在所选时段内未找到有效的电价规则" });
            setTimeout(() => setCalcMsg(null), 3000);
        }
        setResults(calcResults);
    };

    const handleMonthToggle = (m: string) => {
        setFormData(prev => {
            if (prev.months.includes(m)) {
                return { ...prev, months: prev.months.filter(x => x !== m) };
            } else {
                return { ...prev, months: [...prev.months, m] };
            }
        });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in slide-in-from-right-6 duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                            <Calculator size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">月度综合电价计算</h2>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Configuration Panel */}
                <Card className="p-6 space-y-6 lg:col-span-1 flex flex-col h-full">
                    <div className="space-y-4">
                        <div className="font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                            <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                            基础参数
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">省份</label>
                            {dbProvinces.length === 0 && !initLoading ? (
                                <div className="p-4 border border-dashed border-slate-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center gap-3">
                                    <p className="text-sm text-slate-600 font-medium">暂无电价数据</p>
                                    <button
                                        onClick={() => onNavigate('upload')}
                                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 active:scale-95 transition-all"
                                    >
                                        前往导入
                                    </button>
                                </div>
                            ) : (
                                <select
                                    className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 font-bold"
                                    value={formData.province}
                                    onChange={e => {
                                        setFormData({ ...formData, province: e.target.value, category: '', voltage: '', months: [] });
                                        setResults([]);
                                    }}
                                    disabled={initLoading}
                                >
                                    {initLoading ? (
                                        <option>加载中...</option>
                                    ) : dbProvinces.length > 0 ? (
                                        dbProvinces.map(p => <option key={p} value={p}>{p}</option>)
                                    ) : (
                                        <option value="">暂无数据省份</option>
                                    )}
                                </select>
                            )}
                            {dbProvinces.length === 0 && !initLoading && (
                                <p className="text-[10px] text-red-500 mt-1">数据库中暂无任何省份的电价数据</p>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">用电分类</label>
                            <select
                                className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value, voltage: '', months: [] })}
                                disabled={loading || availableCategories.length === 0}
                            >
                                <option value="">-- 请选择 --</option>
                                {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">电压等级</label>
                            <select
                                className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                                value={formData.voltage}
                                onChange={e => setFormData({ ...formData, voltage: e.target.value, months: [] })}
                                disabled={!formData.category || availableVoltages.length === 0}
                            >
                                <option value="">-- 请选择 --</option>
                                {availableVoltages.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                    </div>

                    {availableMonths.length > 0 && (
                        <div className="space-y-3 pt-2">
                            <div className="font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                                <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                                选择月份
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, months: availableMonths }));
                                    }}
                                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                                >
                                    全选
                                </button>
                                <button
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, months: [] }));
                                    }}
                                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={() => {
                                        const summerMonthSet = new Set(['06', '07', '08', '09']);
                                        const summerMonths = availableMonths.filter(m => summerMonthSet.has(getMonthToken(m)));
                                        setFormData(prev => ({ ...prev, months: summerMonths }));
                                    }}
                                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                                >
                                    夏季
                                </button>
                                <button
                                    onClick={() => {
                                        const winterMonthSet = new Set(['12', '01', '02']);
                                        const winterMonths = availableMonths.filter(m => winterMonthSet.has(getMonthToken(m)));
                                        setFormData(prev => ({ ...prev, months: winterMonths }));
                                    }}
                                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                                >
                                    冬季
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                                {availableMonths.map(m => (
                                    <label key={m} className={`
                                   flex items-center justify-center p-2 rounded-lg border cursor-pointer text-sm transition-all
                                   ${formData.months.includes(m) ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' : 'bg-white border-slate-200 hover:border-indigo-300'}
                               `}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={formData.months.includes(m)}
                                            onChange={() => handleMonthToggle(m)}
                                        />
                                        {m}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 pt-2">
                        <div className="font-bold text-slate-800 flex items-center justify-between border-b pb-2">
                            <div className="flex items-center gap-2">
                                <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                                计算时段
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <input
                                type="time"
                                className="flex-1 p-2.5 border rounded-lg text-center font-mono font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.startTime}
                                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                            />
                            <span className="text-slate-400"><ArrowRight size={16} /></span>
                            <input
                                type="time"
                                className="flex-1 p-2.5 border rounded-lg text-center font-mono font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.endTime}
                                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center gap-2 mt-2 group relative">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="时段名称 (如: 白班)"
                                    className="w-full text-xs p-2.5 border-b focus:border-indigo-500 outline-none bg-transparent transition-colors"
                                    value={newRangeName}
                                    onChange={e => {
                                        setNewRangeName(e.target.value);
                                        if (actionStatus) setActionStatus(null);
                                    }}
                                    onKeyDown={e => e.key === 'Enter' && !isActionLoading && handleSaveRange()}
                                />
                                {actionStatus && (
                                    <div className={`absolute -top-6 left-0 text-[10px] font-bold animate-in fade-in slide-in-from-bottom-1 ${actionStatus.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                                        {actionStatus.msg}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleSaveRange}
                                disabled={isActionLoading}
                                title="保存当前时段"
                                className={`p-2 rounded-lg transition-colors ${isActionLoading ? 'text-slate-300' : 'text-indigo-600 hover:bg-indigo-50'}`}
                            >
                                <Save size={20} />
                            </button>
                        </div>

                        {/* Saved Ranges List - Moved to bottom to prevent jumping of inputs */}
                        {savedRanges.length > 0 && (
                            <div className="pt-2 border-t mt-4">
                                <div className="text-[10px] font-bold text-slate-400 mb-2 flex items-center gap-1">
                                    <Clock size={10} /> 已保存时段
                                </div>
                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                                    {savedRanges.map(range => (
                                        <div
                                            key={range.id}
                                            onClick={() => handleApplyRange(range)}
                                            className={`
                                                group flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] cursor-pointer transition-all relative
                                                ${formData.startTime === range.startTime && formData.endTime === range.endTime
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'}
                                            `}
                                        >
                                            <span className="max-w-[80px] truncate">{range.name}</span>
                                            <button
                                                onClick={(e) => handleDeleteRange(range.id, e)}
                                                onMouseLeave={() => setDeleteConfirmId(null)}
                                                className={`
                                                    transition-all p-0.5 rounded-full
                                                    ${deleteConfirmId === range.id ? 'bg-red-500 text-white' : 'hover:bg-red-100 text-slate-400'}
                                                    ${formData.startTime === range.startTime && formData.endTime === range.endTime && deleteConfirmId !== range.id ? 'text-white/70' : ''}
                                                `}
                                                title={deleteConfirmId === range.id ? "再次点击确认删除" : "删除"}
                                            >
                                                <Trash2 size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative mt-auto">
                        {calcMsg && (
                            <div className={`absolute -top-12 left-0 right-0 p-2 text-center text-xs font-bold rounded-lg animate-in fade-in slide-in-from-bottom-1 z-10 ${calcMsg.type === 'error' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                {calcMsg.msg}
                            </div>
                        )}
                        <button
                            onClick={handleCalculate}
                            disabled={formData.months.length === 0}
                            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '加载中...' : '开始计算'}
                        </button>
                    </div>
                </Card>

                {/* Right: Results Panel */}
                <div className="lg:col-span-2 h-full flex flex-col gap-6">
                    {results.length > 0 ? (
                        <>
                            {/* Summary Card */}
                            <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 border-none shadow-xl shadow-indigo-200 relative overflow-hidden group min-h-[220px] shrink-0">
                                <div className="flex items-center justify-between mb-4 opacity-90 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <TrendingUp size={20} className="text-white" />
                                        </div>
                                        <span className="text-sm font-medium">所选月份平均综合电价</span>
                                    </div>
                                    <Calendar size={20} className="opacity-70" />
                                </div>
                                <div className="flex items-end justify-between relative z-10">
                                    <div className="text-5xl font-bold font-mono tracking-tight drop-shadow-sm">
                                        {totalAvgPrice.toFixed(4)} <span className="text-xl opacity-75 font-sans font-normal">元/kWh</span>
                                    </div>
                                    <button
                                        onClick={handleSaveResult}
                                        disabled={isSavingResult}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${isSavingResult ? 'bg-white/20 text-white/50' : 'bg-white text-indigo-600 hover:bg-white/90 active:scale-95 shadow-lg shadow-black/10'}`}
                                    >
                                        <Save size={16} />
                                        {isSavingResult ? '已保存' : '存至数据中心'}
                                    </button>
                                </div>
                                <div className="mt-8 flex flex-wrap gap-6 text-sm relative z-10">
                                    <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10 min-w-[100px]">
                                        <span className="opacity-70 text-xs block mb-1">已选月份</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="font-bold text-2xl">{formData.months.length}</span> <span className="text-xs opacity-70">个</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10 min-w-[100px]">
                                        <span className="opacity-70 text-xs block mb-1">日均时长</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="font-bold text-2xl">{averageHours.toFixed(1)}</span> <span className="text-xs opacity-70">h</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10 min-w-[100px]">
                                        <span className="opacity-70 text-xs block mb-1">最高单价</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="font-bold text-2xl">{Math.max(...results.map(r => r.avgPrice)).toFixed(4)}</span> <span className="text-xs opacity-70">元</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10 min-w-[100px]">
                                        <span className="opacity-70 text-xs block mb-1">最低单价</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="font-bold text-2xl">{Math.min(...results.map(r => r.avgPrice)).toFixed(4)}</span> <span className="text-xs opacity-70">元</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Decorative background element */}
                                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl group-hover:bg-purple-500/40 transition-all duration-700"></div>
                            </Card>

                            <Card className="p-6 border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[350px]">
                                <div className="flex items-center justify-between mb-6 shrink-0">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
                                            <BarChart3 size={18} />
                                        </div>
                                        <h3 className="font-bold text-slate-700">月度价格趋势分析</h3>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>均价
                                        <div className="w-2 h-2 rounded-full bg-indigo-300 ml-2"></div>趋势
                                    </div>
                                </div>
                                <div className="w-full flex-1 min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={results} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis 
                                                dataKey="month" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: '#64748b', fontSize: 11 }} 
                                                dy={10}
                                                tickFormatter={(value) => value.split('-')[1] + '月'}
                                            />
                                            <YAxis 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: '#64748b', fontSize: 11 }} 
                                                domain={['dataMin - 0.1', 'dataMax + 0.1']}
                                                tickFormatter={(value) => value.toFixed(2)}
                                            />
                                            <RechartsTooltip
                                                cursor={{ fill: '#f8fafc' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                labelStyle={{ color: '#64748b', marginBottom: '4px', fontWeight: 'bold' }}
                                                formatter={(value: number) => [value.toFixed(4) + ' 元/kWh', '平均电价']}
                                            />
                                            <Bar dataKey="avgPrice" barSize={32} fill="url(#colorPrice)" radius={[6, 6, 0, 0]}>
                                                {results.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.avgPrice === Math.max(...results.map(r => r.avgPrice)) ? '#ef4444' : (entry.avgPrice === Math.min(...results.map(r => r.avgPrice)) ? '#10b981' : '#6366f1')} fillOpacity={0.8} />
                                                ))}
                                            </Bar>
                                            <Line type="monotone" dataKey="avgPrice" stroke="#818cf8" strokeWidth={2} dot={{ r: 3, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 5 }} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden shrink-0">
                                <button
                                    onClick={() => setIsDetailExpanded(!isDetailExpanded)}
                                    className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                                >
                                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                        <Clock size={18} className="text-indigo-600" />
                                        月度详细数据
                                        <span className="text-xs font-normal text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                                            {results.length} 个月份
                                        </span>
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        {isDetailExpanded ? '收起' : '展开'}
                                        {isDetailExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </button>
                                
                                {isDetailExpanded && (
                                    <div className="p-6 border-t border-slate-200 animate-in slide-in-from-top-2">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {results.map((res, idx) => (
                                                <Card key={res.month} className="p-0 overflow-hidden hover:shadow-lg transition-all duration-300 border-slate-200 group">
                                                    <div className="bg-slate-50/50 p-4 border-b flex items-center justify-between group-hover:bg-indigo-50/30 transition-colors">
                                                        <div className="font-bold text-slate-700 flex items-center gap-2">
                                                            <span className="bg-white border px-2 py-0.5 rounded text-xs text-slate-400 font-mono">{idx + 1}</span>
                                                            <span className="text-lg">{res.month}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-mono font-bold text-indigo-600 text-xl leading-none">
                                                                {res.avgPrice.toFixed(4)}
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 mt-0.5">元/kWh</div>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 space-y-4">
                                                        <div className="space-y-1.5">
                                                            <div className="flex justify-between text-[10px] text-slate-400">
                                                                <span>时段构成</span>
                                                                <span>{res.totalHours.toFixed(1)}h</span>
                                                            </div>
                                                            <div className="flex bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                                                {res.details.map((d, i) => (
                                                                    <div
                                                                        key={i}
                                                                        style={{ width: `${(d.hours / res.totalHours) * 100}%`, backgroundColor: getTypeColor(d.type) }}
                                                                        title={`${getTypeLabel(d.type)}: ${d.hours.toFixed(1)}h`}
                                                                        className="hover:opacity-80 transition-opacity cursor-help"
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-xs bg-slate-50/50 rounded-lg p-2">
                                                            {res.details.map((d, i) => (
                                                                <div key={i} className="flex flex-col">
                                                                    <div className="flex items-center gap-1.5 mb-0.5">
                                                                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: getTypeColor(d.type) }}></div>
                                                                        <span className="text-slate-500 scale-90 origin-left">{getTypeLabel(d.type)}</span>
                                                                    </div>
                                                                    <div className="pl-3 flex items-baseline justify-between">
                                                                        <span className="font-mono font-bold text-slate-700">{d.price.toFixed(4)}</span>
                                                                        <span className="text-[10px] text-slate-400 scale-90 origin-right">{d.hours.toFixed(1)}h</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200 min-h-[600px] flex-1">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <Calculator size={32} className="text-slate-300" />
                            </div>
                            <p>请在左侧选择参数并开始计算</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
