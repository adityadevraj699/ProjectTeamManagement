// src/pages/ChangePassword.jsx
import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const baseURL = import.meta.env.VITE_API_URL || "/api";
const api = axios.create({ baseURL, timeout: 15000 });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers = { ...cfg.headers, Authorization: `Bearer ${token}` };
  return cfg;
});

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

  // -------- Password Policy Check --------
  const isValidPassword = (pwd) => {
    if (!pwd) return false;
    if (pwd.length < 8 || pwd.length > 16) return false;
    if (!/[A-Z]/.test(pwd)) return false;
    if (!/[0-9]/.test(pwd)) return false;
    if (!/[!@#$%^&*()_+\-={}\[\]:;"'<>,.?\/]/.test(pwd)) return false;
    return true;
  };

  const validateClient = () => {
    if (!oldPassword) return "Old password is required";
    if (!newPassword) return "New password is required";
    if (!isValidPassword(newPassword))
      return "New password must be 8-16 chars with uppercase, number & special character";
    if (newPassword === oldPassword) return "New password must be different";
    if (newPassword !== confirmPassword) return "Passwords do not match";
    return null;
  };

  // -------- Generate Strong Password --------
  const genPassword = (length = 12) => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const num = "0123456789";
    const special = "!@#$%^&*()_+-={}[]:;\"'<>,.?/";
    const all = upper + lower + num + special;

    let pwd = "";
    pwd += upper[Math.floor(Math.random() * upper.length)];
    pwd += num[Math.floor(Math.random() * num.length)];
    pwd += special[Math.floor(Math.random() * special.length)];

    for (let i = 3; i < length; i++) {
      pwd += all[Math.floor(Math.random() * all.length)];
    }

    pwd = pwd.split("").sort(() => 0.5 - Math.random()).join("");
    setSuggestion(pwd);
    return pwd;
  };

  // -------- SweetAlert Trigger On New Password Focus (show once per page load) --------
  const handleNewFocus = async () => {
    // If already shown during this page load, don't show again
    if (window.__pwSuggestionShown) return;

    // mark shown so it won't popup again until page reload
    window.__pwSuggestionShown = true;

    // generate suggestion
    const pwd = suggestion || genPassword(12);

    const { value } = await Swal.fire({
      title: "Strong Password Suggestion",
      html: `
        <p style="color:#9CA3AF; margin-bottom:6px">We can suggest a strong password for you:</p>
        <div style="padding:10px; background:#0b1220; border-radius:6px; color:#E5E7EB; word-break:break-word;">
          <strong style="color:#93C5FD; font-size:14px">${pwd}</strong>
        </div>
        <p style="color:#9CA3AF; margin-top:8px; font-size:13px">
          Use "Use Suggested Password" to auto-fill it, or "Create My Own" to type your own password.
        </p>
      `,
      showCancelButton: true,
      confirmButtonText: "Use Suggested Password",
      cancelButtonText: "Create My Own",
      background: "#0f172a",
      color: "#fff",
      showCloseButton: true,
    });

    // If user clicked confirm -> use suggested
    if (value) {
      setSuggestion(pwd);
      setNewPassword(pwd);
      setConfirmPassword(pwd);

      Swal.fire({
        title: "Password Applied",
        text: "Suggested password has been filled in. You can still edit it.",
        icon: "success",
        background: "#0f172a",
        color: "#fff",
        timer: 900,
        showConfirmButton: false,
      });
    } else {
      // user chose "Create My Own" — we already set the shown flag, so modal won't reappear this load
      // suggestion remains available via generator if they want it later
    }
  };

  // -------- Submit Handler --------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateClient();
    if (err) {
      Swal.fire("Validation Error", err, "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/change-password", {
        oldPassword,
        newPassword,
        confirmPassword,
      });

      Swal.fire({
        title: "Success",
        text: res.data.message || "Password changed successfully",
        icon: "success",
        background: "#0f172a",
        color: "#fff",
      });

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuggestion("");
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error?.response?.data?.message || "Failed to change password",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
      });
    }
    setLoading(false);
  };

  // ----------------------------------------------
  // UI — Compact, Centered, Login-like
  // ----------------------------------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-black px-4">
      <div className="w-full max-w-sm bg-white/5 backdrop-blur-2xl p-6 rounded-2xl border border-white/10 shadow-2xl text-gray-100">
        {/* Header */}
        <div className="text-center mb-5">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            className="w-14 h-14 mx-auto rounded-full ring-2 ring-sky-400"
            alt="logo"
          />
          <h2 className="text-xl font-bold mt-3 text-sky-400">Change Password</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* OLD PASSWORD */}
          <div>
            <label className="text-gray-300 text-sm">Old Password</label>
            <div className="relative">
              <input
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                placeholder="Enter old password"
                className="w-full mt-1 p-3 pr-10 bg-slate-900/70 border border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
              <button
                onClick={() => setShowOld(!showOld)}
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300"
                aria-label="toggle old password visibility"
              >
                {showOld ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* NEW PASSWORD */}
          <div>
            <label className="text-gray-300 text-sm">New Password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                onFocus={handleNewFocus}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Choose new password"
                className="w-full mt-1 p-3 pr-10 bg-slate-900/70 border border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
              <button
                onClick={() => setShowNew(!showNew)}
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300"
                aria-label="toggle new password visibility"
              >
                {showNew ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {!isValidPassword(newPassword) && newPassword.length > 0 && (
              <p className="text-red-400 text-xs mt-1">8-16 chars, uppercase, number & special char required.</p>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="text-gray-300 text-sm">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm password"
                className="w-full mt-1 p-3 pr-10 bg-slate-900/70 border border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
              <button
                onClick={() => setShowConfirm(!showConfirm)}
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300"
                aria-label="toggle confirm password visibility"
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-red-400 text-xs mt-1">Passwords do not match.</p>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 rounded-lg font-semibold shadow-lg transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Change Password"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-xs mt-4">
          <Link to="/profile" className="text-sky-400">Back to Profile</Link>
        </p>
      </div>
    </div>
  );
}
