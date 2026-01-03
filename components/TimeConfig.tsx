import React, { useState, useMemo } from 'react';
import { Library, Search, MapPin } from 'lucide-react';
import { TimeConfig } from '../types';
import { PROVINCES } from '../constants.tsx';
import { TimeConfigMatrix } from './TimeConfigMatrix';
import { ConfirmModal } from './UI';

interface TimeConfigProps {
  configs: TimeConfig[];
  onSave: (configs: TimeConfig[]) => void;
}

export const TimeConfigView: React.FC<TimeConfigProps> = ({ configs, onSave }) => {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmProvince, setDeleteConfirmProvince] = useState<string | null>(null);

  // 计算每个省份的配置状态
  const provinceStatus = useMemo(() => {
    const status: Record<string, boolean> = {};
    configs.forEach(c => {
      if (c.province) status[c.province] = true;
    });
    return status;
  }, [configs]);

  // 过滤省份列表
  const filteredProvinces = useMemo(() => {
    return PROVINCES.filter(p =>
      !searchTerm || p.includes(searchTerm)
    );
  }, [searchTerm]);

  const handleMatrixSave = (province: string, newConfigs: TimeConfig[]) => {
    // 1. 移除该省份的所有旧配置
    const otherConfigs = configs.filter(c => c.province !== province);
    // 2. 添加新配置
    const updatedList = [...otherConfigs, ...newConfigs];

    onSave(updatedList);
  };

  const clearProvinceConfig = () => {
    if (deleteConfirmProvince) {
      const updatedList = configs.filter(c => c.province !== deleteConfirmProvince);
      onSave(updatedList);
      setDeleteConfirmProvince(null);
      // 清空后保持选中状态，矩阵会显示为空白，符合预期
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] gap-6 animate-in slide-in-from-right-4 duration-500">
      {/* Left: Province List */}
      <div className="w-full lg:w-1/4 flex flex-col gap-4 overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b bg-slate-50">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800 mb-3">
            <Library className="text-blue-600" /> 省份列表
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="搜索省份..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {filteredProvinces.map(province => {
            const hasConfig = provinceStatus[province];
            const isSelected = selectedProvince === province;

            return (
              <div
                key={province}
                className={`w-full flex items-center justify-between transition-all hover:bg-slate-50 border-l-4 group ${isSelected
                    ? 'border-l-blue-600 bg-blue-50 text-blue-700 font-bold'
                    : 'border-l-transparent text-slate-600'
                  }`}
              >
                <button
                  onClick={() => setSelectedProvince(province)}
                  className="flex-1 px-4 py-3 flex items-center gap-3 text-left"
                >
                  <MapPin size={16} className={hasConfig ? 'text-blue-500' : 'text-slate-300'} />
                  <span>{province}</span>
                </button>

                {hasConfig && (
                  <div className="pr-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmProvince(province);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="清空配置"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {searchTerm && !filteredProvinces.includes(searchTerm) && !provinceStatus[searchTerm] && (
            <button
              onClick={() => setSelectedProvince(searchTerm)}
              className="w-full px-4 py-3 flex items-center gap-3 text-slate-500 hover:bg-blue-50 hover:text-blue-600 border-l-4 border-l-transparent border-t border-slate-100 group"
            >
              <div className="bg-slate-100 p-1 rounded group-hover:bg-blue-200 text-slate-400 group-hover:text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
              </div>
              <span>新增 "{searchTerm}"</span>
            </button>
          )}
        </div>
      </div>

      {/* Right: Matrix Editor */}
      <div className="w-full lg:w-3/4 flex flex-col overflow-hidden">
        {selectedProvince ? (
          <TimeConfigMatrix
            configs={configs}
            selectedProvince={selectedProvince}
            onSave={handleMatrixSave}
          />
        ) : (
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <Library size={64} className="mb-4 opacity-10" />
            <p className="text-lg">请在左侧选择省份进行配置</p>
            <p className="text-sm mt-2 opacity-60">支持 12 个月全量可视化编辑</p>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteConfirmProvince !== null}
        title="确认清空"
        message={`确定要清空 ${deleteConfirmProvince} 的所有配置吗？此操作不可撤销。`}
        onConfirm={clearProvinceConfig}
        onCancel={() => setDeleteConfirmProvince(null)}
        confirmText="清空"
        danger
      />
    </div>
  );
};
