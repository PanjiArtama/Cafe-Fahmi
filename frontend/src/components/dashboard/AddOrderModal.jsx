import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, ShoppingBag, User, UserPlus, Plus, Minus, Trash2, CheckCircle2, Coffee, QrCode, CameraOff } from 'lucide-react';
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { createOrder, getAvailableCouponsByUser, getDataFromQR } from '../../data/service';
import { Toast } from '../../utils/Toast';

const NewOrderModal = ({ isOpen, onClose, productList, userList, onRefresh }) => {
    const [isGuest, setIsGuest] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [guestName, setGuestName] = useState("");
    const [userSearch, setUserSearch] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [coupons, setCoupons] = useState([]);
    const [cart, setCart] = useState([]);
    useEffect(() => {
        const fetchCoupons = async () => {
            const c = await getAvailableCouponsByUser(selectedUser._id);
            setCoupons(c)
        }
        if (selectedUser) {
            fetchCoupons();
        }
    }, [selectedUser]);
    const processOrder = async () => {
        var orderData = {
            userId: selectedUser ? selectedUser._id : null,
            guestName: isGuest ? guestName : null,
            items: cart,
            couponCode: selectedCoupon?.couponId?.code ? selectedCoupon.couponId.code : null,
            totalAmount: total
        }
        try {
            const res = await createOrder(orderData);
            if (res.ok) {
                Toast.fire({
                    icon: 'success',
                    iconColor: '#10b981',
                    title: 'Order Processed',

                    background: '#ecfdf5',
                    color: '#065f46'
                });
                clearState();
                onClose();
                onRefresh();
            } else {
                Toast.fire({
                    icon: 'error',
                    iconColor: '#f43f5e',
                    title: 'Action Failed',
                    background: '#fff1f2',
                    color: '#9f1239'
                });
                clearState();
                onClose();
            }
        }
        catch (err) {
            console.error("Error creating order:", err);
            alert("An error occurred while processing the order.");
        }

    }


    const clearState = () => {
        setIsGuest(false);
        setSelectedUser(null);
        setGuestName("");
        setCart([]);
        setUserSearch("");
        setIsScanning(false);
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

    // Filtered user list
    const filteredUsers = useMemo(() => {
        if (!userSearch || selectedUser) return [];
        return userList.filter(u =>
            u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
            u._id.includes(userSearch)
        );
    }, [userSearch, userList, selectedUser]);

    // QR Scanner Logic
    useEffect(() => {
        let scanner = null;
        if (isScanning && !isGuest) {
            scanner = new Html5Qrcode("qr-reader");
            scanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 350, height: 350 } },
                async (decodedText) => {
                    // Assuming QR contains User ID
                    const data = await getDataFromQR(decodedText);
                    const user = userList.find(u => u._id == data.user._id);
                    if (user) {
                        setSelectedUser(user);
                        setIsScanning(false);
                    }
                    scanner.stop();
                },
                (error) => { /* ignore silent errors */ }
            ).catch(err => console.error(err));
        }
        return () => {
            if (scanner && scanner.isScanning) {
                scanner.stop().catch(err => console.error(err));
            }
        };
    }, [isScanning, userList, isGuest]);
    useEffect(() => {
        setSelectedCoupon(null);
    }, [isGuest, selectedUser]);

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
                            <h2 className="text-2xl font-serif font-bold text-[#4A3728]">New Guest Order</h2>
                            <p className="text-[10px] text-[#8C6A53] font-bold uppercase tracking-[0.2em] mt-0.5">Admin Terminal</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#F5EFE6] rounded-full text-[#8C6A53] transition-colors"><X size={28} /></button>
                </div>

                <div className="flex flex-1 overflow-hidden">

                    {/* LEFT SIDE: SEARCH, QR & MENU */}
                    <div className="w-[65%] flex flex-col bg-[#FDFBF7]/50 border-r border-[#E8DFD5]">

                        <div className="p-8 bg-white border-b border-[#E8DFD5]">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-[#8C6A53]">Customer Profile</label>
                                <div className="flex bg-[#FDFBF7] border border-[#E8DFD5] p-1 rounded-xl">
                                    <button onClick={() => { setIsGuest(false); setIsScanning(false); setGuestName("") }} className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${!isGuest ? 'bg-[#4A3728] text-white' : 'text-[#8C6A53]'}`}>Member</button>
                                    <button onClick={() => { setIsGuest(true); setIsScanning(false); setSelectedUser(null) }} className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${isGuest ? 'bg-[#4A3728] text-white' : 'text-[#8C6A53]'}`}>Guest</button>
                                </div>
                            </div>

                            {isGuest ? (
                                <input
                                    type="text"
                                    placeholder="Enter guest name..."
                                    className="w-full bg-[#FDFBF7] border border-[#E8DFD5] rounded-2xl py-4 px-6 outline-none text-[#4A3728] font-medium"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                />
                            ) : (
                                <div className="space-y-4">
                                    {!selectedUser && (
                                        <div className="flex gap-3">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-5 top-4.5 text-[#C9B8AA]" size={20} />
                                                <input
                                                    type="text"
                                                    placeholder="Search members..."
                                                    className="w-full pl-14 pr-6 py-4 bg-[#FDFBF7] border border-[#E8DFD5] rounded-2xl outline-none"
                                                    value={userSearch}
                                                    onChange={(e) => setUserSearch(e.target.value)}
                                                />
                                            </div>
                                            <button
                                                onClick={() => setIsScanning(!isScanning)}
                                                className={`px-6 rounded-2xl border flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-all ${isScanning ? 'bg-red-50 border-red-200 text-red-500' : 'bg-[#FDFBF7] border-[#E8DFD5] text-[#4A3728] hover:bg-[#F5EFE6]'}`}
                                            >
                                                {isScanning ? <CameraOff size={18} /> : <QrCode size={18} />}
                                                {isScanning ? "Stop" : "Scan QR"}
                                            </button>
                                        </div>
                                    )}

                                    {/* QR Camera Viewport */}
                                    {isScanning && !selectedUser && (
                                        <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-2 border-[#4A3728] bg-black">
                                            <div id="qr-reader" className="w-full h-full"></div>
                                            <div className="absolute inset-0 pointer-events-none border-40 border-black/40"></div>
                                            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold uppercase tracking-widest bg-[#4A3728] px-4 py-2 rounded-full">Position QR code inside frame</p>
                                        </div>
                                    )}

                                    {selectedUser && (
                                        <div className="flex items-center justify-between p-4 border border-[#D9C5B2] bg-[#FDFBF7] rounded-2xl animate-in zoom-in-95">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#4A3728] text-[#FDFBF7] rounded-full flex items-center justify-center font-bold text-lg">{selectedUser.username.charAt(0)}</div>
                                                <div>
                                                    <p className="font-bold text-[#4A3728]">{selectedUser.username}</p>
                                                    <p className="text-xs text-[#8C6A53]">{selectedUser.email}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => { setSelectedUser(null); setUserSearch(""); }} className="text-xs font-bold text-[#8C6A53] underline px-4">Change User</button>
                                        </div>
                                    )}

                                    {userSearch && !selectedUser && filteredUsers.length > 0 && (
                                        <div className="absolute z-20 w-[50%] mt-2 bg-white border border-[#E8DFD5] rounded-2xl shadow-2xl max-h-48 overflow-y-auto">
                                            {filteredUsers.map(user => (
                                                <button key={user._id} onClick={() => setSelectedUser(user)} className="w-full p-4 text-left hover:bg-[#FDFBF7] border-b border-[#F5EFE6] flex items-center justify-between group">
                                                    <span className="font-bold text-[#4A3728]">{user.username}</span>
                                                    <Plus size={18} className="text-[#C9B8AA] group-hover:text-[#4A3728]" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Menu Grid */}
                        <div className="flex-1 p-8 overflow-y-auto">
                            <label className="block text-[11px] font-bold uppercase tracking-widest text-[#8C6A53] mb-6 text-center italic">Signature Menu</label>
                            <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">
                                {productList.map(product => {
                                    const availableStock = getAvailableStockForProduct(product);
                                    const isOutOfStock = product.isAvailable === false || availableStock <= 0;
                                    return (
                                        <button 
                                            key={product._id} 
                                            onClick={() => addToCart(product)} 
                                            disabled={isOutOfStock}
                                            className={`group flex flex-col justify-between p-6 bg-white border border-[#E8DFD5] rounded-4xl transition-all h-40 ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-50 grayscale' : 'hover:border-[#4A3728]'}`}
                                        >
                                            <span className="font-serif font-bold text-[#4A3728] text-lg leading-tight">
                                                {product.name}
                                            </span>
                                            <div className="flex justify-between items-end w-full">
                                                <div className="flex flex-col items-start">
                                                    <span className="font-bold text-[#8C6A53]">Rp {product.price.toLocaleString()}</span>
                                                    {product.isAvailable !== false && availableStock !== Infinity && (
                                                        <span className="text-[10px] font-bold text-[#D9C5B2] uppercase mt-1">Stok: {availableStock}</span>
                                                    )}
                                                    {isOutOfStock && <span className="text-[10px] font-bold text-red-500 uppercase">Habis</span>}
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
                        </div>
                    </div>

                    {/* RIGHT SIDE: BASKET */}
                    <div className="w-[35%] flex flex-col bg-white">
                        <div className="p-8 flex-1 overflow-y-auto">
                            <div className="flex items-center gap-2 mb-8 border-b border-[#F5EFE6] pb-4">
                                <ShoppingBag size={20} className="text-[#4A3728]" />
                                <h3 className="font-serif font-bold text-xl text-[#4A3728]">Current Basket</h3>
                            </div>

                            {cart.map(item => (
                                <div key={item.productId} className="flex flex-col p-4 bg-[#FDFBF7] rounded-3xl border border-[#E8DFD5] mb-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-bold text-[#4A3728] text-sm">{item.name}</p>
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
                            ))}
                        </div>

                        <div className="p-8 bg-[#FDFBF7] border-t border-[#E8DFD5] space-y-6">
                            {/* COUPON SECTION */}
                            <div className="p-8 pb-0">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-[#8C6A53] mb-3 block">
                                    Apply Coupon
                                </label>
                                <select
                                    disabled={isGuest || !selectedUser || cart.length === 0}
                                    value={selectedCoupon?._id || ""}
                                    onChange={(e) => {
                                        const coupon = coupons.find(c => c._id === e.target.value);
                                        setSelectedCoupon(coupon || null);
                                    }}
                                    className="w-full bg-white border border-[#E8DFD5] rounded-xl px-4 py-3 text-sm text-[#4A3728] outline-none focus:border-[#4A3728] disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
                                >
                                    <option value="">Select a coupon...</option>
                                    {coupons.length > 0 && coupons.map(coupon => (
                                        <option key={coupon._id} value={coupon._id}>
                                            {coupon.couponId.code} - Discount {coupon.couponId.type === 'percentage' ? `${coupon.couponId.value}%` : `Rp ${coupon.couponId.value.toLocaleString()}`}
                                        </option>
                                    ))}
                                </select>
                                {isGuest && (
                                    <p className="text-[9px] text-amber-600 mt-2 font-medium italic">
                                        * Coupons are available for registered members only.
                                    </p>
                                )}
                                {discountCalculation.error && <p className="text-[10px] text-red-500 mt-1 italic">{discountCalculation.error}</p>}
                            </div>

                            {/* UPDATED TOTAL SECTION */}
                            <div className="p-8 bg-[#FDFBF7] border-t border-[#E8DFD5] space-y-4">
                                <div className="space-y-2">
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


                            </div>
                            <button onClick={processOrder} disabled={cart.length === 0 || (!isGuest && !selectedUser) || (isGuest && guestName == "")} className="w-full bg-[#4A3728] text-white py-5 rounded-2xl font-bold uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-[#382a1f] transition-all disabled:opacity-30">
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

export default NewOrderModal;