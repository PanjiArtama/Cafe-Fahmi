import React from 'react';
import {
    ShoppingBag,
    Wallet,
    Tag,
    Receipt,
    History,
    ArrowUpRight
} from 'lucide-react';

const FrontPage = ({ orders = [], dailyStats = {}, onViewAll }) => {

    const displayStats = [
        {
            label: 'Total Income',
            value: `Rp ${dailyStats.totalRevenue?.toLocaleString() || '0'}`,
            icon: Wallet,
            color: 'text-emerald-600 bg-emerald-50'
        },
        {
            label: 'Orders Today',
            value: dailyStats.totalOrders || '0',
            icon: ShoppingBag,
            color: 'text-blue-600 bg-blue-50'
        },
        {
            label: 'Discounts Given',
            value: `Rp ${dailyStats.totalDiscount?.toLocaleString() || '0'}`,
            icon: Tag,
            color: 'text-orange-600 bg-orange-50'
        },
    ];

    return (
        <div className="p-8 space-y-10 bg-[#FDFBF7] min-h-screen">

            {/* --- HEADER --- */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-[#4A3728]">Today Overview</h1>
                    <p className="text-[#8C6A53] text-sm font-medium mt-1">Daily performance and live transaction stream.</p>
                </div>

            </div>

            {/* --- CORE STATS (3-Column Grid) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {displayStats.map((stat, i) => (
                    <div key={i} className="bg-white border border-[#E8DFD5] p-8 rounded-[2.5rem] shadow-sm group hover:border-[#D9C5B2] transition-all">
                        <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                            <stat.icon size={28} />
                        </div>
                        <p className="text-[10px] font-bold text-[#8C6A53] uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <h3 className="text-4xl font-bold text-[#4A3728]">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* --- FULL WIDTH RECENT ORDERS --- */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#4A3728] rounded-lg">
                            <History size={18} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-[#4A3728]">Recent Orders</h2>
                    </div>
                    <button className="flex items-center gap-2 text-[10px] font-bold text-[#8C6A53] uppercase tracking-widest hover:text-[#4A3728] transition-all group" onClick={onViewAll}>
                        View All Transactions <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                </div>

                <div className="bg-white border border-[#E8DFD5] rounded-[3.5rem] overflow-hidden shadow-sm">
                    <div className="divide-y divide-[#F5EFE6]">
                        {orders.filter(order => order.status === 'completed' || order.status === 'cancelled').length > 0 ? (
                            orders
                                .filter(order => order.status === 'completed' || order.status === 'cancelled')
                                .slice(0, 8)
                                .map((order) => (
                                    <div key={order._id} className="p-8 flex flex-wrap items-center justify-between hover:bg-[#FDFBF7] transition-colors cursor-pointer">
                                        <div className="flex items-center gap-6 min-w-[300px]">
                                            <div className="w-14 h-14 rounded-2xl bg-[#F5EFE6] flex items-center justify-center text-[#8C6A53]">
                                                <Receipt size={24} />
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold text-[#4A3728]">
                                                    {order.userId?.username || order.guestName || 'Guest Customer'}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] text-[#8C6A53] font-bold uppercase tracking-tight">
                                                        {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        <br />
                                                        {new Date(order.orderDate).toLocaleDateString()}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-[#D9C5B2]" />
                                                    <span className="text-[10px] text-[#8C6A53] font-bold uppercase tracking-tight">
                                                        {order.orderDetails?.length || 0} Items
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-12">
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-[#D9C5B2] uppercase tracking-widest mb-1">Status</p>
                                                <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${order.status === 'completed'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    : 'bg-orange-50 text-orange-700 border-orange-100'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>

                                            <div className="text-right min-w-[120px]">
                                                <p className="text-[10px] font-bold text-[#D9C5B2] uppercase tracking-widest mb-1">Total Amount</p>
                                                <p className="text-xl font-bold text-[#4A3728]">Rp {order.totalAmount.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <div className="p-20 text-center">
                                <p className="text-[#8C6A53] font-medium italic">No transactions recorded yet today.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FrontPage;