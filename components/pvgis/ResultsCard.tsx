
import React from 'react';
import { Sun, Battery, Clock, Activity, ArrowUpRight, Maximize } from 'lucide-react';
import { PVSummary } from '../../types';

interface ResultsCardProps {
    summary: PVSummary;
}

export const ResultsCard: React.FC<ResultsCardProps> = ({ summary }) => {
    return (
        <div className="space-y-4">
            {/* Primary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                        <Sun size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase">年发电量 (Energy)</p>
                        <p className="text-xl font-bold text-slate-900">
                            {Math.round(summary.annualEnergy).toLocaleString()} <span className="text-sm font-normal text-slate-500">kWh</span>
                        </p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase">系统效率 (PR)</p>
                        <p className="text-xl font-bold text-slate-900">
                            {(summary.pr * 100).toFixed(1)} <span className="text-sm font-normal text-slate-500">%</span>
                        </p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase">满发小时数 (Hours)</p>
                        <p className="text-xl font-bold text-slate-900">
                            {Math.round(summary.fullLoadHours).toLocaleString()} <span className="text-sm font-normal text-slate-500">h</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Secondary Metrics (Detailed) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mb-1">
                        <Maximize size={10} /> 最佳倾角 (Opt. Slope)
                    </p>
                    <p className="text-base font-bold text-slate-800">
                        {summary.optimalSlope ? summary.optimalSlope.toFixed(1) : '--'}°
                    </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mb-1">
                        <Sun size={10} /> 水平辐照度 (Horizontal)
                    </p>
                    <p className="text-base font-bold text-slate-800">
                        {Math.round(summary.globalIrradiance).toLocaleString()} <span className="text-xs font-normal">kWh/m²</span>
                    </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mb-1">
                        <ArrowUpRight size={10} /> 斜面辐照度 (In-Plane)
                    </p>
                    <p className="text-base font-bold text-slate-800">
                        {Math.round(summary.inPlaneIrradiance).toLocaleString()} <span className="text-xs font-normal">kWh/m²</span>
                    </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mb-1">
                        <Battery size={10} /> 预估损耗 (Est. Loss)
                    </p>
                    <p className="text-base font-bold text-slate-800">
                        {summary.loss}%
                    </p>
                </div>
            </div>
        </div>
    );
};
