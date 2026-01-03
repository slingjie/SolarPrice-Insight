import React, { useState, useEffect, useMemo } from 'react';
import { History, Filter, Trash2, RefreshCw, Database, Clock, FileText } from 'lucide-react';
import type { OperationLog as OperationLogType, LogCollection, LogAction } from '../../types';
import { getLogs, clearLogs } from '../../services/logService';
import { Card } from '../UI';

// 操作类型的中文映射
const ACTION_LABELS: Record<LogAction, string> = {
    create: '新增',
    update: '编辑',
    delete: '删除',
    bulk_delete: '批量删除',
    bulk_import: '批量导入',
    backup: '备份',
    restore: '恢复'
};

// 集合名称的中文映射
const COLLECTION_LABELS: Record<LogCollection, string> = {
    tariffs: '电价数据',
    time_configs: '时段配置',
    comprehensive_results: '综合电价'
};

// 操作类型对应的颜色
const ACTION_COLORS: Record<LogAction, string> = {
    create: 'bg-green-100 text-green-700',
    update: 'bg-blue-100 text-blue-700',
    delete: 'bg-red-100 text-red-700',
    bulk_delete: 'bg-red-100 text-red-700',
    bulk_import: 'bg-purple-100 text-purple-700',
    backup: 'bg-amber-100 text-amber-700',
    restore: 'bg-cyan-100 text-cyan-700'
};

export const OperationLog: React.FC = () => {
    const [logs, setLogs] = useState<OperationLogType[]>([]);
    const [loading, setLoading] = useState(true);
    const [collectionFilter, setCollectionFilter] = useState<LogCollection | ''>('');
    const [actionFilter, setActionFilter] = useState<LogAction | ''>('');
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const loadLogs = async () => {
        setLoading(true);
        const data = await getLogs(
            200,
            collectionFilter || undefined,
            actionFilter || undefined
        );
        setLogs(data);
        setLoading(false);
    };

    useEffect(() => {
        loadLogs();
    }, [collectionFilter, actionFilter]);

    const handleClearLogs = async () => {
        await clearLogs();
        setShowClearConfirm(false);
        loadLogs();
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const stats = useMemo(() => {
        return {
            total: logs.length,
            create: logs.filter(l => l.action === 'create').length,
            update: logs.filter(l => l.action === 'update').length,
            delete: logs.filter(l => l.action === 'delete' || l.action === 'bulk_delete').length
        };
    }, [logs]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                        <History size={24} className="text-slate-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">操作日志</h2>
                        <p className="text-slate-500 text-sm">记录数据库的关键变更操作</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={loadLogs}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title="刷新"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => setShowClearConfirm(true)}
                        className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                        title="清空日志"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* 统计卡片 */}
            <div className="grid grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-slate-700">{stats.total}</div>
                    <div className="text-xs text-slate-500 mt-1">总记录</div>
                </Card>
                <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.create}</div>
                    <div className="text-xs text-slate-500 mt-1">新增</div>
                </Card>
                <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.update}</div>
                    <div className="text-xs text-slate-500 mt-1">编辑</div>
                </Card>
                <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.delete}</div>
                    <div className="text-xs text-slate-500 mt-1">删除</div>
                </Card>
            </div>

            {/* 筛选器 */}
            <Card className="p-4">
                <div className="flex items-center gap-4">
                    <Filter size={18} className="text-slate-400" />
                    <select
                        value={collectionFilter}
                        onChange={(e) => setCollectionFilter(e.target.value as LogCollection | '')}
                        className="px-3 py-2 border rounded-lg text-sm"
                    >
                        <option value="">全部数据类型</option>
                        <option value="tariffs">电价数据</option>
                        <option value="time_configs">时段配置</option>
                        <option value="comprehensive_results">综合电价</option>
                    </select>
                    <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value as LogAction | '')}
                        className="px-3 py-2 border rounded-lg text-sm"
                    >
                        <option value="">全部操作类型</option>
                        <option value="create">新增</option>
                        <option value="update">编辑</option>
                        <option value="delete">删除</option>
                        <option value="bulk_delete">批量删除</option>
                        <option value="bulk_import">批量导入</option>
                        <option value="restore">恢复</option>
                    </select>
                </div>
            </Card>

            {/* 日志列表 */}
            <Card className="overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-400">
                        <RefreshCw size={32} className="animate-spin mx-auto mb-2" />
                        加载中...
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <FileText size={32} className="mx-auto mb-2 opacity-50" />
                        暂无操作日志
                    </div>
                ) : (
                    <div className="divide-y">
                        {logs.map((log) => (
                            <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${ACTION_COLORS[log.action]}`}>
                                            {ACTION_LABELS[log.action]}
                                        </span>
                                        <span className="flex items-center gap-1 text-sm text-slate-600">
                                            <Database size={14} />
                                            {COLLECTION_LABELS[log.target_collection]}
                                        </span>
                                        <span className="text-slate-400 text-sm">
                                            {log.count} 条记录
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-400">
                                        <Clock size={12} />
                                        {formatTime(log.timestamp)}
                                    </div>
                                </div>
                                {log.details && (
                                    <div className="mt-2 text-xs text-slate-500 pl-2 border-l-2 border-slate-200">
                                        {log.details}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* 清空确认弹窗 */}
            {showClearConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="p-6 max-w-sm mx-4">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">确认清空日志？</h3>
                        <p className="text-slate-500 text-sm mb-4">
                            此操作将删除所有操作日志记录，且无法恢复。
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleClearLogs}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                确认清空
                            </button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
