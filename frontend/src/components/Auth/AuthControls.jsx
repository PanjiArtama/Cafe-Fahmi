import ProfileDropdown from "./ProfileDropdown";

/**
 * Renders either a "MASUK" button (logged-out) or ProfileDropdown (logged-in).
 *
 * @param {object|null} user          - Logged-in user, or null
 * @param {Function}    onLoginClick  - Opens the auth modal
 * @param {Function}    onSignOut     - Clears the session
 * @param {Function}    onDashboard   - Navigates to the dashboard
 */
export default function AuthControls({ user, onLoginClick, onSignOut, onDashboard }) {
  if (user) {
    return (
      <ProfileDropdown
        user={user}
        onSignOut={onSignOut}
        onDashboard={onDashboard}
      />
    );
  }

  return (
    <button
      onClick={onLoginClick}
      className="bg-transparent border-none cursor-pointer p-0 text-[11px] tracking-[1.5px] font-semibold uppercase text-[#c8a97a] transition-colors duration-200"
      onMouseEnter={(e) => (e.currentTarget.style.color = "#a07848")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#c8a97a")}
    >
      MASUK
    </button>
  );
}
