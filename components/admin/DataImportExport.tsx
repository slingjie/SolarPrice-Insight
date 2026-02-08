import React, { useRef, useState } from 'react';
import { Download, Upload, FileJson, FileSpreadsheet, FileText, ChevronDown, AlertTriangle } from 'lucide-react';
import { TariffData, TimeConfig, ComprehensiveResult, LoadPersona } from '../../types';
import { Card } from '../UI';
import { canUseSaveFilePicker, saveTextFile } from '../../utils/fileDialog';
import { recordLog } from '../../services/logService';
import { exportData, type ExportFormat } from '../../utils/dataExport';
import { parseSpreadsheetFile, isSpreadsheetFile } from '../../utils/dataImport';

interface DataImportExportProps {
    tariffs: TariffData[];
    timeConfigs: TimeConfig[];
    comprehensiveResults: ComprehensiveResult[];
    personas: LoadPersona[];
    onImportTariffs: (data: TariffData[]) => void;
    onImportConfigs: (data: TimeConfig[]) => void;
    onImportResults: (data: ComprehensiveResult[]) => void;
    onImportPersonas: (data: LoadPersona[]) => void;
}

const FormatIcon: React.FC<{ format: 'json' | ExportFormat; className?: string }> = ({ format, className = '' }) => {
    switch (format) {
        case 'xlsx': return <FileSpreadsheet className={className} />;
        case 'csv': return <FileText className={className} />;
        default: return <FileJson className={className} />;
    }
};

const safeJson = (value: unknown): string => {
    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
};

const truncate = (value: string, max = 500): string => {
    if (value.length <= max) return value;
    return `${value.slice(0, max)}...`;
};

const formatImportError = (
    err: unknown,
    type: 'tariffs' | 'configs' | 'results' | 'personas',
    filename: string,
): { alertMessage: string; detail: string } => {
    const errObj = err as {
        name?: string;
        message?: string;
        code?: string;
        parameters?: unknown;
        errors?: unknown;
    };

    const base = `${errObj?.name || 'Error'}: ${errObj?.message || String(err)}`;
    const lines = [
        `[Import] category=${type}`,
        `[Import] file=${filename}`,
        `[Import] error=${base}`,
    ];

    if (errObj?.code) {
        lines.push(`[Import] code=${errObj.code}`);
    }
    if (typeof errObj?.parameters !== 'undefined') {
        lines.push(`[Import] parameters=${truncate(safeJson(errObj.parameters), 1200)}`);
    }
    if (typeof errObj?.errors !== 'undefined') {
        lines.push(`[Import] validation=${truncate(safeJson(errObj.errors), 1200)}`);
    }

    const tip =
        type === 'tariffs'
            ? '请检查：省份/月份/用电类别/电压等级是否为空，时间字段是否为有效日期。'
            : type === 'configs'
                ? '请检查：Month 列(1-12)与 0-1~23-24 列是否完整，且工作表格式与导出模板一致。'
                : '请检查文件字段是否与模板一致。';

    return {
        alertMessage: `文件导入失败。\n\n${base}\n\n${tip}`,
        detail: lines.join('\n'),
    };
};

