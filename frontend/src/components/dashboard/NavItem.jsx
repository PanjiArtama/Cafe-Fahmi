const NavItem = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
      active
        ? 'bg-[#F5EFE6] text-[#4A3728] shadow-inner'
        : 'hover:bg-white/5 text-[#D9C5B2]'
    }`}
  >
    {icon}
    <span className="font-bold text-sm tracking-wide">{label}</span>
  </button>
);

export default NavItem;
