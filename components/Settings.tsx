import React, { useState, useRef } from 'react';
import { Settings, CheckCircle2, ShieldCheck, Key, Database, Download, Upload, AlertCircle, FileJson, Trash2, RefreshCcw } from 'lucide-react';
import { Card, Toast } from './UI';
import { TariffData, TimeConfig } from '../types';
import { DEFAULT_TIME_CONFIGS } from '../constants.tsx';

interface SettingsViewProps {
  tariffs: TariffData[];
  timeConfigs: TimeConfig[];
  onImportTariffs: (tariffs: TariffData[]) => void;
  onImportConfigs: (configs: TimeConfig[]) => void;
  onNavigate: (view: any) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ tariffs, timeConfigs, onImportTariffs, onImportConfigs, onNavigate }) => {
  const [apiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || '');
  const [importError, setImportError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [importConfirmation, setImportConfirmation] = useState<{
    tariffs: TariffData[];
    timeConfigs: TimeConfig[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 导出逻辑
  const handleExport = () => {
    const backupData = {
      version: "2.0", // 升级到 RxDB 版本标识
      exportDate: new Date().toISOString(),
      tariffs,
      timeConfigs
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solarprice_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToastMessage("备份文件已准备好，开始下载");
  };

  // 导入准备（解析文件）
  const handleImportRequest = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);

        // 简单验证格式
        if (!json.tariffs || !json.timeConfigs) {
          throw new Error("无效的备份文件格式。");
        }

        setImportConfirmation({
          tariffs: json.tariffs,
          timeConfigs: json.timeConfigs
        });
      } catch (err: any) {
        setImportError(err.message || "导入失败，请检查文件。");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 执行导入
  const confirmImport = () => {
    if (!importConfirmation) return;

    onImportTariffs(importConfirmation.tariffs);
    onImportConfigs(importConfirmation.timeConfigs);

    setImportConfirmation(null);
    setToastMessage("数据导入成功！");
  };

  const handleRestoreDefaults = () => {
    if (window.confirm("确定恢复默认配置库？这会将现有的配置库替换为系统内置的典型省份配置。")) {
      onImportConfigs(DEFAULT_TIME_CONFIGS);
      setToastMessage("已恢复默认配置库");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <h2 className="text-2xl font-bold text-slate-900">系统设置 (Settings)</h2>

      {/* Privacy Card */}
      <Card className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">隐私与策略</h3>
            <p className="text-slate-500 text-sm mt-1">
              我们遵循 "BYOK" (Bring Your Own Key) 模式。您的数据安全地存储在浏览器本地数据库（RxDB/IndexedDB）中。
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Key size={14} className="text-blue-500" /> Google Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              readOnly
              className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-slate-500 focus:outline-none cursor-not-allowed font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-2">
              当前应用使用系统注入的 API Key。如果您在本地开发，请在环境变量中设置 API_KEY。
            </p>
          </div>
        </div>
      </Card>

      {/* Data Management Card */}
      <Card className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Database size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">数据管理</h3>
            <p className="text-slate-500 text-sm mt-1">
              备份或恢复您的电价数据库。当前已升级至 RxDB 架构，支持海量数据存储与后续云端同步。
            </p>
          </div>
        </div>

        {importError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle size={14} /> {importError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onNavigate('admin')}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group lg:col-span-2"
          >
            <Database size={28} className="text-slate-400 group-hover:text-indigo-600 mb-3 transition-colors" />
            <span className="font-bold text-slate-700 text-sm">进入数据管理中心</span>
            <span className="text-[10px] text-slate-400 mt-1">统一管理所有数据、导入导出及备份</span>
          </button>

          <button
            onClick={handleRestoreDefaults}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-orange-500 hover:bg-orange-50 transition-all group lg:col-span-2"
          >
            <RefreshCcw size={28} className="text-slate-400 group-hover:text-orange-600 mb-3 transition-colors" />
            <span className="font-bold text-slate-700 text-sm">恢复默认配置库</span>
            <span className="text-[10px] text-slate-400 mt-1">一键找回系统自带的典型省份时段规则</span>
          </button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportRequest}
          accept=".json"
          className="hidden"
        />
      </Card>

      {/* Model Strategy Card */}
      <Card className="p-6">
        <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <FileJson size={14} className="text-blue-500" /> AI 模型配置
        </h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 border-2 border-blue-500 bg-blue-50/50 rounded-xl p-4 relative">
            <div className="absolute top-3 right-3 text-blue-600"><CheckCircle2 size={16} /></div>
            <div className="font-bold text-blue-900 text-sm mb-1">Gemini 3 Flash</div>
            <div className="text-[10px] text-blue-600 font-medium">响应极速 · 视觉识别优化</div>
          </div>
          <div className="flex-1 border border-slate-200 rounded-xl p-4 opacity-50 cursor-not-allowed">
            <div className="font-bold text-slate-700 text-sm mb-1">Gemini 3 Pro</div>
            <div className="text-[10px] text-slate-500">超强推理 · 暂未启用</div>
          </div>
        </div>
      </Card>

      <div className="text-center text-[10px] text-slate-300">
        SolarPrice Insight v2.0 · Local-First Database (RxDB) · Prepared for Supabase
      </div>

      {/* Import Confirmation Modal */}
      {importConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] animate-in fade-in duration-200">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">确认导入备份</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              即将导入 <span className="text-blue-600 font-bold">{importConfirmation.tariffs.length}</span> 条电价记录和 <span className="text-blue-600 font-bold">{importConfirmation.timeConfigs.length}</span> 条配置。
              <br />
              <span className="text-red-500 font-medium">注意：这将替换您当前的全部数据！</span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setImportConfirmation(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium"
              >
                取消
              </button>
              <button
                onClick={confirmImport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors text-sm font-medium shadow-sm shadow-blue-200"
              >
                <Upload size={16} /> 确认导入并覆盖
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
};
