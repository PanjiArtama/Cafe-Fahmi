import React, { useEffect, useState } from 'react';
import { Plus, Search, ChevronRight, CheckCircle2, User, Star } from 'lucide-react';

import { ReceiptText, ExternalLink } from 'lucide-react';
import { getCategories, getMenuItems, getPublicWebInformation } from '../data/cafeData';
import { addCategory, AssignCoupon, deleteProduct, getAllCoupon, getAvailableCoupon, getOrders, getUserList, getUserStat, updateWebInformation, getOrderDetail, deleteCoupon, handleExportExcel, getDailyStats } from '../data/service';

import Sidebar from '../components/dashboard/Sidebar';
import MenuTable from '../components/dashboard/MenuTable';
import CategoryGrid from '../components/dashboard/CategoryGrid';
import CafeModal from '../components/dashboard/CafeModal';
import AddProductSlideOver from '../components/dashboard/AddProductSlideOver';
import OrderManager from '../components/dashboard/OrderManagement';
import NewOrderModal from '../components/dashboard/AddOrderModal';
import UserTable from '../components/dashboard/UserTable';
import CouponTable from '../components/dashboard/CouponTable';
import CouponSlideOver from '../components/dashboard/AddCouponSlideOver';
import AssignCouponModal from '../components/dashboard/AssignCoupon';
import CompanyProfileEditor from '../components/dashboard/CompanyProfileEditor';
import { Toast } from '../utils/Toast';
import OrderDetailModal from '../components/dashboard/OrderDetailModal';
import FrontPage from '../components/dashboard/FrontPage';

