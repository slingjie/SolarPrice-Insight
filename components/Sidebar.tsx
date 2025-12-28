import React from 'react';
import { LayoutDashboard, Library, Zap, Settings, Sun, FileEdit, Calculator, BarChart3, Home, LogOut, ArrowLeft } from 'lucide-react';
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
      {/* Top Navigation Back Button */}
      <div className="p-4 border-b border-slate-50 mb-2">
        <button
          onClick={() => onNavigate('home')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </div>
          <span className="hidden lg:block font-bold">返回模块门户</span>
        </button>
      </div>

      <div className="px-6 py-2 flex items-center gap-3 opacity-60">
        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex items-center justify-center text-white shadow-sm">
          <Sun size={14} />
        </div>
        <span className="font-bold text-base tracking-tight hidden lg:block text-slate-700">
          PriceInsight
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
