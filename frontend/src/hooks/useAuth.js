import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { login, register } from "../data/auth";

const SESSION_KEY = "cp_user";

const SWAL_CONFIRM_COLOR = "#3085d6";

/**
 * Manages authentication state: persists to sessionStorage,
 * and exposes login / register / signOut handlers.
 *
 * @returns {{
 *   user: object|null,
 *   handleLogin: Function,
 *   handleRegister: Function,
 *   handleSignOut: Function,
 * }}
 */
export default function useAuth() {
  const [user, setUser] = useState(null);
  const SWAL_CONFIRM_COLOR = "#4A3728";
  const SWAL_BACKGROUND = "#FDFBF7";

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const response = await login(credentials);
      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        await localStorage.setItem("token", data.token);
        await sessionStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
        Swal.fire({
          icon: "success",
          iconColor: "#8C6A53",
          title: '<span style="font-family: serif; font-weight: bold; color: #4A3728;">Login Berhasil</span>',
          text: "Anda telah berhasil masuk",
          background: SWAL_BACKGROUND,
          confirmButtonColor: SWAL_CONFIRM_COLOR,
          confirmButtonText: "LANJUTKAN",


          customClass: {
            popup: 'rounded-[2.5rem] border border-[#E8DFD5] shadow-2xl',
            confirmButton: 'rounded-xl px-8 py-3 font-bold uppercase tracking-widest text-xs',
            title: 'text-2xl',
            htmlContainer: 'text-[#8C6A53] font-medium'
          },
          buttonsStyling: true,
          showClass: {
            popup: 'animate__animated animate__fadeInUp animate__faster'
          }
        });
      } else {
        Swal.fire({
          icon: "warning",
          iconColor: "#BC6C25",
          title: '<span style="font-family: serif; font-weight: bold; color: #4A3728;">Akses Ditolak</span>',
          text: "Email atau password yang Anda masukkan tidak sesuai.",
          background: "#FDFBF7",
          confirmButtonColor: "#4A3728",
          confirmButtonText: "COBA LAGI",


          customClass: {
            popup: 'rounded-[2.5rem] border border-[#E8DFD5] shadow-2xl',
            confirmButton: 'rounded-xl px-10 py-3 font-bold uppercase tracking-[0.2em] text-[10px]',
            title: 'text-2xl',
            htmlContainer: 'text-[#8C6A53] font-medium'
          },


          showClass: {
            popup: 'animate__animated animate__headShake'
          }
        });
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleRegister = async (userData) => {
    try {
      const response = await register(userData);
      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          iconColor: "#8C6A53",
          title: '<span style="font-family: serif; font-weight: bold; color: #4A3728;">Login Berhasil</span>',
          text: "Anda telah berhasil mendaftar. Silakan masuk untuk melanjutkan.",
          background: SWAL_BACKGROUND,
          confirmButtonColor: SWAL_CONFIRM_COLOR,
          confirmButtonText: "LANJUTKAN",


          customClass: {
            popup: 'rounded-[2.5rem] border border-[#E8DFD5] shadow-2xl',
            confirmButton: 'rounded-xl px-8 py-3 font-bold uppercase tracking-widest text-xs',
            title: 'text-2xl',
            htmlContainer: 'text-[#8C6A53] font-medium'
          },
          buttonsStyling: true,
          showClass: {
            popup: 'animate__animated animate__fadeInUp animate__faster'
          }
        });
      } else if (data.message == "User already exists") {
        Swal.fire({
          icon: "warning",
          iconColor: "#BC6C25",
          title: '<span style="font-family: serif; font-weight: bold; color: #4A3728;">Email user sudah terdaftar</span>',
          background: "#FDFBF7",
          confirmButtonColor: "#4A3728",
          confirmButtonText: "COBA LAGI",
          customClass: {
            popup: 'rounded-[2.5rem] border border-[#E8DFD5] shadow-2xl',
            confirmButton: 'rounded-xl px-10 py-3 font-bold uppercase tracking-[0.2em] text-[10px]',
            title: 'text-2xl',
            htmlContainer: 'text-[#8C6A53] font-medium'
          },


          showClass: {
            popup: 'animate__animated animate__headShake'
          }
        });
      } else if (data.message == "Invalid email format") {
        Swal.fire({
          icon: "warning",
          iconColor: "#BC6C25",
          title: '<span style="font-family: serif; font-weight: bold; color: #4A3728;">Format Email tidak valid</span>',
          background: "#FDFBF7",
          confirmButtonColor: "#4A3728",
          confirmButtonText: "COBA LAGI",
          customClass: {
            popup: 'rounded-[2.5rem] border border-[#E8DFD5] shadow-2xl',
            confirmButton: 'rounded-xl px-10 py-3 font-bold uppercase tracking-[0.2em] text-[10px]',
            title: 'text-2xl',
            htmlContainer: 'text-[#8C6A53] font-medium'
          },


          showClass: {
            popup: 'animate__animated animate__headShake'
          }
        });
      }
      else {
        Swal.fire({
          icon: "warning",
          iconColor: "#BC6C25",
          title: '<span style="font-family: serif; font-weight: bold; color: #4A3728;">Akses Ditolak</span>',
          text: "Pendaftaran gagal, silahkan coba lagi nanti.",
          background: "#FDFBF7",
          confirmButtonColor: "#4A3728",
          confirmButtonText: "COBA LAGI",


          customClass: {
            popup: 'rounded-[2.5rem] border border-[#E8DFD5] shadow-2xl',
            confirmButton: 'rounded-xl px-10 py-3 font-bold uppercase tracking-[0.2em] text-[10px]',
            title: 'text-2xl',
            htmlContainer: 'text-[#8C6A53] font-medium'
          },


          showClass: {
            popup: 'animate__animated animate__headShake'
          }
        });
      }
    } catch (error) {
      console.error("Register error:", error);
      Swal.fire({
        icon: "warning",
        title: "Server Error",
        text: "Something went wrong. Please try again later.",
        confirmButtonColor: SWAL_CONFIRM_COLOR,
      });
    }
  };

  const handleSignOut = async () => {
    setUser(null);
    await sessionStorage.removeItem(SESSION_KEY);
    await localStorage.clear();
  };

  return { user, handleLogin, handleRegister, handleSignOut };
}
