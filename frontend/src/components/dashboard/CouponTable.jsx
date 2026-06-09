import React, { useMemo, useState } from 'react';
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
  Edit2, Power, PowerOff,
  Trash2
} from 'lucide-react';

const CouponTable = ({ data, onEdit, onDelete }) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);

  const columns = useMemo(() => [
    {
      header: 'Coupon Code',
      accessorKey: 'code',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-[#4A3728] bg-[#F5EFE6] px-2 py-1 rounded border border-[#D9C5B2] w-fit">
            {row.original.code}
          </span>
          <span className="text-[10px] text-[#8C6A53] mt-1">
            Created: {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      header: 'Discount Value',
      accessorFn: row => row.value,
      id: 'value',
      cell: ({ row }) => {
        const { type, value } = row.original;
        return (
          <span className="font-bold text-[#4A3728]">
            {type === 'fixed' ? `Rp ${value.toLocaleString()}` : `${value}%`}
          </span>
        );
      },
    },
    {
      header: 'Min. Purchase',
      accessorKey: 'minPurchase',
      cell: ({ getValue }) => (
        <span className="text-[#8C6A53] text-sm">
          {getValue()? `Rp ${getValue().toLocaleString()}` : 'No minimum'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: ({ getValue, row }) => {
        const isActive = getValue();
        const expiresAt = row.original.expiresAt;
        const isExpired = expiresAt && new Date(expiresAt) < new Date();

        if (isExpired) {
          return (
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
              EXPIRED
            </span>
          );
        }

        return (
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${isActive
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
              : 'bg-gray-50 text-gray-400 border-gray-200'
            }`}>
            {isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      id: 'actions',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          {/* Edit Button */}
          <button
            onClick={() => onEdit(row.original)}
            className="p-2 hover:bg-[#F5EFE6] rounded-md text-[#D9C5B2] hover:text-[#4A3728] transition-all border border-transparent hover:border-[#D9C5B2]"
            title="Edit Coupon"
          >
            <Edit2 size={16} />
          </button>

          {/* Toggle Status Button */}
          <button onClick={() => onDelete?.(row.original)} className="p-2 hover:bg-rose-50 rounded-md text-[#D9C5B2] hover:text-rose-500 transition-all">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    }
  ], [onDelete, onEdit]);

  const table = useReactTable({
    data,
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
            placeholder="Search coupon codes..."
            className="w-full pl-10 pr-4 py-2 bg-[#FDFBF7] border border-[#F5EFE6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D9C5B2]/20 text-[#4A3728]"
          />
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
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-10 text-center text-[#8C6A53]">
                    No coupons found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-[#FDFBF7]/30 transition-colors">
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

export default CouponTable;