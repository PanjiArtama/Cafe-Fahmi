import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { addMaterial, updateMaterial } from '../../data/service';
import { Toast } from '../../utils/Toast';

const EMPTY_FORM = {
  name: '',
  stock: '',
  unit: 'gram',
};

const MaterialSlideOver = ({ isOpen, onClose, initialData = null }) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        id: initialData._id || '',
        name: initialData.name || '',
        stock: initialData.stock ?? '',
        unit: initialData.unit || 'gram',
      });
    } else if (isOpen && !initialData) {
      setFormData(EMPTY_FORM);
    }
  }, [isOpen, initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setFormData(EMPTY_FORM);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      const payload = {
        name: formData.name,
        stock: Number(formData.stock),
        unit: formData.unit,
      };

      if (isEditMode) {
        payload.id = initialData._id;
        res = await updateMaterial(payload);
      } else {
        res = await addMaterial(payload);
      }

      if (res && res.ok) {
        Toast.fire({
          icon: 'success',
          iconColor: '#10b981',
          title: isEditMode ? 'Bahan Diperbarui' : 'Bahan Ditambahkan',
          background: '#ecfdf5',
          color: '#065f46'
        });
        handleClose();
      } else {
        const data = await res.json();
        Toast.fire({
          icon: 'error',
          iconColor: '#f43f5e',
          title: data.message || 'Gagal menyimpan',
          background: '#fff1f2',
          color: '#9f1239'
        });
      }
    } catch (error) {
      Toast.fire({
        icon: 'error',
        iconColor: '#f43f5e',
        title: 'Koneksi Gagal',
        text: 'Server tidak dapat dijangkau.'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#4A3728]/40 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Panel */}
      <div className="fixed inset-0 md:inset-y-0 md:right-0 md:left-auto flex md:max-w-lg w-full md:pl-10">
        <div className="w-full transform transition-all duration-500 ease-in-out">
          <form
            onSubmit={handleSubmit}
            className="flex h-full flex-col bg-white shadow-2xl border-l border-[#E8DFD5]"
          >
            {/* Header */}
            <div className="px-6 md:px-8 py-5 md:py-6 bg-[#FDFBF7] border-b border-[#E8DFD5] flex items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A3728]">
                  {isEditMode ? 'Edit Bahan Baku' : 'Tambah Bahan Baku'}
                </h2>
                <p className="text-xs text-[#8C6A53] font-medium uppercase tracking-widest mt-1">
                  Manajemen Material
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-2 hover:bg-[#F5EFE6] rounded-full text-[#8C6A53] transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 md:space-y-8">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C6A53] mb-2">
                  Nama Bahan
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="cth. Biji Kopi Arabika"
                  className="w-full bg-[#FDFBF7] border border-[#E8DFD5] rounded-2xl py-3 px-5 focus:ring-2 focus:ring-[#D9C5B2] outline-none text-[#4A3728] font-medium"
                  required
                />
              </div>

              {/* Stock & Unit */}
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C6A53] mb-2">
                    Jumlah Stok
                  </label>
                  <input
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    type="number"
                    min="0"
                    placeholder="5000"
                    className="w-full bg-[#FDFBF7] border border-[#E8DFD5] rounded-2xl py-3 px-5 focus:ring-2 focus:ring-[#D9C5B2] outline-none text-[#4A3728] font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C6A53] mb-2">
                    Satuan
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full bg-[#FDFBF7] border border-[#E8DFD5] rounded-2xl py-3 px-5 focus:ring-2 focus:ring-[#D9C5B2] outline-none appearance-none cursor-pointer text-[#4A3728]"
                  >
                    <option value="gram">Gram</option>
                    <option value="ml">Mililiter (ml)</option>
                    <option value="pcs">Pcs (Buah)</option>
                  </select>
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-[#FDFBF7] border border-[#E8DFD5] rounded-2xl p-4">
                <p className="text-xs text-[#8C6A53]">
                  <strong>Info:</strong> Stok bahan baku akan berkurang otomatis setiap kali ada pesanan produk yang menggunakan bahan ini dalam komposisinya.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 md:p-8 bg-[#FDFBF7] border-t border-[#E8DFD5] flex gap-4 mb-safe">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-4 rounded-2xl border border-[#E8DFD5] text-[#8C6A53] font-bold hover:bg-white transition-all active:scale-95"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-4 rounded-2xl bg-[#4A3728] text-white font-bold hover:bg-[#382a1f] shadow-xl shadow-[#4A3728]/20 transition-all active:scale-95"
              >
                {isEditMode ? 'Simpan Perubahan' : 'Tambah Bahan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MaterialSlideOver;
