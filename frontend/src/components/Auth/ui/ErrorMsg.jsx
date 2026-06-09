/**
 * Inline error banner displayed inside a form.
 *
 * @param {React.ReactNode} children - Error message text
 */
export default function ErrorMsg({ children }) {
  return (
    <p
      style={{
        fontSize: 11,
        color: "#b94040",
        background: "rgba(185,64,64,0.07)",
        borderRadius: 8,
        padding: "8px 12px",
        marginTop: 12,
        marginBottom: 0,
      }}
    >
      {children}
    </p>
  );
}
