import { useState } from "react";

/**
 * Reusable labeled input field with focus styling.
 *
 * @param {string}   label       - Visible label above the input
 * @param {string}   id          - Input element id (ties label + input)
 * @param {string}   type        - Input type (text | email | password)
 * @param {string}   value       - Controlled value
 * @param {Function} onChange    - Called with the raw string value on change
 * @param {string}   placeholder - Input placeholder text
 * @param {boolean}  last        - When true, removes bottom margin (last field in a form)
 */
export default function Field({ label, id, type, value, onChange, placeholder, last }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ marginBottom: last ? 0 : 14 }}>
      <label
        htmlFor={id}
        style={{
          display: "block",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: "#7a6550",
          marginBottom: 5,
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: 10,
          outline: "none",
          border: `1px solid ${focused ? "#c8a97a" : "rgba(200,169,122,0.3)"}`,
          background: "#fff",
          color: "#1a1410",
          fontSize: 13,
          boxSizing: "border-box",
          transition: "border-color 0.2s",
          boxShadow: focused ? "0 0 0 3px rgba(200,169,122,0.1)" : "none",
        }}
      />
    </div>
  );
}
