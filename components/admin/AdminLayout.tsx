import React from 'react';
import {
    Database,
    Clock,
    Calculator,
    Download,
    Upload,
    History,
    Home,
    ArrowLeft,
    Settings
} from 'lucide-react';

export type AdminView = 'dashboard' | 'tariffs' | 'configs' | 'results' | 'import-export' | 'backup' | 'logs';

interface AdminLayoutProps {
    currentView: AdminView;
    onNavigate: (view: AdminView) => void;
    onBack: () => void;
    children: React.ReactNode;
}

const NAV_ITEMS: { id: AdminView; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: '数据概览', icon: Home },
    { id: 'tariffs', label: '电价数据', icon: Database },
    { id: 'configs', label: '时段配置', icon: Clock },
    { id: 'results', label: '综合电价', icon: Calculator },
    { id: 'import-export', label: '导入/导出', icon: Download },
    { id: 'backup', label: '备份恢复', icon: Upload },
    { id: 'logs', label: '操作日志', icon: History },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({
    currentView,
    onNavigate,
    onBack,
    children
}) => {
    return (
        <div className="min-h-screen bg-slate-100 flex">
            {/* Sidebar */}
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <Settings size={18} />
                        </div>
                        <div>
                            <h1 className="font-bold text-base text-slate-800">数据管理中心</h1>
                            <p className="text-[10px] text-slate-400 font-medium tracking-wide">ADMIN CONSOLE</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {NAV_ITEMS.map(item => {
                        const Icon = item.icon;
                        const isActive = currentView === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${isActive
                                    ? 'bg-indigo-50 text-indigo-600 font-bold'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                    }`}
                            >
                                <Icon size={18} />
                                <span className="text-sm">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-50">
                    <button
                        onClick={onBack}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium text-sm">返回主应用</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};
