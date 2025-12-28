import React, { useState } from 'react';
import { LocationInput } from './LocationInput';
import { SystemParams } from './SystemParams';
import { ResultsCard } from './ResultsCard';
import { PVGISCharts } from './PVGISCharts';
import { FormulaCard } from './FormulaCard';
import { PVGISParams, PVSummary, HourlyData } from '../../types';
import { pvgisService } from '../../services/pvgisService';
import { AlertCircle, Printer, ArrowLeft, Sun, Download } from 'lucide-react';
import { exportHourlyDataToCSV } from '../../utils/exportUtils';

const DEFAULT_PARAMS: PVGISParams = {
    lat: 30.27, // Hangzhou
    lon: 120.15,
    peakPower: 10,
    loss: 14,
    azimuth: 0,
    angle: undefined // Optimized
};

interface PowerCalculationProps {
    onBack?: () => void;
}

export const PowerCalculation: React.FC<PowerCalculationProps> = ({ onBack }) => {
    const [params, setParams] = useState<PVGISParams>(DEFAULT_PARAMS);
    const [summary, setSummary] = useState<PVSummary | null>(null);
    const [hourly, setHourly] = useState<HourlyData[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleParamChange = (newParams: Partial<PVGISParams>) => {
        setParams(prev => ({ ...prev, ...newParams }));
    };

    const handleLocationChange = (field: 'lat' | 'lon', value: number) => {
        setParams(prev => ({ ...prev, [field]: value }));
    };

    const performCalculation = async (currentParams: PVGISParams) => {
        setLoading(true);
        setError(null);
        try {
            const data = await pvgisService.getPVData(currentParams);
            setSummary(data.summary);
            setHourly(data.hourly);
        } catch (err: any) {
            console.error(err);
            setError(err.message || '计算失败，请检查网络或参数');
        } finally {
            setLoading(false);
        }
    };

    const handleCalculate = () => {
        performCalculation(params);
    };

    const handleLocationSearch = (lat: number, lon: number) => {
        const newParams = { ...params, lat, lon };
        setParams(newParams);
        // Do not auto calculate
    };

    return (
        <div className="h-full flex flex-col md:flex-row gap-6 p-6 animate-in fade-in bg-slate-50 relative">

            {/* Sidebar / Input Panel - Hidden on Print */}
            <div className={`w-full md:w-80 flex-shrink-0 space-y-6 print:hidden ${onBack ? 'mt-16' : ''}`}>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">发电量测算</h2>
                    <div className="space-y-8">
                        <LocationInput
                            lat={params.lat}
                            lon={params.lon}
                            onChange={handleLocationChange}
                            onLocationSelect={handleLocationSearch}
                        />
                        <div className="h-px bg-slate-100" />
                        <SystemParams
                            params={params}
                            onChange={handleParamChange}
                            onCalculate={handleCalculate}
                            loading={loading}
                        />
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-start gap-2 animate-in slide-in-from-top-2">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
            </div>

            {/* Main Content / Results */}
            <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pb-10">
                <div className="flex items-center gap-4 pb-2 print:hidden">
                    <h2 className="text-xl font-bold text-slate-900 hidden md:block">测算结果</h2>
                    <div className="ml-auto flex items-center gap-4">
                        {hourly && (
                            <button
                                onClick={() => {
                                    const dateStr = new Date().toISOString().split('T')[0];
                                    exportHourlyDataToCSV(hourly, `solar_data_${dateStr}.csv`);
                                }}
                                className="text-sm flex items-center gap-2 text-slate-500 hover:text-orange-600 transition-colors"
                            >
                                <Download size={16} /> 导出逐时数据 (CSV)
                            </button>
                        )}
                        {summary && (
                            <button
                                onClick={() => window.print()}
                                className="text-sm flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors"
                            >
                                <Printer size={16} /> 导出报告 / 打印
                            </button>
                        )}
                    </div>
                </div>

                {!summary ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl min-h-[400px]">
                        <p>请输入参数并点击“开始测算”</p>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <ResultsCard summary={summary} />
                        <PVGISCharts summary={summary} hourly={hourly || []} />
                        <FormulaCard />
                    </div>
                )}
            </div>
        </div>
    );
};
