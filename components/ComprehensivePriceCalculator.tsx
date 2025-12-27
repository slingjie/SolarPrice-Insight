import React, { useState, useMemo, useEffect } from 'react';
import { Calculator, Calendar, ArrowRight, Save, Trash2, Clock, PlusCircle } from 'lucide-react';
import { Card } from './UI';
import { TariffData, TimeType, SavedTimeRange, ComprehensiveResult } from '../types';
import { PROVINCES, DEFAULT_TIME_CONFIGS, getTypeColor, getTypeLabel } from '../constants.tsx';
import { getDatabase } from '../services/db';

interface ComprehensivePriceCalculatorProps {
    tariffs: TariffData[];
}


interface PriceResult {
    month: string;
    startTime: string;
    endTime: string;
    avgPrice: number;
    details: {
        type: TimeType;
        price: number;
        hours: number;
        cost: number; // price * hours representation for weight
    }[];
    totalHours: number;
}

export const ComprehensivePriceCalculator: React.FC<ComprehensivePriceCalculatorProps> = ({ tariffs: allTariffs }) => {
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


    // Helper: Convert "HH:MM" to minutes from midnight
    const timeToMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

    // Helper: Calculate intersection of two time ranges in minutes
    const getOverlapMinutes = (start1: number, end1: number, start2: number, end2: number) => {
        const maxStart = Math.max(start1, start2);
        const minEnd = Math.min(end1, end2);
        return Math.max(0, minEnd - maxStart);
    };

    // Helper: Split a time range into segments within [0, 1440]
    const getTimeSegments = (start: string, end: string) => {
        const startMins = timeToMinutes(start);
        let endMins = timeToMinutes(end);

        // Handle "00:00" as "24:00" if it's an end time (common for rules like 17:00-00:00)
        if (endMins === 0 && startMins !== 0) endMins = 1440;

        if (endMins < startMins) {
            // Over midnight: e.g. 22:00 - 02:00 -> [1320, 1440] and [0, endMins]
            return [[startMins, 1440], [0, endMins]];
        }
        return [[startMins, endMins]];
    };

    const handleCalculate = () => {
        setCalcMsg(null);
        if (formData.months.length === 0) {
            setCalcMsg({ type: 'error', msg: "请至少选择一个月份" });
            setTimeout(() => setCalcMsg(null), 3000);
            return;
        }

        const userSegments = getTimeSegments(formData.startTime, formData.endTime);
        const calcResults: PriceResult[] = [];

        formData.months.forEach(month => {
            const tariff = provinceTariffs.find(t =>
                t.province === formData.province &&
                t.category === formData.category &&
                t.voltage_level === formData.voltage &&
                t.month === month
            );


            if (!tariff) return;

            let totalWeightedPrice = 0;
            let totalOverlapMinutes = 0;
            const typeAccumulator: Record<string, { type: TimeType, price: number, totalMinutes: number }> = {};

            tariff.time_rules.forEach(rule => {
                const ruleSegments = getTimeSegments(rule.start, rule.end);
                const price = tariff.prices[rule.type as keyof typeof tariff.prices] || 0;

                userSegments.forEach(uSeg => {
                    ruleSegments.forEach(rSeg => {
                        const overlap = getOverlapMinutes(uSeg[0], uSeg[1], rSeg[0], rSeg[1]);
                        if (overlap > 0) {
                            totalWeightedPrice += price * overlap;
                            totalOverlapMinutes += overlap;

                            if (!typeAccumulator[rule.type]) {
                                typeAccumulator[rule.type] = { type: rule.type as TimeType, price, totalMinutes: 0 };
                            }
                            typeAccumulator[rule.type].totalMinutes += overlap;
                        }
                    });
                });
            });

            if (totalOverlapMinutes > 0) {
                const breakdown = Object.values(typeAccumulator)
                    .sort((a, b) => {
                        const order = ['tip', 'peak', 'flat', 'valley', 'deep'];
                        return order.indexOf(a.type) - order.indexOf(b.type);
                    })
                    .map(item => ({
                        type: item.type,
                        price: item.price,
                        hours: item.totalMinutes / 60,
                        cost: item.price * (item.totalMinutes / 60)
                    }));

                calcResults.push({
                    month: month,
                    startTime: formData.startTime,
                    endTime: formData.endTime,
                    avgPrice: totalWeightedPrice / totalOverlapMinutes,
                    details: breakdown,
                    totalHours: totalOverlapMinutes / 60
                });
            }
        });

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
                <Card className="p-6 space-y-6 lg:col-span-1 h-fit">
                    <div className="space-y-4">
                        <div className="font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                            <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                            基础参数
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">省份</label>
                            <select
                                className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 font-bold"
                                value={formData.province}
                                onChange={e => setFormData({ ...formData, province: e.target.value, category: '', voltage: '', months: [] })}
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

                    <div className="relative">
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
                <div className="lg:col-span-2 space-y-6">
                    {results.length > 0 ? (
                        <>
                            {/* Summary Card */}
                            <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 border-none shadow-xl shadow-indigo-200 relative overflow-hidden group">
                                <div className="flex items-center justify-between mb-2 opacity-90 relative z-10">
                                    <span className="text-sm font-medium">所选月份平均综合电价</span>
                                    <Calendar size={20} />
                                </div>
                                <div className="flex items-end justify-between relative z-10">
                                    <div className="text-4xl font-bold font-mono tracking-tight">
                                        {totalAvgPrice.toFixed(4)} <span className="text-lg opacity-75 font-sans font-normal">元/kWh</span>
                                    </div>
                                    <button
                                        onClick={handleSaveResult}
                                        disabled={isSavingResult}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${isSavingResult ? 'bg-white/20 text-white/50' : 'bg-white text-indigo-600 hover:bg-white/90 active:scale-95 shadow-lg'}`}
                                    >
                                        <Save size={16} />
                                        {isSavingResult ? '已保存' : '存至数据中心'}
                                    </button>
                                </div>
                                <div className="mt-4 flex gap-4 text-sm opacity-90 relative z-10">
                                    <div>已选月份: <span className="font-bold">{formData.months.length}</span> 个</div>
                                    <div>计算时长: <span className="font-bold">{averageHours.toFixed(1)}</span> 小时/日</div>
                                </div>
                                {/* Decorative background element */}
                                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                            </Card>


                            {/* Detail List */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-700">月度明细</h3>
                                {results.map((res, idx) => (
                                    <Card key={res.month} className="p-0 overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="bg-slate-50 p-3 border-b flex items-center justify-between">
                                            <div className="font-bold text-slate-700 flex items-center gap-2">
                                                <span className="bg-white border px-2 py-0.5 rounded text-xs text-slate-500">{idx + 1}</span>
                                                {res.month}
                                            </div>
                                            <div className="font-mono font-bold text-indigo-600 text-lg">
                                                {res.avgPrice.toFixed(4)} 元/kWh
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="text-xs text-slate-400 mb-2">价格构成分析</div>
                                            <div className="flex bg-slate-100 rounded-full h-4 overflow-hidden mb-3">
                                                {res.details.map((d, i) => (
                                                    <div
                                                        key={i}
                                                        style={{ width: `${(d.hours / res.totalHours) * 100}%`, backgroundColor: getTypeColor(d.type) }}
                                                        title={`${getTypeLabel(d.type)}: ${d.hours.toFixed(1)}h`}
                                                    />
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                                {res.details.map((d, i) => (
                                                    <div key={i} className="flex items-center gap-1.5">
                                                        <div className="w-2 h-2 rounded-full" style={{ background: getTypeColor(d.type) }}></div>
                                                        <span className="text-slate-500">{getTypeLabel(d.type)}</span>
                                                        <span className="font-mono font-bold">{d.price.toFixed(4)}</span>
                                                        <span className="text-slate-400 scale-90">× {d.hours.toFixed(1)}h</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200 min-h-[400px]">
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
