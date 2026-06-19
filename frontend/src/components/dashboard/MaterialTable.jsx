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
  Edit2, Trash2
} from 'lucide-react';

const unitLabels = { gram: 'gram', ml: 'ml', pcs: 'pcs' };

const MaterialTable = ({ data, onEdit, onDelete }) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [unitFilter, setUnitFilter] = useState('');

  const columns = useMemo(() => [
    {
      header: 'Nama Bahan',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#8C6A53]/10 to-[#D9C5B2]/20 flex items-center justify-center text-[#8C6A53] font-bold text-sm shrink-0">
            {row.original.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-bold text-[#4A3728]">{row.original.name}</span>
        </div>
      ),
    },
    {
      header: 'Stok',
      accessorKey: 'stock',
      sortingFn: 'basic',
      cell: ({ row }) => {
        const stock = row.original.stock;
        const isLow = stock < 100;
        return (
          <div className="flex items-center gap-2">
            <span className={`font-serif font-bold ${isLow ? 'text-rose-600' : 'text-[#4A3728]'}`}>
              {stock.toLocaleString()}
            </span>
            <span className="text-xs text-[#8C6A53]">{row.original.unit}</span>
            {isLow && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-500 border border-rose-100">
                RENDAH
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Satuan',
      accessorKey: 'unit',
      cell: ({ getValue }) => (
        <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#F5EFE6] text-[#8C6A53] border border-[#E8DFD5] uppercase tracking-wider">
          {unitLabels[getValue()] || getValue()}
        </span>
      ),
    },
    {
      header: 'Actions',
      id: 'actions',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => onEdit(row.original)}
            className="w-8 h-8 rounded-full bg-transparent text-[#8D7B6E] 
                       flex items-center justify-center transition-colors duration-200
                       hover:bg-[#B58950]/10 hover:text-[#4A3728]"
            title="Edit Product"
          >
            <Edit2 size={13} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => onDelete?.(row.original)}
            className="w-8 h-8 rounded-full bg-transparent text-[#8D7B6E] 
                       flex items-center justify-center transition-colors duration-200
                       hover:bg-rose-50 hover:text-rose-600"
            title="Delete Product"
          >
            <Trash2 size={13} strokeWidth={2.5} />
          </button>
        </div>
      ),
    }
  ], [onEdit, onDelete]);

  const filteredData = useMemo(() => {
    if (!unitFilter) return data;
    return data.filter(item => item.unit === unitFilter);
  }, [data, unitFilter]);

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
            placeholder="Cari bahan baku..."
            className="w-full pl-10 pr-4 py-2 bg-[#FDFBF7] border border-[#F5EFE6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D9C5B2]/20 text-[#4A3728]"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            className="bg-[#FDFBF7] border border-[#F5EFE6] text-[#8C6A53] text-sm rounded-lg px-3 py-2 outline-none"
            value={unitFilter}
            onChange={e => setUnitFilter(e.target.value)}
          >
            <option value="">Semua Satuan</option>
            <option value="gram">Gram</option>
            <option value="ml">Mililiter (ml)</option>
            <option value="pcs">Pcs</option>
          </select>
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="bg-white rounded-xl border border-[#F5EFE6] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#FDFBF7] border-b border-[#F5EFE6]">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    const isCentered = header.id !== 'name';
                    return (
                    <th key={header.id} className="px-6 py-4 text-[#8C6A53] text-[10px] uppercase tracking-widest font-bold">
                      <div
                        className={`flex items-center gap-2 ${isCentered ? 'justify-center' : 'justify-start'} ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-[#4A3728]' : ''}`}
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
                  )})}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-[#F5EFE6]">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-10 text-center text-[#8C6A53]">
                    Tidak ada bahan baku ditemukan.
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
              Menampilkan <strong>{table.getRowModel().rows.length}</strong> hasil
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
              Halaman <strong>{table.getState().pagination.pageIndex + 1}</strong> dari{' '}
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

export default MaterialTable;
