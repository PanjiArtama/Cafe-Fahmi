import { useState, useEffect } from 'react';
import { X, Ticket, Calendar, Percent, Banknote } from 'lucide-react';
import { Toast } from '../../utils/Toast';
import { addCoupon, updateCoupon } from '../../data/service';

const EMPTY_COUPON = {
  code: '',
  type: 'fixed', // fixed or percentage
  value: '',
  minPurchase: '',
  maxDiscount: '', // optional for percentage
  expiresAt: '',
  isActive: true
};

const CouponSlideOver = ({ isOpen, onClose, initialData = null }) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState(EMPTY_COUPON);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        ...initialData,
        expiresAt: initialData.expiresAt ? new Date(initialData.expiresAt).toISOString().slice(0, 16) : '',
      });
    } else if (isOpen && !initialData) {
      setFormData(EMPTY_COUPON);
    }
  }, [isOpen, initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleClose = () => {
    setFormData(EMPTY_COUPON);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // API integration logic goes here
    // console.log("Submitting Coupon Data:", formData);
    var res;
    if(isEditMode){
      res = await updateCoupon(formData._id, formData);
    }else{
      res = await addCoupon(formData);
    }
    if (!res.ok) {
      Toast.fire({
        icon: 'error',
        title: 'Failed to save coupon',
        background: '#fff1f2',
        color: '#9f1239'
      });
      handleClose();
      return;
    } else {
      Toast.fire({
        icon: 'success',
        title: isEditMode ? 'Coupon Updated' : 'Coupon Created',
        background: '#ecfdf5',
        color: '#065f46'
      });
      handleClose();
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

      <div className="fixed inset-0 md:inset-y-0 md:right-0 md:left-auto flex md:max-w-xl w-full md:pl-10">
        <div className="w-full transform transition-all duration-500">
          <form
            onSubmit={handleSubmit}
            className="flex h-full flex-col bg-white shadow-2xl border-l border-[#E8DFD5]"
          >
            {/* Header */}
            <div className="px-6 md:px-8 py-5 md:py-6 bg-[#FDFBF7] border-b border-[#E8DFD5] flex items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A3728]">
                  {isEditMode ? 'Edit Coupon' : 'Create New Coupon'}
                </h2>
                <p className="text-xs text-[#8C6A53] font-medium uppercase tracking-widest mt-1">
                  Promotion Management
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
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">

              {/* Coupon Code Section */}
              <div className="bg-[#FDFBF7] border border-[#E8DFD5] p-5 rounded-3xl text-center">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C6A53] mb-3">
                  Coupon Voucher Code
                </label>
                <div className="relative">
                  <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D9C5B2]" size={20} />
                  <input
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    type="text"
                    placeholder="e.g. SUMMER50"
                    className="w-full bg-white border border-[#E8DFD5] rounded-2xl py-4 pl-12 pr-5 focus:ring-2 focus:ring-[#D9C5B2] outline-none text-[#4A3728] font-mono font-bold text-xl uppercase placeholder:normal-case"
                    required
                  />
                </div>
              </div>

              {/* Discount Config */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C6A53] mb-2">
                    Discount Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, type: 'fixed' }))}
                      className={`flex items-center justify-center gap-2 py-3 rounded-2xl border font-bold transition-all ${formData.type === 'fixed' ? 'bg-[#4A3728] text-white border-[#4A3728]' : 'bg-white text-[#8C6A53] border-[#E8DFD5]'}`}
                    >
                      <Banknote size={18} /> Fixed Amount
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, type: 'percentage' }))}
                      className={`flex items-center justify-center gap-2 py-3 rounded-2xl border font-bold transition-all ${formData.type === 'percentage' ? 'bg-[#4A3728] text-white border-[#4A3728]' : 'bg-white text-[#8C6A53] border-[#E8DFD5]'}`}
                    >
                      <Percent size={18} /> Percentage
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C6A53] mb-2">
                    Value ({formData.type === 'fixed' ? 'Rp' : '%'})
                  </label>
                  <input
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    type="number"
                    placeholder={formData.type === 'fixed' ? "5000" : "10"}
                    className="w-full bg-[#FDFBF7] border border-[#E8DFD5] rounded-2xl py-3 px-5 focus:ring-2 focus:ring-[#D9C5B2] outline-none text-[#4A3728] font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C6A53] mb-2">
                    Min. Purchase
                  </label>
                  <input
                    name="minPurchase"
                    value={formData.minPurchase}
                    onChange={handleInputChange}
                    type="number"
                    placeholder="20000"
                    className="w-full bg-[#FDFBF7] border border-[#E8DFD5] rounded-2xl py-3 px-5 focus:ring-2 focus:ring-[#D9C5B2] outline-none text-[#4A3728] font-bold"
                  />
                </div>

                {formData.type === 'percentage' && (
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C6A53] mb-2">
                      Max Discount (Optional)
                    </label>
                    <input
                      name="maxDiscount"
                      value={formData.maxDiscount}
                      onChange={handleInputChange}
                      type="number"
                      placeholder="e.g. 15000"
                      className="w-full bg-[#FDFBF7] border border-[#E8DFD5] rounded-2xl py-3 px-5 focus:ring-2 focus:ring-[#D9C5B2] outline-none text-[#4A3728] font-bold"
                    />
                  </div>
                )}
              </div>

              {/* Expiry and Status */}
              <div className="space-y-4 pt-4 border-t border-[#E8DFD5]">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C6A53] mb-2">
                    Expiry Date & Time
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D9C5B2]" size={18} />
                    <input
                      name="expiresAt"
                      value={formData.expiresAt}
                      onChange={handleInputChange}
                      type="datetime-local"
                      className="w-full bg-[#FDFBF7] border border-[#E8DFD5] rounded-2xl py-3 pl-12 pr-5 focus:ring-2 focus:ring-[#D9C5B2] outline-none text-[#4A3728]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-2xl border border-[#E8DFD5]">
                  <div>
                    <p className="text-sm font-bold text-[#4A3728]">Active Status</p>
                    <p className="text-[10px] text-[#8C6A53]">Turn off to hide coupon from customers</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4A3728]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 md:p-8 bg-[#FDFBF7] border-t border-[#E8DFD5] flex gap-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-4 rounded-2xl border border-[#E8DFD5] text-[#8C6A53] font-bold hover:bg-white transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-4 rounded-2xl bg-[#4A3728] text-white font-bold hover:bg-[#382a1f] shadow-xl shadow-[#4A3728]/20 transition-all active:scale-95"
              >
                {isEditMode ? 'Save Changes' : 'Create Coupon'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CouponSlideOver;