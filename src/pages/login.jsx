import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setIsLoggedIn(true);
      // Redirect immediately based on role
      if (user.role === "ADMIN") navigate("/admin/dashboard");
      else navigate("/student/dashboard");
    }
  }, [navigate]);

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

      const user = response.data.user;
      const token = response.data.token;

      // Save user and token to localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      Swal.fire({
        title: `Welcome, ${user.name}!`,
        text:
          user.role === "ADMIN"
            ? "Redirecting to Admin Dashboard..."
            : "Redirecting to Student Dashboard...",
        icon: "success",
        background: "#0f172a",
        color: "#fff",
        confirmButtonColor: "#2563eb",
      });

      setTimeout(() => {
        if (user.role === "ADMIN") navigate("/admin/dashboard");
        else navigate("/student/dashboard");
      }, 1500);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.request ? "Server not responding" : "Login failed");

      Swal.fire({
        title: "Login Failed",
        text: msg,
        icon: "error",
        background: "#0f172a",
        color: "#fff",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };

  // If user is logged in, show a loader instead of the form
  if (isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-4">
        <div className="text-center text-gray-100">
          <p className="text-xl">Checking authentication...</p>
          <div className="mt-4 animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] p-8 text-gray-100">
        {/* Logo / Heading */}
        <div className="text-center mb-8">
          <img
            src="data:image/jpeg;base64,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"
            alt="Logo"
            className="w-16 h-16 mx-auto rounded-full shadow-lg"
          />
          <h2 className="text-3xl font-bold mt-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Sign in to manage your team efficiently
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
              className="w-full p-3 rounded-lg bg-slate-800/80 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-100 placeholder-gray-400 transition-all"
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
              className="w-full p-3 rounded-lg bg-slate-800/80 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-100 placeholder-gray-400 transition-all"
            />
            <div className="text-right mt-2">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-400 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold rounded-lg shadow-lg shadow-blue-800/40 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="flex items-center justify-center mt-6 mb-2">
          <div className="border-t border-white/10 w-1/3"></div>
          <span className="mx-2 text-gray-500 text-sm">or</span>
          <div className="border-t border-white/10 w-1/3"></div>
        </div>

        <p className="text-center text-gray-400 text-sm">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-400 font-medium hover:underline"
          >
            Register Now
          </Link>
        </p>
      </div>
    </div>
  );
}
