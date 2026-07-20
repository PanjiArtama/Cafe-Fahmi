import { useState } from "react";

export default function Navbar({ mainTitle, solid, authControls }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setMobileMenuOpen((prev) => !prev);
    };

    const navItems = ["TENTANG", "MENU", "GALERI", "KONTAK"];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-5 transition-all duration-500 ${
                solid || mobileMenuOpen
                    ? "bg-[#faf8f4]/95 backdrop-blur-md border-b border-[#c8a97a]/10"
                    : "bg-transparent"
            }`}
        >
            <div className="flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <span className="text-2xl">☕</span>
                    <span className="font-serif font-semibold text-xl tracking-[2px] text-[#3d2b1f] uppercase">
                        {mainTitle ? mainTitle : "Fahmi Cafe"}
                    </span>
                </div>

                {/* Nav links + auth — Desktop view */}
                <div className="hidden md:flex items-center gap-8 text-[11px] tracking-[1.5px] font-medium text-[#7a6555]">
                    {navItems.map((item) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            className="hover:text-[#c8a97a] transition-colors"
                        >
                            {item}
                        </a>
                    ))}

                    {/* Thin divider */}
                    <span
                        style={{
                            width: 1,
                            height: 14,
                            background: "rgba(200,169,122,0.35)",
                            display: "inline-block",
                        }}
                    />

                    {/* Auth controls */}
                    {authControls}
                </div>

                {/* Hamburger Button — Mobile view */}
                <button
                    onClick={toggleMobileMenu}
                    className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 focus:outline-none"
                    aria-label="Toggle navigation menu"
                >
                    <span
                        className={`w-6 h-0.5 bg-[#3d2b1f] transition-all duration-300 ${
                            mobileMenuOpen ? "rotate-45 translate-y-2" : ""
                        }`}
                    />
                    <span
                        className={`w-6 h-0.5 bg-[#3d2b1f] transition-all duration-300 ${
                            mobileMenuOpen ? "opacity-0" : ""
                        }`}
                    />
                    <span
                        className={`w-6 h-0.5 bg-[#3d2b1f] transition-all duration-300 ${
                            mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                        }`}
                    />
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
                    mobileMenuOpen ? "max-h-96 opacity-100 pt-6 pb-2" : "max-h-0 opacity-0"
                }`}
            >
                <div className="flex flex-col gap-4 text-xs tracking-[1.5px] font-medium text-[#7a6555]">
                    {navItems.map((item) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="hover:text-[#c8a97a] transition-colors py-1"
                        >
                            {item}
                        </a>
                    ))}

                    <div className="w-full h-[1px] bg-[#c8a97a]/20 my-1" />

                    {/* Auth controls for Mobile */}
                    <div className="pt-1" onClick={() => setMobileMenuOpen(false)}>
                        {authControls}
                    </div>
                </div>
            </div>
        </nav>
    );
}