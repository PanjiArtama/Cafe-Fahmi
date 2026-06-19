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
  Edit2, Trash2, Image as ImageIcon,
  Search, ChevronLeft, ChevronRight,
  ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { getAllCategories } from '../../data/cafeData';

const MenuTable = ({ data, onEdit, onDelete }) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const getCat = async () => {
      const cats = await getAllCategories();
      setCategories(cats ?? []);
    };
    getCat();
  }, []);

  const columns = useMemo(() => [
    {
      header: 'Product Name',
      accessorKey: 'name',
      id: 'name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3 py-0.5">
          <div className="h-11 w-11 rounded-lg overflow-hidden bg-[#FFFDF9] border border-[#EFEAE2] shrink-0 flex items-center justify-center">
            {row.original.image ? (
              <img
                src={`http://localhost:5005${row.original.image}`}
                className="h-full w-full object-cover"
                alt=""
              />
            ) : (
              <ImageIcon size={16} className="text-[#B58950]/30" />
            )}
          </div>
          <div className="min-w-0 text-left">
            <p className="font-bold text-sm text-[#4A3728] truncate">{row.original.name}</p>
            <p className="text-[11px] text-[#8D7B6E]">{row.original.category?.name}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessorFn: row => row.category?.name,
      id: 'category',
      cell: ({ getValue }) => (
        <div className="flex font-bold items-center justify-center">
          <span className="text-xs font-medium">{getValue()}</span>
        </div>
      ),
    },
    {
      header: 'Price',
      accessorKey: 'price',
      id: 'price',
      sortingFn: 'basic',
      cell: ({ getValue }) => (
        <span className="font-serif font-bold text-[#4A3728]">Rp {getValue().toLocaleString()}</span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'isAvailable',
      id: 'isAvailable',
      cell: ({ getValue }) => {
        const val = getValue();
        return (
          <div className="flex items-center justify-center">
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${val ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'
              }`}>
              {val ? "AVAILABLE" : "OUT OF STOCK"}
            </span>
          </div>
        );
      }
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

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, columnFilters, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

  return (
    <div className="space-y-4 antialiased">
      {/* ─── TOOLBAR (Elegant & Minimalist) ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#EFEAE2]">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8D7B6E]/50" size={16} />
          <input
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2 bg-[#FFFDF9] border border-[#EFEAE2] rounded-lg focus:outline-none focus:border-[#B58950] text-sm text-[#4A3728] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            className="bg-[#FFFDF9] border border-[#EFEAE2] text-[#4A3728] text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-[#B58950] transition-colors"
            onChange={e => table.getColumn('category')?.setFilterValue(e.target.value || undefined)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <select
            className="bg-[#FFFDF9] border border-[#EFEAE2] text-[#4A3728] text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-[#B58950] transition-colors"
            onChange={e => table.getColumn('isAvailable')?.setFilterValue(e.target.value === "" ? undefined : e.target.value === "true")}
          >
            <option value="">All Status</option>
            <option value="true">Available</option>
            <option value="false">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* ─── TABLE CONTENT ─── */}
      <div className="bg-white rounded-xl border border-[#EFEAE2] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#FFFDF9] border-b border-[#EFEAE2]">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    // Cek apakah kolom ini bertipe selain nama produk untuk diposisikan di tengah
                    const isCentered = header.id !== 'name';
                    return (
                      <th
                        key={header.id}
                        className={`px-6 py-3.5 text-[#8D7B6E] text-[10px] uppercase tracking-widest font-bold ${isCentered ? 'text-center' : 'text-left'
                          }`}
                      >
                        <div
                          className={`flex items-center gap-1.5 ${isCentered ? 'justify-center' : 'justify-start'
                            } ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-[#4A3728]' : ''}`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}

                          {header.column.getCanSort() && (
                            <div className="text-[#B58950]">
                              {{
                                asc: <ArrowUp size={11} />,
                                desc: <ArrowDown size={11} />,
                              }[header.column.getIsSorted()] ?? <ArrowUpDown size={11} className="opacity-30" />}
                            </div>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-[#EFEAE2]/40">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-10 text-center text-xs text-[#8D7B6E] font-medium">
                    No products found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-[#FFFDF9] transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-3.5 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ─── PAGINATION (Clean Footnote Style) ─── */}
        <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-4 border-t border-[#EFEAE2] bg-[#FFFDF9]/30">
          <div className="flex items-center gap-4 text-xs text-[#8D7B6E]">
            <p>
              Showing <strong>{table.getRowModel().rows.length}</strong> results
            </p>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">Show:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => table.setPageSize(Number(e.target.value))}
                className="bg-white border border-[#EFEAE2] text-[#4A3728] font-bold text-xs rounded-md px-1.5 py-0.5 outline-none focus:border-[#B58950]"
              >
                {[5, 10, 20, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>{pageSize}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#8D7B6E]">
            <span>
              Page <strong>{table.getState().pagination.pageIndex + 1}</strong> of{' '}
              {table.getPageCount()}
            </span>

            <div className="flex gap-1">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-1.5 rounded border border-[#EFEAE2] bg-white disabled:opacity-40 text-[#4A3728] hover:bg-[#FFFDF9] transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-1.5 rounded border border-[#EFEAE2] bg-white disabled:opacity-40 text-[#4A3728] hover:bg-[#FFFDF9] transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuTable;