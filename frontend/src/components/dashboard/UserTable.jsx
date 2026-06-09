import React, { useEffect, useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Search, ChevronLeft, ChevronRight,
  ArrowUpDown, ArrowUp, ArrowDown,
  Ticket, Filter
} from 'lucide-react';
import { getUserStat } from '../../data/service';

const UserTable = ({ rawData, onAssignCoupon }) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [dates, setDates] = useState({ start: '', end: '' });
  const [data, setData] = useState([]);
  useEffect(() => {
    setData(rawData);
  }, [rawData])
  const onApplyDateRange = async () => {
    const dat = await getUserStat({ startDate: dates.start, endDate: dates.end });
    setData(dat);
  }

  // 1. Add state for column filters
  const [columnFilters, setColumnFilters] = useState([]);

  const columns = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          className="rounded border-[#D9C5B2] text-[#4A3728] focus:ring-[#D9C5B2]"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="rounded border-[#D9C5B2] text-[#4A3728] focus:ring-[#D9C5B2]"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    },
    {
      header: 'User Info',
      accessorKey: 'username',
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="font-bold text-[#4A3728] truncate">{row.original.username}</p>
          <p className="text-xs text-[#8C6A53]">{row.original.email}</p>
        </div>
      ),
    },
    {
      header: 'Total Orders',
      accessorKey: 'totalOrders',
      // Use a function instead of a string to avoid the lookup error
      filterFn: (row, columnId, filterValue) => {
        const rowValue = row.getValue(columnId);
        return rowValue >= filterValue;
      },
      cell: ({ getValue }) => <span className="text-[#4A3728] font-medium">{getValue()}</span>,
    },
    {
      header: 'Lifetime Spend',
      accessorKey: 'lifetimeSpend',
      // Use a function here as well
      filterFn: (row, columnId, filterValue) => {
        const rowValue = row.getValue(columnId);
        return rowValue >= filterValue;
      },
      cell: ({ getValue }) => (
        <span className="font-serif font-bold text-[#4A3728]">
          Rp {getValue().toLocaleString()}
        </span>
      ),
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting, rowSelection, columnFilters },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    // 3. Add filter handler
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

  const selectedRows = table.getSelectedRowModel().flatRows;
  const hasSelection = selectedRows.length > 0;

  // Helper to update specific column filters
  const handleFilterChange = (id, value) => {
    setColumnFilters(prev => {
      const otherFilters = prev.filter(f => f.id !== id);
      return value ? [...otherFilters, { id, value: Number(value) }] : otherFilters;
    });
  };

  return (
    <div className="space-y-4">
      {/* --- TOOLBAR --- */}
      <div className="flex flex-col gap-4 bg-white p-4 rounded-xl border border-[#F5EFE6]">
        {/* New Date Range Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#F5EFE6]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-[#8C6A53] uppercase">From:</label>
              <input
                type="date"
                value={dates.start}
                onChange={(e) => setDates({ ...dates, start: e.target.value })}
                className="px-3 py-1.5 bg-[#FDFBF7] border border-[#F5EFE6] rounded-lg text-sm text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#D9C5B2]/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-[#8C6A53] uppercase">To:</label>
              <input
                type="date"
                value={dates.end}
                onChange={(e) => setDates({ ...dates, end: e.target.value })}
                className="px-3 py-1.5 bg-[#FDFBF7] border border-[#F5EFE6] rounded-lg text-sm text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#D9C5B2]/20"
              />
            </div>
            <button
              onClick={() => onApplyDateRange()}
              className="px-4 py-1.5 bg-[#D9C5B2] text-[#4A3728] hover:bg-[#ccb49d] rounded-lg font-bold text-xs transition-colors"
            >
              Apply Range
            </button>
          </div>

          <button
            onClick={() => onAssignCoupon(selectedRows.map(r => r.original))}
            disabled={!hasSelection}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm
                ${hasSelection
                ? 'bg-[#4A3728] text-white hover:bg-[#3d2d21]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'}`}
          >
            <Ticket size={18} />
            Assign Coupon {hasSelection && `(${selectedRows.length})`}
          </button>
        </div>

        {/* --- SEARCH ROW --- */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D9C5B2]" size={18} />
            <input
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 bg-[#FDFBF7] border border-[#F5EFE6] rounded-lg text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#D9C5B2]/20"
            />
          </div>
        </div>

        {/* --- NUMERIC FILTERS --- */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[#F5EFE6]">
          <div className="flex items-center gap-2 text-[#8C6A53] text-xs font-bold uppercase tracking-wider">
            <Filter size={14} /> Quick Filter:
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-[#8C6A53]">Min Orders:</label>
            <input
              type="number"
              placeholder="0"
              className="w-20 px-2 py-1 bg-[#FDFBF7] border border-[#F5EFE6] rounded-md text-sm outline-none focus:border-[#D9C5B2]"
              onChange={e => handleFilterChange('totalOrders', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-[#8C6A53]">Min Spend (Rp):</label>
            <input
              type="number"
              placeholder="0"
              className="w-32 px-2 py-1 bg-[#FDFBF7] border border-[#F5EFE6] rounded-md text-sm outline-none focus:border-[#D9C5B2]"
              onChange={e => handleFilterChange('lifetimeSpend', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* --- TABLE (Same as before) --- */}
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
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-10 text-center text-[#8C6A53]">
                    No users matching these filters.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className={`hover:bg-[#FDFBF7]/50 transition-colors ${row.getIsSelected() ? 'bg-[#F5EFE6]/30' : ''}`}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION --- */}
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-t border-[#F5EFE6] bg-[#FDFBF7]/50">
          <div className="flex items-center gap-4">
            <p className="text-sm text-[#8C6A53]">
              Showing <strong>{table.getRowModel().rows.length}</strong> results
            </p>

            {/* --- PAGE SIZE SELECTOR --- */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8C6A53] font-medium uppercase">Show:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => {
                  table.setPageSize(Number(e.target.value))
                }}
                className="bg-white border border-[#F5EFE6] text-[#4A3728] text-sm rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-[#D9C5B2]/20"
              >
                {[5, 10, 20, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Page Counter */}
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

export default UserTable;