import { useState, useRef, useEffect } from 'react';
import { X, Camera } from 'lucide-react';
import { addProduct, updateProduct } from '../../data/service';
import Swal from 'sweetalert2';
import { Toast } from '../../utils/Toast';

const EMPTY_FORM = {
  name: '',
  price: '',
  category: '',
  desc: '',
};

const AddProductSlideOver = ({ isOpen, onClose, categories, initialData = null }) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);


  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        id: initialData._id || '',
        name: initialData.name || '',
        price: initialData.price || '',
        category: initialData.category?._id || initialData.category || '',
        desc: initialData.desc || '',
      });
      setImagePreview(`http://localhost:5005${initialData.image}` || null);
    } else if (isOpen && !initialData) {
      setFormData(EMPTY_FORM);
      setImagePreview(null);
    }
  }, [isOpen, initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleClose = () => {
    setFormData(EMPTY_FORM);
    setImagePreview(null);
    onClose();
  };
  const [isCustom, setIsCustom] = useState(false);
  const handleCategoryChange = (e) => {
    const { value } = e.target;

    if (value === "other") {
      setIsCustom(true);
      // Clear the category so the user can type a fresh one
      setFormData(prev => ({ ...prev, category: "" }));
    } else {
      setIsCustom(false);
      setFormData(prev => ({ ...prev, category: value }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('desc', formData.desc);
    if (fileInputRef.current?.files[0]) {
      data.append('image', fileInputRef.current.files[0]);
    }
    try {
      let res;
      if (isEditMode) {
        data.append('id', initialData._id);
        res = await updateProduct(data);
      } else {
        res = await addProduct(data);
      }

      if (res && res.ok) {
        Toast.fire({
          icon: 'success',
          iconColor: '#10b981',
          title: isEditMode ? 'Update Successful' : 'Product Added',

          background: '#ecfdf5',
          color: '#065f46'
        });
        handleClose();
      } else {
        const dat = await res.json();
        Toast.fire({
          icon: 'error',
          iconColor: '#f43f5e',
          title: 'Action Failed',
          background: '#fff1f2',
          color: '#9f1239'
        });
      }
    } catch (error) {
      Toast.fire({
        icon: 'error',
        iconColor: '#f43f5e',
        title: 'Connection Error',
        text: 'Server is currently unreachable.'
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

      {/* Panel — full screen on mobile, slide-over on md+ */}
      <div className="fixed inset-0 md:inset-y-0 md:right-0 md:left-auto flex md:max-w-xl w-full md:pl-10">
        <div className="w-full transform transition-all duration-500 ease-in-out">
          <form
            onSubmit={handleSubmit}
            className="flex h-full flex-col bg-white shadow-2xl border-l border-[#E8DFD5]"
          >
            {/* Header */}
            <div className="px-6 md:px-8 py-5 md:py-6 bg-[#FDFBF7] border-b border-[#E8DFD5] flex items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A3728]">
                  {isEditMode ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-xs text-[#8C6A53] font-medium uppercase tracking-widest mt-1">
                  Menu Management
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
              {/* Image Upload */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C6A53] mb-3 text-center">
                  Product Photography
                </label>
                <div
                  onClick={() => fileInputRef.current.click()}
                  className={`relative h-48 md:h-56 w-full border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden
                    ${imagePreview
                      ? 'border-transparent bg-gray-100'
                      : 'border-[#E8DFD5] bg-[#FDFBF7] hover:border-[#8C6A53]'
                    }`}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-3 text-[#8C6A53]">
                        <Camera size={28} />
                      </div>
                      <p className="text-sm font-medium text-[#4A3728]">
                        Drop product image here
                      </p>
                      <p className="text-[10px] text-[#8C6A53]/60 mt-1 uppercase tracking-tighter">
                        JPG, PNG or WEBP (Max 5MB)
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleImageUpload}
                    accept="image/*"
                  />
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C6A53] mb-2">
                    Product Name
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    type="text"
                    placeholder="e.g. Vanilla Cream Cold Brew"
                    className="w-full bg-[#FDFBF7] border border-[#E8DFD5] rounded-2xl py-3 px-5 focus:ring-2 focus:ring-[#D9C5B2] outline-none text-[#4A3728] font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C6A53] mb-2">
                    Selling Price (Rp)
                  </label>
                  <input
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    type="number"
                    placeholder="32000"
                    className="w-full bg-[#FDFBF7] border border-[#E8DFD5] rounded-2xl py-3 px-5 focus:ring-2 focus:ring-[#D9C5B2] outline-none text-[#4A3728] font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C6A53] mb-2">
                    Category
                  </label>
                  <div className="flex flex-col gap-3">
                    {!isCustom ? (
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleCategoryChange}
                        className="w-full bg-[#FDFBF7] border border-[#E8DFD5] rounded-2xl py-3 px-5 focus:ring-2 focus:ring-[#D9C5B2] outline-none appearance-none cursor-pointer"
                      >
                        <option value="">-- Category --</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                        <option value="other">+ Type New Category...</option>
                      </select>
                    ) : (
                      <div className="relative">
                        <input
                          type="text"
                          name="category"
                          placeholder="Enter new category name"
                          value={formData.category}
                          onChange={handleInputChange} // Uses your original handler
                          autoFocus
                          className="w-full bg-[#FDFBF7] border border-[#E8DFD5] rounded-2xl py-3 px-5 focus:ring-2 focus:ring-[#D9C5B2] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setIsCustom(false)}
                          className="absolute right-4 top-3 text-sm text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C6A53] mb-2">
                  Product Story / Description
                </label>
                <textarea
                  name="desc"
                  value={formData.desc}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Notes of almond and toasted sugar..."
                  className="w-full bg-[#FDFBF7] border border-[#E8DFD5] rounded-2xl py-4 px-5 focus:ring-2 focus:ring-[#D9C5B2] outline-none resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 md:p-8 bg-[#FDFBF7] border-t border-[#E8DFD5] flex gap-4 mb-safe">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-4 rounded-2xl border border-[#E8DFD5] text-[#8C6A53] font-bold hover:bg-white transition-all active:scale-95"
              >
                Discard
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-4 rounded-2xl bg-[#4A3728] text-white font-bold hover:bg-[#382a1f] shadow-xl shadow-[#4A3728]/20 transition-all active:scale-95"
              >
                {isEditMode ? 'Save Changes' : 'Confirm Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductSlideOver;
