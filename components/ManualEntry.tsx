
import React from 'react';
import { AlertTriangle, Database, Settings } from 'lucide-react';
import { TimeConfig, TariffData } from '../types';
import { Card } from './UI';

interface ManualEntryProps {
  timeConfigs: TimeConfig[];
  tariffs: TariffData[];
  onSave: (newTariffs: TariffData[]) => void;
  onNavigate: (view: any) => void;
}

export const ManualEntry: React.FC<ManualEntryProps> = ({ timeConfigs, tariffs, onSave, onNavigate }) => {
  void timeConfigs;
  void tariffs;
  void onSave;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-right-6 duration-500 pb-20">
      <div className="flex items-center gap-3">
        <AlertTriangle size={22} className="text-amber-500" />
        <h2 className="text-2xl font-bold text-slate-900">手动录入已下线</h2>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Database size={18} className="text-blue-500" /> 电价配置入口已统一
        </div>

        <p className="text-sm text-slate-600 leading-7">
          为避免“手动录入”和“数据管理中心”双入口导致的配置冲突，手动录入页面中的“手动配置电价”表单已移除。
          请在“数据管理中心 → 电价数据管理”中维护电价数据。
        </p>

        <button
          onClick={() => onNavigate('admin')}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 transition-all active:scale-95 text-sm"
        >
          <Settings size={16} /> 前往数据管理中心
        </button>
      </Card>
    </div>
  );
};
