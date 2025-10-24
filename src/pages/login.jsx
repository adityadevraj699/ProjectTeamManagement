import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      const userData = response.data.user;
      const tokenData = response.data.token;

      login(userData, tokenData);

      Swal.fire({
        title: `Welcome, ${userData.name}!`,
        text: userData.role === "ADMIN" ? "Redirecting to Admin Dashboard..." : "Redirecting to Student Dashboard...",
        icon: "success",
        background: "#0f172a",
        color: "#fff",
        confirmButtonColor: "#38bdf8",
      });

      setTimeout(() => {
        navigate(userData.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard");
      }, 1200);
    } catch (err) {
      Swal.fire({
        title: "Login Failed",
        text: err.response?.data?.message || "Login failed",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  if (user) navigate(user.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-black px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-8 text-gray-100">
        {/* Logo / Heading */}
        <div className="text-center mb-8">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="Team Manager Logo"
            className="w-16 h-16 mx-auto rounded-full ring-2 ring-sky-400 shadow-md"
          />
          <h2 className="text-3xl font-bold mt-4 text-sky-400">
            Login to Your Account
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Access your team dashboard securely
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-slate-900/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-100 placeholder-gray-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-slate-900/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-100 placeholder-gray-400 transition-all"
            />
            <div className="text-right mt-2">
              <Link
                to="/forgot-password"
                className="text-sm text-sky-400 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-sky-500 hover:bg-sky-600 font-semibold rounded-lg shadow-lg shadow-sky-900/40 transition-all disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center justify-center mt-6 mb-2">
          <div className="border-t border-white/10 w-1/3"></div>
          <span className="mx-2 text-gray-500 text-sm">or</span>
          <div className="border-t border-white/10 w-1/3"></div>
        </div>

        {/* Register Link */}
        <p className="text-center text-gray-400 text-sm">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-sky-400 font-medium hover:underline"
          >
            Register Now
          </Link>
        </p>
      </div>
    </div>
  );
}
