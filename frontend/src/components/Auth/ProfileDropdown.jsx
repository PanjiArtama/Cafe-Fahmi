import { useState, useEffect, useRef } from "react";

const DROPDOWN_ANIMATION = `
  @keyframes cpFadeIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

/**
 * Avatar button that opens a dropdown with Dashboard and Sign Out actions.
 *
 * @param {{ username: string, email: string }} user
 * @param {Function} onSignOut   - Called when "Keluar" is clicked
 * @param {Function} onDashboard - Called when "Dashboard" is clicked
 */
export default function ProfileDropdown({ user, onSignOut, onDashboard }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const avatar = user.username[0].toUpperCase();
  const firstName = user.username.split(" ")[0].toUpperCase();

  const menuItems = [
    {
      label: "Dashboard",
      color: "#3d2b1f",
      hoverBg: "rgba(200,169,122,0.08)",
      action: () => { setOpen(false); onDashboard(); },
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c8a97a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      label: "Keluar",
      color: "#b94040",
      hoverBg: "rgba(185,64,64,0.07)",
      action: () => { setOpen(false); onSignOut(); },
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      ),
    },
  ];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          fontSize: 11,
          letterSpacing: "1.5px",
          fontWeight: 600,
          textTransform: "uppercase",
          color: open ? "#c8a97a" : "#7a6555",
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#c8a97a")}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.color = "#7a6555"; }}
      >
        {/* Avatar bubble */}
        <span style={{
          width: 20, height: 20, borderRadius: "50%",
          fontSize: 9, fontWeight: 700,
          background: "linear-gradient(135deg,#c8a97a,#a07848)",
          color: "#fff",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          {avatar}
        </span>

        {firstName}

        {/* Chevron */}
        <svg
          width="8" height="8" viewBox="0 0 10 10" fill="none"
          style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 10px)",
          width: 180,
          background: "#faf8f4",
          border: "1px solid rgba(200,169,122,0.2)",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(26,20,16,0.12)",
          animation: "cpFadeIn 0.15s ease",
        }}>
          {/* User info header */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(200,169,122,0.12)" }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#3d2b1f", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.username}
            </p>
            <p style={{ fontSize: 10, color: "#a07848", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.email}
            </p>
          </div>

          {/* Menu items */}
          <div style={{ padding: "6px 0" }}>
            {menuItems.map(({ label, color, hoverBg, action, icon }) => (
              <button
                key={label}
                onClick={action}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 16px", border: "none", background: "transparent",
                  cursor: "pointer", fontSize: 11, fontWeight: 600,
                  letterSpacing: "1px", textTransform: "uppercase",
                  color, textAlign: "left", transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{DROPDOWN_ANIMATION}</style>
    </div>
  );
}
