
import React, { useState, useMemo } from 'react';
import { ArrowLeft, TrendingUp, Edit3, Clock } from 'lucide-react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ComposedChart, Area } from 'recharts';
import { TariffData, PriceSchema } from '../types';
import { getTypeColor } from '../constants.tsx';
import { Card } from './UI';

interface AnalysisProps {
  tariffs: TariffData[];
  target: { province: string, category: string, voltage: string };
  onBack: () => void;
  onUpdateTariffs: (tariffs: TariffData[]) => void;
}

export const AnalysisView: React.FC<AnalysisProps> = ({ tariffs, target, onBack, onUpdateTariffs }) => {
  const seriesData = useMemo(() => {
    return tariffs
      .filter(t =>
        t.province === target.province &&
        t.category === target.category &&
        t.voltage_level === target.voltage
      )
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [tariffs, target]);

  const trendData = useMemo(() => {
    return seriesData.map(t => ({
      month: t.month,
      tip: t.prices.tip,
      peak: t.prices.peak,
      flat: t.prices.flat,
      valley: t.prices.valley
    }));
  }, [seriesData]);

  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(seriesData[0]?.id || null);
  const selectedTariff = seriesData.find(t => t.id === selectedMonthId) || seriesData[0];

  const handlePriceChange = (id: string, type: keyof PriceSchema, value: string) => {
    const numVal = parseFloat(value);
    if (isNaN(numVal)) return;
    const updated = tariffs.map(t => t.id === id ? { ...t, prices: { ...t.prices, [type]: numVal } } : t);
    onUpdateTariffs(updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in h-full flex flex-col pb-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors border border-transparent hover:border-slate-200"
        >
          <ArrowLeft size={20} /> <span>返回</span>
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            {target.province} 年度电价分析
          </h2>
          <div className="flex gap-2 text-sm text-slate-500 mt-1">
            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">{target.category}</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">{target.voltage}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
        <Card className="p-6">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={18} /> 年度电价走势 (Annual Trends)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => val.slice(5)} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line type="monotone" dataKey="tip" name="尖峰" stroke={getTypeColor('tip')} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} animationDuration={800} />
                <Line type="monotone" dataKey="peak" name="高峰" stroke={getTypeColor('peak')} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} animationDuration={800} />
                <Line type="monotone" dataKey="flat" name="平段" stroke={getTypeColor('flat')} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} animationDuration={800} />
                <Line type="monotone" dataKey="valley" name="低谷" stroke={getTypeColor('valley')} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} animationDuration={800} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 flex flex-col h-[500px] overflow-hidden">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Edit3 className="text-blue-600" size={18} /> 数据明细与调整
              <span className="text-[10px] font-normal text-slate-400 ml-auto bg-slate-50 px-2 py-1 rounded">点击行查看分时图</span>
            </h3>
            <div className="flex-1 overflow-auto border rounded-xl custom-scrollbar">
              <table className="w-full text-[13px] text-left relative border-collapse">
                <thead className="bg-slate-50 text-slate-500 uppercase sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 font-bold">月份</th>
                    <th className="px-2 py-3 font-bold text-right text-red-600">尖峰</th>
                    <th className="px-2 py-3 font-bold text-right text-orange-600">高峰</th>
                    <th className="px-2 py-3 font-bold text-right text-green-600">平段</th>
                    <th className="px-2 py-3 font-bold text-right text-blue-600">低谷</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {seriesData.map(t => (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedMonthId(t.id)}
                      className={`hover:bg-blue-50/50 transition-colors cursor-pointer group ${selectedMonthId === t.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                    >
                      <td className="px-4 py-3 font-bold text-slate-700">{t.month}</td>
                      {['tip', 'peak', 'flat', 'valley'].map((type) => (
                        <td key={type} className="px-2 py-2">
                          <input
                            type="number"
                            step="0.0001"
                            className="w-full text-right bg-transparent border-b border-transparent group-hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:outline-none px-1 py-1 rounded transition-all font-mono"
                            value={t.prices[type as keyof PriceSchema]}
                            onChange={(e) => handlePriceChange(t.id, type as keyof PriceSchema, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-6 flex flex-col h-[500px] overflow-hidden">
            <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
              <Clock className="text-blue-600" size={18} /> {selectedTariff?.month || '--'} 分时图预览
            </h3>
            <p className="text-[10px] text-slate-400 mb-6">展示该月 24 小时电价阶梯曲线</p>

            {selectedTariff ? (
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={(() => {
                      const data = [];
                      const tariff = selectedTariff;
                      for (let h = 0; h < 24; h++) {
                        for (let m = 0; m < 60; m += 30) {
                          const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                          const hourDecimal = h + m / 60;
                          const rule = tariff.time_rules.find(r => {
                            const p = r.start.split(':');
                            const ep = r.end.split(':');
                            const startH = parseInt(p[0]) + (parseInt(p[1]) || 0) / 60;
                            let endH = parseInt(ep[0]) + (parseInt(ep[1]) || 0) / 60;
                            if (endH === 0 && r.end.startsWith('24')) endH = 24;
                            return hourDecimal >= startH && hourDecimal < endH;
                          });
                          const type = rule ? rule.type : 'flat';
                          const price = tariff.prices[type as keyof PriceSchema] || 0;
                          data.push({ time: timeStr, price, type });
                        }
                      }
                      data.push({ time: "24:00", price: data[data.length - 1].price, type: data[data.length - 1].type });
                      return data;
                    })()}
                    margin={{ top: 10, right: 30, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorPriceDaily" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" interval={11} stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 'auto']} />
                    <Tooltip formatter={(value: number) => value.toFixed(4)} labelStyle={{ color: '#64748b' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Area type="stepAfter" dataKey="price" stroke="#3b82f6" strokeWidth={3} fill="url(#colorPriceDaily)" animationDuration={1000} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                请先在左侧选择数据
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
