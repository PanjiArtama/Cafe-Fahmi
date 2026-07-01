import React, { useEffect, useState } from 'react';
import {
  User,
  ShoppingBag,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  QrCode,
  LogOut,
  Menu,
  X,
  Ticket,
  Coffee,
  Calendar,
  Save,
  Clock,
  CheckCircle2,
  Maximize2,
  Plus, // Imported Plus icon for the action button
  Home
} from 'lucide-react';
import { getOwnCoupon, getProfile, getQr, getUserOrder, updateProfile } from '../data/service';
import { Toast } from '../utils/Toast';
import Swal from "sweetalert2";
import NewUserOrder from '../components/userDashboard/AddOrderModal'; // Adjust path if needed depending on file tree
import { getMenuItems } from '../data/cafeData'; // Import getMenuList function

// ─── Sub-Components ─────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const isPending = status.toLowerCase() === 'pending';
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isPending ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
      }`}>
      {isPending ? <Clock size={12} /> : <CheckCircle2 size={12} />}
      {status}
    </div>
  );
};

const CouponCard = ({ couponId, expiresAt }) => {
  const { code, type, value, minPurchase, maxDiscount } = couponId;

  const discountDisplay = type === "percentage" ? `${value}%` : `Rp ${value.toLocaleString()}`;

  return (
    <div className="bg-white border-2 border-dashed border-[#D9C5B2] p-6 rounded-4xl flex flex-col gap-4 relative overflow-hidden group hover:border-[#8C6A53] hover:shadow-xl transition-all duration-300">

      {/* Decorative Ticket Notches */}
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#FDFBF7] rounded-full border-r-2 border-[#D9C5B2] group-hover:border-[#8C6A53] transition-colors" />
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#FDFBF7] rounded-full border-l-2 border-[#D9C5B2] group-hover:border-[#8C6A53] transition-colors" />

      {/* Top Section: Code & Icon */}
      <div className="flex justify-between items-start">
        <div className="bg-[#4A3728] text-white px-4 py-1.5 rounded-lg text-[10px] font-bold tracking-[0.2em] uppercase">
          {code}
        </div>
        <div className="text-[#D9C5B2] group-hover:text-[#8C6A53] transition-colors">
          <Ticket size={24} />
        </div>
      </div>

      {/* Middle Section: Big Value */}
      <div className="py-2">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-serif font-bold text-[#4A3728]">{discountDisplay}</span>
          <span className="text-[#8C6A53] text-xs font-bold uppercase tracking-tighter">Discount</span>
        </div>

        {/* Conditional Max Value for Percentages */}
        {type === "percentage" && maxDiscount && (
          <p className="text-[10px] text-[#A68A78] font-bold uppercase mt-1">
            Up to Rp {maxDiscount.toLocaleString()}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-[#F5EFE6] pt-4 mt-2">
        <div className="grid grid-cols-2 gap-4">
          {/* Min Purchase Column */}
          <div>
            <p className="text-[9px] font-bold text-[#D9C5B2] uppercase tracking-widest mb-1">Min. Purchase</p>
            <p className="text-xs font-bold text-[#4A3728]">
              Rp {minPurchase?.toLocaleString() || "0"}
            </p>
          </div>

          {/* Expiry Column */}
          <div className="text-right">
            <p className="text-[9px] font-bold text-[#D9C5B2] uppercase tracking-widest mb-1">Expires On</p>
            <div className="flex items-center justify-end gap-1 text-[#4A3728] font-bold text-xs">
              <Calendar size={12} className="text-[#8C6A53]" />
              <span>{expiresAt ? new Date(expiresAt).toLocaleDateString('en-GB') : "No Limit"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const [activeSection, setActiveSection] = useState('orders');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false); // Modal state
  const [Coupons, setCoupons] = useState([]);
  const [Orders, setOrders] = useState([]);
  const [profile, setProfile] = useState({});
  const [qrImage, setQrImage] = useState(null);

  // ── Pagination States ──
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Fallback product list array if needed for testing modal compilation
  const [productList, setProductList] = useState([]);

  const refreshOrders = () => {
    setPage(1);
    // Add additional handling or custom order processing execution logic here later
  };

  useEffect(() => {
    const fetchProfileAndCoupons = async () => {
      try {
        const [coupons, menuItems, prof, qr] = await Promise.all([
          getOwnCoupon(),
          getMenuItems(),
          getProfile(),
          getQr()
        ]);
        console.log(coupons);
        setCoupons(coupons || []);
        setProductList(menuItems || []);
        setProfile(prof || {});
        setQrImage(qr?.qr || null);
      } catch (error) {
        console.error("Error fetching user profile data:", error);
      }
    };
    fetchProfileAndCoupons();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const res = await getUserOrder(page, 10);
        let data = [];
        let totalPagesCount = 1;
        if (Array.isArray(res)) {
          data = res;
          totalPagesCount = 1;
        } else if (res) {
          data = res.data || [];
          totalPagesCount = res.totalPages || 1;
        }
        if (page === 1) {
          setOrders(data);
        } else {
          setOrders(prev => [...prev, ...data]);
        }
        setTotalPages(totalPagesCount);
      } catch (error) {
        console.error("Error fetching user orders:", error);
      } finally {
        setIsLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [page]);

  const handleUpdate = async () => {
    const res = await updateProfile(profile);
    if (res.ok) {
      Toast.fire({
        icon: 'success',
        iconColor: '#10b981',
        title: 'Update Profile',
        background: '#ecfdf5',
        color: '#065f46'
      });
    } else {
      Toast.fire({
        icon: 'error',
        iconColor: '#f43f5e',
        title: 'Action Failed',
        background: '#fff1f2',
        color: '#9f1239'
      });
    }
  }

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Keluar Aplikasi?',
      text: 'Anda akan mengakhiri sesi ini dan harus login kembali untuk masuk.',
      icon: 'warning',
      iconColor: '#c59b27',
      showCancelButton: true,
      confirmButtonColor: '#5c4033',
      cancelButtonColor: '#b89047',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      background: '#fdfbf7',
      color: '#3e2723',
      customClass: {
        popup: 'rounded-xl border border-[#e7e0d4]',
      }
    });
    if (result.isConfirmed) {
      localStorage.clear();
      sessionStorage.removeItem("cp_user");
      window.location.href = "/";
    }
  }

  const handleNavClick = (section) => {
    setActiveSection(section);
    setSelectedOrder(null);
    setIsMobileMenuOpen(false);
    if (section === 'orders') {
      setPage(1); // Reset to page 1 to load fresh
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A3728] flex flex-col md:flex-row">

      {/* ── Mobile Header ── */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-[#E8DFD5] sticky top-0 z-50">
        <button
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2 text-[#8C6A53] active:opacity-70"
        >
          <Coffee size={20} />
          <span className="font-serif font-bold text-lg">Cafe Dashboard</span>
        </button>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2"><Menu size={24} /></button>
      </div>

      {/* ── Sidebar ── */}
      <div className={`fixed inset-0 z-60 md:relative md:z-0 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:w-72`}>
        <div className="absolute inset-0 bg-[#4A3728]/20 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
        <aside className="relative w-72 h-full bg-white border-r border-[#E8DFD5] p-6 flex flex-col">

          {/* HEADER SIDEBAR (SEKARANG BISA DIKLIK UNTUK KEMBALI KE /) */}
          <div className="flex justify-between items-center mb-10 px-2">
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 text-[#8C6A53] hover:opacity-80 transition-opacity text-left layout-auto"
            >
              <Coffee size={24} />
              <h1 className="font-serif font-bold text-xl hidden md:block">Cafe Dashboard</h1>
            </button>
            <button className="md:hidden" onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
          </div>

          <nav className="space-y-2 flex-1">
            <button onClick={() => handleNavClick('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeSection === 'orders' ? 'bg-[#8C6A53] text-white' : 'text-[#8C6A53] hover:bg-[#F5EFE6]'}`}>
              <ShoppingBag size={20} /> Order History
            </button>
            <button onClick={() => handleNavClick('coupons')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${activeSection === 'coupons' ? 'bg-[#8C6A53] text-white' : 'text-[#8C6A53] hover:bg-[#F5EFE6]'}`}>
              <div className="flex items-center gap-3"><Ticket size={20} /> My Coupons</div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${activeSection === 'coupons' ? 'bg-white text-[#8C6A53] border-transparent' : 'bg-[#FDFBF7] border-[#D9C5B2]'}`}>{Coupons.length}</span>
            </button>
            <button onClick={() => handleNavClick('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeSection === 'profile' ? 'bg-[#8C6A53] text-white' : 'text-[#8C6A53] hover:bg-[#F5EFE6]'}`}>
              <Settings size={20} /> Settings
            </button>
          </nav>
          <button className="flex items-center gap-3 px-4 py-3 text-red-400 font-bold mt-auto hover:bg-red-50 rounded-xl transition-colors" onClick={handleLogout}><LogOut size={20} /> Logout</button>
        </aside>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 p-5 md:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">

          {/* ── Identity Barcode Card ── */}
          <div className="bg-white border border-[#E8DFD5] rounded-4xl p-6 mb-10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-center gap-8 flex-1">
              <div className="bg-[#FDFBF7] p-4 rounded-3xl border border-[#D9C5B2] shrink-0 relative group">
                <div
                  className="cursor-pointer relative overflow-hidden rounded-xl"
                  onClick={() => qrImage && setIsPreviewOpen(true)}
                >
                  {qrImage ? (
                    <div className="relative group">
                      <img
                        src={qrImage}
                        alt="User QR Code"
                        className="w-24 h-24 object-cover hover:scale-105 transition-transform duration-200"
                      />
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-[#4A3728]/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Maximize2 size={20} className="text-white" />
                      </div>
                    </div>
                  ) : (
                    <QrCode size={95} strokeWidth={1.5} className="text-[#4A3728]" />
                  )}
                </div>

                {/* Badge near barcode */}
                <div className="absolute -top-3 -right-3 bg-[#8C6A53] text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-4 border-white shadow-lg group-hover:scale-110 transition-transform">
                  {Coupons.length}
                </div>
              </div>

              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-serif font-bold text-[#4A3728] mb-1">{profile.username}</h2>
                <p className="text-[#8C6A53] text-sm mb-4 tracking-wide">
                  Member ID: CUST-***{profile._id ? profile._id.slice(-3) : ''}
                </p>
                <div className="inline-flex items-center gap-2 bg-[#F5EFE6] px-4 py-2 rounded-2xl">
                  <Ticket size={16} className="text-[#8C6A53]" />
                  <span className="text-xs font-bold text-[#8C6A53] uppercase tracking-widest">
                    {Coupons.length} Coupons Available
                  </span>
                </div>
              </div>
            </div>

            {/* NEW ORDER ACTION BUTTON */}
            <div className="w-full sm:w-auto shrink-0">
              <button
                onClick={() => setIsOrderModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#4A3728] text-white px-6 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-[#382a1f] transition-all shadow-md"
              >
                <Plus size={16} /> New Order
              </button>
            </div>
          </div>

          {/* --- FULL SIZE QR MODAL --- */}
          {isPreviewOpen && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-6 transition-all">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-[#4A3728]/90 backdrop-blur-md animate-in fade-in duration-300"
                onClick={() => setIsPreviewOpen(false)}
              />

              {/* Modal Container */}
              <div className="relative bg-[#FDFBF7] p-8 md:p-12 rounded-[3rem] shadow-2xl max-w-lg w-full flex flex-col items-center animate-in zoom-in duration-300">

                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="absolute top-6 right-6 p-2 hover:bg-[#F5EFE6] rounded-full text-[#8C6A53] transition-colors"
                >
                  <X size={28} />
                </button>

                {/* QR Container */}
                <div className="bg-white p-6 rounded-3xl shadow-inner border border-[#E8DFD5] mb-6">
                  <img
                    src={qrImage}
                    alt="Full Size QR"
                    className="w-full max-w-[320px] aspect-square object-contain"
                  />
                </div>

                <div className="text-center">
                  <h3 className="text-2xl font-serif font-bold text-[#4A3728] mb-1">Membership QR</h3>
                </div>

                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="mt-8 py-3 px-8 bg-[#4A3728] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#3d2d21] transition-all"
                >
                  Close Preview
                </button>
              </div>
            </div>
          )}

          {/* ── Sections ── */}

          {activeSection === 'orders' && (
            <section>
              <h3 className="text-2xl font-serif font-bold mb-6 text-[#4A3728]">Recent Activity</h3>
              {!selectedOrder && Orders.length !== 0 ? (
                <>
                  <div className="space-y-4">
                    {Orders.map((order) => (
                      <div
                        key={order._id}
                        onClick={() => setSelectedOrder(order)}
                        className="bg-white border border-[#E8DFD5] p-5 rounded-3xl flex items-center justify-between cursor-pointer hover:shadow-md transition-all active:scale-[0.98] group animate-in fade-in"
                      >
                        <div className="flex flex-col gap-1">
                          <StatusBadge status={order.status} />
                          <p className="font-bold text-lg text-[#4A3728]">
                            {new Date(order.orderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                          <p className="text-[10px] font-bold text-[#D9C5B2] uppercase tracking-widest">
                            ID: {order._id.slice(-8).toUpperCase()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-xl text-[#4A3728]">Rp {order.totalAmount.toLocaleString()}</p>
                            <p className="text-[10px] text-[#8C6A53] font-bold uppercase">{order.orderDetails?.length || 0} Items</p>
                          </div>
                          <ChevronRight size={20} className="text-[#D9C5B2] group-hover:text-[#8C6A53] transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ── Server-side Load More Button ── */}
                  {page < totalPages && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={() => setPage(prev => prev + 1)}
                        disabled={isLoadingOrders}
                        className="flex items-center gap-2 bg-white border border-[#E8DFD5] text-[#8C6A53] px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#F5EFE6] transition-all shadow-sm disabled:opacity-50"
                      >
                        {isLoadingOrders ? 'Loading...' : (
                          <>
                            <ChevronDown size={16} /> Load More
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              ) : Orders.length === 0 && !isLoadingOrders ? (
                <div className="bg-white border border-[#E8DFD5] rounded-4xl p-8 shadow-sm flex flex-col items-center gap-4">
                  <p className="text-[#8C6A53] text-sm font-bold">You haven't made any orders yet.</p>
                </div>
              ) : selectedOrder ? (
                <div className="bg-white border border-[#E8DFD5] rounded-4xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
                  {/* HEADER */}
                  <div className="p-6 border-b border-[#F5EFE6] flex items-center justify-between bg-[#FDFBF7]/50">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="p-2 hover:bg-white rounded-full text-[#8C6A53] border border-transparent hover:border-[#E8DFD5] transition-all"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <div>
                        <h3 className="text-xl font-serif font-bold text-[#4A3728]">Order Detail</h3>
                        <p className="text-[10px] font-bold text-[#8C6A53] uppercase tracking-widest">
                          {new Date(selectedOrder.orderDate).toLocaleDateString()} • {new Date(selectedOrder.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={selectedOrder.status} />
                  </div>

                  {/* ITEMS LIST */}
                  <div className="p-8">
                    <div className="space-y-5 mb-8">
                      <label className="text-[10px] font-bold text-[#D9C5B2] uppercase tracking-[0.2em] block mb-4">Items Summary</label>
                      {selectedOrder.orderDetails?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start">
                          <div className="flex gap-3">
                            <div className="w-10 h-10 bg-[#F5EFE6] rounded-xl flex items-center justify-center text-[#8C6A53] font-bold text-xs shrink-0">
                              {item.quantity}x
                            </div>
                            <div>
                              <p className="font-bold text-[#4A3728] leading-tight">{item.productId?.name || "Unknown Product"}</p>
                              <p className="text-[10px] text-[#8C6A53] font-bold mt-1">Rp {item.price.toLocaleString()} / unit</p>
                            </div>
                          </div>
                          <p className="font-bold text-[#4A3728]">Rp {(item.quantity * item.price).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>

                    {/* PRICING CALCULATION */}
                    <div className="border-t border-[#F5EFE6] pt-6 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#8C6A53] font-medium">Subtotal</span>
                        <span className="font-bold text-[#4A3728]">Rp {selectedOrder.subtotalAmount.toLocaleString()}</span>
                      </div>

                      {selectedOrder.discountAmount > 0 && (
                        <div className="flex justify-between text-sm items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-[#8C6A53] font-medium">Discount</span>
                            {selectedOrder.couponId && (
                              <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-tighter">
                                {selectedOrder.couponId.code || "COUPON"}
                              </span>
                            )}
                          </div>
                          <span className="font-bold text-emerald-600">- Rp {selectedOrder.discountAmount.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="pt-4 flex justify-between items-center border-t border-dashed border-[#E8DFD5]">
                        <span className="text-xs font-bold text-[#8C6A53] uppercase tracking-widest">Total Amount</span>
                        <span className="text-3xl font-serif font-bold text-[#4A3728]">
                          Rp {selectedOrder.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white border border-[#E8DFD5] p-5 rounded-3xl h-24 shadow-sm"></div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeSection === 'coupons' && (
            <section>
              <h3 className="text-2xl font-serif font-bold mb-6">My Coupons</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {
                  Coupons.length === 0 ? (
                    <div className="bg-white border border-[#E8DFD5] rounded-4xl p-8 shadow-sm flex flex-col items-center gap-4">
                      <p className="text-[#8C6A53] text-sm font-bold">No Coupons Available</p>
                    </div>
                  ) :
                    (
                      Coupons.map((coupon) => (
                        <CouponCard key={coupon._id} {...coupon} />
                      ))
                    )
                }
              </div>
            </section>
          )}

          {activeSection === 'profile' && (
            <section className="max-w-2xl">
              <h3 className="text-2xl font-serif font-bold mb-6">Profile Settings</h3>
              <div className="bg-white border border-[#E8DFD5] rounded-4xl p-8 shadow-sm">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#8C6A53] uppercase tracking-widest">Username</label>
                      <input
                        type="text"
                        value={profile.username || ''}
                        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                        className="w-full bg-[#FDFBF7] border border-[#E8DFD5] rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#D9C5B2] outline-none font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#8C6A53] uppercase tracking-widest">Phone</label>
                      <input
                        type="text"
                        value={profile.phone || ''}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full bg-[#FDFBF7] border border-[#E8DFD5] rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#D9C5B2] outline-none font-medium"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-xs font-bold text-[#8C6A53] uppercase tracking-widest">Email</label>
                      <input
                        type="email"
                        value={profile.email || ''}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full bg-[#FDFBF7] border border-[#E8DFD5] rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#D9C5B2] outline-none font-medium"
                      />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[#F5EFE6]">
                    <button className="flex items-center justify-center gap-2 bg-[#8C6A53] text-white px-10 py-3.5 rounded-2xl font-bold hover:bg-[#725541] transition-all shadow-lg shadow-[#8C6A53]/20 w-full sm:w-auto" onClick={handleUpdate}>
                      <Save size={18} /> Update Profile
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* RENDER NEW USER ORDER MODAL */}
      <NewUserOrder
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        productList={productList}
        onRefresh={refreshOrders}
        couponlist={Coupons}
      />
    </div>
  );
};

export default UserDashboard;