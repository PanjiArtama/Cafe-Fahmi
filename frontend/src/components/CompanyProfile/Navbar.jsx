export default function Navbar({ mainTitle, solid, authControls }) {
    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-5 flex items-center justify-between transition-all duration-500 ${
                solid
                    ? "bg-[#faf8f4]/95 backdrop-blur-md border-b border-[#c8a97a]/10"
                    : "bg-transparent"
            }`}
        >
            {/* Logo */}
            <div className="flex items-center gap-3">
                <span className="text-2xl">☕</span>
                <span className="font-serif font-semibold text-xl tracking-[2px] text-[#3d2b1f] uppercase">
                    {mainTitle? mainTitle : "Fahmi Cafe"}
                </span>
            </div>

            {/* Nav links + auth — right side */}
            <div className="hidden md:flex items-center gap-8 text-[11px] tracking-[1.5px] font-medium text-[#7a6555]">
                {["TENTANG", "MENU", "GALERI", "KONTAK"].map((item) => (
                    <a
                        key={item}
                        href={`#${item.toLowerCase()}`}
                        className="hover:text-[#c8a97a] transition-colors"
                    >
                        {item}
                    </a>
                ))}

                {/* Thin divider */}
                <span style={{ width: 1, height: 14, background: "rgba(200,169,122,0.35)", display: "inline-block" }} />

                {/* Auth controls inherit same text sizing from parent */}
                {authControls}
            </div>
        </nav>
    );
}
