import React, { useEffect, useState } from 'react';
import { User, Star, CheckCircle2, Clock, History, PackageOpen, XCircle } from 'lucide-react';
import OrderHistoryTable from './OrderHistoryTable';
import { Toast } from '../../utils/Toast';
import { completeStatus } from '../../data/service';

const OrderManager = ({ orders, onRefresh, onDetail, orderTab = 'ongoing' }) => {
    const [activeTab, setActiveTab] = useState('ongoing');
    useEffect(() => {
        if (orderTab === 'history') {
            setActiveTab('history');
        }
    }, [orderTab]);

    // Check against the string value from your backend data
    const ongoingOrders = orders.filter((o) => o.status === "processing");
    const historyOrders = orders.filter((o) => o.status === "completed" || o.status === "cancelled");
    const onComplete = async (data) => {
        const id = data._id;
        const status = "completed";
        try {
            const res = await completeStatus(id, status);
            if (res.ok) {
                Toast.fire({
                    icon: 'success',
                    iconColor: '#10b981',
                    title: 'Order Completed',

                    background: '#ecfdf5',
                    color: '#065f46'
                });
                onRefresh();
            } else {
                Toast.fire({
                    icon: 'error',
                    iconColor: '#f43f5e',
                    title: 'Action Failed',
                    background: '#fff1f2',
                    color: '#9f1239'
                });
            }
        } catch (err) {
            console.error("Error updating order status:", err);
            alert("Failed to update order status");
        }
    }
    const onCancel = async (data) => {
        const id = data._id;
        const status = "cancelled";
        try {
            const res = await completeStatus(id, status);
            if (res.ok) {
                Toast.fire({
                    icon: 'success',
                    iconColor: '#10b981',
                    title: 'Order Cancelled',

                    background: '#ecfdf5',
                    color: '#065f46'
                });
                onRefresh();
            } else {
                Toast.fire({
                    icon: 'error',
                    iconColor: '#f43f5e',
                    title: 'Action Failed',
                    background: '#fff1f2',
                    color: '#9f1239'
                });
            }
        } catch (err) {
            console.error("Error updating order status:", err);
            alert("Failed to update order status");
        }
    }
    return (
        <div className="max-w-full mx-auto p-6">
            {/* --- TAB NAVIGATION --- */}
            <div className="flex items-center justify-between mb-8 border-b border-[#E8DFD5]">
                <div className="flex gap-8">
                    <TabButton
                        active={activeTab == 'ongoing'}
                        onClick={() => setActiveTab('ongoing')}
                        label="Ongoing"
                        count={ongoingOrders.length}
                        icon={<Clock size={18} />}
                    />
                    <TabButton
                        active={activeTab === 'history'}
                        onClick={() => setActiveTab('history')}
                        label="History"
                        icon={<History size={18} />}
                    />
                </div>

                <div className="text-right pb-2">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-[#8C6A53]">Store Status</p>
                    <div className="flex items-center gap-2 justify-end">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-sm font-bold text-[#4A3728]">Open</span>
                    </div>
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="transition-all duration-300">
                {activeTab === 'ongoing' ? (
                    <section className="animate-in fade-in slide-in-from-bottom-2">
                        {ongoingOrders.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {ongoingOrders.map(order => (
                                    <OrderCard key={order.id} order={order} onComplete={() => {
                                        onComplete(order);
                                    }} onCancel={() => {
                                        onCancel(order)
                                    }} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState message="No pending orders" sub="Time to clean the espresso machine!" />
                        )}
                    </section>
                ) : (
                    <section className="animate-in fade-in slide-in-from-bottom-2">
                        <div className="overflow-hidden">
                            <OrderHistoryTable data={historyOrders} onDetail={onDetail} />
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const TabButton = ({ active, onClick, label, count, icon }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 pb-4 px-1 transition-all relative font-bold text-sm ${active ? 'text-[#4A3728]' : 'text-[#8C6A53] hover:text-[#4A3728]'
            }`}
    >
        {icon}
        {label}
        {count !== undefined && (
            <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${active ? 'bg-[#4A3728] text-white' : 'bg-[#F5EFE6] text-[#8C6A53]'
                }`}>
                {count}
            </span>
        )}
        {active && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#8C6A53] rounded-t-full" />
        )}
    </button>
);

const EmptyState = ({ message, sub }) => (
    <div className="flex flex-col items-center justify-center py-20 bg-[#FDFBF7] rounded-3xl border-2 border-dashed border-[#E8DFD5]">
        <div className="w-16 h-16 bg-[#F5EFE6] rounded-full flex items-center justify-center mb-4 text-[#8C6A53]">
            <PackageOpen size={32} />
        </div>
        <h3 className="text-lg font-bold text-[#4A3728]">{message}</h3>
        <p className="text-[#8C6A53] text-sm">{sub}</p>
    </div>
);
const OrderCard = ({ order, onComplete, onCancel }) => {
    const isMember = !!order.userId;
    const items = order.orderDetails || [];

    return (
        <div className="bg-[#FDFBF7] border border-[#E8DFD5] rounded-3xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    {/* Avatar Logic */}
                    <div className="w-12 h-12 rounded-2xl bg-[#F5EFE6] flex items-center justify-center overflow-hidden border border-[#E8DFD5]">
                        {isMember ? (
                            <div className="bg-[#8C6A53] w-full h-full flex items-center justify-center text-white font-bold">
                                {order.userId.username?.[0].toUpperCase()}
                            </div>
                        ) : (
                            <User size={20} className="text-[#8C6A53]" />
                        )}
                    </div>

                    <div>
                        <div className="flex items-center gap-1">
                            <h4 className="font-bold text-[#4A3728]">
                                {isMember ? order.userId.username : (order.guestName || "Guest")}
                            </h4>
                            {isMember && <Star size={14} className="fill-emerald-500 text-emerald-500" />}
                        </div>
                        <p className="text-xs text-[#8C6A53] font-medium">
                            {isMember ? order.userId.email : "Walk-in Customer"}
                        </p>
                    </div>
                </div>
                <span className="text-[10px] font-bold text-[#8C6A53] bg-[#F5EFE6] px-2 py-1 rounded-full uppercase">
                    #{order._id.slice(-5)}
                </span>
            </div>

            {/* Items List */}
            <div className="bg-white/50 rounded-2xl p-3 mb-4 border border-[#F5EFE6] space-y-2">
                {items.map((item) => (
                    <div key={item._id} className="flex justify-between text-sm">
                        <span className="text-[#4A3728]">
                            <span className="font-bold">{item.quantity}x</span> {item.productId?.name}
                        </span>
                        <span className="text-[#8C6A53]">
                            Rp {(item.price * item.quantity).toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-1 mb-4 px-1">
                {order.discountAmount > 0 && (
                    <>
                        <div className="flex justify-between items-center text-xs text-[#8C6A53]">
                            <span>Subtotal</span>
                            <span>Rp {order.subtotalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-emerald-600 font-medium">
                            <span>Discount</span>
                            <span>- Rp {order.discountAmount.toLocaleString()}</span>
                        </div>
                        <div className="border-t border-dashed border-[#E8DFD5] my-2" />
                    </>
                )}

                <div className="flex justify-between items-center">
                    <span className="text-xs text-[#8C6A53] font-bold uppercase tracking-wider">Total</span>
                    <span className="text-lg font-serif font-bold text-[#4A3728]">
                        Rp {order.totalAmount.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-2">
                <button
                    onClick={onCancel}
                    className="flex-1 bg-white border border-[#E8DFD5] hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-[#8C6A53] py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                    <XCircle size={18} />
                    Cancel
                </button>
                <button
                    onClick={onComplete}
                    className="flex-[2] bg-[#4A3728] hover:bg-[#382a1f] text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-[#4A3728]/10"
                >
                    <CheckCircle2 size={18} />
                    Complete
                </button>
            </div>
        </div>
    );
};

export default OrderManager;