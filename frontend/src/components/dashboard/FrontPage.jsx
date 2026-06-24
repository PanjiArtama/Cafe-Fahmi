import React, { useState, useEffect } from 'react';
import {
    ShoppingBag,
    Wallet,
    Tag,
    Receipt,
    History,
    ArrowUpRight,
    TrendingUp,
    Trophy
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getOrderStats, getOrderHistory } from '../../data/service';

const FrontPage = ({ onViewAll }) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const [startDate, setStartDate] = useState(startOfWeek.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
    const [topSellerLimit, setTopSellerLimit] = useState(5);

    const [stats, setStats] = useState({ totalIncome: 0, totalOrdersCount: 0, totalDiscount: 0 });
    const [salesData, setSalesData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [statsRes, historyRes] = await Promise.all([
                    getOrderStats(startDate, endDate),
                    getOrderHistory({ page: 1, limit: 8, startDate, endDate })
                ]);
                if (isMounted) {
                    setStats(statsRes.stats || { totalIncome: 0, totalOrdersCount: 0, totalDiscount: 0 });
                    setSalesData(statsRes.salesData || []);
                    setTopProducts(statsRes.topProducts || []);
                    setRecentOrders(historyRes.data || []);
                }
            } catch (error) {
                console.error("Error fetching dashboard stats/history:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchData();
        return () => {
            isMounted = false;
        };
    }, [startDate, endDate]);

    const displayStats = [
        {
            label: 'Total Income',
            value: `Rp ${stats.totalIncome.toLocaleString()}`,
            icon: Wallet,
            color: 'text-emerald-600 bg-emerald-50'
        },
        {
            label: 'Orders',
            value: stats.totalOrdersCount,
            icon: ShoppingBag,
            color: 'text-blue-600 bg-blue-50'
        },
        {
            label: 'Discounts Given',
            value: `Rp ${stats.totalDiscount.toLocaleString()}`,
            icon: Tag,
            color: 'text-orange-600 bg-orange-50'
        },
    ];

    if (isLoading) {
        return (
            <div className="p-8 space-y-10 bg-[#FDFBF7] min-h-screen animate-pulse">
                {/* Header skeleton */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                    <div className="space-y-2">
                        <div className="h-8 w-48 bg-[#E8DFD5] rounded-lg"></div>
                        <div className="h-4 w-64 bg-[#E8DFD5] rounded-lg"></div>
                    </div>
                    <div className="h-12 w-80 bg-white border border-[#E8DFD5] rounded-2xl shadow-sm"></div>
                </div>

                {/* Stats cards skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white border border-[#E8DFD5] p-8 rounded-[2.5rem] shadow-sm">
                            <div className="w-14 h-14 bg-[#E8DFD5] rounded-2xl mb-6"></div>
                            <div className="h-3 w-24 bg-[#E8DFD5] rounded-lg mb-2"></div>
                            <div className="h-8 w-32 bg-[#E8DFD5] rounded-lg"></div>
                        </div>
                    ))}
                </div>

                {/* Analytics skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white border border-[#E8DFD5] p-8 rounded-[2.5rem] shadow-sm h-[32rem]">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-[#E8DFD5] rounded-xl"></div>
                            <div className="space-y-2">
                                <div className="h-5 w-28 bg-[#E8DFD5] rounded-lg"></div>
                                <div className="h-3 w-36 bg-[#E8DFD5] rounded-lg"></div>
                            </div>
                        </div>
                        <div className="h-[24rem] bg-[#FDFBF7] rounded-2xl border border-dashed border-[#E8DFD5]"></div>
                    </div>
                    <div className="bg-white border border-[#E8DFD5] p-8 rounded-[2.5rem] shadow-sm h-[32rem]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-[#E8DFD5] rounded-xl"></div>
                            <div className="space-y-2">
                                <div className="h-5 w-28 bg-[#E8DFD5] rounded-lg"></div>
                                <div className="h-3 w-36 bg-[#E8DFD5] rounded-lg"></div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-16 bg-[#FDFBF7] rounded-2xl border border-[#E8DFD5]"></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent orders skeleton */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#E8DFD5] rounded-lg"></div>
                            <div className="h-6 w-36 bg-[#E8DFD5] rounded-lg"></div>
                        </div>
                        <div className="h-4 w-32 bg-[#E8DFD5] rounded-lg"></div>
                    </div>
                    <div className="bg-white border border-[#E8DFD5] rounded-[3.5rem] h-64"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-10 bg-[#FDFBF7] min-h-screen">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-[#4A3728]">Overview</h1>
                    <p className="text-[#8C6A53] text-sm font-medium mt-1">Performance and transaction stream.</p>
                </div>
                
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-[#E8DFD5] shadow-sm">
                    <div className="flex items-center gap-2 px-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6A53]">From</span>
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-[#FDFBF7] border border-[#E8DFD5] text-[#4A3728] text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#D9C5B2] font-medium"
                        />
                    </div>
                    <div className="w-px h-6 bg-[#E8DFD5]"></div>
                    <div className="flex items-center gap-2 px-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6A53]">To</span>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-[#FDFBF7] border border-[#E8DFD5] text-[#4A3728] text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#D9C5B2] font-medium"
                        />
                    </div>
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

            {/* --- ANALYTICS SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white border border-[#E8DFD5] p-8 rounded-[2.5rem] shadow-sm group hover:border-[#D9C5B2] transition-colors">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-[#F5EFE6] rounded-xl text-[#8C6A53]">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-serif font-bold text-[#4A3728]">Sales Trend</h2>
                            <p className="text-[10px] text-[#8C6A53] uppercase tracking-[0.2em] font-bold mt-1">Revenue over time</p>
                        </div>
                    </div>
                    <div className="h-75 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8C6A53" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8C6A53" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8DFD5" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8C6A53', fontSize: 12, fontWeight: 600 }} dy={10} />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#8C6A53', fontSize: 12, fontWeight: 600 }}
                                    tickFormatter={(value) => `Rp ${(value / 1000)}k`}
                                    dx={-10}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                    formatter={(value) => [`Rp ${value.toLocaleString()}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#8C6A53" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white border border-[#E8DFD5] p-8 rounded-[2.5rem] shadow-sm flex flex-col group hover:border-[#D9C5B2] transition-colors">
                    <div className="flex items-start justify-between mb-6 gap-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 rounded-xl text-amber-600 shrink-0">
                                <Trophy size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-serif font-bold text-[#4A3728]">Top Sellers</h2>
                                <p className="text-[10px] text-[#8C6A53] uppercase tracking-[0.2em] font-bold mt-1">By Quantity Sold</p>
                            </div>
                        </div>
                        <select 
                            value={topSellerLimit} 
                            onChange={(e) => setTopSellerLimit(Number(e.target.value))}
                            className="bg-[#FDFBF7] border border-[#E8DFD5] text-[#8C6A53] text-[10px] font-bold rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#D9C5B2] cursor-pointer uppercase tracking-wider shrink-0 mt-1"
                        >
                            <option value={5}>Top 5</option>
                            <option value={10}>Top 10</option>
                            <option value={15}>Top 15</option>
                        </select>
                    </div>
                    <div className="flex-1 space-y-4 overflow-y-auto max-h-[22rem]">
                        {topProducts.length > 0 ? topProducts.slice(0, topSellerLimit).map((product, index) => (
                            <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-[#FDFBF7] border border-[#E8DFD5] hover:border-[#8C6A53] hover:shadow-md transition-all cursor-default">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-amber-100 text-amber-600' : index === 1 ? 'bg-slate-100 text-slate-600' : index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-[#E8DFD5] text-[#8C6A53]'}`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-[#4A3728] truncate text-sm">{product.name}</p>
                                    <p className="text-xs text-[#8C6A53] font-medium mt-0.5">{product.quantity} items sold</p>
                                </div>
                            </div>
                        )) : (
                            <div className="h-full flex items-center justify-center text-[#8C6A53] text-sm italic font-medium bg-[#FDFBF7] rounded-2xl border border-dashed border-[#E8DFD5] min-h-[10rem]">
                                No sales data available.
                            </div>
                        )}
                    </div>
                </div>
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
                        {recentOrders.length > 0 ? (
                            recentOrders
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
                                <p className="text-[#8C6A53] font-medium italic">No transactions recorded yet in this range.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FrontPage;