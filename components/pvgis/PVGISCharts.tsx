
import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Brush } from 'recharts';
import { PVSummary, HourlyData } from '../../types';

interface PVGISChartsProps {
    summary: PVSummary;
    hourly: HourlyData[];
}

export const PVGISCharts: React.FC<PVGISChartsProps> = ({ summary, hourly }) => {
    const [viewMode, setViewMode] = useState<'monthly' | 'hourly'>('monthly');

    const monthlyData = useMemo(() => {
        return summary.monthlyEnergy.map((val, idx) => ({
            month: `${idx + 1}月`,
            energy: Math.round(val)
        }));
    }, [summary]);

    // Optimize hourly data for display - maybe aggregate or show 365 days?
    // Displaying 8760 points is heavy. 
    // Let's format data for a generic view (e.g. daily totals or just sample points)
    // For now, let's take daily sums for the hourly chart to show seasonality clearly
    const dailyData = useMemo(() => {
        if (!hourly || hourly.length === 0) return [];

        // Group by date
        const dailyMap = new Map<string, number>();
        hourly.forEach(h => {
            const date = h.time.split('T')[0];
            const energy = h.pvPower / 1000; // Assuming h.pvPower is Watts average over hour -> Wh -> kWh
            dailyMap.set(date, (dailyMap.get(date) || 0) + energy);
        });

        return Array.from(dailyMap.entries()).map(([date, energy]) => ({
            date,
            energy: parseFloat(energy.toFixed(1))
        }));
    }, [hourly]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800">数据可视化</h3>
                <div className="flex bg-slate-100 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('monthly')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        月度汇总
                    </button>
                    <button
                        onClick={() => setViewMode('hourly')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'hourly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        日发电趋势
                    </button>
                </div>
            </div>

            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {viewMode === 'monthly' ? (
                        <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="energy" name="月发电量 (kWh)" fill="#3b82f6" radius={[4, 4, 0, 0]} animationDuration={1000} />
                        </BarChart>
                    ) : (
                        <LineChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickFormatter={val => val.slice(5)} minTickGap={30} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                labelFormatter={label => `日期: ${label}`}
                            />
                            <Line
                                type="monotone"
                                dataKey="energy"
                                name="日发电量 (kWh)"
                                stroke="#f59e0b"
                                strokeWidth={1}
                                dot={false}
                                animationDuration={1000}
                            />
                            <Brush dataKey="date" height={30} stroke="#cbd5e1" />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
};
