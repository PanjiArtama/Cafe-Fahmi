import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../data/auth";
import Swal from "sweetalert2";
import { getPublicWebInformation } from "../data/cafeData";

export default function LoginAdmin() {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [mainTitle, setMainTitle] = useState("Title Caffe");
    useEffect(() => {
        const fetchMainTitle = async () => {
            const dat = await getPublicWebInformation();
            setMainTitle(dat?.mainTitle || "Title Caffe");
        }
        fetchMainTitle();
    }, []);
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginAdmin({
                username: formData.username,
                password: formData.password
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.clear();
                sessionStorage.removeItem("cp_user");
                localStorage.setItem("token", data.token);
                navigate("/admin/dashboard");
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Login Failed',
                    text: data.message || 'Something went wrong.',
                    confirmButtonColor: '#3085d6',
                });
            }
        } catch (error) {
            console.error("Login error:", error);
        }
    };
    return (
        <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center px-6">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-[#c8933a]/5 -translate-x-1/2 -translate-y-1/2" />
            <div className="w-full max-w-md">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#ede4d8] relative overflow-hidden">
                    {/* Top Gold Accent Line */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#c8933a]" />
                    <div className="text-center mb-8">
                        <div className="inline-flex w-12 h-12 rounded-full bg-[#1c1209] items-center justify-center text-[#c8933a] font-display font-bold text-xl mb-4">
                            A
                        </div>
                        <h1 className="font-display text-2xl text-[#1c1209] font-bold">Admin Portal</h1>
                        <p className="font-body text-[#8a7360] text-sm mt-2">{mainTitle}</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block font-body text-[10px] text-[#c8933a] tracking-[0.2em] uppercase mb-2 ml-1">
                                Username
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full bg-[#faf7f2] border border-[#ede4d8] rounded-lg px-4 py-3 font-body text-sm text-[#1c1209] focus:outline-none focus:border-[#c8933a] transition-colors"
                                placeholder="Admin"
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block font-body text-[10px] text-[#c8933a] tracking-[0.2em] uppercase mb-2 ml-1">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                className="w-full bg-[#faf7f2] border border-[#ede4d8] rounded-lg px-4 py-3 font-body text-sm text-[#1c1209] focus:outline-none focus:border-[#c8933a] transition-colors"
                                placeholder="••••••••"
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-4 bg-[#1c1209] text-[#faf7f2] font-body font-medium text-xs tracking-[0.2em] uppercase hover:bg-[#c8933a] hover:text-[#1c1209] transition-all duration-300 rounded-lg shadow-md active:scale-[0.98]"
                        >
                            Sign In to Dashboard
                        </button>
                    </form>
                </div>
                <p className="text-center mt-6 font-body text-[10px] text-[#8a7360] tracking-widest uppercase">
                    © 2026 {mainTitle} · Secured Access
                </p>
            </div>
        </div>
    );
}