export const DataImportExport: React.FC<DataImportExportProps> = ({
    tariffs,
    timeConfigs,
    comprehensiveResults,
    personas,
    onImportTariffs,
    onImportConfigs,
    onImportResults,
    onImportPersonas
}) => {
    const importInputRef = useRef<HTMLInputElement>(null);
    const pendingImportTypeRef = useRef<'tariffs' | 'configs' | 'results' | 'personas'>('tariffs');
    const isPickingImportRef = useRef(false);
    const isSavingExportRef = useRef(false);
    const [debugLines, setDebugLines] = useState<string[]>([]);
    const pickAttemptIdRef = useRef(0);
    const [dragOverType, setDragOverType] = useState<null | 'tariffs' | 'configs' | 'results' | 'personas'>(null);
    const [pickerHint, setPickerHint] = useState<string | null>(null);
    const [exportFormat, setExportFormat] = useState<'json' | ExportFormat>('json');
    const [importErrorDetail, setImportErrorDetail] = useState<string | null>(null);
    const [copyState, setCopyState] = useState<'idle' | 'ok' | 'fail'>('idle');

    const pushDebug = (line: string) => {
        setDebugLines(prev => {
            const next = [...prev, line];
            return next.slice(-8);
        });
        // Clear stale hint once we have new activity.
        setPickerHint(null);
    };

    const handleCopyImportError = async () => {
        if (!importErrorDetail) return;
        try {
            await navigator.clipboard.writeText(importErrorDetail);
            setCopyState('ok');
            window.setTimeout(() => setCopyState('idle'), 1600);
        } catch {
            setCopyState('fail');
            window.setTimeout(() => setCopyState('idle'), 1600);
        }
    };

    const toLogCollection = (type: 'tariffs' | 'configs' | 'results' | 'personas') => {
        if (type === 'tariffs') return 'tariffs' as const;
        if (type === 'configs') return 'time_configs' as const;
        if (type === 'personas') return 'personas' as const;
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

    const handleExport = async (
        category: 'tariffs' | 'configs' | 'results' | 'personas',
        data: TariffData[] | TimeConfig[] | ComprehensiveResult[] | LoadPersona[],
        filenamePrefix: string,
    ) => {
        if (isSavingExportRef.current) return;
        isSavingExportRef.current = true;
        try {
            if (exportFormat === 'json') {
                await handleExportJSON(data, filenamePrefix);
            } else {
                await exportData(category, data, exportFormat, filenamePrefix);
            }
        } finally {
            isSavingExportRef.current = false;
        }
    };

    const importFromFile = async (file: File, type: 'tariffs' | 'configs' | 'results' | 'personas') => {
        try {
            setImportErrorDetail(null);
            setCopyState('idle');
            pushDebug(`[Import] file selected: ${file.name} (${file.type || 'unknown'}, ${file.size} bytes)`);

            let data: any[];

            if (isSpreadsheetFile(file.name)) {
                data = await parseSpreadsheetFile(file, type);
            } else {
                const text = await file.text();
                data = JSON.parse(text);
            }

            if (!Array.isArray(data)) throw new Error("Format error: Root must be array");

            if (type === 'tariffs') await Promise.resolve(onImportTariffs(data as TariffData[]));
            if (type === 'configs') await Promise.resolve(onImportConfigs(data as TimeConfig[]));
            if (type === 'results') await Promise.resolve(onImportResults(data as ComprehensiveResult[]));
            if (type === 'personas') await Promise.resolve(onImportPersonas(data as LoadPersona[]));

            alert(`成功导入 ${data.length} 条数据`);
            const ext = file.name.split('.').pop()?.toUpperCase() ?? 'JSON';
            recordLog(toLogCollection(type), 'bulk_import', data.length, `${ext} 导入成功: ${file.name}`);
        } catch (err) {
            console.error(err);
            const formatted = formatImportError(err, type, file.name);
            alert(formatted.alertMessage);
            setImportErrorDetail(formatted.detail);
            pushDebug(formatted.detail);
            recordLog(toLogCollection(type), 'bulk_import', 0, `导入失败: ${formatted.detail}`);
        }
    };

    const handleImportInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await importFromFile(file, pendingImportTypeRef.current);
        e.target.value = '';
    };

    const handleDropImport = async (e: React.DragEvent, type: 'tariffs' | 'configs' | 'results' | 'personas') => {
        e.preventDefault();
        setDragOverType(null);
        setPickerHint(null);
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        pushDebug(`[Import] drop file: ${file.name}`);
        await importFromFile(file, type);
    };

    const handlePickImport = async (type: 'tariffs' | 'configs' | 'results' | 'personas') => {
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
                setPickerHint('文件选择框未弹出：可直接把文件拖到上方按钮上松开导入。');
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
                            <p className="text-slate-500 text-xs">选择格式后导出数据</p>
                        </div>
                    </div>

                    <div className="relative">
                        <label className="text-xs font-medium text-slate-500 mb-1 block">导出格式</label>
                        <div className="relative">
                            <select
                                value={exportFormat}
                                onChange={(e) => setExportFormat(e.target.value as 'json' | ExportFormat)}
                                className="w-full appearance-none border rounded-lg px-3 py-2 pr-8 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="json">JSON（原始格式，可再导入）</option>
                                <option value="xlsx">Excel (.xlsx)</option>
                                <option value="csv">CSV（逗号分隔）</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => handleExport('tariffs', tariffs, 'solar_tariffs')}
                            className="w-full p-4 border rounded-xl hover:bg-slate-50 flex justify-between items-center group transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <FormatIcon format={exportFormat} className="text-slate-400 group-hover:text-blue-500" />
                                <div className="text-left">
                                    <div className="font-bold text-slate-700">导出电价数据</div>
                                    <div className="text-xs text-slate-400">{tariffs.length} 条记录</div>
                                </div>
                            </div>
                            <Download size={16} className="text-slate-300 group-hover:text-blue-500" />
                        </button>

                        <button
                            onClick={() => handleExport('configs', timeConfigs, 'solar_time_configs')}
                            className="w-full p-4 border rounded-xl hover:bg-slate-50 flex justify-between items-center group transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <FormatIcon format={exportFormat} className="text-slate-400 group-hover:text-purple-500" />
                                <div className="text-left">
                                    <div className="font-bold text-slate-700">导出时段配置</div>
                                    <div className="text-xs text-slate-400">{timeConfigs.length} 条记录</div>
                                </div>
                            </div>
                            <Download size={16} className="text-slate-300 group-hover:text-purple-500" />
                        </button>

                        <button
                            onClick={() => handleExport('results', comprehensiveResults, 'solar_results')}
                            className="w-full p-4 border rounded-xl hover:bg-slate-50 flex justify-between items-center group transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <FormatIcon format={exportFormat} className="text-slate-400 group-hover:text-green-500" />
                                <div className="text-left">
                                    <div className="font-bold text-slate-700">导出计算结果</div>
                                    <div className="text-xs text-slate-400">{comprehensiveResults.length} 条记录</div>
                                </div>
                            </div>
                            <Download size={16} className="text-slate-300 group-hover:text-green-500" />
                        </button>

                        <button
                            onClick={() => handleExport('personas', personas, 'solar_personas')}
                            className="w-full p-4 border rounded-xl hover:bg-slate-50 flex justify-between items-center group transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <FormatIcon format={exportFormat} className="text-slate-400 group-hover:text-amber-500" />
                                <div className="text-left">
                                    <div className="font-bold text-slate-700">导出行业画像</div>
                                    <div className="text-xs text-slate-400">{personas.length} 条记录</div>
                                </div>
                            </div>
                            <Download size={16} className="text-slate-300 group-hover:text-amber-500" />
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
                            <p className="text-slate-500 text-xs">支持 JSON / Excel / CSV 格式</p>
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
                            <Upload size={18} /> 导入电价数据{dragOverType === 'tariffs' ? '（松开以导入）' : ''}
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
                            <Upload size={18} /> 导入时段配置{dragOverType === 'configs' ? '（松开以导入）' : ''}
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
                            <Upload size={18} /> 导入计算结果{dragOverType === 'results' ? '（松开以导入）' : ''}
                        </button>

                        <button
                            type="button"
                            onClick={() => handlePickImport('personas')}
                            onDragOver={(e) => { e.preventDefault(); setDragOverType('personas'); }}
                            onDragLeave={() => setDragOverType(null)}
                            onDrop={(e) => handleDropImport(e, 'personas')}
                            className={`w-full p-4 border border-dashed rounded-xl flex justify-center items-center gap-2 font-medium transition-colors cursor-pointer ${dragOverType === 'personas'
                                    ? 'bg-slate-100 border-slate-400 text-slate-800'
                                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <Upload size={18} /> 导入行业画像{dragOverType === 'personas' ? '（松开以导入）' : ''}
                        </button>
                    </div>

                    <input
                        ref={importInputRef}
                        type="file"
                        accept=".json,.xlsx,.xls,.csv"
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

                    {importErrorDetail && (
                        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                            <div className="flex items-center justify-between gap-3 mb-2">
                                <div className="text-xs font-semibold text-red-700">导入错误详情（可复制）</div>
                                <button
                                    type="button"
                                    onClick={handleCopyImportError}
                                    className="text-xs px-2 py-1 rounded border border-red-300 text-red-700 bg-white hover:bg-red-100"
                                >
                                    {copyState === 'ok' ? '已复制' : copyState === 'fail' ? '复制失败' : '复制详情'}
                                </button>
                            </div>
                            <textarea
                                readOnly
                                value={importErrorDetail}
                                className="w-full h-32 p-2 text-[11px] font-mono rounded border border-red-200 bg-white text-red-800"
                            />
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
