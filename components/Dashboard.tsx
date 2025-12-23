
import React, { useState, useMemo } from 'react';
import { Plus, RotateCcw, Filter, ChevronRight, Search, FileEdit, Map, ArrowLeft } from 'lucide-react';
import { TariffData } from '../types';
import { PROVINCES, getTypeColor } from '../constants.tsx';
import { Card } from './UI';
import { ChinaMap } from './ChinaMap';

interface DashboardProps {
  tariffs: TariffData[];
  onOpenAnalysis: (tariff: TariffData) => void;
  onNavigate: (view: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ tariffs, onOpenAnalysis, onNavigate }) => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedVoltages, setSelectedVoltages] = useState<string[]>([]);
  const [filterMonth, setFilterMonth] = useState('');

  const uniqueProvinces = useMemo(() => Array.from(new Set(tariffs.map(t => t.province))).sort(), [tariffs]);
  const uniqueCategories = useMemo(() => Array.from(new Set(tariffs.map(t => t.category))).filter(Boolean).sort(), [tariffs]);
  const uniqueVoltages = useMemo(() => Array.from(new Set(tariffs.map(t => t.voltage_level))).filter(Boolean).sort(), [tariffs]);

  const filteredTariffs = useMemo(() => {
    return tariffs.filter(t => {
      const matchProvince = selectedProvinces.length === 0 || selectedProvinces.includes(t.province);
      const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(t.category);
      const matchVoltage = selectedVoltages.length === 0 || selectedVoltages.includes(t.voltage_level);
      const matchMonth = !filterMonth || t.month === filterMonth;
      return matchProvince && matchCategory && matchVoltage && matchMonth;
    });
  }, [tariffs, selectedProvinces, selectedCategories, selectedVoltages, filterMonth]);

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedVoltages([]);
    setFilterMonth('');
  };

  const handleProvinceSelect = (province: string) => {
    setSelectedProvinces([province]);
    setViewMode('list');
  };

  const handleBackToMap = () => {
    setSelectedProvinces([]);
    setViewMode('map');
  };

  const toggleSelection = (item: string, currentSelections: string[], setSelections: (vals: string[]) => void) => {
    if (currentSelections.includes(item)) {
      setSelections(currentSelections.filter(i => i !== item));
    } else {
      setSelections([...currentSelections, item]);
    }
  };

  const renderFilterGroup = (title: string, items: string[], current: string[], setFunc: (vals: string[]) => void) => (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-slate-500">{title}</label>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFunc([])}
          className={`px-3 py-1 text-xs rounded-full border transition-all ${current.length === 0
            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
        >
          全部
        </button>
        {items.map(item => {
          const isSelected = current.includes(item);
          return (
            <button
              key={item}
              onClick={() => toggleSelection(item, current, setFunc)}
              className={`px-3 py-1 text-xs rounded-full border transition-all ${isSelected
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
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
              {viewMode === 'map' ? '点击省份查看详细数据' : `已筛选 ${filteredTariffs.length} 条数据`}
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
        <ChinaMap
          dataProvinces={uniqueProvinces}
          onProvinceSelect={handleProvinceSelect}
        />
      ) : (
        <>
          <Card className="p-6 flex flex-col gap-6 bg-white/80 backdrop-blur sticky top-0 z-10 shadow-sm border-b border-white">
            {renderFilterGroup("用电分类", uniqueCategories, selectedCategories, setSelectedCategories)}
            {renderFilterGroup("电压等级", uniqueVoltages, selectedVoltages, setSelectedVoltages)}

            <div className="flex items-end gap-4 border-t pt-4">
              <div className="flex-1 max-w-[200px]">
                <label className="text-xs font-bold text-slate-500 mb-1 block">执行月份</label>
                <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <button onClick={resetFilters} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-red-500 flex items-center gap-2 text-sm transition-colors mb-0.5">
                <RotateCcw size={16} /> 重置筛选
              </button>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
            {filteredTariffs.map(t => (
              <Card key={t.id} className="p-4 hover:shadow-xl transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-500 group">
                <div onClick={() => onOpenAnalysis(t)}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600">
                        {t.province[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{t.province}</div>
                        <div className="text-xs text-slate-500">{t.month}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-slate-900 max-w-[100px] truncate">{t.category}</div>
                      <div className="text-xs text-slate-500">{t.voltage_level}</div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex mb-3">
                    {t.time_rules.map((r, i) => {
                      const parts = r.start.split(':');
                      const eparts = r.end.split(':');
                      const s = parseInt(parts[0]) + (parseInt(parts[1]) || 0) / 60;
                      let e = parseInt(eparts[0]) + (parseInt(eparts[1]) || 0) / 60;
                      if (e === 0 && r.end.startsWith('24')) e = 24;
                      if (e < s) e = 24;
                      return <div key={i} style={{ width: `${(e - s) / 24 * 100}%`, background: getTypeColor(r.type) }} />
                    })}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                    <div className="bg-red-50 text-red-700 rounded py-1 border border-red-100">{t.prices.tip.toFixed(3)}</div>
                    <div className="bg-orange-50 text-orange-700 rounded py-1 border border-orange-100">{t.prices.peak.toFixed(3)}</div>
                    <div className="bg-green-50 text-green-700 rounded py-1 border border-green-100">{t.prices.flat.toFixed(3)}</div>
                    <div className="bg-blue-50 text-blue-700 rounded py-1 border border-blue-100">{t.prices.valley.toFixed(3)}</div>
                  </div>
                  <div className="mt-4 text-[10px] text-slate-400 text-center border-t pt-2 flex items-center justify-center gap-1">
                    点击查看趋势与分时图 <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            ))}

            {filteredTariffs.length === 0 && (
              <div className="col-span-full py-24 text-center text-slate-400 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center">
                <Filter size={48} className="mb-4 text-slate-300" />
                <p className="font-medium text-lg text-slate-600">没有找到匹配的数据</p>
                <p className="text-sm mt-1 mb-6">请尝试调整筛选条件或使用录入功能添加新数据</p>
                <div className="flex gap-4">
                  <button onClick={resetFilters} className="bg-white px-6 py-2 rounded-full border border-slate-300 text-blue-600 hover:bg-slate-50 shadow-sm transition-all">
                    清除所有筛选
                  </button>
                  <button onClick={handleBackToMap} className="bg-blue-50 px-6 py-2 rounded-full border border-blue-100 text-blue-700 hover:bg-blue-100 shadow-sm transition-all flex items-center gap-2">
                    <Map size={16} /> 返回地图概览
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
