
import React from 'react';
import { LayoutDashboard, Library, Zap, Settings, Sun, FileEdit, Calculator } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const items = [
    { id: 'dashboard', label: '数据概览', icon: LayoutDashboard },
    { id: 'config', label: '时段配置库', icon: Library },
    { id: 'upload', label: '智能录入', icon: Zap },
    { id: 'manual', label: '手动录入', icon: FileEdit },
    { id: 'calculator', label: '综合电价', icon: Calculator },
    { id: 'settings', label: '系统设置', icon: Settings },
  ];

  return (
    <aside className="w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20 transition-all">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-200">
          <Sun size={20} />
        </div>
        <span className="font-bold text-xl tracking-tight hidden lg:block bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
          SolarPrice
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as AppView)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === item.id ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-500 hover:bg-slate-50'
              }`}
          >
            <item.icon size={20} />
            <span className="hidden lg:block">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};
