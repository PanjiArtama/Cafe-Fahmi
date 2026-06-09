import { Edit2, Trash2 } from 'lucide-react';

const CategoryGrid = ({ data = [], onEdit }) => (
  <div className="p-4 md:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
    {data.map((cat) => (
      <div
        key={cat._id}
        className="p-6 md:p-8 bg-[#FDFBF7] border border-[#E8DFD5] rounded-[2rem] hover:border-[#8C6A53] transition-all group cursor-pointer"
      >
        <h3 className="text-xl font-serif font-bold mb-1">{cat.name}</h3>
        <p className="text-xs text-[#8C6A53] font-medium">{cat.productCount ?? 0} Active Items</p>
        <div className="mt-6 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(cat)}
            className="p-2 bg-white rounded-xl shadow-sm hover:text-[#4A3728] transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button className="p-2 bg-white rounded-xl shadow-sm text-rose-400">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    ))}
  </div>
);

export default CategoryGrid;

