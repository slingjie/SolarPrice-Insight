
import React from 'react';
import { Calculator } from 'lucide-react';

export const FormulaCard: React.FC = () => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mt-6 print:break-inside-avoid">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Calculator className="text-blue-600" size={18} /> 计算逻辑说明
            </h3>

            <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm text-slate-700 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <span className="font-bold whitespace-nowrap">E = H × P × PR</span>
                </div>

                <hr className="border-slate-200" />

                <div className="bg-amber-50 rounded p-3 mb-4 text-xs text-amber-800 border border-amber-100">
                    <strong>注意区分:</strong> “系统损耗 (Loss)”是您预估的输入值，而“系统效率 (PR)”是实际计算出的结果值。
                    <br />
                    PR ≈ 1 - (系统损耗 + 温度损耗 + 其他不可避免的物理损耗)。
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                        <strong className="text-slate-900 block mb-1">E (Annual Energy)</strong>
                        <span className="text-slate-500">年发电量 (kWh)。系统最终输出的交流电能。</span>
                    </div>
                    <div>
                        <strong className="text-slate-900 block mb-1">H (In-Plane Irradiation)</strong>
                        <span className="text-slate-500">斜面年辐照度 (kWh/m²)。光伏组件表面接收到的太阳辐射总量。</span>
                    </div>
                    <div>
                        <strong className="text-slate-900 block mb-1">P (Peak Power)</strong>
                        <span className="text-slate-500">装机容量 (kWp)。光伏系统的额定峰值功率。</span>
                    </div>
                    <div>
                        <strong className="text-slate-900 block mb-1">PR (Performance Ratio)</strong>
                        <span className="text-slate-500">实际系统效率 (Performance Ratio)。综合考虑了预估损耗、温度影响等后的最终效率系数。</span>
                    </div>
                </div>

                <div className="text-[10px] text-slate-400 mt-2">
                    * 数据来源: EU Science Hub (PVGIS) API v5.2, 使用 ERA5 / SARAH2 气象数据库。
                </div>
            </div>
        </div>
    );
};
