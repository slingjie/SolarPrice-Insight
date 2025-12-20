
import React, { useState, useMemo } from 'react';
import { Save, ArrowLeft, Info, Database, MapPin, Calendar, Layers, Zap } from 'lucide-react';
import { TimeConfig, TariffData, PriceSchema } from '../types';
import { PROVINCES } from '../constants.tsx';
import { Card } from './UI';

interface ManualEntryProps {
  timeConfigs: TimeConfig[];
  tariffs: TariffData[];
  onSave: (newTariffs: TariffData[]) => void;
  onNavigate: (view: any) => void;
}

export const ManualEntry: React.FC<ManualEntryProps> = ({ timeConfigs, tariffs, onSave, onNavigate }) => {
  const [formData, setFormData] = useState({
    province: PROVINCES[0],
    month: new Date().toISOString().slice(0, 7),
    category: '大工业用电',
    voltage: '1-10kV',
    configId: '',
    prices: {
      tip: 0,
      peak: 0,
      flat: 0,
      valley: 0,
    } as PriceSchema
  });

  const availableConfigs = useMemo(() => {
    return timeConfigs.filter(c => c.province === formData.province || c.province === '全部');
  }, [timeConfigs, formData.province]);

  const handlePriceChange = (type: keyof PriceSchema, val: string) => {
    const numVal = parseFloat(val) || 0;
    setFormData(prev => ({
      ...prev,
      prices: { ...prev.prices, [type]: numVal }
    }));
  };

  const handleSave = () => {
    const config = timeConfigs.find(c => c.id === formData.configId);
    if (!config) {
        alert("请选择关联的时段配置库");
        return;
    }

    const newTariff: TariffData = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      province: formData.province,
      city: null,
      month: formData.month,
      category: formData.category,
      voltage_level: formData.voltage,
      prices: formData.prices,
      time_rules: config.time_rules,
      currency_unit: 'CNY/kWh',
      source_config_id: config.id
    };

    onSave([...tariffs, newTariff]);
    onNavigate('dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right-6 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-slate-900">手动配置电价</h2>
        </div>
        <button 
          onClick={handleSave}
          className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95"
        >
          <Save size={18}/> 保存数据
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Basic Info */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-800 mb-2">
            <Info size={18} className="text-blue-500"/> 基本信息
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block flex items-center gap-1">
                <MapPin size={12}/> 省份
              </label>
              <select 
                value={formData.province} 
                onChange={e => setFormData({...formData, province: e.target.value})}
                className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block flex items-center gap-1">
                <Calendar size={12}/> 执行月份
              </label>
              <input 
                type="month" 
                value={formData.month}
                onChange={e => setFormData({...formData, month: e.target.value})}
                className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block flex items-center gap-1">
              <Layers size={12}/> 用电分类
            </label>
            <input 
              type="text" 
              placeholder="例如：大工业用电、一般工商业"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">电压等级</label>
            <input 
              type="text" 
              placeholder="例如：1-10kV、35kV"
              value={formData.voltage}
              onChange={e => setFormData({...formData, voltage: e.target.value})}
              className="w-full p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </Card>

        {/* Section 2: Time Rule Mapping */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-800 mb-2">
            <Database size={18} className="text-blue-500"/> 关联时段配置
          </div>
          
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-blue-700 leading-relaxed mb-4">
            手动录入需要关联一个已有的“时段配置库”。我们将根据该库定义的尖峰、高峰、平段、低谷时段来生成分时曲线。
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">选择配置库</label>
            <select 
              className="w-full p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.configId}
              onChange={e => setFormData({...formData, configId: e.target.value})}
            >
              <option value="">-- 请选择配置库 --</option>
              {availableConfigs.map(c => (
                <option key={c.id} value={c.id}>{c.province} - {c.month_pattern === 'All' ? '全年' : c.month_pattern + '月'}</option>
              ))}
            </select>
            {availableConfigs.length === 0 && (
              <p className="text-[10px] text-red-500 mt-2">该省份暂无配置库，请先前往“配置库管理”创建。</p>
            )}
          </div>
        </Card>

        {/* Section 3: Price Matrix */}
        <Card className="p-6 md:col-span-2 space-y-6">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Zap size={18} className="text-blue-500"/> 电价配置 (元/kWh)
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-red-600 uppercase tracking-wider">尖峰电价</label>
              <input 
                type="number" 
                step="0.0001"
                value={formData.prices.tip || ''}
                onChange={e => handlePriceChange('tip', e.target.value)}
                className="w-full p-3 border-b-2 border-transparent focus:border-red-500 bg-red-50/30 text-lg font-mono font-bold outline-none rounded-t-lg transition-all"
                placeholder="0.0000"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">高峰电价</label>
              <input 
                type="number" 
                step="0.0001"
                value={formData.prices.peak || ''}
                onChange={e => handlePriceChange('peak', e.target.value)}
                className="w-full p-3 border-b-2 border-transparent focus:border-orange-500 bg-orange-50/30 text-lg font-mono font-bold outline-none rounded-t-lg transition-all"
                placeholder="0.0000"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-green-600 uppercase tracking-wider">平段电价</label>
              <input 
                type="number" 
                step="0.0001"
                value={formData.prices.flat || ''}
                onChange={e => handlePriceChange('flat', e.target.value)}
                className="w-full p-3 border-b-2 border-transparent focus:border-green-500 bg-green-50/30 text-lg font-mono font-bold outline-none rounded-t-lg transition-all"
                placeholder="0.0000"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">低谷电价</label>
              <input 
                type="number" 
                step="0.0001"
                value={formData.prices.valley || ''}
                onChange={e => handlePriceChange('valley', e.target.value)}
                className="w-full p-3 border-b-2 border-transparent focus:border-blue-500 bg-blue-50/30 text-lg font-mono font-bold outline-none rounded-t-lg transition-all"
                placeholder="0.0000"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
