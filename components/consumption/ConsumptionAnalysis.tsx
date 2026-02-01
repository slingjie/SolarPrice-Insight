import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Zap,
  Sun,
  Battery,
  ArrowUpRight,
  ArrowDownRight,
  Calendar
} from 'lucide-react';
import { ConsumptionSummary } from '../../types';

interface ConsumptionAnalysisProps {
  summary: ConsumptionSummary;
  onDateSelect?: (month: number, day: number) => void;
}

const COLORS = {
  pv: '#22c55e',
  load: '#3b82f6',
  self: '#f97316',
  export: '#10b981',
  import: '#6366f1',
  grid: '#94a3b8'
};

const ConsumptionAnalysis: React.FC<ConsumptionAnalysisProps> = ({ summary }) => {
  
  // Calculate typical daily profile (0-23h average)
  const typicalDailyProfile = useMemo(() => {
    if (!summary.hourlyData || summary.hourlyData.length === 0) return [];

    const hourlySums = new Array(24).fill(0).map(() => ({
      pv: 0,
      load: 0,
      count: 0
    }));

    summary.hourlyData.forEach(item => {
      // time format: "MM-DD HH:00" or ISO string
      let hour = 0;
      if (item.time.includes('T')) {
         hour = new Date(item.time).getHours();
      } else {
         const parts = item.time.split(' ');
         if (parts.length > 1) {
            hour = parseInt(parts[1].split(':')[0], 10);
         }
      }
      
      if (hour >= 0 && hour < 24) {
        hourlySums[hour].pv += item.pvGeneration;
        hourlySums[hour].load += item.loadDemand;
        hourlySums[hour].count += 1;
      }
    });

    return hourlySums.map((item, index) => ({
      hour: `${index}:00`,
      pv: item.count > 0 ? item.pv / item.count : 0,
      load: item.count > 0 ? item.load / item.count : 0
    }));
  }, [summary.hourlyData]);

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatKWh = (value: number) => `${Math.round(value).toLocaleString()} kWh`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="年发电量"
          value={formatKWh(summary.totalPvGeneration)}
          icon={<Sun className="w-5 h-5 text-yellow-500" />}
          subtext="Total Generation"
        />
        <StatCard
          title="年用电量"
          value={formatKWh(summary.totalLoadDemand)}
          icon={<Zap className="w-5 h-5 text-blue-500" />}
          subtext="Total Load"
        />
        <StatCard
          title="消纳率"
          value={formatPercent(summary.selfConsumptionRate)}
          icon={<ArrowUpRight className="w-5 h-5 text-green-500" />}
          subtext="Self-Consumption Rate"
        />
        <StatCard
          title="自给率"
          value={formatPercent(summary.selfSufficiencyRate)}
          icon={<Battery className="w-5 h-5 text-orange-500" />}
          subtext="Self-Sufficiency Rate"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-500" />
              月度电量汇总
            </h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} unit="月" />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [Math.round(value).toLocaleString(), 'kWh']}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                <Bar name="发电量" dataKey="pvGeneration" fill={COLORS.pv} radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar name="用电量" dataKey="loadDemand" fill={COLORS.load} radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar name="自用量" dataKey="selfConsumption" fill={COLORS.self} radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-slate-500" />
              消纳率与自给率趋势
            </h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} unit="月" />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, '']}
                />
                <Legend iconType="plainline" wrapperStyle={{ paddingTop: '10px' }} />
                <Line 
                  type="monotone" 
                  name="消纳率 (Self-Consumption)" 
                  dataKey="selfConsumptionRate" 
                  stroke={COLORS.self} 
                  strokeWidth={2} 
                  dot={{ r: 3, strokeWidth: 2 }} 
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  name="自给率 (Self-Sufficiency)" 
                  dataKey="selfSufficiencyRate" 
                  stroke={COLORS.pv} 
                  strokeWidth={2} 
                  dot={{ r: 3, strokeWidth: 2 }} 
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <ArrowDownRight className="w-5 h-5 text-slate-500" />
              光伏电量流向 (Generation Breakdown)
            </h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSelf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.self} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.self} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorExport" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.export} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.export} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} unit="月" />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [Math.round(value).toLocaleString(), 'kWh']}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                <Area 
                  type="monotone" 
                  dataKey="selfConsumption" 
                  name="自用 (Self-consumed)" 
                  stackId="1" 
                  stroke={COLORS.self} 
                  fill="url(#colorSelf)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="gridExport" 
                  name="上网 (Exported)" 
                  stackId="1" 
                  stroke={COLORS.export} 
                  fill="url(#colorExport)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-500" />
              典型日平均曲线 (Average Daily Profile)
            </h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={typicalDailyProfile} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPvDaily" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.pv} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.pv} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLoadDaily" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.load} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.load} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} interval={2} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [value.toFixed(2), 'kWh']}
                  labelFormatter={(label) => `${label}时`}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                <Area 
                  type="monotone" 
                  dataKey="pv" 
                  name="平均光伏 (Avg PV)" 
                  stroke={COLORS.pv} 
                  fill="url(#colorPvDaily)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="load" 
                  name="平均负荷 (Avg Load)" 
                  stroke={COLORS.load} 
                  fill="url(#colorLoadDaily)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  subtext: string;
}> = ({ title, value, icon, subtext }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
      <p className="text-xs text-slate-400 mt-1">{subtext}</p>
    </div>
    <div className="p-3 bg-slate-50 rounded-lg">
      {icon}
    </div>
  </div>
);

export default ConsumptionAnalysis;