// ─── Category Modal Content (controlled) ─────────────────────────────────────
const CategoryModalContent = ({ value, onChange }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-widest text-[#8C6A53] mb-2">
      Category Name
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="e.g. Seasonal Brews"
      className="w-full bg-[#FDFBF7] border border-[#E8DFD5] rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#D9C5B2]"
    />
  </div>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('front');
  const [menuItems, setMenuItems] = useState([]);
  const [cat, setCat] = useState([]);
  const [orders, setOrders] = useState([]);
  const [userList, setUserList] = useState([]);
  const [user, setUser] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [webInfo, setWebInfo] = useState(null);

  // ── Modal open state ──
  const [categoryModal, setCategoryModal] = useState(false);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isCouponOpen, setIsCouponOpen] = useState(false);
  const [isAssignCouponOpen, setIsAssignCouponOpen] = useState(false);
  const [orderTab, setOrderTab] = useState('ongoing');
  //
  const [selectedUsersForCoupon, setSelectedUsersForCoupon] = useState([]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);

  const onDetailOrder = async (id) => {
    const data = await getOrderDetail(id);
    setSelectedOrder(data);
    setIsOrderDetailOpen(true);
  }

  const onViewAll = async () => {
    setActiveTab('order');
  }

  // ── Editing targets (null = add mode, object = edit mode) ──
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCoupon, setEditingCoupon] = useState(null);

  // ── Controlled form state ──
  const [categoryName, setCategoryName] = useState('');

  const [dailyStats, setDailyStats] = useState(null);
  // ── Loading state ──
  const [savingCategory, setSavingCategory] = useState(false);
  const [avalCoupon, setAvalCoupon] = useState([]);
  const fetchAll = async () => {
    const [menuRes, categories, orders, users, userL, coupons, avCoupon, daily] = await Promise.all([
      getMenuItems(),
      getCategories(),
      getOrders(),
      getUserStat(),
      getUserList(),
      getAllCoupon(),
      getAvailableCoupon(),
      getDailyStats()
    ]);
    setDailyStats(daily);
    setMenuItems(menuRes);
    setCat(categories);
    setOrders(orders);
    setUser(users);
    setUserList(userL)
    setCoupons(coupons);
    setAvalCoupon(avCoupon);

    // Fetch web information separately (non-blocking) — uses public endpoint (no auth needed)
    getPublicWebInformation().then(info => { if (info) setWebInfo(info); }).catch(() => { });
  };
  useEffect(() => {
    fetchAll();
  }, []);

  // ── Open handlers ──────────────────────────────────────────────────────────

  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryModal(true);
  };

  const openEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryModal(true);
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setIsProductOpen(true);
  };

  const openAddCoupon = () => {
    setEditingCoupon(null);
    setIsCouponOpen(true);
  }
  const openEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setIsCouponOpen(true);
  }

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setIsProductOpen(true);
  };

  const handleAddNew = () => {
    if (activeTab === 'menu') openAddProduct();
    else if (activeTab === 'order') setShowNewOrderModal(true);
    else if (activeTab === 'coupons') openAddCoupon();
  };

  // ── Save handlers ──────────────────────────────────────────────────────────

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) return;
    try {
      setSavingCategory(true);
      if (editingCategory) {
        await updateCategory(editingCategory._id, { name: categoryName });
      } else {
        await addCategory({ name: categoryName });
      }
      setCategoryName('');
      setEditingCategory(null);
      setCategoryModal(false);
      const updated = await getCategories();
      setCat(updated);
    } catch (err) {
      console.error('Failed to save category:', err);
      alert('Could not save category.');
    } finally {
      setSavingCategory(false);
    }
  };

  const assignCoupons = async (coupon, users) => {
    const ids = users.map(u => u.userId);
    const couponId = coupon._id;
    const data = {
      couponId: couponId,
      userIds: ids
    }
    const response = await AssignCoupon(data);
    if (response.ok) {
      Toast.fire({
        icon: 'success',
        iconColor: '#10b981',
        title: 'Coupon Assigned',

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

  const onDeleteProduct = async (product) => {
    const resp = await deleteProduct(product._id);
    if (resp.ok) {
      Toast.fire({
        icon: 'success',
        iconColor: '#10b981',
        title: 'Product Deleted',

        background: '#ecfdf5',
        color: '#065f46'
      });
      fetchAll();
    } else {
      Toast.fire({
        icon: 'error',
        iconColor: '#f43f5e',
        title: 'Delete Failed',
        background: '#fff1f2',
        color: '#9f1239'
      });
    }
  }
  const onLogout = async () => {
    localStorage.clear();
    window.location.href = "/";
  }
  const onDeleteCoupon = async (product) => {
    const resp = await deleteCoupon(product._id);
    if (resp.ok) {
      Toast.fire({
        icon: 'success',
        iconColor: '#10b981',
        title: 'Coupon Deleted',

        background: '#ecfdf5',
        color: '#065f46'
      });
      fetchAll();
    } else {
      Toast.fire({
        icon: 'error',
        iconColor: '#f43f5e',
        title: 'Delete Failed',
        background: '#fff1f2',
        color: '#9f1239'
      });
    }
  }



  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A3728] font-sans flex transition-colors duration-500">

      {/* ── SlideOver ── */}
      <AddProductSlideOver
        isOpen={isProductOpen}
        onClose={() => { setIsProductOpen(false); setEditingProduct(null); fetchAll();}}
        categories={cat}
        initialData={editingProduct}
      />
      {
        isOrderDetailOpen &&
        <OrderDetailModal
          isOpen={isOrderDetailOpen}
          onClose={() => { setIsOrderDetailOpen(false); setSelectedOrder(null); }}
          order={selectedOrder}
        />
      }

      <AssignCouponModal
        isOpen={isAssignCouponOpen}
        onClose={() => { setIsAssignCouponOpen(false); fetchAll(); }}
        selectedUsers={selectedUsersForCoupon}
        coupons={avalCoupon}
        onApply={assignCoupons}
      />

      <CouponSlideOver
        isOpen={isCouponOpen}
        onClose={() => { setIsCouponOpen(false); setEditingCoupon(null); fetchAll(); }}
        initialData={editingCoupon}
      />

      <NewOrderModal onRefresh={fetchAll} isOpen={showNewOrderModal} onClose={() => setShowNewOrderModal(false)} productList={menuItems} userList={userList} />
      {/* ── Category Modal ── */}
      <CafeModal
        title={editingCategory ? 'Edit Category' : 'New Category'}
        isOpen={categoryModal}
        onClose={() => { setCategoryModal(false); setEditingCategory(null); setCategoryName(''); }}
        onSave={handleSaveCategory}
        loading={savingCategory}
      >
        <CategoryModalContent value={categoryName} onChange={setCategoryName} />
      </CafeModal>

      {/* ── Sidebar ── */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

      {/* ── Main Content ── */}
      <main className="flex-1 p-5 md:p-12 overflow-y-auto pt-20 md:pt-12">
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8 md:mb-10">
          <div>
            <div className="flex items-center gap-2 text-[#8C6A53] mb-1">
              <span className="text-xs font-bold uppercase tracking-widest">Management</span>
              <ChevronRight size={14} />
              <span className="text-xs font-bold uppercase tracking-widest text-[#4A3728]">
                {activeTab == 'front' ? 'Dashboard' : activeTab}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#4A3728] capitalize">
                {activeTab == 'front' ? 'Dashboard' : activeTab}
            </h2>
          </div>
          {activeTab !== 'user' && activeTab !== 'companyProfile' && activeTab !== 'front' &&
            (
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 bg-[#8C6A53] hover:bg-[#725541] text-white px-6 md:px-8 py-3 rounded-2xl font-bold transition-all transform hover:-translate-y-1 shadow-lg shadow-[#8C6A53]/20 w-full sm:w-auto justify-center"
              >
                <Plus size={20} /> Add New
              </button>
            )}
        </header>

        <div className="p-2">
          {activeTab === 'front' && dailyStats !== null &&(
            <FrontPage dailyStats={dailyStats} orders={orders} onViewAll={onViewAll}  />
          )}
          {activeTab === 'menu' && (
            <MenuTable data={menuItems} onEdit={openEditProduct} onDelete={onDeleteProduct} />
          )}
          {activeTab === 'order' && (
            <OrderManager orders={orders} onRefresh={fetchAll} onDetail={onDetailOrder} orderTab={orderTab} />
          )}
          {activeTab === 'user' && (
            <UserTable rawData={user} onAssignCoupon={(users) => { setIsAssignCouponOpen(true); setSelectedUsersForCoupon(users) }} />
          )}
          {activeTab === 'coupons' && (
            <CouponTable data={coupons} onEdit={openEditCoupon} onDelete={onDeleteCoupon} />
          )}
          {activeTab === 'companyProfile' && (
            <CompanyProfileEditor data={webInfo} onSave={async (payload) => {
              const res = await updateWebInformation(payload);
              if (res.ok) {
                const updated = await getPublicWebInformation();
                if (updated) setWebInfo(updated);
              }
              return res;
            }} />
          )}
          {/* <button
            onClick={async () => {
              const dat = await handleExportExcel("2024-01-01", "2027-01-01");
            }}>
            Test fetch
          </button> */}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;