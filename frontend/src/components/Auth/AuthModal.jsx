import { useState, useEffect, useRef } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const TABS = [
  { key: "login", label: "Masuk" },
  { key: "register", label: "Daftar" },
];

/**
 * Overlay modal with Login and Register tabs.
 *
 * @param {Function} onClose    - Called when the modal should close
 * @param {Function} onLogin    - Called with { email, password }
 * @param {Function} onRegister - Called with { name, email, password }
 */
export default function AuthModal({ mainTitle,onClose, onLogin, onRegister }) {
  const [tab, setTab] = useState("login");
  const overlayRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-9999 flex items-center justify-center bg-[#1a1410]/60 backdrop-blur-[5px] p-4"
    >
      <div className="relative w-full max-w-105 rounded-[20px] bg-[#faf8f4] border border-[#c8a97a]/25 shadow-[0_20px_60px_rgba(26,20,16,0.2)] overflow-hidden">

        {/* Gold top bar */}
        <div className="h-0.75 bg-linear-to-r from-[#c8a97a] via-[#a07848] to-[#c8a97a]" />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full border-none bg-transparent flex items-center justify-center text-[#a07848] transition-colors hover:bg-[#c8a97a]/15 cursor-pointer"
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="pt-7 px-8 pb-8">
          {/* Brand */}
          <div className="text-center mb-5.5">
            <span className="text-[28px]">☕</span>
            <p className="font-['Georgia',serif] text-[13px] tracking-[3px] text-[#3d2b1f] uppercase mt-1.5 font-semibold">
              {mainTitle}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-[#c8a97a]/10 rounded-[10px] p-0.75 mb-5.5">
            {TABS.map(({ key, label }) => (
              <button
              aria-label={`${label}Switch`}
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 py-1.75 rounded-lg border-none cursor-pointer text-[11px] tracking-[1.5px] font-bold uppercase transition-all duration-200
                  ${tab === key
                    ? "bg-white text-[#3d2b1f] shadow-[0_1px_6px_rgba(26,20,16,0.08)]"
                    : "bg-transparent text-[#a07848]"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Active form */}
          {tab === "login" ? (
            <LoginForm
              onSubmit={onLogin}
              onSwitch={() => setTab("register")}
            />
          ) : (
            <RegisterForm
              onSubmit={onRegister}
              onSwitch={() => setTab("login")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
