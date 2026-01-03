import React, { useRef, useState } from 'react';
import { Archive, RefreshCcw, AlertCircle, Download, Upload } from 'lucide-react';
import { TariffData, TimeConfig, ComprehensiveResult } from '../../types';
import { Card } from '../UI';
import { recordLog } from '../../services/logService';
import { canUseSaveFilePicker, saveTextFile } from '../../utils/fileDialog';

interface BackupRestoreProps {
    tariffs: TariffData[];
    timeConfigs: TimeConfig[];
    comprehensiveResults: ComprehensiveResult[];
    onRestoreTariffs: (data: TariffData[]) => void;
    onRestoreConfigs: (data: TimeConfig[]) => void;
    onRestoreResults: (data: ComprehensiveResult[]) => void;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({
    tariffs,
    timeConfigs,
    comprehensiveResults,
    onRestoreTariffs,
    onRestoreConfigs,
    onRestoreResults
}) => {
    const restoreInputRef = useRef<HTMLInputElement>(null);
    const isPickingRestoreRef = useRef(false);
    const isSavingBackupRef = useRef(false);
    const [debugLines, setDebugLines] = useState<string[]>([]);
    const pickAttemptIdRef = useRef(0);
    const [isDragOver, setIsDragOver] = useState(false);
    const [pickerHint, setPickerHint] = useState<string | null>(null);

    const pushDebug = (line: string) => {
        setDebugLines(prev => {
            const next = [...prev, line];
            return next.slice(-8);
        });
        setPickerHint(null);
    };

    const handleBackupAll = async () => {
        if (isSavingBackupRef.current) return;
        isSavingBackupRef.current = true;

        const fullBackup = {
            metadata: {
                version: "1.0",
                timestamp: new Date().toISOString(),
                exportSource: "SolarPrice-Insight Admin"
            },
            data: {
                tariffs,
                timeConfigs,
                comprehensiveResults
            }
        };

        const jsonStr = JSON.stringify(fullBackup, null, 2);
        const filename = `FullBackup_${new Date().toISOString().slice(0, 19).replace(/[:]/g, '-')}.json`;

        try {
            if (canUseSaveFilePicker()) {
                const saved = await saveTextFile({
                    suggestedName: filename,
                    description: 'SolarPrice-Insight Backup',
                    mimeType: 'application/json',
                    extensions: ['.json'],
                    text: jsonStr
                });
                if (saved) return;
            }

            // Use application/octet-stream to force download in Chrome
            const blob = new Blob([jsonStr], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);

            // IMPORTANT: Must be synchronous to avoid Chrome interception
            link.click();

            // Cleanup after a delay
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
        } catch (err) {
            console.error(err);
            const detail =
                err instanceof DOMException
                    ? `${err.name}${err.message ? `: ${err.message}` : ''}`
                    : (err as any)?.message || String(err);
            alert(`保存失败。\n\n${detail}`);
        } finally {
            isSavingBackupRef.current = false;
        }
    };

    const restoreFromFile = async (file: File) => {
        try {
            const text = await file.text();
            const backup = JSON.parse(text);

            if (!backup.data || !backup.metadata) {
                throw new Error("Invalid backup file format");
            }

            let totalCount = 0;
            if (backup.data.tariffs) {
                onRestoreTariffs(backup.data.tariffs);
                totalCount += backup.data.tariffs.length;
            }
            if (backup.data.timeConfigs) {
                onRestoreConfigs(backup.data.timeConfigs);
                totalCount += backup.data.timeConfigs.length;
            }
            if (backup.data.comprehensiveResults) {
                onRestoreResults(backup.data.comprehensiveResults);
                totalCount += backup.data.comprehensiveResults.length;
            }

            recordLog('tariffs', 'restore', totalCount, '全量恢复');
            alert("全量恢复成功！");
        } catch (err) {
            console.error(err);
            alert("恢复失败：文件格式不正确");
        }
    };

    const handleRestoreAllChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await restoreFromFile(file);
        e.target.value = '';
    };

