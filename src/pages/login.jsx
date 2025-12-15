import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { HiMail, HiLockClosed, HiArrowRight, HiLogin } from "react-icons/hi";

// 🔄 Elegant Loader Component (Small version for button)
const ButtonLoader = () => (
  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Map roles to dashboard routes
  const roleToPath = {
    ADMIN: "/admin/dashboard",
    GUIDE: "/guide/dashboard",
    STUDENT: "/student/dashboard",
    TEACHER: "/teacher/dashboard",
  };

  const getRedirectForRole = (role) => {
    if (!role) return "/";
    const key = ("" + role).toUpperCase();
    return roleToPath[key] || "/";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      const userData = response.data.user;
      const tokenData = response.data.token;

      // Persist into auth context
      login(userData, tokenData);

      // Toast
      Swal.fire({
        title: `Welcome back, ${userData.name.split(' ')[0]}!`,
        text: "Redirecting to your dashboard...",
        icon: "success",
        background: "#1e293b",
        color: "#fff",
        confirmButtonColor: "#10b981",
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      // Navigate
      const redirectPath = getRedirectForRole(userData?.role);
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 1000);
    } catch (err) {
      console.error("Login error:", err);
      Swal.fire({
        title: "Login Failed",
        text: err.response?.data?.message || "Invalid credentials",
        icon: "error",
        background: "#1e293b",
        color: "#fff",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      const redirectPath = getRedirectForRole(user.role);
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 relative overflow-hidden">
      {/* Background Decor (Same as Register) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-sky-500/20 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        
        {/* Left Side: Visuals */}
        <div className="md:w-1/2 bg-gradient-to-br from-slate-800 to-slate-900 p-8 flex flex-col justify-center items-center text-white relative overflow-hidden border-r border-slate-700/50">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
           
           <div className="relative z-10 text-center">
             <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <HiLogin className="text-4xl" />
             </div>
             <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome Back</h1>
             <p className="text-slate-400 text-sm px-8">
               Sign in to access your project dashboard, manage tasks, and collaborate with your team.
             </p>
           </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center md:text-left mb-8">
            <h2 className="text-2xl font-bold text-white">Sign In</h2>
            <p className="text-sm text-slate-400 mt-1">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <HiMail className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors text-lg" />
                <input
                  type="email"
                  placeholder="you@mitmeerut.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-800/50 text-white pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-slate-600 text-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <HiLockClosed className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors text-lg" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-800/50 text-white pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-slate-600 text-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>Logging In <ButtonLoader /></>
              ) : (
                <>Sign In <HiArrowRight/></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
             <div className="flex-1 border-t border-slate-700/50"></div>
             <span className="px-3 text-slate-500 text-xs uppercase">Or</span>
             <div className="flex-1 border-t border-slate-700/50"></div>
          </div>

          {/* Register Link */}
          <p className="text-center text-slate-400 text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline">
              Create Student Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}