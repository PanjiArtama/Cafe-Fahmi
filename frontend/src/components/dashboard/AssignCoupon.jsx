import React, { useState } from 'react';
import { X, Tag, Users, CheckCircle2, Ticket, Info, Calendar, ChevronRight } from 'lucide-react';

const AssignCouponModal = ({ isOpen, onClose, selectedUsers, coupons, onApply }) => {
    const [selectedCoupon, setSelectedCoupon] = useState(null);

    if (!isOpen) return null;

    const handleApply = () => {
        if (selectedCoupon && selectedUsers.length > 0) {
            onApply(selectedCoupon, selectedUsers);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[#4A3728]/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-white w-full max-w-5xl h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-[#E8DFD5]">

                {/* HEADER */}
                <div className="px-8 py-6 bg-[#FDFBF7] border-b border-[#E8DFD5] flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#4A3728] p-3 rounded-2xl text-white">
                            <Ticket size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-[#4A3728]">Bulk Coupon Assignment</h2>
                            <p className="text-[10px] text-[#8C6A53] font-bold uppercase tracking-[0.2em] mt-0.5">Marketing Management</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#F5EFE6] rounded-full text-[#8C6A53] transition-colors">
                        <X size={28} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* LEFT SIDE: SELECTED USERS LIST (Flutter ListTile Style) */}
                    <div className="w-[55%] flex flex-col bg-[#FDFBF7]/50 border-r border-[#E8DFD5]">
                        <div className="p-6 border-b border-[#E8DFD5] bg-white">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-[#8C6A53] flex items-center gap-2">
                                <Users size={14} /> Recipient List ({selectedUsers.length})
                            </label>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {selectedUsers.map((user) => (
                                <div
                                    key={user._id}
                                    className="flex items-center p-4 bg-white border border-[#E8DFD5] rounded-2xl shadow-sm hover:border-[#4A3728] transition-all group"
                                >
                                    <div className="w-10 h-10 bg-[#F5EFE6] text-[#4A3728] rounded-xl flex items-center justify-center font-bold mr-4 group-hover:bg-[#4A3728] group-hover:text-white transition-colors">
                                        {user.username?.charAt(0) || user.email?.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-[#4A3728] text-sm">{user.username}</p>
                                        <p className="text-xs text-[#8C6A53]">{user.email}</p>
                                    </div>
                                    <ChevronRight size={16} className="text-[#C9B8AA]" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT SIDE: COUPON SELECTION & PREVIEW */}
                    <div className="w-[45%] flex flex-col bg-white">
                        <div className="p-8 flex-1 overflow-y-auto">
                            <div className="mb-8">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-[#8C6A53] mb-3 block italic">
                                    Select Promotion
                                </label>
                                <select
                                    className="w-full bg-[#FDFBF7] border border-[#E8DFD5] rounded-2xl py-4 px-6 outline-none text-[#4A3728] font-medium appearance-none cursor-pointer focus:border-[#4A3728] transition-all"
                                    onChange={(e) => {
                                        const coupon = coupons.find(c => c.code === e.target.value);
                                        setSelectedCoupon(coupon);
                                    }}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Choose a coupon code...</option>
                                    {coupons.map((coupon) => (
                                        <option key={coupon.code} value={coupon.code}>{coupon.code}</option>
                                    ))}
                                </select>
                            </div>

                            {/* COUPON DETAIL CARD */}
                            <div className="border border-[#E8DFD5] rounded-[2rem] bg-[#FDFBF7] p-6 relative overflow-hidden">
                                <div className="relative z-10">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#8C6A53] flex items-center gap-2 mb-4">
                                        <Info size={14} /> Coupon Details
                                    </label>

                                    {selectedCoupon ? (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div>
                                                <h3 className="text-3xl font-serif font-bold text-[#4A3728]">
                                                    {selectedCoupon.type === 'percentage'
                                                        ? `${selectedCoupon.value}% OFF`
                                                        : `Rp ${selectedCoupon.value.toLocaleString()}`}
                                                </h3>
                                                <p className="text-sm text-[#8C6A53] mt-1 italic leading-relaxed">
                                                    "{selectedCoupon.desc}"
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E8DFD5]">
                                                <div>
                                                    <p className="text-[9px] font-bold text-[#C9B8AA] uppercase">Min. Purchase</p>
                                                    <p className="text-sm font-bold text-[#4A3728]">Rp {selectedCoupon.minPurchase?.toLocaleString() || '0'}</p>
                                                </div>
                                                {selectedCoupon.maxDiscount && (
                                                    <div>
                                                        <p className="text-[9px] font-bold text-[#C9B8AA] uppercase">Max Cap</p>
                                                        <p className="text-sm font-bold text-[#4A3728]">Rp {selectedCoupon.maxDiscount.toLocaleString()}</p>
                                                    </div>
                                                )}
                                            </div>
                                            {
                                                new Date(selectedCoupon.expiresAt).toLocaleDateString() != 'Invalid Date' ?
                                                    <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-100">
                                                        <Calendar size={14} />
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">
                                                            Expires: {new Date(selectedCoupon.expiresAt).toLocaleDateString()}
                                                        </span>
                                                    </div> : null
                                            }
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center">
                                            <Tag className="mx-auto text-[#E8DFD5] mb-2" size={40} />
                                            <p className="text-xs text-[#C9B8AA] font-medium">Please select a coupon to see benefits</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* FOOTER ACTIONS */}
                        <div className="p-8 bg-[#FDFBF7] border-t border-[#E8DFD5] space-y-4">
                            <button
                                onClick={handleApply}
                                disabled={!selectedCoupon}
                                className="w-full bg-[#4A3728] text-white py-5 rounded-2xl font-bold uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-[#382a1f] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                <CheckCircle2 size={18} />
                                Apply to {selectedUsers.length} Users
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-2 text-[#8C6A53] text-[10px] font-bold uppercase tracking-widest hover:text-[#4A3728] transition-colors"
                            >
                                Cancel Assignment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignCouponModal;