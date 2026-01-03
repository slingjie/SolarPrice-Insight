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
import { ArrowUpDown, Search, Trash2, Filter } from 'lucide-react';
import { ComprehensiveResult } from '../../types';
import { recordLog } from '../../services/logService';

interface ResultsManagerProps {
    results: ComprehensiveResult[];
    onUpdateResults: (newResults: ComprehensiveResult[]) => void;
}

export const ResultsManager: React.FC<ResultsManagerProps> = ({ results, onUpdateResults }) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ ids: string[], message: string } | null>(null);

    const columnHelper = createColumnHelper<ComprehensiveResult>();

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
        columnHelper.accessor('category', {
            header: '分类',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('voltage_level', {
            header: '电压',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('avg_price', {
            header: '平均综合电价',
            cell: info => <span className="font-mono font-bold text-blue-600">{info.getValue().toFixed(4)}</span>,
        }),
        columnHelper.accessor('start_time', {
            header: '时段',
            cell: info => `${info.row.original.start_time} - ${info.row.original.end_time}`,
        }),
        columnHelper.accessor('last_modified', {
            header: '计算时间',
            cell: info => new Date(info.getValue()).toLocaleString('zh-CN'),
        }),
        columnHelper.display({
            id: 'actions',
            header: '操作',
            cell: props => (
                <button
                    onClick={() => handleDelete(props.row.original.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="删除"
                >
                    <Trash2 size={16} />
                </button>
            ),
        }),
    ], []);

    const table = useReactTable({
        data: results,
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
            message: '确定要删除这条计算结果吗？'
        });
    };

    const confirmDelete = () => {
        if (!deleteConfirmation) return;
        const idsToDelete = new Set(deleteConfirmation.ids);
        const count = deleteConfirmation.ids.length;
        const newResults = results.filter(r => !idsToDelete.has(r.id));
        onUpdateResults(newResults);
        recordLog('comprehensive_results', count > 1 ? 'bulk_delete' : 'delete', count);
        setDeleteConfirmation(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">综合电价结果管理</h2>
                    <p className="text-slate-500 text-sm mt-1">管理已保存的月度综合电价计算结果</p>
                </div>
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

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
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
