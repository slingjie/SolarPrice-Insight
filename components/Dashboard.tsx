
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, RotateCcw, Filter, ChevronRight, Search, FileEdit, Map, ArrowLeft, Zap } from 'lucide-react';
import { TariffData, ComprehensiveResult } from '../types';
import { PROVINCES, getTypeColor } from '../constants';
import { Card } from './UI';
import { ChinaMap } from './ChinaMap';
import { getDatabase } from '../services/db';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


interface DashboardProps {
  tariffs: TariffData[];
  calcCompPrice: (t: TariffData, startTime: string, endTime: string) => number | null;
  onOpenAnalysis: (tariff: TariffData) => void;
  onNavigate: (view: any) => void;
  viewMode: 'map' | 'list';
  onViewModeChange: (mode: 'map' | 'list') => void;
  selectedProvinces: string[];
  onSelectedProvincesChange: (provinces: string[]) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  tariffs, onOpenAnalysis, onNavigate,
  viewMode, onViewModeChange,
  selectedProvinces, onSelectedProvincesChange,
  calcCompPrice
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedVoltages, setSelectedVoltages] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [compResults, setCompResults] = useState<Record<string, ComprehensiveResult>>({});




  useEffect(() => {
    const fetchCompResults = async () => {
      try {
        const db = await getDatabase();
        const results = await db.comprehensive_results.find().exec();
        const mapping: Record<string, ComprehensiveResult> = {};
        results.forEach(r => {
          mapping[r.province] = r.toJSON() as unknown as ComprehensiveResult;
        });
        setCompResults(mapping);
      } catch (err) {
        console.error("Failed to fetch comprehensive results:", err);
      }
    };
    fetchCompResults();
  }, [viewMode]);

  // 利用 Dashboard 自身的 compResults + App 传入的 calcCompPrice 计算综合电价
  const comprehensivePriceMap = useMemo(() => {
    const map: Record<string, number | null> = {};
    for (const t of tariffs) {
      const saved = compResults[t.province];
      if (!saved?.start_time || !saved?.end_time) {
        map[t.id] = null;
        continue;
      }
      map[t.id] = calcCompPrice(t, saved.start_time, saved.end_time);
    }
    return map;
  }, [tariffs, compResults, calcCompPrice]);

  const uniqueProvinces = useMemo(() => Array.from(new Set(tariffs.map(t => t.province))).sort(), [tariffs]);
  const uniqueCategories = useMemo(() => Array.from(new Set(tariffs.map(t => t.category))).filter(Boolean).sort(), [tariffs]);
  const uniqueVoltages = useMemo(() => Array.from(new Set(tariffs.map(t => t.voltage_level))).filter(Boolean).sort(), [tariffs]);
  const uniqueMonths = useMemo(() => Array.from(new Set(tariffs.map(t => t.month))).filter(Boolean).sort().reverse(), [tariffs]);
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

  const filteredTariffs = useMemo(() => {
    return tariffs.filter(t => {
      const matchProvince = selectedProvinces.length === 0 || selectedProvinces.includes(t.province);
      const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(t.category);
      const matchVoltage = selectedVoltages.length === 0 || selectedVoltages.includes(t.voltage_level);
      const year = t.month.match(/^(\d{4})-/)?.[1] || '';
      const matchYear = selectedYears.length === 0 || selectedYears.includes(year);
      const matchMonth = selectedMonths.length === 0 || selectedMonths.includes(t.month);
      return matchProvince && matchCategory && matchVoltage && matchYear && matchMonth;
    }).sort((a, b) => b.month.localeCompare(a.month) || a.province.localeCompare(b.province));
  }, [tariffs, selectedProvinces, selectedCategories, selectedVoltages, selectedYears, selectedMonths]);

  const chartData = useMemo(() => {
    return filteredTariffs.map(t => ({
      ...t,
      year: t.month.match(/^(\d{4})-/)?.[1] || '--',
      monthOnly: t.month.match(/^\d{4}-(\d{1,2})$/)?.[1] || t.month,
      axisLabel: t.month,
      comprehensivePrice: comprehensivePriceMap[t.id] ?? null,
      prices: {
        ...t.prices,
        tip: t.prices.tip || null,
        peak: t.prices.peak || null,
        flat: t.prices.flat || null,
        valley: t.prices.valley || null,
        deep: t.prices.deep || null,
      }
    }));
  }, [filteredTariffs, comprehensivePriceMap]);

  const provinceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tariffs.forEach(t => {
      counts[t.province] = (counts[t.province] || 0) + 1;
    });
    return counts;
  }, [tariffs]);

  const resetFilters = () => {
    onSelectedProvincesChange([]);
    setSelectedCategories([]);
    setSelectedVoltages([]);
    setSelectedYears([]);
    setSelectedMonths([]);
  };

  const handleProvinceSelect = (province: string) => {
    onSelectedProvincesChange([province]);
    onViewModeChange('list');
  };

  const handleBackToMap = () => {
    onSelectedProvincesChange([]);
    onViewModeChange('map');
  };

  const toggleSelection = (item: string, currentSelections: string[], setSelections: (vals: string[]) => void) => {
    if (currentSelections.includes(item)) {
      setSelections(currentSelections.filter(i => i !== item));
    } else {
      setSelections([...currentSelections, item]);
    }
  };

  const renderFilterGroup = (
    title: string,
    items: string[],
    current: string[],
    setFunc: (vals: string[]) => void,
  ) => {
    const isAll = current.length === 0;
    return (
      <div className="flex flex-col gap-2 min-w-[180px] flex-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span>{title}</span>
            {current.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                已选 {current.length}
              </span>
            )}
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFunc([])}
              className={`text-[11px] transition-colors ${
                isAll ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              全部
            </button>
            {items.length > 0 && current.length > 0 && (
              <button
                onClick={() => setFunc([])}
                className="text-[11px] text-slate-400 hover:text-red-500 transition-colors"
              >
                清空
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto custom-scrollbar p-0.5">
          {items.map(item => {
            const isSelected = current.includes(item);
            return (
              <button
                key={item}
                onClick={() => toggleSelection(item, current, setFunc)}
                className={`px-2.5 py-1 text-xs rounded-lg border transition-all select-none ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-medium'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {viewMode === 'list' && (
              <button
                onClick={handleBackToMap}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium transition-all shadow-sm active:scale-95"
              >
                <ArrowLeft size={18} /> 返回地图
              </button>
            )}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {viewMode === 'map' ? '数据地图概览' : `${selectedProvinces.length > 0 ? selectedProvinces.join('、') : '全部'}电价数据详情`}
              </h2>
              <p className="text-slate-500 text-sm">
                {viewMode === 'map' ? '点击省份查看详细数据，颜色越深代表数据越多' : `已筛选 ${filteredTariffs.length} 条数据`}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => onNavigate('manual')} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2">
              <FileEdit size={18} /> 手动录入
            </button>
            <button onClick={() => onNavigate('upload')} className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium flex items-center gap-2 shadow-lg shadow-slate-200">
              <Plus size={18} /> 智能录入
            </button>
          </div>
        </div>

        {viewMode === 'map' ? (
          <div className="flex gap-4 items-stretch h-[600px]">

            <div className="flex-1 min-w-0 h-full">
              <Card className="h-full bg-white p-4 shadow-xl border-slate-100 relative overflow-hidden flex flex-col">
                {/* Decorative Background gradient */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-80 z-10" />
                <ChinaMap
                  dataCounts={provinceCounts}
                  onProvinceSelect={handleProvinceSelect}
                />
              </Card>
            </div>

            <div className="flex-shrink-0 w-64 h-full hidden lg:block">
              <Card className="h-full bg-white/70 backdrop-blur-md border-slate-100 shadow-xl flex flex-col overflow-hidden relative">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 whitespace-nowrap">
                    <Zap size={16} className="text-amber-500" />
                    已录入省份
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                  {uniqueProvinces.map(p => (
                    <div
                      key={p}
                      onClick={() => handleProvinceSelect(p)}
                      className="group/item flex items-center justify-between p-3 rounded-xl hover:bg-white cursor-pointer transition-all border border-transparent hover:border-slate-100 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-sm font-bold text-slate-400 group-hover/item:bg-blue-50 group-hover/item:text-blue-600 transition-colors shrink-0">
                          {p[0]}
                        </div>
                        <span className="font-bold text-slate-600 group-hover/item:text-slate-900 transition-colors truncate max-w-[80px] text-xs">{p}</span>
                      </div>
                      {compResults[p] ? (
                        <div className="text-right shrink-0">
                          <div className="text-[10px] font-mono font-bold text-blue-600">
                            {compResults[p].avg_price.toFixed(3)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[9px] text-slate-300 shrink-0">
                          {provinceCounts[p] || 0}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-slate-50/50 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 leading-relaxed text-center">
                    点击跳转详情
                  </p>
                </div>
              </Card>
            </div>
          </div>

        ) : (
          <>
            <Card className="p-6 flex flex-col gap-5 bg-white shadow-sm border border-slate-100 sticky top-0 z-10 backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-blue-600" />
                  <h3 className="font-bold text-slate-800 text-sm">多维交叉筛选器（支持多选）</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">
                    共匹配到 <span className="font-bold text-blue-600">{filteredTariffs.length}</span> 条记录
                  </span>
                  <button
                    onClick={resetFilters}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-red-600 flex items-center gap-1.5 text-xs transition-colors"
                  >
                    <RotateCcw size={14} /> 重置所有筛选
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                {renderFilterGroup("省份地区", uniqueProvinces, selectedProvinces, onSelectedProvincesChange)}
                {renderFilterGroup("用电分类", uniqueCategories, selectedCategories, setSelectedCategories)}
                {renderFilterGroup("电压等级", uniqueVoltages, selectedVoltages, setSelectedVoltages)}
                {renderFilterGroup("执行月份", uniqueMonths, selectedMonths, setSelectedMonths)}
                {renderFilterGroup("执行年份", uniqueYears, selectedYears, setSelectedYears)}
              </div>
            </Card>

            <Card className="p-6 bg-white shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4">年度电价趋势</h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="axisLabel" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="prices.tip" name="尖峰电价" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="prices.peak" name="高峰电价" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="prices.flat" name="平段电价" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="prices.valley" name="低谷电价" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="prices.deep" name="深谷电价" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="comprehensivePrice" name="综合电价" stroke="#d97706" strokeWidth={2.5} strokeDasharray="6 3" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6 bg-white shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-slate-800 mb-4">电价数据明细</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 font-medium">省份</th>
                      <th className="px-4 py-3 font-medium">月份</th>
                      <th className="px-4 py-3 font-medium">年份</th>
                      <th className="px-4 py-3 font-medium">用电分类</th>
                      <th className="px-4 py-3 font-medium">电压等级</th>
                      <th className="px-4 py-3 font-medium text-amber-600">综合电价</th>
                      <th className="px-4 py-3 font-medium text-red-600">尖峰电价</th>
                      <th className="px-4 py-3 font-medium text-orange-600">高峰电价</th>
                      <th className="px-4 py-3 font-medium text-green-600">平段电价</th>
                      <th className="px-4 py-3 font-medium text-blue-600">低谷电价</th>
                      <th className="px-4 py-3 font-medium text-purple-600">深谷电价</th>
                      <th className="px-4 py-3 font-medium text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTariffs.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900">{t.province}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono">{t.month}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono">{t.month.match(/^(\d{4})-/)?.[1] || '--'}</td>
                        <td className="px-4 py-3">{t.category}</td>
                        <td className="px-4 py-3">{t.voltage_level}</td>
                        <td className="px-4 py-3 font-mono text-xs font-bold text-amber-600">{comprehensivePriceMap[t.id]?.toFixed(3) ?? '-'}</td>
                        <td className="px-4 py-3 font-mono text-xs">{t.prices.tip?.toFixed(3) ?? '-'}</td>
                        <td className="px-4 py-3 font-mono text-xs">{t.prices.peak?.toFixed(3) ?? '-'}</td>
                        <td className="px-4 py-3 font-mono text-xs">{t.prices.flat?.toFixed(3) ?? '-'}</td>
                        <td className="px-4 py-3 font-mono text-xs">{t.prices.valley?.toFixed(3) ?? '-'}</td>
                        <td className="px-4 py-3 font-mono text-xs">{t.prices.deep?.toFixed(3) ?? '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => onOpenAnalysis(t)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center justify-end gap-1 ml-auto"
                          >
                            详情 <ChevronRight size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredTariffs.length === 0 && (
                      <tr>
                        <td colSpan={12} className="px-4 py-8 text-center text-slate-400">
                          暂无数据，请调整筛选条件
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};
