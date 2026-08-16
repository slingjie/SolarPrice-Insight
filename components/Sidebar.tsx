import React from 'react';
import { LayoutDashboard, Library, Settings, Calculator, ArrowLeft, GitCompare, Zap } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const items = [
    { id: 'dashboard', label: '电价与时段', icon: LayoutDashboard },
    { id: 'compare', label: '跨省横向对比', icon: GitCompare, badge: '多省同屏' },
    { id: 'config', label: '分时规则查看', icon: Library },
    { id: 'calculator', label: '综合电价', icon: Calculator },
    { id: 'settings', label: '系统设置', icon: Settings },
  ];

  return (
    <aside className="w-20 lg:w-64 glass-panel border-r border-slate-200/80 flex flex-col fixed h-full z-30 transition-all p-3">
      {/* 顶部 Logo & 工作台名称 */}
      <div className="flex items-center gap-3 px-3 py-3 mb-3 border-b border-slate-100/80">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
          <Zap size={18} />
        </div>
        <div className="hidden lg:block overflow-hidden">
          <h1 className="font-extrabold text-sm tracking-tight text-slate-900 leading-none truncate">电价工作台</h1>
          <span className="text-[11px] font-medium text-slate-400">SolarPrice Insight</span>
        </div>
      </div>

      {/* 导航按钮组 */}
      <nav className="flex-1 space-y-1.5 mt-1">
        <div className="hidden lg:block px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          核心功能
        </div>
        {items.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as AppView)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-indigo-50/90 text-indigo-600 font-bold border border-indigo-100/80 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 font-medium'
              }`}
            >
              <item.icon size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
              <span className="hidden lg:block text-xs">{item.label}</span>
              {item.badge && (
                <span className="hidden lg:inline-block ml-auto text-[10px] bg-indigo-50 text-indigo-600 font-semibold px-1.5 py-0.5 rounded border border-indigo-100">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 底部返回门户与权威数据库状态卡 */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <div className="hidden lg:block p-3 rounded-xl bg-slate-50/80 border border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-700">95598 权威数据库</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>已同步
            </span>
          </div>
          <div className="text-[10px] text-slate-400 tabular-nums">覆盖 31 省份 · 实时更新</div>
        </div>

        <button
          onClick={() => onNavigate('home')}
          className="w-full flex items-center justify-center lg:justify-start gap-2.5 px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors text-xs font-medium border border-transparent hover:border-slate-200"
          title="返回模块门户"
        >
          <ArrowLeft size={16} />
          <span className="hidden lg:block">返回模块门户</span>
        </button>
      </div>
    </aside>
  );
};
