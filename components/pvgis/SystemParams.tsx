
import React from 'react';
import { Settings, Zap, Compass, RefreshCw } from 'lucide-react';
import { PVGISParams } from '../../types';

interface SystemParamsProps {
    params: PVGISParams;
    onChange: (newParams: Partial<PVGISParams>) => void;
    onCalculate: () => void;
    loading: boolean;
}

export const SystemParams: React.FC<SystemParamsProps> = ({ params, onChange, onCalculate, loading }) => {
    return (
        <div className="space-y-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Settings size={18} className="text-blue-600" />
                系统参数
            </h3>

            <div className="space-y-4">
                {/* Installed Capacity */}
                <div className="space-y-2">
                    <label className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Zap size={12} /> 装机容量 (kWp)
                    </label>
                    <input
                        type="number"
                        value={params.peakPower}
                        onChange={(e) => onChange({ peakPower: parseFloat(e.target.value) || 0 })}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-mono"
                        min="0"
                        step="0.1"
                    />
                </div>

                {/* System Loss */}
                <div className="space-y-2">
                    <label className="text-xs text-slate-500 font-medium">预估损耗 (Estimated Loss %)</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min="0"
                            max="30"
                            value={params.loss}
                            onChange={(e) => onChange({ loss: parseFloat(e.target.value) })}
                            className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <span className="text-sm font-mono w-10 text-right">{params.loss}%</span>
                    </div>
                </div>

                {/* Inclination / Slope */}
                <div className="space-y-2">
                    <label className="text-xs text-slate-500 font-medium flex items-center gap-1 justify-between">
                        <span className="flex items-center gap-1"><Compass size={12} className="rotate-45" /> 倾角 (Slope/Tilt)</span>
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] text-slate-500 font-normal cursor-pointer flex items-center gap-1 select-none">
                                <input
                                    type="checkbox"
                                    checked={params.angle === undefined}
                                    onChange={(e) => onChange({ angle: e.target.checked ? undefined : 35 })}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                自动最佳倾角
                            </label>
                        </div>
                    </label>

                    {params.angle === undefined ? (
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 text-xs text-slate-400 text-center font-mono">
                            Auto / Optimal
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min="0"
                                max="90"
                                value={params.angle}
                                onChange={(e) => onChange({ angle: parseFloat(e.target.value) })}
                                className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <span className="text-sm font-mono w-10 text-right">{params.angle}°</span>
                        </div>
                    )}
                </div>

                {/* Azimuth */}
                <div className="space-y-2">

                    <label className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Compass size={12} /> 方位角 (Azimuth)
                        <span className="text-[10px] text-slate-400 ml-auto font-normal">0=南, -90=东, 90=西</span>
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min="-180"
                            max="180"
                            value={params.azimuth}
                            onChange={(e) => onChange({ azimuth: parseFloat(e.target.value) })}
                            className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <span className="text-sm font-mono w-12 text-right">{params.azimuth}°</span>
                    </div>
                </div>
            </div>

            <button
                onClick={onCalculate}
                disabled={loading}
                className={`w-full py-2.5 rounded-xl font-medium text-white shadow-lg transition-all flex items-center justify-center gap-2
                    ${loading
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0'
                    }`}
            >
                {loading ? (
                    <>
                        <RefreshCw size={18} className="animate-spin" /> 计算中...
                    </>
                ) : (
                    <>
                        开始测算 (Calculate)
                    </>
                )}
            </button>
        </div>
    );
};
