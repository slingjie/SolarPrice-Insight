import React, { useRef, useState } from 'react';
import { Download, Upload, FileJson, AlertTriangle } from 'lucide-react';
import { TariffData, TimeConfig, ComprehensiveResult } from '../../types';
import { Card } from '../UI';
import { canUseSaveFilePicker, saveTextFile } from '../../utils/fileDialog';
import { recordLog } from '../../services/logService';

interface DataImportExportProps {
    tariffs: TariffData[];
    timeConfigs: TimeConfig[];
    comprehensiveResults: ComprehensiveResult[];
    onImportTariffs: (data: TariffData[]) => void;
    onImportConfigs: (data: TimeConfig[]) => void;
    onImportResults: (data: ComprehensiveResult[]) => void;
}

export const DataImportExport: React.FC<DataImportExportProps> = ({
    tariffs,
    timeConfigs,
    comprehensiveResults,
    onImportTariffs,
    onImportConfigs,
    onImportResults
}) => {
    const importInputRef = useRef<HTMLInputElement>(null);
    const pendingImportTypeRef = useRef<'tariffs' | 'configs' | 'results'>('tariffs');
    const isPickingImportRef = useRef(false);
    const isSavingExportRef = useRef(false);
    const [debugLines, setDebugLines] = useState<string[]>([]);
    const pickAttemptIdRef = useRef(0);
    const [dragOverType, setDragOverType] = useState<null | 'tariffs' | 'configs' | 'results'>(null);
    const [pickerHint, setPickerHint] = useState<string | null>(null);

    const pushDebug = (line: string) => {
        setDebugLines(prev => {
            const next = [...prev, line];
            return next.slice(-8);
        });
        // Clear stale hint once we have new activity.
        setPickerHint(null);
    };

    const toLogCollection = (type: 'tariffs' | 'configs' | 'results') => {
        if (type === 'tariffs') return 'tariffs' as const;
        if (type === 'configs') return 'time_configs' as const;
        return 'comprehensive_results' as const;
    };

    const handleExportJSON = async (data: any, filename: string) => {
        if (isSavingExportRef.current) return;
        isSavingExportRef.current = true;

        const jsonStr = JSON.stringify(data, null, 2);
        const suggestedName = `${filename}_${new Date().toISOString().slice(0, 10)}.json`;

        try {
            if (canUseSaveFilePicker()) {
                const saved = await saveTextFile({
                    suggestedName,
                    description: 'SolarPrice-Insight Export',
                    mimeType: 'application/json',
                    extensions: ['.json'],
                    text: jsonStr
                });
                if (saved) return;
            }

            const blob = new Blob([jsonStr], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = suggestedName;
            link.style.display = 'none';
            document.body.appendChild(link);

            link.click();

            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
        } catch (err) {
            console.error(err);
            if (err instanceof DOMException && err.name === 'NotAllowedError' && /file picker already active/i.test(err.message)) {
                return;
            }
            const detail =
                err instanceof DOMException
                    ? `${err.name}${err.message ? `: ${err.message}` : ''}`
                    : (err as any)?.message || String(err);
            alert(`保存失败。\n\n${detail}`);
        } finally {
            isSavingExportRef.current = false;
        }
    };

    const importFromFile = async (file: File, type: 'tariffs' | 'configs' | 'results') => {
        try {
            pushDebug(`[Import] file selected: ${file.name} (${file.type || 'unknown'}, ${file.size} bytes)`);
            const text = await file.text();
            const data = JSON.parse(text);

            if (!Array.isArray(data)) throw new Error("Format error: Root must be array");

            if (type === 'tariffs') onImportTariffs(data);
            if (type === 'configs') onImportConfigs(data);
            if (type === 'results') onImportResults(data);

            alert(`成功导入 ${data.length} 条数据`);
            recordLog(toLogCollection(type), 'bulk_import', data.length, `JSON 导入成功: ${file.name}`);
        } catch (err) {
            console.error(err);
            alert("文件解析失败，请检查格式");
            const detail =
                err instanceof Error ? `${err.name}: ${err.message}` : (err as any)?.message || String(err);
            pushDebug(`[Import] parse failed: ${detail}`);
            recordLog(toLogCollection(type), 'bulk_import', 0, `JSON 导入失败: ${detail}`);
        }
    };

    const handleImportInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await importFromFile(file, pendingImportTypeRef.current);
        e.target.value = '';
    };

    const handleDropImport = async (e: React.DragEvent, type: 'tariffs' | 'configs' | 'results') => {
        e.preventDefault();
        setDragOverType(null);
        setPickerHint(null);
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        pushDebug(`[Import] drop file: ${file.name}`);
        await importFromFile(file, type);
    };

    const handlePickImport = async (type: 'tariffs' | 'configs' | 'results') => {
        if (isPickingImportRef.current) return;
        isPickingImportRef.current = true;
        pickAttemptIdRef.current += 1;
        const attemptId = pickAttemptIdRef.current;

        try {
            pendingImportTypeRef.current = type;
            const input = importInputRef.current;
            if (!input) return;

            const diag = {
                type,
                isSecureContext: window.isSecureContext,
                visibility: document.visibilityState,
                hasFocus: document.hasFocus(),
                userActivation: (navigator as any).userActivation
                    ? {
                        isActive: (navigator as any).userActivation.isActive,
                        hasBeenActive: (navigator as any).userActivation.hasBeenActive
                    }
                    : undefined
            };

            pushDebug(`[Import] click: ${JSON.stringify(diag)}`);
            recordLog(toLogCollection(type), 'bulk_import', 0, `打开文件选择器: ${JSON.stringify(diag)}`);

            const anyInput = input as any;
            const canShowPicker = typeof anyInput.showPicker === 'function';
            pushDebug(`[Import] open via input.${canShowPicker ? 'showPicker()' : 'click()'}`);

            try {
                if (canShowPicker) {
                    anyInput.showPicker();
                } else {
                    input.click();
                }
            } catch (err) {
                // Fallback to click if showPicker has stricter visibility constraints.
                if (canShowPicker) {
                    try {
                        input.click();
                    } catch {
                        // ignore, handled below
                    }
                }
                throw err;
            }

            // If the picker is blocked or swallowed, provide a visible hint and log it.
            setTimeout(() => {
                if (attemptId !== pickAttemptIdRef.current) return;
                if (!document.hasFocus()) return;
                pushDebug('[Import] no picker UI detected (still focused) — 可能被浏览器/系统拦截或对话框在后台');
                setPickerHint('文件选择框未弹出：可直接把 .json 文件拖到上方按钮上松开导入。');
                recordLog(
                    toLogCollection(type),
                    'bulk_import',
                    0,
                    '文件选择器未弹出：页面仍处于 focus，可能被拦截/对话框在后台/Chrome picker 卡死'
                );
            }, 600);
        } catch (err) {
            console.error(err);
            const detail =
                err instanceof DOMException
                    ? `${err.name}${err.message ? `: ${err.message}` : ''}`
                    : (err as any)?.message || String(err);
            pushDebug(`[Import] open failed: ${detail}`);
            recordLog(toLogCollection(type), 'bulk_import', 0, `打开文件选择器失败: ${detail}`);
            setPickerHint('无法弹出文件选择框：请使用拖拽导入（把 .json 文件拖到按钮上松开）。');
            alert(`无法打开文件选择器。\n\n${detail}\n\n建议：\n1) 确认是否有文件选择对话框在后台/其它桌面空间\n2) 关闭所有 Chrome 窗口后重启\n3) 暂时禁用会拦截弹窗/下载的扩展`);
        } finally {
            isPickingImportRef.current = false;
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">数据导入导出</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Section */}
                <Card className="p-6 space-y-6">
                    <div className="flex items-center gap-3 border-b pb-4">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Download size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">导出数据</h3>
                            <p className="text-slate-500 text-xs">导出为 JSON 格式进行备份或迁移</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => handleExportJSON(tariffs, 'solar_tariffs')}
                            className="w-full p-4 border rounded-xl hover:bg-slate-50 flex justify-between items-center group transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <FileJson className="text-slate-400 group-hover:text-blue-500" />
                                <div className="text-left">
                                    <div className="font-bold text-slate-700">导出电价数据</div>
                                    <div className="text-xs text-slate-400">{tariffs.length} 条记录</div>
                                </div>
                            </div>
                            <Download size={16} className="text-slate-300 group-hover:text-blue-500" />
                        </button>

                        <button
                            onClick={() => handleExportJSON(timeConfigs, 'solar_time_configs')}
                            className="w-full p-4 border rounded-xl hover:bg-slate-50 flex justify-between items-center group transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <FileJson className="text-slate-400 group-hover:text-purple-500" />
                                <div className="text-left">
                                    <div className="font-bold text-slate-700">导出时段配置</div>
                                    <div className="text-xs text-slate-400">{timeConfigs.length} 条记录</div>
                                </div>
                            </div>
                            <Download size={16} className="text-slate-300 group-hover:text-purple-500" />
                        </button>

                        <button
                            onClick={() => handleExportJSON(comprehensiveResults, 'solar_results')}
                            className="w-full p-4 border rounded-xl hover:bg-slate-50 flex justify-between items-center group transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <FileJson className="text-slate-400 group-hover:text-green-500" />
                                <div className="text-left">
                                    <div className="font-bold text-slate-700">导出计算结果</div>
                                    <div className="text-xs text-slate-400">{comprehensiveResults.length} 条记录</div>
                                </div>
                            </div>
                            <Download size={16} className="text-slate-300 group-hover:text-green-500" />
                        </button>
                    </div>
                </Card>

                {/* Import Section */}
                <Card className="p-6 space-y-6">
                    <div className="flex items-center gap-3 border-b pb-4">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                            <Upload size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">导入数据</h3>
                            <p className="text-slate-500 text-xs">支持 JSON 格式恢复数据</p>
                        </div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg flex gap-3 text-sm text-orange-800">
                        <AlertTriangle className="shrink-0" size={18} />
                        <p>导入操作将合并新数据到现有数据库中。如果 ID 相同，原有数据将被覆盖。</p>
                    </div>

                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={() => handlePickImport('tariffs')}
                            onDragOver={(e) => { e.preventDefault(); setDragOverType('tariffs'); }}
                            onDragLeave={() => setDragOverType(null)}
                            onDrop={(e) => handleDropImport(e, 'tariffs')}
                            className={`w-full p-4 border border-dashed rounded-xl flex justify-center items-center gap-2 font-medium transition-colors cursor-pointer ${dragOverType === 'tariffs'
                                    ? 'bg-slate-100 border-slate-400 text-slate-800'
                                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <Upload size={18} /> 导入电价数据 (JSON){dragOverType === 'tariffs' ? '（松开以导入）' : ''}
                        </button>

                        <button
                            type="button"
                            onClick={() => handlePickImport('configs')}
                            onDragOver={(e) => { e.preventDefault(); setDragOverType('configs'); }}
                            onDragLeave={() => setDragOverType(null)}
                            onDrop={(e) => handleDropImport(e, 'configs')}
                            className={`w-full p-4 border border-dashed rounded-xl flex justify-center items-center gap-2 font-medium transition-colors cursor-pointer ${dragOverType === 'configs'
                                    ? 'bg-slate-100 border-slate-400 text-slate-800'
                                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <Upload size={18} /> 导入时段配置 (JSON){dragOverType === 'configs' ? '（松开以导入）' : ''}
                        </button>

                        <button
                            type="button"
                            onClick={() => handlePickImport('results')}
                            onDragOver={(e) => { e.preventDefault(); setDragOverType('results'); }}
                            onDragLeave={() => setDragOverType(null)}
                            onDrop={(e) => handleDropImport(e, 'results')}
                            className={`w-full p-4 border border-dashed rounded-xl flex justify-center items-center gap-2 font-medium transition-colors cursor-pointer ${dragOverType === 'results'
                                    ? 'bg-slate-100 border-slate-400 text-slate-800'
                                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <Upload size={18} /> 导入计算结果 (JSON){dragOverType === 'results' ? '（松开以导入）' : ''}
                        </button>
                    </div>

                    <input
                        ref={importInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImportInputChange}
                        className="sr-only"
                    />

                    {pickerHint && (
                        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                            {pickerHint}
                        </div>
                    )}

                    {debugLines.length > 0 && (
                        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600 font-mono whitespace-pre-wrap">
                            {debugLines.join('\n')}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
