
import React, { useState, useRef } from 'react';
import { Settings, CheckCircle2, ShieldCheck, Key, Database, Download, Upload, AlertCircle, FileJson } from 'lucide-react';
import { Card } from './UI';
import { TariffData, TimeConfig } from '../types';

interface SettingsViewProps {
  tariffs: TariffData[];
  timeConfigs: TimeConfig[];
  onImportTariffs: (tariffs: TariffData[]) => void;
  onImportConfigs: (configs: TimeConfig[]) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ tariffs, timeConfigs, onImportTariffs, onImportConfigs }) => {
  const [apiKey] = useState(process.env.API_KEY || '');
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 导出逻辑
  const handleExport = () => {
    const backupData = {
      version: "1.2",
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
  };

  // 导入逻辑
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
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

        if (window.confirm(`即将导入 ${json.tariffs.length} 条电价数据和 ${json.timeConfigs.length} 条时段配置。是否确定覆盖当前数据？`)) {
          onImportTariffs(json.tariffs);
          onImportConfigs(json.timeConfigs);
          alert("数据导入成功！");
        }
      } catch (err: any) {
        setImportError(err.message || "导入失败，请检查文件。");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
              我们遵循 "BYOK" (Bring Your Own Key) 模式。您的数据存储在浏览器本地存储（LocalStorage）中。
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Key size={14} className="text-blue-500"/> Google Gemini API Key
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
              备份或恢复您的电价数据库。建议定期导出以防浏览器清理缓存导致数据丢失。
            </p>
          </div>
        </div>

        {importError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle size={14}/> {importError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleExport}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <Download size={28} className="text-slate-400 group-hover:text-blue-600 mb-3 transition-colors" />
            <span className="font-bold text-slate-700 text-sm">导出备份</span>
            <span className="text-[10px] text-slate-400 mt-1">下载 JSON 文件</span>
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <Upload size={28} className="text-slate-400 group-hover:text-green-600 mb-3 transition-colors" />
            <span className="font-bold text-slate-700 text-sm">导入恢复</span>
            <span className="text-[10px] text-slate-400 mt-1">上传 JSON 文件</span>
          </button>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImport} 
          accept=".json" 
          className="hidden" 
        />
      </Card>

      {/* Model Strategy Card */}
      <Card className="p-6">
          <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <FileJson size={14} className="text-blue-500"/> AI 模型配置
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
        SolarPrice Insight v1.2 · Serverless Web App · Local-First Storage
      </div>
    </div>
  );
};
