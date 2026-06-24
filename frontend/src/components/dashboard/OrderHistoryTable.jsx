import React, { useEffect, useMemo, useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, Filter, Calendar, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { getOrderHistory, handleExportExcel } from '../../data/service';
import { Toast } from '../../utils/Toast';

const columnHelper = createColumnHelper();

const OrderHistoryTable = ({ onDetail }) => {
    const [finalData, setFinalData] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [type, setType] = useState('all');
    const [status, setStatus] = useState('all');

    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [appliedStartDate, setAppliedStartDate] = useState('');
    const [appliedEndDate, setAppliedEndDate] = useState('');

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const params = {
                page,
                limit,
                type,
                status
            };
            if (appliedStartDate) params.startDate = appliedStartDate;
            if (appliedEndDate) params.endDate = appliedEndDate;

            const res = await getOrderHistory(params);
            setFinalData(res.data || []);
            setTotal(res.total || 0);
            setTotalPages(res.totalPages || 1);
        } catch (error) {
            console.error("Error fetching order history:", error);
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
    }, [page, limit, type, status, appliedStartDate, appliedEndDate]);

    const onApplyRange = () => {
        setAppliedStartDate(startDate);
        setAppliedEndDate(endDate);
        setPage(1);
        Toast.fire({
            icon: 'success',
            iconColor: '#10b981',
            title: 'Range Applied',
            background: '#ecfdf5',
            color: '#065f46'
        });
    };

    const exportExcel = async () => {
        await handleExportExcel(startDate, endDate);
    };

    const columns = useMemo(() => [
        columnHelper.accessor(row => row.userId ? row.userId.username : (row.guestName || 'Guest'), {
            id: 'customer',
            header: 'Customer',
            cell: info => <span className="font-bold text-[#4A3728]">{info.getValue()}</span>,
        }),
        columnHelper.accessor('userId', {
            id: 'isMember',
            header: 'Type',
            cell: ({ getValue }) => {
                const member = getValue();
                return member ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 uppercase">Member</span>
                ) : (
                    <span className="text-[10px] font-bold text-[#8C6A53] bg-[#F5EFE6] px-2 py-1 rounded-md uppercase">Guest</span>
                );
            },
        }),
        columnHelper.accessor('orderDetails', {
            header: 'Items',
            cell: info => <span className="text-[#8C6A53]">{info.getValue()?.length || 0} items</span>,
        }),
        columnHelper.accessor('totalAmount', {
            header: 'Total Price',
            cell: info => <span className="text-sm font-bold">Rp {info.getValue().toLocaleString()}</span>,
        }),
        columnHelper.accessor('status', {
            id: 'status',
            header: 'Status',
            cell: info => {
                const statusStr = info.getValue();
                const isCompleted = statusStr === 'completed';
                return (
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-orange-50 text-orange-700 border-orange-100'
                        }`}>
                        {statusStr}
                    </span>
                );
            },
        }),
        columnHelper.accessor('orderDate', {
            header: 'Date',
            cell: info => {
                const date = new Date(info.getValue());
                return (
                    <div className="flex flex-col">
                        <span className="text-xs text-[#4A3728] font-medium">
                            {date.toLocaleDateString('en-GB')}
                        </span>
                        <span className="text-[10px] text-[#8C6A53]">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                );
            },
        }),
    ], []);

    const table = useReactTable({
        data: finalData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="space-y-4">
            {/* --- TOP RANGE & EXPORT CONTROLS --- */}
            <div className="bg-white border border-[#E8DFD5] rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-6">

                    {/* Date Inputs */}
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-[#8C6A53] uppercase tracking-widest ml-1">Start Date</label>
                            <div className="relative">
                                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D9C5B2]" />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-[#FDFBF7] border border-[#E8DFD5] text-[#4A3728] text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-[#D9C5B2]/20"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-[#8C6A53] uppercase tracking-widest ml-1">End Date</label>
                            <div className="relative">
                                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D9C5B2]" />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-[#FDFBF7] border border-[#E8DFD5] text-[#4A3728] text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-[#D9C5B2]/20"
                                />
                            </div>
                        </div>

                        <button
                            onClick={onApplyRange}
                            className="bg-[#4A3728] text-white px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#3d2d21] transition-all flex items-center gap-2 mt-auto"
                        >
                            <RefreshCw size={14} />
                            Apply Range
                        </button>
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={exportExcel}
                        className="bg-[#FDFBF7] border-2 border-[#D9C5B2] text-[#8C6A53] px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-[#8C6A53] hover:text-[#4A3728] transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <FileSpreadsheet size={16} />
                        Export Excel
                    </button>
                </div>
            </div>

            {/* --- TABLE CONTENT --- */}
            <div className="bg-white border border-[#E8DFD5] rounded-3xl overflow-hidden shadow-sm">
                {/* Filters Header */}
                <div className="flex flex-wrap items-center gap-4 p-4 bg-[#FDFBF7]/50 border-b border-[#F5EFE6]">
                    <div className="flex items-center gap-3">
                        <Filter size={16} className="text-[#8C6A53]" />
                        <select
                            className="bg-white border border-[#E8DFD5] text-[#4A3728] text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#D9C5B2]/50"
                            value={type}
                            onChange={(e) => {
                                setType(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="all">All Types</option>
                            <option value="member">Members Only</option>
                            <option value="guest">Guests Only</option>
                        </select>
                        
                        <select
                            className="bg-white border border-[#E8DFD5] text-[#4A3728] text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#D9C5B2]/50"
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="all">All Statuses</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className="ml-auto">
                        <p className="text-[10px] font-bold text-[#8C6A53] uppercase tracking-widest">
                            {total} results found
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#FDFBF7]/30">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id} className="border-b border-[#F5EFE6]">
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="p-4 text-[10px] font-bold uppercase text-[#8C6A53] tracking-wider">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-[#F5EFE6]">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-4"><div className="h-4 bg-[#E8DFD5] rounded w-24"></div></td>
                                        <td className="p-4"><div className="h-4 bg-[#E8DFD5] rounded w-16"></div></td>
                                        <td className="p-4"><div className="h-4 bg-[#E8DFD5] rounded w-12"></div></td>
                                        <td className="p-4"><div className="h-4 bg-[#E8DFD5] rounded w-20"></div></td>
                                        <td className="p-4"><div className="h-4 bg-[#E8DFD5] rounded w-16"></div></td>
                                        <td className="p-4"><div className="h-4 bg-[#E8DFD5] rounded w-28"></div></td>
                                    </tr>
                                ))
                            ) : finalData.length > 0 ? (
                                table.getRowModel().rows.map(row => (
                                    <tr 
                                        key={row.id} 
                                        onClick={() => onDetail(row.original._id)} 
                                        className="hover:bg-[#FDFBF7]/80 cursor-pointer transition-colors"
                                    >
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="p-4">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-[#8C6A53] italic">
                                        No historical orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- PAGINATION --- */}
                <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-t border-[#F5EFE6] bg-[#FDFBF7]/30">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[#8C6A53] font-bold uppercase tracking-tighter">Rows:</span>
                            <select
                                value={limit}
                                onChange={e => {
                                    setLimit(Number(e.target.value));
                                    setPage(1);
                                }}
                                className="bg-transparent text-[#4A3728] text-xs font-bold outline-none"
                            >
                                {[10, 20, 50].map(pageSize => <option key={pageSize} value={pageSize}>{pageSize}</option>)}
                            </select>
                        </div>
                        <span className="text-xs text-[#8C6A53] font-medium">
                            Page {page} of {totalPages}
                        </span>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page <= 1 || isLoading}
                            className="p-2 rounded-xl border border-[#D9C5B2] bg-white disabled:opacity-30 hover:bg-[#FDFBF7] transition-all"
                        >
                            <ChevronLeft size={18} className="text-[#4A3728]" />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages || isLoading}
                            className="p-2 rounded-xl border border-[#D9C5B2] bg-white disabled:opacity-30 hover:bg-[#FDFBF7] transition-all"
                        >
                            <ChevronRight size={18} className="text-[#4A3728]" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderHistoryTable;