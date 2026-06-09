import { useState } from "react";
import Field from "./ui/Field";
import ErrorMsg from "./ui/ErrorMsg";
import SubmitBtn from "./ui/SubmitBtn";
import Switcher from "./ui/Switcher";

/**
 * Login form — validates locally then delegates to onSubmit.
 *
 * @param {Function} onSubmit   - Called with { email, password } on valid submit
 * @param {Function} onSwitch   - Called when the user wants to switch to Register
 */
export default function LoginForm({ onSubmit, onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Mohon isi semua kolom.");
      return;
    }

    setLoading(true);
    await onSubmit({ email, password });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Field
        label="Email"
        id="lEmail"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="kamu@email.com"
      />
      <Field
        label="Kata Sandi"
        id="lPass"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="••••••••"
        last
      />

      {error && <ErrorMsg>{error}</ErrorMsg>}

      <SubmitBtn loading={loading}>
        {loading ? "Memproses…" : "Masuk"}
      </SubmitBtn>

      <Switcher
        msg="Belum punya akun?"
        cta="Daftar sekarang"
        onSwitch={onSwitch}
      />
    </form>
  );
}
