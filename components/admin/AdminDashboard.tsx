import React, { useMemo } from 'react';
import { Database, Clock, Calculator, TrendingUp, AlertCircle } from 'lucide-react';
import { TariffData, TimeConfig, ComprehensiveResult } from '../../types';

interface AdminDashboardProps {
    tariffs: TariffData[];
    timeConfigs: TimeConfig[];
    comprehensiveResults: ComprehensiveResult[];
    onNavigate: (view: 'tariffs' | 'configs' | 'results') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
    tariffs,
    timeConfigs,
    comprehensiveResults,
    onNavigate
}) => {
    const stats = useMemo(() => {
        const provinces = new Set(tariffs.map(t => t.province));
        const configProvinces = new Set(timeConfigs.map(c => c.province));

        return {
            tariffCount: tariffs.length,
            tariffProvinces: provinces.size,
            configCount: timeConfigs.length,
            configProvinces: configProvinces.size,
            resultCount: comprehensiveResults.length,
        };
    }, [tariffs, timeConfigs, comprehensiveResults]);

    const cards = [
        {
            id: 'tariffs' as const,
            title: '电价数据',
            icon: Database,
            color: 'blue',
            stats: [
                { label: '总记录数', value: stats.tariffCount },
                { label: '覆盖省份', value: stats.tariffProvinces },
            ],
        },
        {
            id: 'configs' as const,
            title: '时段配置',
            icon: Clock,
            color: 'purple',
            stats: [
                { label: '配置数量', value: stats.configCount },
                { label: '覆盖省份', value: stats.configProvinces },
            ],
        },
        {
            id: 'results' as const,
            title: '综合电价结果',
            icon: Calculator,
            color: 'green',
            stats: [
                { label: '计算结果', value: stats.resultCount },
            ],
        },
    ];

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; text: string; icon: string; hover: string }> = {
            blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'bg-blue-100', hover: 'hover:bg-blue-100' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'bg-purple-100', hover: 'hover:bg-purple-100' },
            green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'bg-green-100', hover: 'hover:bg-green-100' },
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">数据概览</h1>
                <p className="text-slate-500 mt-1">管理电价数据、时段配置和计算结果</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map(card => {
                    const Icon = card.icon;
                    const colors = getColorClasses(card.color);

                    return (
                        <button
                            key={card.id}
                            onClick={() => onNavigate(card.id)}
                            className={`${colors.bg} ${colors.hover} p-6 rounded-2xl text-left transition-all group`}
                        >
                            <div className="flex items-start justify-between">
                                <div className={`${colors.icon} p-3 rounded-xl`}>
                                    <Icon size={24} className={colors.text} />
                                </div>
                                <TrendingUp size={20} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
                            </div>

                            <h3 className={`text-lg font-bold mt-4 ${colors.text}`}>{card.title}</h3>

                            <div className="mt-4 space-y-2">
                                {card.stats.map((stat, idx) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <span className="text-sm text-slate-500">{stat.label}</span>
                                        <span className="text-xl font-bold text-slate-900">{stat.value}</span>
                                    </div>
                                ))}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Quick Tips */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4">
                <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold text-amber-800">使用提示</h4>
                    <ul className="text-sm text-amber-700 mt-2 space-y-1">
                        <li>点击上方卡片可进入对应的数据管理页面</li>
                        <li>使用"导入/导出"功能可批量管理数据</li>
                        <li>建议定期使用"备份恢复"功能备份数据</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
