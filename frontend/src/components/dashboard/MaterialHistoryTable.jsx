import React, { useEffect, useMemo, useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import {
    ChevronLeft, ChevronRight, Filter, Calendar, RefreshCw,
    ArrowUpDown, ArrowUp, ArrowDown, Search
} from 'lucide-react';
import { getMaterialHistory } from '../../data/service';
import { Toast } from '../../utils/Toast';

const columnHelper = createColumnHelper();

const typeConfig = {
    IN: { label: 'Stock In', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
    OUT: { label: 'Stock Out', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100' },
    ADJUSTMENT: { label: 'Adjustment', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
    RETURN: { label: 'Return', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
    ORDER: { label: 'Order', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-100' },
};

const MaterialHistoryTable = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState([]);
    const [typeFilter, setTypeFilter] = useState('all');

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const res = await getMaterialHistory();
            setData(res || []);
        } catch (error) {
            console.error('Error fetching material history:', error);
            Toast.fire({
                icon: 'error',
                iconColor: '#f43f5e',
                title: 'Failed to fetch history',
                background: '#fff1f2',
                color: '#9f1239'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const filteredData = useMemo(() => {
        if (typeFilter === 'all') return data;
        return data.filter(item => item.transactionType === typeFilter);
    }, [data, typeFilter]);

    const columns = useMemo(() => [
        columnHelper.accessor(row => row.materialId?.name || 'Deleted Material', {
            id: 'materialName',
            header: 'Material',
            cell: info => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-linear-to-br from-[#8C6A53]/10 to-[#D9C5B2]/20 flex items-center justify-center text-[#8C6A53] font-bold text-sm shrink-0">
                        {(info.getValue()?.charAt(0) || '?').toUpperCase()}
                    </div>
                    <span className="font-bold text-[#4A3728]">{info.getValue()}</span>
                </div>
            ),
        }),
        columnHelper.accessor('transactionType', {
            header: 'Type',
            cell: ({ getValue }) => {
                const type = getValue();
                const config = typeConfig[type] || typeConfig.ADJUSTMENT;
                return (
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${config.bg} ${config.text} ${config.border}`}>
                        {config.label}
                    </span>
                );
            },
        }),
        columnHelper.accessor('quantity', {
            header: 'Quantity',
            sortingFn: 'basic',
            cell: ({ row }) => {
                const type = row.original.transactionType;
                const qty = row.original.quantity;
                const isIn = type === 'IN';
                const isOut = type === 'OUT';
                return (
                    <span className={`font-serif font-bold ${isIn ? 'text-emerald-600' : isOut ? 'text-rose-600' : 'text-amber-600'}`}>
                        {isIn ? '+' : isOut ? '-' : '~'}{qty.toLocaleString()}
                    </span>
                );
            },
        }),
        columnHelper.accessor('previousStock', {
            header: 'Previous Stock',
            sortingFn: 'basic',
            cell: info => (
                <span className="text-[#8C6A53] font-medium">{info.getValue().toLocaleString()}</span>
            ),
        }),
        columnHelper.accessor('currentStock', {
            header: 'Current Stock',
            sortingFn: 'basic',
            cell: info => (
                <span className="font-bold text-[#4A3728]">{info.getValue().toLocaleString()}</span>
            ),
        }),
        columnHelper.accessor('createdAt', {
            header: 'Date',
            cell: info => {
                const date = new Date(info.getValue());
                return (
                    <div className="flex flex-col">
                        <span className="text-xs text-[#4A3728] font-medium">
                            {date.toLocaleDateString('en-GB')}
                        </span>
                        <span className="text-[10px] text-[#8C6A53]">
                            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                );
            },
        }),
    ], []);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: { globalFilter, sorting },
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 10 } },
    });

    return (
        <div className="space-y-4">
            {/* --- TOOLBAR --- */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#F5EFE6]">
                <div className="relative flex-1 min-w-60">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D9C5B2]" size={18} />
                    <input
                        value={globalFilter ?? ''}
                        onChange={e => setGlobalFilter(e.target.value)}
                        placeholder="Search history..."
                        className="w-full pl-10 pr-4 py-2 bg-[#FDFBF7] border border-[#F5EFE6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D9C5B2]/20 text-[#4A3728]"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Filter size={16} className="text-[#8C6A53]" />
                    <select
                        className="bg-[#FDFBF7] border border-[#F5EFE6] text-[#8C6A53] text-sm rounded-lg px-3 py-2 outline-none"
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="IN">Stock In</option>
                        <option value="OUT">Stock Out</option>
                        <option value="ADJUSTMENT">Adjustment</option>
                        <option value="RETURN">Return</option>
                        <option value="ORDER">Order</option>
                    </select>
                    <button
                        onClick={fetchHistory}
                        className="p-2 rounded-lg border border-[#F5EFE6] bg-white hover:bg-[#FDFBF7] text-[#8C6A53] hover:text-[#4A3728] transition-all"
                        title="Refresh"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* --- TABLE --- */}
            <div className="bg-white rounded-xl border border-[#F5EFE6] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#FDFBF7] border-b border-[#F5EFE6]">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-6 py-4 text-[#8C6A53] text-[10px] uppercase tracking-widest font-bold">
                                            <div
                                                className={`flex items-center gap-2 ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-[#4A3728]' : ''}`}
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getCanSort() && (
                                                    <div className="w-4">
                                                        {{
                                                            asc: <ArrowUp size={12} />,
                                                            desc: <ArrowDown size={12} />,
                                                        }[header.column.getIsSorted()] ?? <ArrowUpDown size={12} className="opacity-30" />}
                                                    </div>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-[#F5EFE6]">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-[#E8DFD5] rounded w-28"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-[#E8DFD5] rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-[#E8DFD5] rounded w-12"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-[#E8DFD5] rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-[#E8DFD5] rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-[#E8DFD5] rounded w-24"></div></td>
                                    </tr>
                                ))
                            ) : table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-[#FDFBF7]/30 transition-colors">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-6 py-4">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-[#8C6A53] italic">
                                        No material history found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- PAGINATION --- */}
                <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-t border-[#F5EFE6] bg-[#FDFBF7]/50">
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-[#8C6A53]">
                            Showing <strong>{table.getRowModel().rows.length}</strong> of{' '}
                            <strong>{filteredData.length}</strong> results
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-[#8C6A53] font-medium uppercase">Show:</span>
                            <select
                                value={table.getState().pagination.pageSize}
                                onChange={e => table.setPageSize(Number(e.target.value))}
                                className="bg-white border border-[#F5EFE6] text-[#4A3728] text-sm rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-[#D9C5B2]/20"
                            >
                                {[5, 10, 20, 50].map(pageSize => (
                                    <option key={pageSize} value={pageSize}>{pageSize}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-[#8C6A53]">
                            Page <strong>{table.getState().pagination.pageIndex + 1}</strong> of{' '}
                            {table.getPageCount()}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className="p-2 rounded-md border border-[#F5EFE6] bg-white disabled:opacity-50 text-[#4A3728] hover:bg-[#FDFBF7]"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                                className="p-2 rounded-md border border-[#F5EFE6] bg-white disabled:opacity-50 text-[#4A3728] hover:bg-[#FDFBF7]"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaterialHistoryTable;
