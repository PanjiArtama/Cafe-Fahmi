import { useEffect, useState } from 'react';
import { Coffee, LayoutGrid, Package, Menu, X, ShoppingCart, Users, Globe, LayoutDashboard, LogOut, Layers } from 'lucide-react';
import NavItem from './NavItem';
import { getWebInformation } from '../../data/service';

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { key: 'front', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { key: 'order', icon: <ShoppingCart size={20} />, label: 'Order Management' },
    { key: 'user', icon: <Users size={20} />, label: 'User Management' },
    { key: 'menu', icon: <Coffee size={20} />, label: 'Menu List' },
    { key: 'material', icon: <Layers size={20} />, label: 'Bahan Baku' },
    { key: 'coupons', icon: <Package size={20} />, label: 'Coupons' },
    { key: 'companyProfile', icon: <Globe size={20} />, label: 'Company Profile' },
  ];

  const [mainTitle, setTitle] = useState('Title Cafe');

  useEffect(() => {
    const fetchTitle = async () => {
      try {
        const dat = await getWebInformation();
        setTitle(dat.mainTitle);
      } catch (error) {
        console.error("Failed to fetch title:", error);
      }
    };
    fetchTitle();
  }, []);

  const handleNavClick = (key) => {
    setActiveTab(key);
    setMobileOpen(false);
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      console.log("Logout triggered. Pass an 'onLogout' prop to handle session destruction.");
    }
    setMobileOpen(false);
  };

  return (
    <>
      {/* ── Mobile Top Bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#4A3728] px-5 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#8C6A53] rounded-full animate-pulse" />
          <span className="text-[#D9C5B2] font-serif font-bold text-lg">{mainTitle}</span>
        </div>
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="p-2 rounded-xl text-[#D9C5B2] hover:bg-white/10 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── Mobile Backdrop ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-[#4A3728]/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Drawer Panel ── */}
      <div
        className={`md:hidden fixed top-0 left-0 z-40 h-full w-72 bg-[#4A3728] shadow-2xl flex flex-col p-8 transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="mb-12 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#D9C5B2] flex items-center gap-2">
              <div className="w-3 h-3 bg-[#8C6A53] rounded-full animate-pulse" />
              {mainTitle}
            </h1>
            <p className="text-[10px] text-[#D9C5B2]/50 tracking-[0.2em] mt-1 font-bold">
              ADMINISTRATION SYSTEM
            </p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-full text-[#D9C5B2]/60 hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-2 flex-1">
          {navItems.map(({ key, icon, label }) => (
            <NavItem
              key={key}
              active={activeTab === key}
              onClick={() => handleNavClick(key)}
              icon={icon}
              label={label}
            />
          ))}
        </nav>

        {/* Mobile Log Out Button */}
        <div className="pt-4 border-t border-[#8C6A53]/30 mt-auto">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#D9C5B2]/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 font-medium text-sm"
          >
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-72 bg-[#4A3728] text-[#F5EFE6] h-screen sticky top-0 p-8 flex-col shadow-2xl shrink-0">
        <div className="mb-12">
          <h1 className="text-2xl font-serif font-bold text-[#D9C5B2] flex items-center gap-2">
            <div className="w-3 h-3 bg-[#8C6A53] rounded-full animate-pulse" />
            {mainTitle}
          </h1>
          <p className="text-[10px] text-[#D9C5B2]/50 tracking-[0.2em] mt-1 font-bold">
            ADMINISTRATION SYSTEM
          </p>
        </div>

        <nav className="space-y-2 flex-1">
          {navItems.map(({ key, icon, label }) => (
            <NavItem
              key={key}
              active={activeTab === key}
              onClick={() => setActiveTab(key)}
              icon={icon}
              label={label}
            />
          ))}
        </nav>

        {/* Desktop Log Out Button */}
        <div className="pt-4 border-t border-[#8C6A53]/30 mt-auto">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#D9C5B2]/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 font-medium text-sm"
          >
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;