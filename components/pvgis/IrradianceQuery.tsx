/**
 * 辐照度查询组件
 * 参考 https://github.com/slingjie/PVgis 实现
 * 
 * 功能：
 * - 地址/经纬度双模式输入
 * - TMY / 年度序列查询切换
 * - 月份筛选、日内曲线图表
 * - 数据表格（分页）
 * - CSV 导出（含 metadata）
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, Download, Calendar, ChevronLeft, ChevronRight, Clock, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { geocodeService } from '../../services/geocodeService';
import { pvgisService } from '../../services/pvgisService';
import { IrradianceResponse, IrradiancePoint, GeocodeCandidate } from '../../types';

type LocationMode = 'address' | 'coords';
type QueryType = 'tmy' | 'series';
type TimeMode = 'cn' | 'utc';

interface IrradianceQueryProps {
    onBack?: () => void;
}

// 时间处理辅助函数
function getTimeParts(timeIso: string, mode: TimeMode): { y: number; m: number; d: number; hh: number; mm: number } | null {
    const date = new Date(timeIso);
    if (!Number.isFinite(date.getTime())) return null;

    if (mode === 'utc') {
        return {
            y: date.getUTCFullYear(),
            m: date.getUTCMonth() + 1,
            d: date.getUTCDate(),
            hh: date.getUTCHours(),
            mm: date.getUTCMinutes(),
        };
    } else {
        // China time (UTC+8)
        const cnDate = new Date(date.getTime() + 8 * 60 * 60 * 1000);
        return {
            y: cnDate.getUTCFullYear(),
            m: cnDate.getUTCMonth() + 1,
            d: cnDate.getUTCDate(),
            hh: cnDate.getUTCHours(),
            mm: cnDate.getUTCMinutes(),
        };
    }
}

function pad2(n: number) {
    return String(n).padStart(2, '0');
}

function formatTime(timeIso: string, mode: TimeMode): string {
    const p = getTimeParts(timeIso, mode);
    if (!p) return timeIso;
    return `${p.y}-${pad2(p.m)}-${pad2(p.d)} ${pad2(p.hh)}:${pad2(p.mm)}`;
}

function dayKey(timeIso: string, mode: TimeMode): string {
    const p = getTimeParts(timeIso, mode);
    if (!p) return '';
    return `${p.y}-${pad2(p.m)}-${pad2(p.d)}`;
}

export const IrradianceQuery: React.FC<IrradianceQueryProps> = ({ onBack }) => {
    // 输入状态
    const [locationMode, setLocationMode] = useState<LocationMode>('coords');
    const [queryType, setQueryType] = useState<QueryType>('tmy');
    const [address, setAddress] = useState('');
    const [lat, setLat] = useState('30.27');
    const [lon, setLon] = useState('120.15');
    const [startYear, setStartYear] = useState('2020');
    const [endYear, setEndYear] = useState('2020');

    // 地址解析状态
    const [candidates, setCandidates] = useState<GeocodeCandidate[]>([]);
    const [selectedCandidateIdx, setSelectedCandidateIdx] = useState(0);
    const [confirmLocation, setConfirmLocation] = useState(false);
    const [geocodeLoading, setGeocodeLoading] = useState(false);

    // 查询状态
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<IrradianceResponse | null>(null);

    // 显示状态
    const [timeMode, setTimeMode] = useState<TimeMode>('cn');
    const [monthFilter, setMonthFilter] = useState<number | 'all'>('all');
    const [selectedDay, setSelectedDay] = useState<string>('');
    const [page, setPage] = useState(1);
    const [tableFollowChartDay, setTableFollowChartDay] = useState(false); // 表格是否跟随日期筛选
    const pageSize = 100;

    const selectedCandidate = candidates[selectedCandidateIdx];

    // 解析后的坐标
    const resolvedLat = useMemo(() => {
        if (locationMode === 'coords') return parseFloat(lat);
        return selectedCandidate?.lat ?? NaN;
    }, [locationMode, lat, selectedCandidate]);

    const resolvedLon = useMemo(() => {
        if (locationMode === 'coords') return parseFloat(lon);
        return selectedCandidate?.lon ?? NaN;
    }, [locationMode, lon, selectedCandidate]);

    // 构建 OpenStreetMap 嵌入 URL
    const osmEmbedUrl = useMemo(() => {
        const latNum = locationMode === 'coords' ? parseFloat(lat) : selectedCandidate?.lat;
        const lonNum = locationMode === 'coords' ? parseFloat(lon) : selectedCandidate?.lon;
        if (!latNum || !lonNum || !Number.isFinite(latNum) || !Number.isFinite(lonNum)) return null;

        const dLat = 0.02;
        const dLon = 0.02;
        const bbox = `${lonNum - dLon},${latNum - dLat},${lonNum + dLon},${latNum + dLat}`;
        return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${latNum},${lonNum}`)}`;
    }, [locationMode, lat, lon, selectedCandidate]);

    // 过滤后的数据（表格用）
    const filteredData = useMemo(() => {
        if (!result) return [];
        let data = result.data;

        // 月份过滤
        if (monthFilter !== 'all') {
            data = data.filter(r => {
                const p = getTimeParts(r.time, timeMode);
                return p && p.m === monthFilter;
            });
        }

        // 日期过滤（仅当 tableFollowChartDay 为 true 时）
        if (tableFollowChartDay && selectedDay) {
            data = data.filter(r => dayKey(r.time, timeMode) === selectedDay);
        }

        return data;
    }, [result, monthFilter, selectedDay, timeMode, tableFollowChartDay]);

    // 分页数据
    const pagedData = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, page]);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredData.length / pageSize)), [filteredData.length]);

    // 月度汇总
    const monthlySummary = useMemo(() => {
        if (!result) return [];
        const sums = Array.from({ length: 12 }, () => 0);

        for (const r of result.data) {
            const p = getTimeParts(r.time, timeMode);
            if (!p) continue;
            const v = r.ghi ?? 0;
            if (typeof v === 'number' && Number.isFinite(v)) {
                sums[p.m - 1] += v;
            }
        }

        return sums.map((sum, idx) => ({
            month: idx + 1,
            label: `${idx + 1}月`,
            kwhM2: sum / 1000,
        }));
    }, [result, timeMode]);

    // 日内曲线数据
    const dailyCurve = useMemo(() => {
        if (!result || !selectedDay) return null;

        const dayData = result.data.filter(r => dayKey(r.time, timeMode) === selectedDay);
        if (dayData.length === 0) return null;

        return dayData.map(r => {
            const p = getTimeParts(r.time, timeMode);
            return {
                hour: p ? `${pad2(p.hh)}:${pad2(p.mm)}` : '',
                ghi: r.ghi ?? 0,
                dni: r.dni ?? 0,
                dhi: r.dhi ?? 0,
            };
        }).sort((a, b) => a.hour.localeCompare(b.hour)); // 按小时排序
    }, [result, selectedDay, timeMode]);

    // 初始化日期选择
    useEffect(() => {
        if (result && result.data.length > 0) {
            // 获取数据中的第一个日期（按当前时间模式）
            const firstDay = dayKey(result.data[0].time, timeMode);
            setSelectedDay(firstDay);
            setPage(1);
        }
    }, [result]); // 只在 result 变化时重置，不在 timeMode 变化时重置

    // 地址解析
    const handleGeocode = async () => {
        if (!address.trim()) return;
        setGeocodeLoading(true);
        setError(null);
        setCandidates([]);
        setConfirmLocation(false);

        try {
            const response = await geocodeService.searchAddress(address, { limit: 5 });
            setCandidates(response.candidates);
            if (response.candidates.length === 0) {
                setError('未解析到位置，请补充城市/区县或改用经纬度。');
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : '地址解析失败');
        } finally {
            setGeocodeLoading(false);
        }
    };

    // 查询辐照数据
    const handleQuery = async () => {
        const latNum = resolvedLat;
        const lonNum = resolvedLon;

        if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
            setError('请输入有效的经纬度或先解析地址');
            return;
        }

        if (locationMode === 'address' && candidates.length > 0 && !confirmLocation) {
            setError('请先确认候选位置坐标');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            let data: IrradianceResponse;

            if (queryType === 'tmy') {
                data = await pvgisService.getTMYData(latNum, lonNum);
            } else {
                const sy = parseInt(startYear);
                const ey = parseInt(endYear);
                if (!Number.isInteger(sy) || !Number.isInteger(ey) || sy < 1990 || ey > 2024) {
                    throw new Error('请输入有效的年份范围 (1990-2024)');
                }
                data = await pvgisService.getIrradianceSeries(latNum, lonNum, sy, ey);
            }

            setResult(data);
            setMonthFilter('all');
        } catch (e) {
            setError(e instanceof Error ? e.message : '查询失败');
        } finally {
            setLoading(false);
        }
    };

    // CSV 导出
    const handleExport = () => {
        if (!result) return;

        // 构建 CSV
        const meta = `# metadata=${JSON.stringify({
            ...result.metadata,
            exportTimeRef: timeMode === 'cn' ? 'Asia/Shanghai' : 'UTC',
        })}`;

        const headers = ['time_cn', 'time_utc', 'ghi', 'dni', 'dhi'].join(',');
        const rows = result.data.map(r => {
            const timeCn = formatTime(r.time, 'cn');
            const timeUtc = r.time;
            return [timeCn, timeUtc, r.ghi ?? '', r.dni ?? '', r.dhi ?? ''].join(',');
        });

        const csv = [meta, headers, ...rows].join('\n');

        // 下载
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `irradiance_${result.metadata.queryType}_${result.metadata.lat}_${result.metadata.lon}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        // 同时复制到剪贴板
        navigator.clipboard?.writeText('\uFEFF' + csv);
    };

    return (
        <div className="h-full flex flex-col gap-6 p-6 bg-slate-50">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="text-orange-500" size={24} />
                    辐照度查询
                </h2>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-600">数据源: PVGIS</span>
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-600">时间基准: UTC</span>
                </div>
            </div>

            {/* 查询面板 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 左侧：输入 */}
                    <div className="space-y-4">
                        {/* 位置输入方式 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">位置输入方式</label>
                            <div className="flex gap-2">
                                <button
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors
                                        ${locationMode === 'coords' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    onClick={() => setLocationMode('coords')}
                                >
                                    经纬度
                                </button>
                                <button
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors
                                        ${locationMode === 'address' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    onClick={() => setLocationMode('address')}
                                >
                                    地址/公司名称
                                </button>
                            </div>
                        </div>

                        {/* 经纬度输入 */}
                        {locationMode === 'coords' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">纬度 (lat)</label>
                                    <input
                                        type="text"
                                        value={lat}
                                        onChange={e => setLat(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="例: 30.27"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">经度 (lon)</label>
                                    <input
                                        type="text"
                                        value={lon}
                                        onChange={e => setLon(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="例: 120.15"
                                    />
                                </div>
                            </div>
                        )}

                        {/* 地址输入 */}
                        {locationMode === 'address' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">地址/公司名称</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={e => { setAddress(e.target.value); setConfirmLocation(false); }}
                                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="例: 某某公司 杭州 余杭区"
                                    />
                                    <button
                                        onClick={handleGeocode}
                                        disabled={geocodeLoading || !address.trim()}
                                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <Search size={16} />
                                        {geocodeLoading ? '解析中...' : '解析'}
                                    </button>
                                </div>

                                {/* 候选位置 */}
                                {candidates.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        <div className="text-sm text-slate-500">选择候选位置:</div>
                                        {candidates.map((c, idx) => (
                                            <label
                                                key={idx}
                                                className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-colors
                                                    ${selectedCandidateIdx === idx ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="candidate"
                                                    checked={selectedCandidateIdx === idx}
                                                    onChange={() => { setSelectedCandidateIdx(idx); setConfirmLocation(false); }}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-slate-700 truncate">{c.displayName}</div>
                                                    <div className="text-xs text-slate-500">({c.lat.toFixed(5)}, {c.lon.toFixed(5)})</div>
                                                </div>
                                            </label>
                                        ))}
                                        <label className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                                            <input
                                                type="checkbox"
                                                checked={confirmLocation}
                                                onChange={e => setConfirmLocation(e.target.checked)}
                                            />
                                            我已确认该坐标用于查询
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 查询类型 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">查询类型</label>
                            <div className="flex gap-2">
                                <button
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors
                                        ${queryType === 'tmy' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    onClick={() => setQueryType('tmy')}
                                >
                                    典型年 (TMY)
                                </button>
                                <button
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors
                                        ${queryType === 'series' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    onClick={() => setQueryType('series')}
                                >
                                    年度序列
                                </button>
                            </div>
                        </div>

                        {/* 年份选择 (Series) */}
                        {queryType === 'series' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">开始年份</label>
                                    <input
                                        type="text"
                                        value={startYear}
                                        onChange={e => setStartYear(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                        placeholder="2020"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">结束年份</label>
                                    <input
                                        type="text"
                                        value={endYear}
                                        onChange={e => setEndYear(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                        placeholder="2020"
                                    />
                                </div>
                            </div>
                        )}

                        {/* 查询按钮 */}
                        <button
                            onClick={handleQuery}
                            disabled={loading || (locationMode === 'address' && candidates.length > 0 && !confirmLocation)}
                            className="w-full py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    查询中...
                                </>
                            ) : (
                                <>
                                    <Search size={18} />
                                    查询辐照数据
                                </>
                            )}
                        </button>

                        {/* 错误提示 */}
                        {error && (
                            <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                {error}
                            </div>
                        )}
                    </div>

                    {/* 右侧：地图预览 / 概览 */}
                    <div className="bg-slate-50 p-4 rounded-lg min-h-[300px]">
                        {/* 地图预览 */}
                        {osmEmbedUrl && (
                            <div className="mb-4">
                                <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                                    <MapPin size={12} />
                                    位置预览
                                </div>
                                <iframe
                                    title="位置预览"
                                    src={osmEmbedUrl}
                                    className="w-full h-48 rounded-lg border border-slate-200"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                />
                                <a
                                    href={`https://www.openstreetmap.org/?mlat=${resolvedLat}&mlon=${resolvedLon}#map=14/${resolvedLat}/${resolvedLon}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-500 hover:underline mt-1 inline-block"
                                >
                                    在 OpenStreetMap 中查看
                                </a>
                            </div>
                        )}

                        {!result && !osmEmbedUrl && (
                            <div className="h-full flex items-center justify-center text-slate-400">
                                <div className="text-center">
                                    <MapPin size={48} className="mx-auto mb-2 opacity-50" />
                                    <p>请输入位置并点击查询</p>
                                </div>
                            </div>
                        )}

                        {result && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-green-500" size={20} />
                                    <span className="font-medium text-slate-700">查询成功</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white p-3 rounded-lg">
                                        <div className="text-xs text-slate-500">坐标</div>
                                        <div className="font-medium">{result.metadata.lat.toFixed(4)}, {result.metadata.lon.toFixed(4)}</div>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg">
                                        <div className="text-xs text-slate-500">类型</div>
                                        <div className="font-medium">{result.metadata.queryType.toUpperCase()}</div>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg">
                                        <div className="text-xs text-slate-500">记录数</div>
                                        <div className="font-medium">{result.data.length.toLocaleString()}</div>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg">
                                        <div className="text-xs text-slate-500">单位</div>
                                        <div className="font-medium">{result.metadata.unit.irradiance || 'W/m2'}</div>
                                    </div>
                                </div>

                                {/* 可验证性：显示请求 URL */}
                                {result.metadata.requestUrl && (
                                    <div className="bg-white p-3 rounded-lg">
                                        <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                                            <Info size={12} />
                                            请求 URL (可复制复现)
                                        </div>
                                        <div className="text-xs text-slate-600 break-all font-mono bg-slate-50 p-2 rounded">
                                            {result.metadata.requestUrl}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleExport}
                                    className="w-full py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 flex items-center justify-center gap-2"
                                >
                                    <Download size={18} />
                                    导出 CSV
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 结果展示 */}
            {result && (
                <div className="flex-1 overflow-auto space-y-6">
                    {/* 控制栏 */}
                    <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-sm">
                        <div className="flex items-center gap-4">
                            {/* 时间显示模式 */}
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-slate-400" />
                                <select
                                    value={timeMode}
                                    onChange={e => setTimeMode(e.target.value as TimeMode)}
                                    className="text-sm border border-slate-200 rounded px-2 py-1"
                                >
                                    <option value="cn">中国时间</option>
                                    <option value="utc">UTC</option>
                                </select>
                            </div>

                            {/* 月份筛选 */}
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-slate-400" />
                                <select
                                    value={monthFilter}
                                    onChange={e => {
                                        const v = e.target.value;
                                        setMonthFilter(v === 'all' ? 'all' : parseInt(v));
                                        setPage(1);
                                    }}
                                    className="text-sm border border-slate-200 rounded px-2 py-1"
                                >
                                    <option value="all">全部月份</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                        <option key={m} value={m}>{m}月</option>
                                    ))}
                                </select>
                            </div>

                            {/* 日期选择（影响日内曲线） */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={selectedDay}
                                    onChange={e => setSelectedDay(e.target.value)}
                                    className="text-sm border border-slate-200 rounded px-2 py-1"
                                />
                                <span className="text-xs text-slate-400">(日内曲线)</span>
                            </div>

                            {/* 表格跟随日期筛选 */}
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={tableFollowChartDay}
                                    onChange={e => {
                                        setTableFollowChartDay(e.target.checked);
                                        setPage(1);
                                    }}
                                    className="rounded"
                                />
                                <span>表格仅显示选中日期</span>
                            </label>
                        </div>

                        <div className="text-sm text-slate-500">
                            共 {filteredData.length.toLocaleString()} 条记录
                        </div>
                    </div>

                    {/* 图表 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 月度汇总 */}
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <h3 className="text-sm font-medium text-slate-700 mb-3">月度辐照量 (kWh/m2)</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlySummary}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip />
                                        <Bar dataKey="kwhM2" fill="#f97316" name="辐照量" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* 日内曲线 */}
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <h3 className="text-sm font-medium text-slate-700 mb-3">
                                日内曲线 - {selectedDay || '请选择日期'}
                            </h3>
                            <div className="h-64">
                                {dailyCurve ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={dailyCurve}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="ghi" stroke="#f97316" name="GHI" dot={false} />
                                            {dailyCurve.some(d => d.dni > 0) && (
                                                <Line type="monotone" dataKey="dni" stroke="#3b82f6" name="DNI" dot={false} />
                                            )}
                                            {dailyCurve.some(d => d.dhi > 0) && (
                                                <Line type="monotone" dataKey="dhi" stroke="#22c55e" name="DHI" dot={false} />
                                            )}
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-400">
                                        请选择日期查看日内曲线
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 数据表格 */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-slate-600">时间</th>
                                        <th className="px-4 py-3 text-right font-medium text-slate-600">GHI (W/m2)</th>
                                        <th className="px-4 py-3 text-right font-medium text-slate-600">DNI (W/m2)</th>
                                        <th className="px-4 py-3 text-right font-medium text-slate-600">DHI (W/m2)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagedData.map((row, idx) => (
                                        <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50">
                                            <td className="px-4 py-2 text-slate-700">{formatTime(row.time, timeMode)}</td>
                                            <td className="px-4 py-2 text-right text-slate-700">{row.ghi?.toFixed(1) ?? '-'}</td>
                                            <td className="px-4 py-2 text-right text-slate-700">{row.dni?.toFixed(1) ?? '-'}</td>
                                            <td className="px-4 py-2 text-right text-slate-700">{row.dhi?.toFixed(1) ?? '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* 分页 */}
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                            <div className="text-sm text-slate-500">
                                第 {page} / {totalPages} 页
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded hover:bg-slate-100 disabled:opacity-50"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 rounded hover:bg-slate-100 disabled:opacity-50"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
