import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import {
  Clock,
  Settings,
  Sun,
  Moon,
  Calendar,
  Briefcase,
  Coffee,
  Zap
} from 'lucide-react';
import { LoadProfileConfig } from '../../types';
import { previewDailyLoadCurve } from '../../services/loadDataService';

interface LoadProfileConfigProps {
  config: LoadProfileConfig;
  onChange: (config: LoadProfileConfig) => void;
  averageDailyConsumption?: number;
}

const MONTHS = [
  { value: 1, label: '1月' },
  { value: 2, label: '2月' },
  { value: 3, label: '3月' },
  { value: 4, label: '4月' },
  { value: 5, label: '5月' },
  { value: 6, label: '6月' },
  { value: 7, label: '7月' },
  { value: 8, label: '8月' },
  { value: 9, label: '9月' },
  { value: 10, label: '10月' },
  { value: 11, label: '11月' },
  { value: 12, label: '12月' },
];

export const LoadProfileConfigComponent: React.FC<LoadProfileConfigProps> = ({
  config,
  onChange,
  averageDailyConsumption = 100,
}) => {
  // Generate chart data based on current config
  const chartData = useMemo(() => {
    const workdayCurve = previewDailyLoadCurve(averageDailyConsumption, config, false);
    // Holiday daily consumption is scaled by holidayRatio relative to workday
    const holidayDailyConsumption = averageDailyConsumption * config.holidayRatio;
    const holidayCurve = previewDailyLoadCurve(holidayDailyConsumption, config, true);

    return workdayCurve.map((point, index) => ({
      hour: point.hour,
      workday: Number(point.load.toFixed(2)),
      holiday: Number(holidayCurve[index].load.toFixed(2)),
    }));
  }, [config, averageDailyConsumption]);

  // Handlers
  const handleWorkdayChange = (key: keyof LoadProfileConfig, value: number) => {
    onChange({ ...config, [key]: value });
  };

  const handleMonthToggle = (season: 'summer' | 'winter', month: number) => {
    const key = season === 'summer' ? 'summerMonths' : 'winterMonths';
    const currentMonths = config[key];
    const newMonths = currentMonths.includes(month)
      ? currentMonths.filter((m) => m !== month)
      : [...currentMonths, month].sort((a, b) => a - b);
    
    onChange({ ...config, [key]: newMonths });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      
      {/* Left Column: Configuration */}
      <div className="lg:col-span-5 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-800">负荷曲线配置</h2>
        </div>

        {/* 1. Work Schedule */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <div className="flex items-center gap-2 mb-4 text-slate-700">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span className="font-medium">工作日设置</span>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-slate-600 mb-1">
                <span>工作时间</span>
                <span className="font-mono bg-white px-2 rounded border border-slate-200 text-xs py-0.5">
                  {String(config.workdayStart).padStart(2, '0')}:00 - {String(config.workdayEnd).padStart(2, '0')}:00
                </span>
              </div>
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <label className="text-xs text-slate-400 block mb-1">开始</label>
                  <input
                    type="range"
                    min="0"
                    max="23"
                    value={config.workdayStart}
                    onChange={(e) => handleWorkdayChange('workdayStart', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-400 block mb-1">结束</label>
                  <input
                    type="range"
                    min="0"
                    max="23"
                    value={config.workdayEnd}
                    onChange={(e) => handleWorkdayChange('workdayEnd', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm text-slate-600 mb-1">
                <span>工作时段用电占比</span>
                <span className="font-bold text-blue-600">{Math.round(config.workdayRatio * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={Math.round(config.workdayRatio * 100)}
                onChange={(e) => handleWorkdayChange('workdayRatio', parseInt(e.target.value) / 100)}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-xs text-slate-400 mt-1">
                工作时段用电量占全天的比例
              </p>
            </div>
          </div>
        </div>

        {/* 2. Holiday Settings */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <div className="flex items-center gap-2 mb-4 text-slate-700">
            <Coffee className="w-4 h-4 text-amber-600" />
            <span className="font-medium">假期设置</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">周末视为假期</span>
              <button
                onClick={() => onChange({ ...config, weekendAsHoliday: !config.weekendAsHoliday })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.weekendAsHoliday ? 'bg-amber-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.weekendAsHoliday ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <div className="flex justify-between text-sm text-slate-600 mb-1">
                <span>假期用电比例</span>
                <span className="font-bold text-amber-600">{Math.round(config.holidayRatio * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={Math.round(config.holidayRatio * 100)}
                onChange={(e) => handleWorkdayChange('holidayRatio', parseInt(e.target.value) / 100)}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                相对于工作日用电量
              </p>
            </div>
          </div>
        </div>

        {/* 3. Seasonal Adjustment */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <div className="flex items-center gap-2 mb-4 text-slate-700">
            <Calendar className="w-4 h-4 text-green-600" />
            <span className="font-medium">季节调整</span>
          </div>

          {/* Summer */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Sun className="w-3.5 h-3.5 text-orange-500" />
                <span>夏季</span>
              </div>
              <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                x{config.summerMultiplier}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {MONTHS.map((m) => (
                <button
                  key={`summer-${m.value}`}
                  onClick={() => handleMonthToggle('summer', m.value)}
                  className={`text-[10px] w-8 h-6 rounded flex items-center justify-center border transition-colors ${
                    config.summerMonths.includes(m.value)
                      ? 'bg-orange-50 border-orange-200 text-orange-700 font-medium'
                      : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {m.label.slice(0, 3)}
                </button>
              ))}
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={config.summerMultiplier}
              onChange={(e) => handleWorkdayChange('summerMultiplier', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          {/* Winter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                <span>冬季</span>
              </div>
              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                x{config.winterMultiplier}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {MONTHS.map((m) => (
                <button
                  key={`winter-${m.value}`}
                  onClick={() => handleMonthToggle('winter', m.value)}
                  className={`text-[10px] w-8 h-6 rounded flex items-center justify-center border transition-colors ${
                    config.winterMonths.includes(m.value)
                      ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
                      : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {m.label.slice(0, 3)}
                </button>
              ))}
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={config.winterMultiplier}
              onChange={(e) => handleWorkdayChange('winterMultiplier', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-400"
            />
          </div>
        </div>
      </div>

      {/* Right Column: Preview Chart */}
      <div className="lg:col-span-7 flex flex-col h-full min-h-[400px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-500" />
            <h3 className="text-lg font-medium text-slate-800">日负荷曲线预览</h3>
          </div>
          <div className="flex items-center gap-3 text-sm">
             <div className="flex items-center gap-1.5">
               <span className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500"></span>
               <span className="text-slate-600">工作日</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500"></span>
                <span className="text-slate-600">假期</span>
             </div>
          </div>
        </div>

        <div className="flex-1 w-full bg-slate-50 rounded-xl border border-slate-200 p-4 relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorWorkday" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="colorHoliday" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 12, fill: '#64748b' }} 
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                unit="h"
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }} 
                tickLine={false}
                axisLine={false}
                label={{ value: 'kWh', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                itemStyle={{ fontSize: '0.875rem' }}
                labelStyle={{ color: '#64748b', marginBottom: '0.25rem' }}
                formatter={(value: number) => [`${value} kWh`, '']}
              />
              <ReferenceLine x={config.workdayStart} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: '开始', position: 'top', fill: '#3b82f6', fontSize: 10 }} />
              <ReferenceLine x={config.workdayEnd} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: '结束', position: 'top', fill: '#3b82f6', fontSize: 10 }} />
              
              <Area 
                type="monotone" 
                dataKey="workday" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorWorkday)" 
                strokeWidth={2}
                name="工作日"
                animationDuration={500}
              />
              <Area 
                type="monotone" 
                dataKey="holiday" 
                stroke="#f59e0b" 
                fillOpacity={1} 
                fill="url(#colorHoliday)" 
                strokeWidth={2}
                name="假期"
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700 flex gap-2 items-start">
          <Zap className="w-4 h-4 mt-0.5 shrink-0" />
          <p>
            此配置用于将月度用电量分配到逐时数据。
            请根据实际生产运营情况调整工作时间和用电比例。
          </p>
        </div>
      </div>
    </div>
  );
};
