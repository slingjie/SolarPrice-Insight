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
import { ArrowUpDown, Search, Trash2, Edit2, X, Filter, Plus } from 'lucide-react'; // Added Plus
import { TimeConfig } from '../../types';
import { TimeConfigMatrix } from '../TimeConfigMatrix';
import { PROVINCES } from '../../constants'; // Import PROVINCES
import { recordLog } from '../../services/logService';

interface TimeConfigsManagerProps {
    configs: TimeConfig[];
    onUpdateConfigs: (newConfigs: TimeConfig[]) => void;
}

export const TimeConfigsManager: React.FC<TimeConfigsManagerProps> = ({ configs, onUpdateConfigs }) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [editingConfig, setEditingConfig] = useState<{ province: string, configs: TimeConfig[] } | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ ids: string[], message: string } | null>(null);

    // Create Mode States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createProvince, setCreateProvince] = useState('');

    const columnHelper = createColumnHelper<TimeConfig>();

    const columns = useMemo(() => [
        columnHelper.accessor('province', {
            header: ({ column }) => (
                <button
                    className="flex items-center gap-1 hover:text-blue-600"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    省份
                    <ArrowUpDown size={14} />
                </button>
            ),
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('month_pattern', {
            header: '适用月份',
            cell: info => {
                const val = info.getValue();
                return val === 'All' ? <span className="text-green-600 font-bold">全年统一</span> : `${val}月`;
            },
        }),
        columnHelper.accessor('last_modified', {
            header: '最后修改',
            cell: info => new Date(info.getValue()).toLocaleString('zh-CN'),
        }),
        columnHelper.display({
            id: 'actions',
            header: '操作',
            cell: props => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleEdit(props.row.original.province)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="编辑 (进入矩阵模式)"
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

    const table = useReactTable({
        data: configs,
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
            message: '确定要删除这条时段配置吗？'
        });
    };

    const confirmDelete = () => {
        if (!deleteConfirmation) return;
        const idsToDelete = new Set(deleteConfirmation.ids);
        const count = deleteConfirmation.ids.length;
        const newConfigs = configs.filter(c => !idsToDelete.has(c.id));
        onUpdateConfigs(newConfigs);
        recordLog('time_configs', 'delete', count);
        setDeleteConfirmation(null);
    };

    const handleEdit = (province: string) => {
        setEditingConfig({ province, configs });
    };

    const handleCreateClick = () => {
        setCreateProvince('');
        setShowCreateModal(true);
    };

    const confirmCreate = () => {
        if (!createProvince.trim()) {
            alert("请输入或选择省份");
            return;
        }
        setShowCreateModal(false);
        // Start editing for this new province. 
        // If it already exists, TimeConfigMatrix will load existing data. 
        // If not, it will start empty.
        setEditingConfig({ province: createProvince, configs });
    };

    const handleMatrixSave = (province: string, newProvinceConfigs: TimeConfig[]) => {
        const otherConfigs = configs.filter(c => c.province !== province);
        const oldCount = configs.filter(c => c.province === province).length;
        const isCreate = oldCount === 0;
        onUpdateConfigs([...otherConfigs, ...newProvinceConfigs]);
        recordLog('time_configs', isCreate ? 'create' : 'update', newProvinceConfigs.length, province);
        setEditingConfig(null);
    };

    return (
        <div className="space-y-6">
            {!editingConfig ? (
                <>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">时段配置管理</h2>
                            <p className="text-slate-500 text-sm mt-1">管理各省份的峰谷平分时规则</p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleCreateClick}
                                className="bg-blue-600 text-white px-4 py-2 rounded-xl border border-blue-700 hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-all"
                            >
                                <Plus size={18} />
                                <span className="font-bold text-sm">新建配置</span>
                            </button>

                            <div className="relative">
                                <input
                                    value={globalFilter ?? ''}
                                    onChange={e => setGlobalFilter(e.target.value)}
                                    placeholder="搜索省份..."
                                    className="pl-10 pr-4 py-2 border rounded-xl w-64 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        {/* Table Content (unchanged) */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-600 font-medium">
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <th key={header.id} className="px-6 py-4 border-b">
                                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                </>
            ) : (
                <div className="h-[calc(100vh-100px)] flex flex-col">
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={() => setEditingConfig(null)}
                            className="bg-white p-2 rounded-full hover:bg-slate-100 border shadow-sm"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-bold">编辑 {editingConfig.province} 时段配置</h2>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <TimeConfigMatrix
                            configs={configs}
                            selectedProvince={editingConfig.province}
                            onSave={handleMatrixSave}
                        />
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900">新建时段配置</h3>
                            <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-slate-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">选择或输入省份</label>
                            <input
                                list="province-options"
                                type="text"
                                value={createProvince}
                                onChange={e => setCreateProvince(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="例如：北京市"
                                autoFocus
                            />
                            <datalist id="province-options">
                                {PROVINCES.map(p => <option key={p} value={p} />)}
                            </datalist>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium"
                            >
                                取消
                            </button>
                            <button
                                onClick={confirmCreate}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium"
                            >
                                开始配置
                            </button>
                        </div>
                    </div>
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
        </div>
    );
};
