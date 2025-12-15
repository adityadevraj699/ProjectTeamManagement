import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiMail, HiLockClosed, HiArrowRight, HiArrowLeft, 
  HiShieldCheck, HiKey 
} from "react-icons/hi";

// 🔄 API Instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000
});

// 🔄 Button Loader
const ButtonLoader = () => (
  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
);

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: request, 2: verify, 3: reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- API HANDLERS ---

  const requestOtp = async (e) => {
    e?.preventDefault();
    if (!email.trim()) return Swal.fire({ icon: 'warning', title: 'Validation', text: 'Email is required', background: '#1e293b', color: '#fff' });
    
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot/request", { email: email.trim() });
      Swal.fire({
        icon: 'info',
        title: 'Check Your Email',
        text: res?.data?.message || "If account exists, OTP has been sent.",
        background: '#1e293b',
        color: '#fff',
        timer: 2000,
        showConfirmButton: false
      });
      setStep(2);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to send OTP";
      Swal.fire({ icon: 'error', title: 'Error', text: msg, background: '#1e293b', color: '#fff' });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e?.preventDefault();
    if (!otp.trim()) return Swal.fire({ icon: 'warning', title: 'Validation', text: 'OTP is required', background: '#1e293b', color: '#fff' });
    
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot/verify", { email: email.trim(), otp: otp.trim() });
      Swal.fire({
        icon: 'success',
        title: 'Verified',
        text: res?.data?.message || "OTP Verified Successfully",
        background: '#1e293b',
        color: '#fff',
        timer: 1500,
        showConfirmButton: false
      });
      setStep(3);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Invalid or expired OTP";
      Swal.fire({ icon: 'error', title: 'Error', text: msg, background: '#1e293b', color: '#fff' });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e?.preventDefault();
    if (!newPassword || !confirmPassword) return Swal.fire({ icon: 'warning', title: 'Validation', text: 'Both fields are required', background: '#1e293b', color: '#fff' });
    if (newPassword !== confirmPassword) return Swal.fire({ icon: 'warning', title: 'Mismatch', text: 'Passwords do not match', background: '#1e293b', color: '#fff' });
    
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot/reset", {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
        confirmPassword
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Password Reset!',
        text: 'You can now login with your new password.',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#10b981'
      }).then(() => navigate("/login"));
      
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to reset password";
      Swal.fire({ icon: 'error', title: 'Error', text: msg, background: '#1e293b', color: '#fff' });
    } finally {
      setLoading(false);
    }
  };

  // Animation Variants
  const slideVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-sky-500/20 rounded-full blur-[100px]" />

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden p-8 relative z-10">
        
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shadow-lg text-emerald-400">
            {step === 1 && <HiKey className="text-3xl" />}
            {step === 2 && <HiShieldCheck className="text-3xl" />}
            {step === 3 && <HiLockClosed className="text-3xl" />}
          </div>
        </div>

        <AnimatePresence mode="wait">
          
          {/* STEP 1: REQUEST OTP */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-center text-white mb-2">Forgot Password?</h2>
              <p className="text-slate-400 text-center text-sm mb-6">Enter your registered email address to receive a verification code.</p>

              <form onSubmit={requestOtp} className="space-y-4">
                <div className="relative group">
                  <HiMail className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors text-lg" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-slate-800/50 text-white pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-slate-600 text-sm"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <>Sending... <ButtonLoader /></> : "Send OTP"}
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 2: VERIFY OTP */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-center text-white mb-2">Verify OTP</h2>
              <p className="text-slate-400 text-center text-sm mb-6">
                Enter the code sent to <br/><span className="text-emerald-400 font-mono">{email}</span>
              </p>

              <form onSubmit={verifyOtp} className="space-y-4">
                <div className="relative group">
                  <HiShieldCheck className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors text-lg" />
                  <input
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-full bg-slate-800/50 text-white pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-slate-600 text-sm tracking-widest"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <>Verifying... <ButtonLoader /></> : "Verify & Proceed"}
                </button>
                
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full py-2 text-slate-400 hover:text-white text-sm transition-colors flex items-center justify-center gap-1"
                >
                  <HiArrowLeft /> Change Email
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 3: RESET PASSWORD */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-center text-white mb-2">Reset Password</h2>
              <p className="text-slate-400 text-center text-sm mb-6">Create a strong new password for your account.</p>

              <form onSubmit={resetPassword} className="space-y-4">
                <div className="relative group">
                  <HiLockClosed className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors text-lg" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    className="w-full bg-slate-800/50 text-white pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-slate-600 text-sm"
                  />
                </div>

                <div className="relative group">
                  <HiLockClosed className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors text-lg" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm New Password"
                    className="w-full bg-slate-800/50 text-white pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-slate-600 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <>Updating... <ButtonLoader /></> : "Update Password"}
                </button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Back to Login Link (Visible on all steps) */}
        <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
           <Link to="/login" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1">
             <HiArrowLeft /> Back to Login
           </Link>
        </div>

      </div>
    </div>
  );
}