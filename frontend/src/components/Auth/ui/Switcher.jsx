/**
 * Small "switch form" prompt shown below a form (e.g. "Don't have an account? Register").
 *
 * @param {string}   msg      - Descriptive text (e.g. "Don't have an account?")
 * @param {string}   cta      - Link label (e.g. "Register now")
 * @param {Function} onSwitch - Called when the link is clicked
 */
export default function Switcher({ msg, cta, onSwitch }) {
  return (
    <p
      style={{
        textAlign: "center",
        fontSize: 11,
        color: "#a07848",
        marginTop: 14,
        letterSpacing: "0.5px",
      }}
    >
      {msg}{" "}
      <button
        type="button"
        onClick={onSwitch}
        style={{
          color: "#c8a97a",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: 11,
        }}
      >
        {cta}
      </button>
    </p>
  );
}
