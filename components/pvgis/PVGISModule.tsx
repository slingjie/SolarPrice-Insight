/**
 * PVGIS 模块入口组件
 * 包含两个子 Tab：辐照度查询 / 发电量计算
 */

import React, { useState } from 'react';
import { Sun, Zap, ArrowLeft } from 'lucide-react';
import { IrradianceQuery } from './IrradianceQuery';
import { PowerCalculation } from './PowerCalculation';

type TabType = 'irradiance' | 'power';

export interface PVGISNavParams {
    lat?: number;
    lon?: number;
    address?: string;
    source?: 'irradiance_query';
    optimalSlope?: number;
}

interface PVGISModuleProps {
    onBack?: () => void;
}

export const PVGISModule: React.FC<PVGISModuleProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<TabType>('irradiance');
    const [navParams, setNavParams] = useState<PVGISNavParams>({});

    const handleNavigate = (tab: TabType, params?: PVGISNavParams) => {
        if (params) {
            setNavParams(prev => ({ ...prev, ...params }));
        }
        setActiveTab(tab);
    };

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                                <Sun className="text-white" size={22} />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900">光伏发电量计算</h1>
                                <p className="text-xs text-slate-500">基于 PVGIS 数据源</p>
                            </div>
                        </div>
                    </div>

                    {/* Tab 切换 */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('irradiance')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                                ${activeTab === 'irradiance'
                                    ? 'bg-white text-orange-600 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            <Sun size={16} />
                            辐照度查询
                        </button>
                        <button
                            onClick={() => setActiveTab('power')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                                ${activeTab === 'power'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            <Zap size={16} />
                            发电量计算
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {activeTab === 'irradiance' ? (
                    <IrradianceQuery
                        onNavigate={(params) => handleNavigate('power', params)}
                    />
                ) : (
                    <PowerCalculation
                        initialParams={navParams}
                    />
                )}
            </div>
        </div>
    );
};
