import React from 'react';
import { X, Receipt, User, Calendar, Coffee, Tag, ChevronRight, Clock } from 'lucide-react';

const OrderDetailModal = ({ isOpen, onClose, order }) => {
    if (!isOpen || !order) return null;

    const username = order.guestName ? order.guestName : order.userId?.username || 'Unknown User'
    const isGuest = order.guestName ? true : false
    const guestName = order.guestName
    const subtotalAmount = order.subtotalAmount
    const totalAmount = order.totalAmount
    const discountAmount = order.discountAmount
    const couponCode = order.couponId ? order.couponId.code : null
    const status = order.status
    const orderDetails = order.orderDetails
    const createdAt = order.createdAt

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[#4A3728]/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-white w-full max-w-5xl h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-[#E8DFD5]">
                
                {/* HEADER */}
                <div className="px-8 py-6 bg-[#FDFBF7] border-b border-[#E8DFD5] flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#4A3728] p-3 rounded-2xl text-white">
                            <Receipt size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-[#4A3728]">Order Specification</h2>
                            <p className="text-[10px] text-[#8C6A53] font-bold uppercase tracking-[0.2em] mt-0.5">Reference ID: {order._id?.substring(0, 8).toUpperCase()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                            status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                            {status}
                        </span>
                        <button onClick={onClose} className="p-2 hover:bg-[#F5EFE6] rounded-full text-[#8C6A53] transition-colors">
                            <X size={28} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* LEFT SIDE: CUSTOMER & ITEMS */}
                    <div className="w-[60%] flex flex-col bg-[#FDFBF7]/50 border-r border-[#E8DFD5]">
                        <div className="p-8 space-y-8 overflow-y-auto">
                            
                            {/* Customer Section */}
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-widest text-[#8C6A53] mb-4 block italic">Customer Information</label>
                                <div className="flex items-center p-5 bg-white border border-[#E8DFD5] rounded-3xl shadow-sm">
                                    <div className="w-12 h-12 bg-[#4A3728] text-white rounded-2xl flex items-center justify-center mr-4">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <p className="font-serif font-bold text-[#4A3728] text-lg">
                                            {isGuest ? guestName : username}
                                        </p>
                                        <p className="text-[10px] font-bold text-[#8C6A53] uppercase tracking-wider">
                                            {isGuest ? "Guest Checkout" : "Registered Member"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items Section */}
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-widest text-[#8C6A53] mb-4 block italic">Order Items</label>
                                <div className="space-y-3">
                                    {orderDetails.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-white border border-[#E8DFD5] rounded-2xl group hover:border-[#4A3728] transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-[#FDFBF7] rounded-xl text-[#4A3728]">
                                                    <Coffee size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#4A3728] text-sm">{item.productId.name}</p>
                                                    <p className="text-xs text-[#8C6A53]">Qty: {item.quantity} × Rp {item.price.toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-[#4A3728]">
                                                Rp {(item.quantity * item.price).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: SUMMARY & DATE */}
                    <div className="w-[40%] flex flex-col bg-white">
                        <div className="p-8 flex-1 overflow-y-auto space-y-6">
                            
                            {/* Date & Time */}
                            <div className="p-6 bg-[#FDFBF7] rounded-3xl border border-[#E8DFD5]">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#8C6A53] flex items-center gap-2 mb-3">
                                    <Clock size={14} /> Timestamp
                                </label>
                                <p className="text-[#4A3728] font-bold">
                                    {new Date(createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                                <p className="text-xs text-[#8C6A53]">
                                    {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>

                            {/* Financial Summary */}
                            <div className="space-y-4">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-[#8C6A53] block italic">Payment Summary</label>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-[#8C6A53]">
                                        <span>Subtotal</span>
                                        <span className="font-bold">Rp {subtotalAmount.toLocaleString()}</span>
                                    </div>

                                    {couponCode && (
                                        <div className="flex justify-between items-center p-3 bg-green-50 border border-green-100 rounded-xl">
                                            <div className="flex items-center gap-2 text-green-700">
                                                <Tag size={14} />
                                                <span className="text-[10px] font-bold uppercase">{couponCode}</span>
                                            </div>
                                            <span className="text-sm font-bold text-green-700">- Rp {discountAmount?.toLocaleString()}</span>
                                        </div>
                                    )}

                                    <div className="pt-4 mt-4 border-t border-[#E8DFD5] flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-[#8C6A53]">Grand Total</p>
                                            <p className="text-4xl font-serif font-bold text-[#4A3728]">
                                                Rp {totalAmount.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="p-8 bg-[#FDFBF7] border-t border-[#E8DFD5]">
                            <button 
                                onClick={() => window.print()}
                                className="w-full bg-[#4A3728] text-white py-5 rounded-2xl font-bold uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-[#382a1f] transition-all flex items-center justify-center gap-3"
                            >
                                <Receipt size={18} />
                                Print Receipt
                            </button>
                            <button 
                                onClick={onClose}
                                className="w-full py-3 mt-2 text-[#8C6A53] text-[10px] font-bold uppercase tracking-widest hover:text-[#4A3728] transition-colors"
                            >
                                Close Detail
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;