import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './UI';
import { simulateDailySolarCurve, simulateLoadCurve, calculateSelfConsumption } from '../services/solarCalculator';
import { SolarSimulationResult } from '../types';
import { Calculator, Sun, Battery, Zap, PieChart, BatteryCharging, Upload, Download } from 'lucide-react';
import { 
    ComposedChart, 
    BarChart,
    Bar, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer, 
    Area 
} from 'recharts';

const SelfConsumptionAnalysis: React.FC = () => {
    const [systemSize, setSystemSize] = useState<number>(10);
    const [monthlyConsumption, setMonthlyConsumption] = useState<number>(1500);
    const [workStart, setWorkStart] = useState<string>('09:00');
    const [workEnd, setWorkEnd] = useState<string>('18:00');
    const [selectedMonth, setSelectedMonth] = useState<number>(6);

    const [simulationResult, setSimulationResult] = useState<SolarSimulationResult | null>(null);

    const handleCalculate = () => {
        try {
            console.log('Starting simulation...');
            
            const solarCurve = simulateDailySolarCurve(systemSize, selectedMonth);
            const loadCurve = simulateLoadCurve(monthlyConsumption, workStart, workEnd);
            const result = calculateSelfConsumption(solarCurve, loadCurve);
            
            console.log('Simulation Result:', result);
            setSimulationResult(result);
        } catch (error) {
            console.error('Simulation failed:', error);
            alert('Simulation failed. Please check your inputs.');
        }
    };

    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <Card className="h-full border-t-4 border-t-blue-500 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
                            <Calculator className="w-6 h-6 text-blue-500" />
                            Simulation Parameters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Sun className="w-4 h-4 text-orange-500" />
                                System Size (kWp)
                            </label>
                            <input
                                type="number"
                                value={systemSize}
                                onChange={(e) => setSystemSize(Number(e.target.value))}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                min="0"
                                step="0.1"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-500" />
                                Monthly Consumption (kWh)
                            </label>
                            <input
                                type="number"
                                value={monthlyConsumption}
                                onChange={(e) => setMonthlyConsumption(Number(e.target.value))}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                min="0"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Work Start</label>
                                <input
                                    type="time"
                                    value={workStart}
                                    onChange={(e) => setWorkStart(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Work End</label>
                                <input
                                    type="time"
                                    value={workEnd}
                                    onChange={(e) => setWorkEnd(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Month</label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                            >
                                {months.map((m) => (
                                    <option key={m.value} value={m.value}>
                                        {m.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleCalculate}
                            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Run Simulation
                        </button>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-2">
                <Card className="h-full border-t-4 border-t-green-500 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
                            <Battery className="w-6 h-6 text-green-500" />
                            Analysis Results
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {simulationResult ? (
                            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <Card className="bg-green-50 border-green-100 shadow-sm">
                                        <CardContent className="p-4 flex flex-col items-center text-center">
                                            <div className="flex items-center gap-2 mb-2">
                                                <PieChart className="w-5 h-5 text-green-600" />
                                                <p className="text-sm text-green-600 font-medium">Self-Consumption</p>
                                            </div>
                                            <p className="text-2xl font-bold text-green-800">
                                                {(simulationResult.selfConsumptionRate * 100).toFixed(1)}%
                                            </p>
                                        </CardContent>
                                    </Card>
                                    
                                    <Card className="bg-blue-50 border-blue-100 shadow-sm">
                                        <CardContent className="p-4 flex flex-col items-center text-center">
                                            <div className="flex items-center gap-2 mb-2">
                                                <BatteryCharging className="w-5 h-5 text-blue-600" />
                                                <p className="text-sm text-blue-600 font-medium">Consumed</p>
                                            </div>
                                            <p className="text-2xl font-bold text-blue-800">
                                                {simulationResult.totalSelfConsumedKwh.toFixed(0)} <span className="text-xs font-normal text-blue-600">kWh</span>
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-yellow-50 border-yellow-100 shadow-sm">
                                        <CardContent className="p-4 flex flex-col items-center text-center">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Upload className="w-5 h-5 text-yellow-600" />
                                                <p className="text-sm text-yellow-600 font-medium">Grid Export</p>
                                            </div>
                                            <p className="text-2xl font-bold text-yellow-800">
                                                {simulationResult.totalExportKwh.toFixed(0)} <span className="text-xs font-normal text-yellow-600">kWh</span>
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-red-50 border-red-100 shadow-sm">
                                        <CardContent className="p-4 flex flex-col items-center text-center">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Download className="w-5 h-5 text-red-600" />
                                                <p className="text-sm text-red-600 font-medium">Grid Import</p>
                                            </div>
                                            <p className="text-2xl font-bold text-red-800">
                                                {simulationResult.totalImportKwh.toFixed(0)} <span className="text-xs font-normal text-red-600">kWh</span>
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="h-80 w-full p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                                        <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                            <Sun className="w-4 h-4 text-orange-500" />
                                            Solar Generation vs. Load Profile
                                        </h3>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ComposedChart data={simulationResult.hourlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.05}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                <XAxis 
                                                    dataKey="hour" 
                                                    tickFormatter={(tick) => `${tick}:00`} 
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                                    dy={10}
                                                />
                                                <YAxis 
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                                />
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    formatter={(value: number) => [`${value.toFixed(2)} kWh`, '']}
                                                    labelFormatter={(label) => `${label}:00 - ${label + 1}:00`}
                                                />
                                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="solarKwh" 
                                                    name="Solar Generation" 
                                                    fill="url(#colorSolar)" 
                                                    stroke="#f97316" 
                                                    strokeWidth={2}
                                                />
                                                <Line 
                                                    type="step" 
                                                    dataKey="loadKwh" 
                                                    name="Load Consumption" 
                                                    stroke="#3b82f6" 
                                                    strokeWidth={2} 
                                                    dot={false}
                                                />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="h-80 w-full p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                                        <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                                            <Battery className="w-4 h-4 text-green-500" />
                                            Energy Balance (Hourly)
                                        </h3>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={simulationResult.hourlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                <XAxis 
                                                    dataKey="hour" 
                                                    tickFormatter={(tick) => `${tick}:00`} 
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                                    dy={10}
                                                />
                                                <YAxis 
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                                />
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    cursor={{ fill: '#f3f4f6' }}
                                                    formatter={(value: number) => [`${value.toFixed(2)} kWh`, '']}
                                                />
                                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                                <Bar dataKey="selfConsumedKwh" name="Self-Consumed" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} />
                                                <Bar dataKey="exportKwh" name="Grid Export" stackId="a" fill="#eab308" radius={[4, 4, 0, 0]} />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="importKwh" 
                                                    name="Grid Import" 
                                                    stroke="#ef4444" 
                                                    strokeWidth={2} 
                                                    dot={false}
                                                    strokeDasharray="5 5"
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="text-xs text-gray-400 text-center">
                                    * Simulation based on typical daily profiles for {months.find(m => m.value === selectedMonth)?.label}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 min-h-[400px]">
                                <Calculator className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-lg font-medium">Enter parameters and run simulation</p>
                                <p className="text-sm opacity-60">Results will appear here</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SelfConsumptionAnalysis;
