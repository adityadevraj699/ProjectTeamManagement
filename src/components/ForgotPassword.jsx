import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api", // will become e.g. "/api"
  timeout: 15000
});

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: request, 2: verify, 3: reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // NOTE: backend endpoints (from your controller) are:
  // POST /api/auth/forgot/request
  // POST /api/auth/forgot/verify
  // POST /api/auth/forgot/reset

  const requestOtp = async (e) => {
    e?.preventDefault();
    if (!email.trim()) return Swal.fire("Validation", "Email is required", "warning");
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot/request", { email: email.trim() });
      Swal.fire("Check email", res?.data?.message || "If account exists, OTP sent");
      setStep(2);
    } catch (err) {
      console.error("requestOtp error:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to send OTP";
      Swal.fire("Error", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e?.preventDefault();
    if (!otp.trim()) return Swal.fire("Validation", "OTP is required", "warning");
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot/verify", { email: email.trim(), otp: otp.trim() });
      Swal.fire("Success", res?.data?.message || "OTP verified");
      setStep(3);
    } catch (err) {
      console.error("verifyOtp error:", err);
      const msg = err?.response?.data?.message || err?.message || "Invalid or expired OTP";
      Swal.fire("Error", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e?.preventDefault();
    if (!newPassword || !confirmPassword) return Swal.fire("Validation", "Both password fields are required", "warning");
    if (newPassword !== confirmPassword) return Swal.fire("Validation", "Passwords do not match", "warning");
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot/reset", {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
        confirmPassword
      });
      Swal.fire("Success", res?.data?.message || "Password reset successful", "success");
      navigate("/login");
    } catch (err) {
      console.error("resetPassword error:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to reset password";
      Swal.fire("Error", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-slate-900 p-6">
      <div className="w-full max-w-md bg-slate-800 p-6 rounded-lg text-gray-100">
        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold mb-4">Forgot Password</h2>
            <p className="text-sm text-gray-300 mb-4">Enter your email and we'll send an OTP to reset your password.</p>
            <form onSubmit={requestOtp} className="space-y-4">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                     className="w-full px-3 py-2 rounded bg-slate-900 border border-white/5" placeholder="Email" />
              <div className="flex justify-between items-center">
                <button type="submit" disabled={loading} className="px-4 py-2 bg-sky-600 rounded hover:bg-sky-700">
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </div>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold mb-4">Verify OTP</h2>
            <p className="text-sm text-gray-300 mb-4">We sent an OTP to <strong>{email}</strong>. Enter it below.</p>
            <form onSubmit={verifyOtp} className="space-y-4">
              <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter OTP"
                     className="w-full px-3 py-2 rounded bg-slate-900 border border-white/5" />
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="px-4 py-2 bg-sky-600 rounded hover:bg-sky-700">
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
                <button type="button" onClick={() => setStep(1)} className="px-3 py-2 bg-slate-700 rounded">
                  Back
                </button>
              </div>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-xl font-semibold mb-4">Set New Password</h2>
            <form onSubmit={resetPassword} className="space-y-4">
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                     placeholder="New password" className="w-full px-3 py-2 rounded bg-slate-900 border border-white/5" />
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                     placeholder="Confirm password" className="w-full px-3 py-2 rounded bg-slate-900 border border-white/5" />
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="px-4 py-2 bg-sky-600 rounded hover:bg-sky-700">
                  {loading ? "Saving..." : "Reset Password"}
                </button>
                <button type="button" onClick={() => { setStep(2); }} className="px-3 py-2 bg-slate-700 rounded">
                  Back
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
