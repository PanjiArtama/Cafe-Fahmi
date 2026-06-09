/**
 * Full-width gold gradient submit button.
 *
 * @param {boolean}         loading  - Disables button and dims it while true
 * @param {React.ReactNode} children - Button label / content
 */
export default function SubmitBtn({ loading, children }) {
  return (
    <button
    aria-label={`${children}Button`}
      type="submit"
      disabled={loading}
      onMouseEnter={(e) => {
        if (!loading) e.currentTarget.style.filter = "brightness(1.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = "none";
      }}
      style={{
        width: "100%",
        marginTop: 18,
        padding: "11px 0",
        borderRadius: 12,
        border: "none",
        background: loading
          ? "rgba(200,169,122,0.5)"
          : "linear-gradient(135deg,#c8a97a,#a07848)",
        color: "#fff",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        cursor: loading ? "not-allowed" : "pointer",
        boxShadow: "0 4px 14px rgba(200,169,122,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      {children}
    </button>
  );
}