    const handleDropRestore = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        setPickerHint(null);
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        pushDebug(`[Restore] drop file: ${file.name}`);
        await restoreFromFile(file);
    };

    const handlePickRestoreFile = async () => {
        if (isPickingRestoreRef.current) return;
        isPickingRestoreRef.current = true;
        pickAttemptIdRef.current += 1;
        const attemptId = pickAttemptIdRef.current;

        try {
            const input = restoreInputRef.current;
            if (!input) return;

            const diag = {
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
            pushDebug(`[Restore] click: ${JSON.stringify(diag)}`);
            recordLog('tariffs', 'restore', 0, `打开文件选择器: ${JSON.stringify(diag)}`);

            // Prefer native picker tied to the actual <input type="file"> to avoid
            // Chromium File System Access picker occasionally getting "stuck".
            const anyInput = input as any;
            const canShowPicker = typeof anyInput.showPicker === 'function';
            pushDebug(`[Restore] open via input.${canShowPicker ? 'showPicker()' : 'click()'}`);

            try {
                if (canShowPicker) {
                    anyInput.showPicker();
                } else {
                    input.click();
                }
            } catch (err) {
                if (canShowPicker) {
                    try {
                        input.click();
                    } catch {
                        // ignore, handled below
                    }
                }
                throw err;
            }

            setTimeout(() => {
                if (attemptId !== pickAttemptIdRef.current) return;
                if (!document.hasFocus()) return;
                pushDebug('[Restore] no picker UI detected (still focused) — 可能被浏览器/系统拦截或对话框在后台');
                setPickerHint('文件选择框未弹出：可直接把备份 .json 文件拖到上方按钮上松开恢复。');
                recordLog('tariffs', 'restore', 0, '文件选择器未弹出：页面仍处于 focus，可能被拦截/对话框在后台/Chrome picker 卡死');
            }, 600);
        } catch (err) {
            console.error(err);
            const detail =
                err instanceof DOMException
                    ? `${err.name}${err.message ? `: ${err.message}` : ''}`
                    : (err as any)?.message || String(err);
            pushDebug(`[Restore] open failed: ${detail}`);
            recordLog('tariffs', 'restore', 0, `打开文件选择器失败: ${detail}`);
            setPickerHint('无法弹出文件选择框：请使用拖拽恢复（把备份 .json 文件拖到按钮上松开）。');
            alert(`无法打开文件选择器。\n\n${detail}\n\n建议：\n1) 确认是否有文件选择对话框在后台/其它桌面空间\n2) 关闭所有 Chrome 窗口后重启\n3) 暂时禁用会拦截弹窗/下载的扩展`);
        } finally {
            isPickingRestoreRef.current = false;
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">备份与恢复</h2>
                <p className="text-slate-500">建议定期进行全量备份，以防数据丢失。</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl flex gap-3 items-start animate-in fade-in slide-in-from-top-4">
                <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-blue-900 leading-relaxed">
                    <p className="font-bold mb-1">💡 为什么不同浏览器的数据不一致？</p>
                    <p>
                        本应用的数据存储在您浏览器的 <strong>本地数据库 (IndexedDB)</strong> 中。Chrome 和 Safari 的存储空间是完全独立的。
                    </p>
                    <p className="mt-2 text-xs opacity-75">
                        同步方法：在源浏览器<strong>下载备份</strong>后，到目标浏览器<strong>执行恢复</strong>即可。
                    </p>
                </div>
            </div>

            <Card className="p-8 border-2 border-blue-100 bg-blue-50/30">
                <div className="flex flex-col items-center gap-6">
                    <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
                        <Archive size={48} />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-slate-800">全量备份</h3>
                        <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                            将所有电价数据、时段配置和计算结果打包为一个 JSON 文件下载。
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 w-full max-w-md my-4">
                        <div className="bg-white p-3 rounded-lg border text-center">
                            <div className="text-sm text-slate-500">电价数据</div>
                            <div className="font-bold text-xl">{tariffs.length}</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border text-center">
                            <div className="text-sm text-slate-500">时段配置</div>
                            <div className="font-bold text-xl">{timeConfigs.length}</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border text-center">
                            <div className="text-sm text-slate-500">计算结果</div>
                            <div className="font-bold text-xl">{comprehensiveResults.length}</div>
                        </div>
                    </div>

                    <button
                        onClick={handleBackupAll}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Download size={20} /> 立即下载备份
                    </button>
                </div>
            </Card>

            <div className="relative group">
                <div className="absolute inset-0 bg-red-50 rounded-xl transform rotate-1 transition-transform group-hover:rotate-2"></div>
                <Card className="relative p-8 border-2 border-slate-200 bg-white">
                    <div className="flex flex-col items-center gap-6">
                        <div className="p-4 bg-slate-100 text-slate-600 rounded-full group-hover:bg-red-100 group-hover:text-red-500 transition-colors text-center">
                            <RefreshCcw size={48} className="mx-auto" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-800">从备份恢复</h3>
                            <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                                上传备份文件以恢复数据。注意：这将覆盖所有现有数据。
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handlePickRestoreFile}
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={handleDropRestore}
                            className={`bg-white border-2 px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${isDragOver
                                    ? 'border-slate-400 bg-slate-100 text-slate-900'
                                    : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                        >
                            <Upload size={20} /> 选择备份文件{isDragOver ? '（松开以恢复）' : ''}
                        </button>
                        <input
                            ref={restoreInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleRestoreAllChange}
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
                    </div>
                </Card>
            </div>

            <div className="flex gap-2 items-start bg-amber-50 p-4 rounded-lg text-amber-800 text-sm">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p>
                    <strong>注意：</strong> 恢复操作会执行批量 Upsert，ID 相同的数据将被覆盖，ID 不同的数据将被保留。如果您希望完全重置数据库，请先在设置中清空数据。
                </p>
            </div>
        </div>
    );
};
