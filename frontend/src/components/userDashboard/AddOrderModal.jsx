import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, ShoppingBag, Plus, Minus, Trash2, Coffee } from 'lucide-react';
import { createOrder, getAvailableCouponsByUser } from '../../data/service';
import { Toast } from '../../utils/Toast';

const NewUserOrder = ({ isOpen, onClose, productList, onRefresh, couponlist = [] }) => {
    const [menuSearch, setMenuSearch] = useState(""); // State for menu search
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [coupons, setCoupons] = useState([]);
    const [cart, setCart] = useState([]);

    const processOrder = async () => {
        var orderData = {
            userId: null,
            guestName: "Walk-in Guest",
            items: cart,
            couponCode: selectedCoupon?.couponId?.code ? selectedCoupon.couponId.code : null,
            totalAmount: total
        }
        try {
            Toast.fire({
                icon: 'success',
                iconColor: '#10b981',
                title: 'Fitur sedang dikerjakan',
                background: '#ecfdf5',
                color: '#065f46'
            });
            clearState();
            onClose();
            onRefresh();
            // const res = await createOrder(orderData);
            // if (res.ok) {
            //     Toast.fire({
            //         icon: 'success',
            //         iconColor: '#10b981',
            //         title: 'Order Processed',
            //         background: '#ecfdf5',
            //         color: '#065f46'
            //     });
            //     clearState();
            //     onClose();
            //     onRefresh();
            // } else {
            //     Toast.fire({
            //         icon: 'error',
            //         iconColor: '#f43f5e',
            //         title: 'Action Failed',
            //         background: '#fff1f2',
            //         color: '#9f1239'
            //     });
            //     clearState();
            //     onClose();
            // }
        }
        catch (err) {
            console.error("Error creating order:", err);
            alert("An error occurred while processing the order.");
        }
    }

    const clearState = () => {
        setCart([]);
        setMenuSearch("");
        setSelectedCoupon(null);
    };

    const getAvailableStockForProduct = (product) => {
        if (!product || !product.composition || product.composition.length === 0) return Infinity;

        const materialUsage = {};
        for (const item of cart) {
            const cartProduct = productList.find(p => p._id === item.productId);
            if (cartProduct && cartProduct.composition) {
                for (const comp of cartProduct.composition) {
                    if (comp.materialId && comp.materialId._id) {
                        const matId = comp.materialId._id;
                        materialUsage[matId] = (materialUsage[matId] || 0) + (comp.quantity * item.quantity);
                    }
                }
            }
        }

        let minPossible = Infinity;
        for (const comp of product.composition) {
            if (comp.materialId && comp.materialId._id) {
                const matId = comp.materialId._id;
                const totalStock = comp.materialId.stock || 0;
                const used = materialUsage[matId] || 0;
                const remainingStock = Math.max(0, totalStock - used);
                const possibleWithRemaining = Math.floor(remainingStock / comp.quantity);
                if (possibleWithRemaining < minPossible) {
                    minPossible = possibleWithRemaining;
                }
            }
        }
        return minPossible;
    };

    // Cart State
    const minusCart = (productId) => {
        setCart(cart.map(item => item.productId === productId
            ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item));
    };
    const plusCart = (productId) => {
        const product = productList.find(p => p._id === productId);
        if (getAvailableStockForProduct(product) > 0) {
            setCart(cart.map(item => item.productId === productId
                ? { ...item, quantity: item.quantity + 1 } : item));
        }
    };

    // Filtered menu/product list
    const filteredProducts = useMemo(() => {
        if (!menuSearch) return productList;
        return productList.filter(product =>
            product.name.toLowerCase().includes(menuSearch.toLowerCase())
        );
    }, [menuSearch, productList]);

    const subtotal = useMemo(() => {
        return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    }, [cart]);

    const discountCalculation = useMemo(() => {
        if (!selectedCoupon || !selectedCoupon.couponId) return { amount: 0, error: null };

        const { minPurchase, maxDiscount, type, value } = selectedCoupon.couponId;

        if (subtotal < minPurchase) {
            return { amount: 0, error: `Min. purchase Rp ${minPurchase.toLocaleString()} required` };
        }

        let calculatedDiscount = 0;
        if (type === 'percentage') {
            calculatedDiscount = Math.floor(subtotal * (value / 100));
            if (maxDiscount > 0 && calculatedDiscount > maxDiscount) {
                calculatedDiscount = maxDiscount;
            }
        } else {
            calculatedDiscount = value;
        }

        return { amount: calculatedDiscount, error: null };
    }, [selectedCoupon, subtotal]);

    const total = Math.max(0, subtotal - discountCalculation.amount);

    const addToCart = (product) => {
        if (getAvailableStockForProduct(product) <= 0) return;

        const existing = cart.find(item => item.productId === product._id);
        if (existing) {
            setCart(cart.map(item => item.productId === product._id
                ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { productId: product._id, name: product.name, price: product.price, quantity: 1 }]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
            <div className="absolute inset-0 bg-[#4A3728]/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-white w-full max-w-6xl h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-[#E8DFD5]">

                {/* HEADER */}
                <div className="px-8 py-6 bg-[#FDFBF7] border-b border-[#E8DFD5] flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#4A3728] p-3 rounded-2xl text-white">
                            <Coffee size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-[#4A3728]">New Quick Order</h2>
                            <p className="text-[10px] text-[#8C6A53] font-bold uppercase tracking-[0.2em] mt-0.5">Admin Terminal</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#F5EFE6] rounded-full text-[#8C6A53] transition-colors"><X size={28} /></button>
                </div>

                <div className="flex flex-1 overflow-hidden">

                    {/* LEFT SIDE: MENU LIST ONLY */}
                    <div className="w-[65%] flex flex-col bg-[#FDFBF7]/50 border-r border-[#E8DFD5]">
                        <div className="flex-1 p-8 overflow-y-auto flex flex-col">

                            {/* Search & Header Section */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <div>
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-[#8C6A53] block mb-1">Menu Catalog</label>
                                    <h3 className="font-serif font-bold text-xl text-[#4A3728]">Select Items</h3>
                                </div>

                                {/* Menu Search Bar */}
                                <div className="relative w-full md:w-80">
                                    <Search className="absolute left-4 top-3.5 text-[#C9B8AA]" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search menu item..."
                                        className="w-full pl-11 pr-11 py-3 text-sm bg-white border border-[#E8DFD5] rounded-2xl outline-none focus:border-[#4A3728] text-[#4A3728] transition-colors shadow-sm"
                                        value={menuSearch}
                                        onChange={(e) => setMenuSearch(e.target.value)}
                                    />
                                    {menuSearch && (
                                        <button
                                            onClick={() => setMenuSearch("")}
                                            className="absolute right-4 top-3.5 text-[#C9B8AA] hover:text-[#4A3728]"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Menu Grid */}
                            {filteredProducts.length > 0 ? (
                                <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredProducts.map(product => {
                                        const availableStock = getAvailableStockForProduct(product);
                                        const isOutOfStock = product.isAvailable === false || availableStock <= 0;
                                        return (
                                            <button
                                                key={product._id}
                                                onClick={() => addToCart(product)}
                                                disabled={isOutOfStock}
                                                className={`group flex flex-col justify-between p-6 bg-white border border-[#E8DFD5] rounded-4xl transition-all h-40 shadow-sm ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-50 grayscale shadow-none' : 'hover:border-[#4A3728] hover:shadow-md'}`}
                                            >
                                                <span className="font-serif font-bold text-[#4A3728] text-lg leading-tight text-left">
                                                    {product.name}
                                                </span>
                                                <div className="flex justify-between items-end w-full">
                                                    <div className="flex flex-col items-start">
                                                        <span className="font-bold text-[#8C6A53]">Rp {product.price.toLocaleString()}</span>
                                                        {product.isAvailable !== false && availableStock !== Infinity && (
                                                            <span className="text-[10px] font-bold text-[#D9C5B2] uppercase mt-1">Stok: {availableStock}</span>
                                                        )}
                                                        {isOutOfStock && <span className="text-[10px] font-bold text-red-500 uppercase mt-1">Habis</span>}
                                                    </div>
                                                    {!isOutOfStock && (
                                                        <div className="p-2 bg-[#FDFBF7] border border-[#E8DFD5] rounded-2xl group-hover:bg-[#4A3728] group-hover:text-white transition-colors">
                                                            <Plus size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-[#8C6A53] py-12">
                                    <Coffee size={40} className="stroke-1 opacity-60 mb-2 animate-pulse" />
                                    <p className="text-sm font-medium">No menu items match "{menuSearch}"</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT SIDE: BASKET */}
                    <div className="w-[35%] flex flex-col bg-white">
                        <div className="p-8 flex-1 overflow-y-auto">
                            <div className="flex items-center gap-2 mb-8 border-b border-[#F5EFE6] pb-4">
                                <ShoppingBag size={20} className="text-[#4A3728]" />
                                <h3 className="font-serif font-bold text-xl text-[#4A3728]">Current Basket</h3>
                            </div>

                            {cart.length > 0 ? (
                                cart.map(item => (
                                    <div key={item.productId} className="flex flex-col p-4 bg-[#FDFBF7] rounded-3xl border border-[#E8DFD5] mb-3">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-bold text-[#4A3728] text-sm text-left">{item.name}</p>
                                            <button onClick={() => setCart(cart.filter(i => i.productId !== item.productId))} className="text-[#C9B8AA] hover:text-red-400"><Trash2 size={16} /></button>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-[#8C6A53] text-sm">Rp {(item.price * item.quantity).toLocaleString()}</span>
                                            <div className="flex items-center gap-3 bg-white border border-[#E8DFD5] rounded-xl px-2 py-1">
                                                <button onClick={() => minusCart(item.productId)} className="p-1 text-[#8C6A53]"><Minus size={14} /></button>
                                                <span className="text-sm font-bold text-[#4A3728]">{item.quantity}</span>
                                                <button onClick={() => plusCart(item.productId)} disabled={getAvailableStockForProduct(productList.find(p => p._id === item.productId)) <= 0} className="p-1 text-[#8C6A53] disabled:opacity-30"><Plus size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-48 flex flex-col items-center justify-center text-[#C9B8AA] gap-2">
                                    <ShoppingBag size={32} className="stroke-1" />
                                    <p className="text-xs font-medium">Basket is empty</p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-[#FDFBF7] border-t border-[#E8DFD5] space-y-6">
                            {/* COUPON SECTION */}
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-widest text-[#8C6A53] mb-3 block">
                                    Apply Coupon
                                </label>
                                <select
                                    disabled={cart.length === 0}
                                    value={selectedCoupon?._id || ""}
                                    onChange={(e) => {
                                        const coupon = couponlist.find(c => c._id === e.target.value);
                                        setSelectedCoupon(coupon || null);
                                    }}
                                    className="w-full bg-white border border-[#E8DFD5] rounded-xl px-4 py-3 text-sm text-[#4A3728] outline-none focus:border-[#4A3728] disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
                                >
                                    <option value="">Select a coupon...</option>
                                    {couponlist.length > 0 && couponlist.map(coupon => (
                                        <option key={coupon._id} value={coupon._id}>
                                            {coupon.couponId.code} - Discount {coupon.couponId.type === 'percentage' ? `${coupon.couponId.value}%` : `Rp ${coupon.couponId.value.toLocaleString()}`}
                                        </option>
                                    ))}
                                </select>
                                {discountCalculation.error && <p className="text-[10px] text-red-500 mt-1 italic">{discountCalculation.error}</p>}
                            </div>

                            {/* TOTAL SECTION */}
                            <div className="pt-4 border-t border-[#E8DFD5] space-y-2">
                                <div className="flex justify-between items-center text-sm text-[#8C6A53]">
                                    <span>Subtotal</span>
                                    <span>Rp {subtotal.toLocaleString()}</span>
                                </div>
                                {discountCalculation.amount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Discount</span>
                                        <span>- Rp {discountCalculation.amount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2 border-t border-[#E8DFD5]">
                                    <span className="font-serif font-bold text-[#4A3728] text-xl">Total</span>
                                    <span className="font-serif font-bold text-[#4A3728] text-3xl">Rp {total.toLocaleString()}</span>
                                </div>
                            </div>

                            <button onClick={processOrder} disabled={cart.length === 0} className="w-full bg-[#4A3728] text-white py-5 rounded-2xl font-bold uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-[#382a1f] transition-all disabled:opacity-30">
                                Process Order
                            </button>
                        </div>
                        <button onClick={() => {
                            clearState();
                            onClose();
                        }} className="w-full py-3 text-[#8C6A53] text-[10px] font-bold uppercase tracking-widest hover:text-[#4A3728] transition-colors">
                            Discard Draft
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewUserOrder;