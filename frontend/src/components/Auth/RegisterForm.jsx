import { useState } from "react";
import Field from "./ui/Field";
import ErrorMsg from "./ui/ErrorMsg";
import SubmitBtn from "./ui/SubmitBtn";
import Switcher from "./ui/Switcher";

export default function RegisterForm({ onSubmit, onSwitch }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const { name, email, phone, password, confirm } = form;

    if (!name || !email || !phone || !password || !confirm) {
      return "Mohon isi semua kolom.";
    }

    if (!/^[0-9]+$/.test(phone)) {
      return "Nomor telepon harus berupa angka.";
    }

    if (password.length < 6) {
      return "Kata sandi minimal 6 karakter.";
    }

    if (password !== confirm) {
      return "Kata sandi tidak cocok.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    await onSubmit({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password
    });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Field
        label="Nama Lengkap"
        id="rName"
        type="text"
        value={form.name}
        onChange={handleChange("name")}
        placeholder="Nama kamu"
      />

      <Field
        label="Email"
        id="rEmail"
        type="email"
        value={form.email}
        onChange={handleChange("email")}
        placeholder="kamu@email.com"
      />

      <Field
        label="Nomor Telepon"
        id="rPhone"
        type="tel"
        value={form.phone}
        onChange={handleChange("phone")}
        placeholder="08xxxxxxxxxx"
      />

      <Field
        label="Kata Sandi"
        id="rPass"
        type="password"
        value={form.password}
        onChange={handleChange("password")}
        placeholder="Min. 6 karakter"
      />

      <Field
        label="Konfirmasi Sandi"
        id="rConfirm"
        type="password"
        value={form.confirm}
        onChange={handleChange("confirm")}
        placeholder="Ulangi kata sandi"
        last
      />

      {error && <ErrorMsg>{error}</ErrorMsg>}

      <SubmitBtn loading={loading}>
        {loading ? "Mendaftar…" : "Buat Akun"}
      </SubmitBtn>

      <Switcher
        msg="Sudah punya akun?"
        cta="Masuk di sini"
        onSwitch={onSwitch}
      />
    </form>
  );
}