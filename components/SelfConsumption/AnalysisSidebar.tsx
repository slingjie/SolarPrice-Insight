import React from 'react';
import { PieChart, History, ArrowLeft, PlusCircle, Sun } from 'lucide-react';

interface AnalysisSidebarProps {
  onBack: () => void;
}

export const AnalysisSidebar: React.FC<AnalysisSidebarProps> = ({ onBack }) => {
  return (
    <aside className="w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20 transition-all">
      <div className="p-4 border-b border-slate-50 mb-2">
        <button
          onClick={onBack}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </div>
          <span className="hidden lg:block font-bold">返回模块门户</span>
        </button>
      </div>

      <div className="px-6 py-2 flex items-center gap-3 opacity-80">
        <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded flex items-center justify-center text-white shadow-sm">
          <Sun size={14} />
        </div>
        <span className="font-bold text-base tracking-tight hidden lg:block text-slate-700">
          自发自用分析
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all bg-emerald-50 text-emerald-700 font-bold border border-emerald-100"
        >
          <PlusCircle size={20} />
          <span className="hidden lg:block">新建测算</span>
        </button>

        <button
          disabled
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-400 cursor-not-allowed hover:bg-slate-50"
        >
          <History size={20} />
          <span className="hidden lg:block">历史记录</span>
          <span className="hidden lg:inline-block text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded ml-auto">
            Dev
          </span>
        </button>
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100/50 hidden lg:block">
          <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1">
             <PieChart size={16} />
             <span>分析模式</span>
          </div>
          <p className="text-xs text-emerald-600/80 leading-relaxed">
            当前处于独立分析视图。
            所有的测算数据将自动保存到本地。
          </p>
        </div>
      </div>
    </aside>
  );
};
