import React, { useState, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    createColumnHelper,
    SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, Search, Trash2, Edit2, Save, X, Filter, Plus } from 'lucide-react'; // Added Plus
import { TariffData } from '../../types';
import { PROVINCES } from '../../constants.tsx';
import { recordLog } from '../../services/logService';

interface TariffsManagerProps {
    tariffs: TariffData[];
    onUpdateTariffs: (newTariffs: TariffData[]) => void;
}

export const TariffsManager: React.FC<TariffsManagerProps> = ({ tariffs, onUpdateTariffs }) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false); // New state
    const [editForm, setEditForm] = useState<Partial<TariffData>>({});
    const [filterMode, setFilterMode] = useState<'none' | 'exact' | 'price'>('none');
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ ids: string[], message: string } | null>(null);

    // ... (column definitions unchanged)
    const columnHelper = createColumnHelper<TariffData>();

    const columns = useMemo(() => [
        columnHelper.accessor('province', {
            header: ({ column }) => {
                return (
                    <button
                        className="flex items-center gap-1 hover:text-blue-600"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        省份
                        <ArrowUpDown size={14} />
                    </button>
                )
            },
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('month', {
            header: '月份',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('category', {
            header: '用电分类',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('voltage_level', {
            header: '电压等级',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('prices.tip', {
            header: '尖峰',
            cell: info => info.getValue()?.toFixed(4) || '-',
        }),
        columnHelper.accessor('prices.peak', {
            header: '高峰',
            cell: info => info.getValue()?.toFixed(4) || '-',
        }),
        columnHelper.accessor('prices.flat', {
            header: '平段',
            cell: info => info.getValue()?.toFixed(4) || '-',
        }),
        columnHelper.accessor('prices.valley', {
            header: '低谷',
            cell: info => info.getValue()?.toFixed(4) || '-',
        }),
        columnHelper.accessor('prices.deep', {
            header: '深谷',
            cell: info => info.getValue()?.toFixed(4) || '-',
        }),
        columnHelper.display({
            id: 'actions',
            header: '操作',
            cell: props => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleEdit(props.row.original)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="编辑"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => handleDelete(props.row.original.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="删除"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        }),
    ], []);

    // ... (filtering logic unchanged)
    const filteredData = useMemo(() => {
        let data = tariffs;

        if (filterMode === 'exact') {
            const map = new Map<string, number>();
            data.forEach(t => {
                const key = `${t.province}|${t.month}|${t.category}|${t.voltage_level}|${t.prices.tip}|${t.prices.peak}|${t.prices.flat}|${t.prices.valley}`;
                map.set(key, (map.get(key) || 0) + 1);
            });
            data = data.filter(t => {
                const key = `${t.province}|${t.month}|${t.category}|${t.voltage_level}|${t.prices.tip}|${t.prices.peak}|${t.prices.flat}|${t.prices.valley}`;
                return (map.get(key) || 0) > 1;
            });
        } else if (filterMode === 'price') {
            const map = new Map<string, number>();
            data.forEach(t => {
                const key = `${t.prices.tip}|${t.prices.peak}|${t.prices.flat}|${t.prices.valley}`;
                map.set(key, (map.get(key) || 0) + 1);
            });
            data = data.filter(t => {
                const key = `${t.prices.tip}|${t.prices.peak}|${t.prices.flat}|${t.prices.valley}`;
                return (map.get(key) || 0) > 1;
            });
        }

        if (filterMode !== 'none') {
            data.sort((a, b) => {
                const keyA = `${a.province}|${a.month}|${a.category}|${a.voltage_level}`;
                const keyB = `${b.province}|${b.month}|${b.category}|${b.voltage_level}`;
                return keyA.localeCompare(keyB);
            });
        }

        return data;
    }, [tariffs, filterMode]);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    const handleDelete = (id: string) => {
        setDeleteConfirmation({
            ids: [id],
            message: '确定要删除这条记录吗？此操作无法撤销。'
        });
    };

    const handleBatchDelete = (ids: string[], count: number) => {
        setDeleteConfirmation({
            ids,
            message: `确定要删除这组内的所有 ${count} 条记录吗？此操作无法撤销。`
        });
    };

    const confirmDelete = () => {
        if (!deleteConfirmation) return;
        const idsToDelete = new Set(deleteConfirmation.ids);
        const count = deleteConfirmation.ids.length;
        const newTariffs = tariffs.filter(t => !idsToDelete.has(t.id));
        onUpdateTariffs(newTariffs);
        recordLog('tariffs', count > 1 ? 'bulk_delete' : 'delete', count);
        setDeleteConfirmation(null);
    };

    const handleEdit = (tariff: TariffData) => {
        setEditingId(tariff.id);
        setIsCreating(false);
        setEditForm({ ...tariff });
    };

    const handleAdd = () => {
        setIsCreating(true);
        setEditingId(null);
        setEditForm({
            province: '',
            month: new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0'), // Default current month
            category: '工商业',
            voltage_level: '不满1千伏',
            prices: { tip: 0, peak: 0, flat: 0, valley: 0, deep: 0 }
        });
    };

    const handleSaveEdit = () => {
        if (!editForm) return;

        // Validation simple
        if (!editForm.province || !editForm.month) {
            alert("请填写省份和月份");
            return;
        }
        if (isCreating) {
            // Create Logic
            const newRecord: TariffData = {
                id: crypto.randomUUID(),
                created_at: new Date().toISOString(),
                province: editForm.province!,
                city: null,
                month: editForm.month!,
                category: editForm.category || '工商业',
                voltage_level: editForm.voltage_level || '不满1千伏',
                prices: {
                    tip: Number(editForm.prices?.tip || 0),
                    peak: Number(editForm.prices?.peak || 0),
                    flat: Number(editForm.prices?.flat || 0),
                    valley: Number(editForm.prices?.valley || 0),
                    deep: Number(editForm.prices?.deep || 0),
                },
                time_rules: [],
                currency_unit: '元/kWh',
                last_modified: new Date().toISOString()
            };
            console.log('[TariffsManager] Creating new tariff:', newRecord);
            const updatedTariffs = [...tariffs, newRecord];
            console.log('[TariffsManager] Calling onUpdateTariffs with', updatedTariffs.length, 'items');
            onUpdateTariffs(updatedTariffs);
            recordLog('tariffs', 'create', 1, `${newRecord.province} ${newRecord.month}`);
        } else {
            // Update Logic
            if (!editingId) return;
            const newTariffs = tariffs.map(t => {
                if (t.id === editingId) {
                    return {
                        ...t,
                        ...editForm,
                        prices: { ...t.prices, ...editForm.prices },
                        last_modified: new Date().toISOString()
                    } as TariffData;
                }
                return t;
            });
            onUpdateTariffs(newTariffs);
            recordLog('tariffs', 'update', 1);
        }

        handleCancelEdit();
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setIsCreating(false);
        setEditForm({});
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">电价数据管理</h2>
                    <p className="text-slate-500 text-sm mt-1">管理各省份分月电价数据 (共 {tariffs.length} 条)</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleAdd}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl border border-blue-700 hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-all"
                    >
                        <Plus size={18} />
                        <span className="font-bold text-sm">手动添加</span>
                    </button>

                    <div className="relative">
                        <Filter className="absolute left-3 top-2.5 text-slate-500 pointer-events-none" size={16} />
                        <select
                            value={filterMode}
                            onChange={e => setFilterMode(e.target.value as any)}
                            className={`pl-10 pr-8 py-2 border rounded-xl outline-none appearance-none cursor-pointer text-sm font-medium transition-colors ${filterMode !== 'none'
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <option value="none">全部数据</option>
                            <option value="exact">完全重复</option>
                            <option value="price">价格重复</option>
                        </select>
                    </div>

                    <div className="relative">
                        <input
                            value={globalFilter ?? ''}
                            onChange={e => setGlobalFilter(e.target.value)}
                            placeholder="搜索省份、分类..."
                            className="pl-10 pr-4 py-2 border rounded-xl w-64 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    </div>
                </div>
            </div>

            {filterMode === 'none' ? (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-medium">
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <th key={header.id} className="px-6 py-4 border-b">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {table.getRowModel().rows.length > 0 ? (
                                    table.getRowModel().rows.map(row => (
                                        <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id} className="px-6 py-4">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400">
                                            暂无数据
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
                        <div className="text-slate-500">
                            共 {table.getFilteredRowModel().rows.length} 条记录
                        </div>
                        <div className="flex gap-2">
                            <button
                                className="px-3 py-1 border rounded bg-white disabled:opacity-50 hover:bg-slate-50"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                上一页
                            </button>
                            <span className="flex items-center px-2">
                                第 {table.getState().pagination.pageIndex + 1} / {table.getPageCount()} 页
                            </span>
                            <button
                                className="px-3 py-1 border rounded bg-white disabled:opacity-50 hover:bg-slate-50"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                下一页
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredData.length === 0 && (
                        <div className="text-center py-12 text-slate-400 bg-white rounded-xl border">
                            未发现重复数据
                        </div>
                    )}

                    {(Object.entries(
                        filteredData.reduce((acc, curr) => {
                            let key = '';
                            if (filterMode === 'exact') {
                                key = `${curr.province} - ${curr.month} - ${curr.category} - ${curr.voltage_level}`;
                            } else {
                                key = `尖峰:${(curr.prices.tip ?? 0).toFixed(4)} / 高峰:${(curr.prices.peak ?? 0).toFixed(4)} / 平段:${(curr.prices.flat ?? 0).toFixed(4)} / 低谷:${(curr.prices.valley ?? 0).toFixed(4)}`;
                            }
                            if (!acc[key]) acc[key] = [];
                            acc[key].push(curr);
                            return acc;
                        }, {} as Record<string, TariffData[]>)
                    ) as [string, TariffData[]][]).map(([groupTitle, groupItems]) => (
                        <div key={groupTitle} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <div className="bg-slate-50 px-6 py-3 border-b flex justify-between items-center">
                                <h3 className="font-bold text-slate-700">{groupTitle} <span className="text-xs font-normal text-slate-500 ml-2">(共 {groupItems.length} 条)</span></h3>
                                <button
                                    onClick={() => handleBatchDelete(groupItems.map(i => i.id), groupItems.length)}
                                    className="text-xs bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded hover:bg-red-50 transition-colors flex items-center gap-1"
                                >
                                    <Trash2 size={12} /> 批量删除此组
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-slate-500 border-b">
                                        <tr>
                                            <th className="px-6 py-2 font-medium">省份</th>
                                            <th className="px-6 py-2 font-medium">月份</th>
                                            <th className="px-6 py-2 font-medium">用电分类</th>
                                            <th className="px-6 py-2 font-medium">电压等级</th>
                                            <th className="px-6 py-2 font-medium">尖峰</th>
                                            <th className="px-6 py-2 font-medium">高峰</th>
                                            <th className="px-6 py-2 font-medium">平段</th>
                                            <th className="px-6 py-2 font-medium">低谷</th>
                                            <th className="px-6 py-2 font-medium">深谷</th>
                                            <th className="px-6 py-2 font-medium w-32">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {groupItems.map(item => (
                                            <tr key={item.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-3">{item.province}</td>
                                                <td className="px-6 py-3">{item.month}</td>
                                                <td className="px-6 py-3">{item.category}</td>
                                                <td className="px-6 py-3">{item.voltage_level}</td>
                                                <td className="px-6 py-3 font-mono text-slate-600">{item.prices.tip.toFixed(4)}</td>
                                                <td className="px-6 py-3 font-mono text-slate-600">{item.prices.peak.toFixed(4)}</td>
                                                <td className="px-6 py-3 font-mono text-slate-600">{item.prices.flat.toFixed(4)}</td>
                                                <td className="px-6 py-3 font-mono text-slate-600">{item.prices.valley.toFixed(4)}</td>
                                                <td className="px-6 py-3 font-mono text-slate-600">{(item.prices.deep || 0).toFixed(4)}</td>
                                                <td className="px-6 py-3 flex gap-2">
                                                    <button onClick={() => handleEdit(item)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="编辑"><Edit2 size={14} /></button>
                                                    <button onClick={() => handleDelete(item.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="删除"><Trash2 size={14} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {deleteConfirmation && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">确认删除</h3>
                        <p className="text-slate-500 text-sm mb-6">{deleteConfirmation.message}</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirmation(null)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium"
                            >
                                取消
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm font-medium"
                            >
                                <Trash2 size={16} /> 确认删除
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {(editingId || isCreating) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold">{isCreating ? '新增电价' : '编辑电价'}</h3>
                            <button onClick={handleCancelEdit} className="p-1 hover:bg-slate-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">省份</label>
                                <input
                                    list="edit-province-options"
                                    type="text"
                                    value={editForm.province}
                                    onChange={e => setEditForm(prev => ({ ...prev, province: e.target.value }))}
                                    className="w-full p-2 border rounded"
                                />
                                <datalist id="edit-province-options">
                                    {PROVINCES.map(p => <option key={p} value={p} />)}
                                </datalist>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">月份</label>
                                <input
                                    type="month"
                                    value={editForm.month}
                                    onChange={e => setEditForm(prev => ({ ...prev, month: e.target.value }))}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1">用电分类</label>
                                <input
                                    value={editForm.category}
                                    onChange={e => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1">电压等级</label>
                                <input
                                    value={editForm.voltage_level}
                                    onChange={e => setEditForm(prev => ({ ...prev, voltage_level: e.target.value }))}
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            <div className="col-span-2 grid grid-cols-5 gap-2 pt-2">
                                <div>
                                    <label className="block text-[10px] font-bold text-red-500">尖峰</label>
                                    <input
                                        type="number" step="0.0001"
                                        value={editForm.prices?.tip}
                                        onChange={e => setEditForm(prev => ({ ...prev, prices: { ...prev.prices!, tip: Number(e.target.value) } }))}
                                        className="w-full p-2 border rounded text-right"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-orange-500">高峰</label>
                                    <input
                                        type="number" step="0.0001"
                                        value={editForm.prices?.peak}
                                        onChange={e => setEditForm(prev => ({ ...prev, prices: { ...prev.prices!, peak: Number(e.target.value) } }))}
                                        className="w-full p-2 border rounded text-right"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-green-500">平段</label>
                                    <input
                                        type="number" step="0.0001"
                                        value={editForm.prices?.flat}
                                        onChange={e => setEditForm(prev => ({ ...prev, prices: { ...prev.prices!, flat: Number(e.target.value) } }))}
                                        className="w-full p-2 border rounded text-right"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-blue-500">低谷</label>
                                    <input
                                        type="number" step="0.0001"
                                        value={editForm.prices?.valley}
                                        onChange={e => setEditForm(prev => ({ ...prev, prices: { ...prev.prices!, valley: Number(e.target.value) } }))}
                                        className="w-full p-2 border rounded text-right"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-indigo-500">深谷</label>
                                    <input
                                        type="number" step="0.0001"
                                        value={editForm.prices?.deep}
                                        onChange={e => setEditForm(prev => ({ ...prev, prices: { ...prev.prices!, deep: Number(e.target.value) } }))}
                                        className="w-full p-2 border rounded text-right"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button onClick={handleCancelEdit} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">取消</button>
                            <button
                                onClick={handleSaveEdit}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Save size={16} /> 保存更改
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
