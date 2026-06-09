import React, { useEffect, useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel, // Important
  flexRender,
} from '@tanstack/react-table';
import {
  Edit2, Trash2, Image as ImageIcon,
  Search, ChevronLeft, ChevronRight,
  ArrowUpDown, ArrowUp, ArrowDown // Added sort icons
} from 'lucide-react';
import { getAllCategories } from '../../data/cafeData';

const MenuTable = ({ data, onEdit, onDelete }) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]); // 1. Add sorting state
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const getCat = async () => {
      const cats = await getAllCategories();
      setCategories(cats);
    };
    getCat();
  }, []);

  const columns = useMemo(() => [
    {
      header: 'Product Name',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg overflow-hidden bg-[#F5EFE6] border border-[#F5EFE6] shrink-0">
            {row.original.image ? (
              <img
                src={`http://localhost:5005${row.original.image}`}
                className="h-full w-full object-cover"
                alt=""
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-[#D9C5B2]"><ImageIcon size={18} /></div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-[#4A3728] truncate">{row.original.name}</p>
            <p className="text-xs text-[#8C6A53]">{row.original.category?.name}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessorFn: row => row.category?.name,
      id: 'category',
      cell: ({ getValue }) => <span className="text-[#8C6A53] text-sm">{getValue()}</span>,
    },
    {
      header: 'Price',
      accessorKey: 'price',
      // Ensure it sorts numerically
      sortingFn: 'basic',
      cell: ({ getValue }) => <span className="font-serif font-bold text-[#4A3728]">Rp {getValue().toLocaleString()}</span>,
    },
    {
      header: 'Status',
      accessorKey: 'isAvailable',
      cell: ({ getValue }) => {
        const val = getValue();
        return (
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${val ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'
            }`}>
            {val ? "AVAILABLE" : "OUT OF STOCK"}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      id: 'actions',
      enableSorting: false, // 2. Disable sorting for action buttons
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => onEdit(row.original)} className="p-2 hover:bg-[#F5EFE6] rounded-md text-[#D9C5B2] hover:text-[#4A3728] transition-all">
            <Edit2 size={16} />
          </button>
          <button onClick={() => onDelete?.(row.original)} className="p-2 hover:bg-rose-50 rounded-md text-[#D9C5B2] hover:text-rose-500 transition-all">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    }
  ], [onEdit, onDelete]);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, columnFilters, sorting }, // 3. Pass sorting state
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting, // 4. Add sorting change handler
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(), // 5. Use sorted row model
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

  return (
    <div className="space-y-4">
      {/* --- TOOLBAR --- (No changes needed here) */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#F5EFE6]">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D9C5B2]" size={18} />
          <input
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 bg-[#FDFBF7] border border-[#F5EFE6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D9C5B2]/20 text-[#4A3728]"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            className="bg-[#FDFBF7] border border-[#F5EFE6] text-[#8C6A53] text-sm rounded-lg px-3 py-2 outline-none"
            onChange={e => table.getColumn('category')?.setFilterValue(e.target.value || undefined)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <select
            className="bg-[#FDFBF7] border border-[#F5EFE6] text-[#8C6A53] text-sm rounded-lg px-3 py-2 outline-none"
            onChange={e => table.getColumn('isAvailable')?.setFilterValue(e.target.value === "" ? undefined : e.target.value === "true")}
          >
            <option value="">All Status</option>
            <option value="true">Available</option>
            <option value="false">Out of Stock</option>
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
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-[#8C6A53] text-[10px] uppercase tracking-widest font-bold"
                    >
                      {/* 6. Wrap content in a div to handle sorting clicks */}
                      <div
                        className={`flex items-center gap-2 ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-[#4A3728]' : ''
                          }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}

                        {/* 7. Show sort icons based on state */}
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
              {/* ... Rest of your tbody remains exactly the same ... */}
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-10 text-center text-[#8C6A53]">
                    No products found.
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

        {/* --- PAGINATION --- (No changes needed here) */}
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

export default MenuTable;