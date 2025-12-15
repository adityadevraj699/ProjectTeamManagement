import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  HiLockClosed, HiShieldCheck, HiEye, HiEyeOff, 
  HiKey, HiCheckCircle, HiXCircle, HiLightningBolt 
} from "react-icons/hi";

// 🔄 API Setup
const baseURL = import.meta.env.VITE_API_URL || "/api";
const api = axios.create({ baseURL, timeout: 15000 });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers = { ...cfg.headers, Authorization: `Bearer ${token}` };
  return cfg;
});

// 🔄 Button Loader
const ButtonLoader = () => (
  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
);

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState("");

  // Visibility toggles
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // -------- Validation Logic --------
  const checks = {
    length: newPassword.length >= 8 && newPassword.length <= 16,
    upper: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*()_+\-={}\[\]:;"'<>,.?\/]/.test(newPassword),
  };

  const isStrong = Object.values(checks).every(Boolean);

  const validateClient = () => {
    if (!oldPassword) return "Old password is required";
    if (!newPassword) return "New password is required";
    if (!isStrong) return "Please meet all password requirements below.";
    if (newPassword === oldPassword) return "New password must be different from the old one.";
    if (newPassword !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  // -------- Generator --------
  const genPassword = (length = 14) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}";
    let pwd = "";
    // Ensure at least one of each required type
    pwd += "A"; // Upper
    pwd += "1"; // Number
    pwd += "@"; // Special
    for (let i = 3; i < length; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd.split('').sort(() => 0.5 - Math.random()).join('');
  };

  const handleSuggestion = async () => {
    const pwd = genPassword();
    const { value } = await Swal.fire({
      title: "Strong Password Suggestion",
      html: `
        <div class="text-left bg-slate-800 p-4 rounded-lg border border-slate-700">
          <p class="text-slate-400 text-sm mb-2">Recommended secure password:</p>
          <div class="bg-slate-900 p-3 rounded border border-emerald-500/30 text-emerald-400 font-mono text-lg tracking-wider select-all text-center">
            ${pwd}
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Use Password",
      confirmButtonColor: "#10b981",
      cancelButtonText: "Cancel",
      cancelButtonColor: "#64748b",
      background: "#1e293b",
      color: "#fff",
    });

    if (value) {
      setNewPassword(pwd);
      setConfirmPassword(pwd);
      // Ensure checklist updates visually immediately
    }
  };

  // -------- Submit Handler --------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateClient();
    if (err) return Swal.fire({ icon: 'warning', title: 'Validation', text: err, background: '#1e293b', color: '#fff' });

    setLoading(true);
    try {
      const res = await api.post("/change-password", {
        oldPassword,
        newPassword,
        confirmPassword,
      });

      Swal.fire({
        icon: "success",
        title: "Password Updated",
        text: "Please login again with your new credentials.",
        background: "#1e293b",
        color: "#fff",
        confirmButtonColor: "#10b981"
      });

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error?.response?.data?.message || "Something went wrong.",
        background: "#1e293b",
        color: "#fff",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 relative z-10"
      >
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
            <HiShieldCheck className="text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-white">Change Password</h2>
          <p className="text-slate-400 text-sm mt-1">Secure your account with a strong password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* OLD PASSWORD */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Current Password</label>
            <div className="relative group">
              <HiKey className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors text-lg" />
              <input
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full bg-slate-800/50 text-white pl-10 pr-12 py-3 rounded-xl border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-slate-600 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-3 text-slate-400 hover:text-white transition-colors"
              >
                {showOld ? <HiEyeOff className="text-lg" /> : <HiEye className="text-lg" />}
              </button>
            </div>
          </div>

          {/* NEW PASSWORD */}
          <div className="space-y-1">
            <div className="flex justify-between items-center ml-1">
               <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">New Password</label>
               <button type="button" onClick={handleSuggestion} className="text-[10px] flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold uppercase transition-colors">
                 <HiLightningBolt /> Suggest Strong
               </button>
            </div>
            
            <div className="relative group">
              <HiLockClosed className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors text-lg" />
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create new password"
                className="w-full bg-slate-800/50 text-white pl-10 pr-12 py-3 rounded-xl border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-slate-600 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-3 text-slate-400 hover:text-white transition-colors"
              >
                {showNew ? <HiEyeOff className="text-lg" /> : <HiEye className="text-lg" />}
              </button>
            </div>

            {/* Strength Checker Visuals */}
            <div className="grid grid-cols-2 gap-2 mt-2 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
              <Requirement label="8-16 Chars" met={checks.length} />
              <Requirement label="Uppercase (A-Z)" met={checks.upper} />
              <Requirement label="Number (0-9)" met={checks.number} />
              <Requirement label="Special Char (!@#)" met={checks.special} />
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Confirm Password</label>
            <div className="relative group">
              <HiLockClosed className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors text-lg" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className={`w-full bg-slate-800/50 text-white pl-10 pr-12 py-3 rounded-xl border outline-none transition-all placeholder-slate-600 text-sm
                  ${confirmPassword && newPassword !== confirmPassword 
                    ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500" 
                    : "border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-slate-400 hover:text-white transition-colors"
              >
                {showConfirm ? <HiEyeOff className="text-lg" /> : <HiEye className="text-lg" />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-400 ml-1 font-medium animate-pulse">Passwords do not match</p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <>Updating... <ButtonLoader /></> : "Update Password"}
            </button>
            
            <div className="mt-4 text-center">
              <Link to="/profile" className="text-sm text-slate-400 hover:text-white transition-colors">
                Cancel and go back
              </Link>
            </div>
          </div>

        </form>
      </motion.div>
    </div>
  );
}

// Helper Component for Checklist
const Requirement = ({ label, met }) => (
  <div className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors duration-300 ${met ? "text-emerald-400" : "text-slate-500"}`}>
    {met ? <HiCheckCircle className="text-sm" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />}
    {label}
  </div>
);