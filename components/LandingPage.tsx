import React from 'react';
import { LayoutDashboard, Sun, ArrowRight, Zap, Coins } from 'lucide-react';
import { AppView } from '../types';

interface LandingPageProps {
    onNavigate: (view: AppView) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl opacity-30 animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100 rounded-full blur-3xl opacity-30 animate-pulse delay-700" />
            </div>

            <div className="text-center mb-12 z-10">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 mb-4 tracking-tight">
                    SolarPrice Insight
                </h1>
                <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto">
                    一站式光伏投资决策平台：分时电价洞察与精准发电量测算
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full z-10">
                {/* Electricity Price Module */}
                <button
                    onClick={() => onNavigate('dashboard')}
                    className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 text-left overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-1/2 -translate-y-1/2" />

                    <div className="relative">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                            <Coins size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors">
                            分时电价洞察
                        </h2>
                        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-6">
                            Electricity Price Insight
                        </h3>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            全国分时电价数据库，支持多维度查询、横向对比与综合电价计算。助您精准把握收益模型。
                        </p>

                        <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                            进入模块 <ArrowRight className="ml-2" size={20} />
                        </div>
                    </div>
                </button>

                {/* Solar Generation Module */}
                <button
                    onClick={() => onNavigate('pvgis')}
                    className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 text-left overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-32 bg-gradient-to-br from-orange-50 to-amber-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-1/2 -translate-y-1/2" />

                    <div className="relative">
                        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                            <Sun size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-orange-700 transition-colors">
                            光伏发电测算
                        </h2>
                        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-6">
                            PVGIS Power Calculator
                        </h3>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            基于欧盟 PVGIS 权威气象数据，智能搜索定位，一键测算年发电量、PR效率与最佳倾角。
                        </p>

                        <div className="flex items-center text-orange-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                            开始测算 <ArrowRight className="ml-2" size={20} />
                        </div>
                    </div>
                </button>
            </div>

            <div className="mt-16 text-slate-400 text-sm">
                SolarPrice Insight © 2025
            </div>
        </div>
    );
};
