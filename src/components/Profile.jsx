// src/components/Profile.jsx
import React, {
  useEffect,
  useState,
  useContext,
  useRef,
} from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  FaCopy,
  FaCheck,
  FaQrcode,
  FaWhatsapp,
  FaEnvelope,
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaDownload,
  FaShareAlt,
  FaFacebook,
  FaTelegramPlane,
  FaRedditAlien,
  FaPinterestP,
} from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";

/**
 * Profile component:
 * - Uses AuthContext as primary source of truth for user & token
 * - Shows cached user quickly (context or localStorage)
 * - Fetches refreshed user from GET /profile
 * - Loads branches/semesters/sections for edit selects
 * - Edit mode shows inputs + selects (select value = id)
 * - On save POST /profile with DTO including branchId/sectionId/semesterId
 * - After successful save, calls authContext.login(updatedUser, token) to refresh global state
 */

const baseURL = import.meta.env.VITE_API_URL || "/api";
const api = axios.create({ baseURL, timeout: 15000 });

api.interceptors.request.use(
  (cfg) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        cfg.headers = cfg.headers || {};
        cfg.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {}
    return cfg;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch {}
      setTimeout(() => (window.location.href = "/login"), 150);
    }
    return Promise.reject(err);
  }
);

export default function Profile() {
  const { user: ctxUser, token: ctxToken, login: ctxLogin } =
    useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    contactNo: "",
    rollNumber: "",
    course: "",
    branchId: "",
    sectionId: "",
    semesterId: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sections, setSections] = useState([]);

  // copy state for public profile URL
  const [copyPublicDone, setCopyPublicDone] = useState(false);

  // share modal
  const [shareOpen, setShareOpen] = useState(false);
  const qrCanvasRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    // Prefer context user; fallback to localStorage cached user
    try {
      if (ctxUser) {
        if (mounted) {
          setUser(ctxUser);
          setFormFromUser(ctxUser);
        }
      } else {
        const cached = localStorage.getItem("user");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (mounted) {
            setUser(parsed);
            setFormFromUser(parsed);
          }
        }
      }
    } catch (e) {
      console.warn("[Profile] invalid cached user", e);
    }

    // fetch lists and fresh profile
    const fetchAll = async () => {
      setLoading(true);
      try {
        const listCalls = [
          api.get("/branches").catch(() => ({ data: [] })),
          api.get("/semesters").catch(() => ({ data: [] })),
          api.get("/sections").catch(() => ({ data: [] })),
        ];
        const [bRes, semRes, secRes] = await Promise.all(listCalls);
        if (mounted) {
          setBranches(bRes.data || []);
          setSemesters(semRes.data || []);
          setSections(secRes.data || []);
        }

        // GET /profile -> uses backend auth via token
        const profileRes = await api.get("/profile");
        if (!mounted) return;
        const u = profileRes.data.user;
        setUser(u);
        setFormFromUser(u);
        try {
          localStorage.setItem("user", JSON.stringify(u));
        } catch (e) {}
      } catch (err) {
        console.error("[Profile] fetchAll error:", err);
        const msg = err?.response?.data?.message || err?.message;
        Swal.fire(
          "Warning",
          `Could not fetch profile or lists: ${msg}`,
          "warning"
        );
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctxUser]);

  const setFormFromUser = (u) => {
    setForm({
      name: u?.name || "",
      contactNo: u?.contactNo || "",
      rollNumber: u?.rollNumber || "",
      course: u?.course || "",
      branchId:
        u?.branchId ?? (u?.branch ? u.branch.id || u.branchId || "" : ""),
      sectionId:
        u?.sectionId ?? (u?.section ? u.section.id || u.sectionId || "" : ""),
      semesterId:
        u?.semesterId ??
        (u?.semester ? u.semester.id || u.semesterId || "" : ""),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = () => setIsEdit(true);
  const handleCancel = () => {
    setFormFromUser(user);
    setIsEdit(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      Swal.fire("Validation", "Name is required", "warning");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: user?.id,
        name: form.name,
        contactNo: form.contactNo,
        rollNumber: form.rollNumber,
        course: form.course,
        ...(user?.role === "STUDENT"
          ? {
              branchId: form.branchId ? Number(form.branchId) : null,
              sectionId: form.sectionId ? Number(form.sectionId) : null,
              semesterId: form.semesterId ? Number(form.semesterId) : null,
            }
          : {}),
      };

      console.log("[Profile] POST /profile payload:", payload);
      const res = await api.post("/profile", payload);
      const updated = res.data.user;

      // update local component state
      setUser(updated);
      setFormFromUser(updated);
      try {
        localStorage.setItem("user", JSON.stringify(updated));
      } catch (e) {}

      // update global AuthContext so navbar and other components reflect new user
      try {
        const tokenToKeep = ctxToken || localStorage.getItem("token") || null;
        if (ctxLogin) {
          ctxLogin(updated, tokenToKeep);
        } else {
          if (tokenToKeep) localStorage.setItem("token", tokenToKeep);
          localStorage.setItem("user", JSON.stringify(updated));
        }
      } catch (e) {
        console.warn("[Profile] failed to update AuthContext", e);
      }

      Swal.fire("Success", res.data.message || "Profile updated", "success");
      setIsEdit(false);
    } catch (err) {
      console.error("[Profile] POST /profile error:", err);
      Swal.fire(
        "Error",
        err?.response?.data?.message || "Failed to update profile",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // --------- public contribution profile helpers (for STUDENT) ---------

  const getPublicProfileUrl = () => {
    if (!user?.email) return "";
    return `${window.location.origin}/profile/${encodeURIComponent(
      user.email
    )}`;
  };

  const handleCopyPublicLink = () => {
    const url = getPublicProfileUrl();
    if (!url) return;
    try {
      navigator.clipboard.writeText(url);
      setCopyPublicDone(true);
      setTimeout(() => setCopyPublicDone(false), 1500);
    } catch (e) {
      console.warn("Clipboard failed", e);
      Swal.fire("Info", "Unable to copy link automatically.", "info");
    }
  };

  const handleViewPublicProfile = () => {
    if (!user?.email) return;
    navigate(`/profile/${encodeURIComponent(user.email)}`);
  };

  const handleDownloadQr = () => {
    const canvas =
      qrCanvasRef.current?.querySelector("canvas") || null;
    if (!canvas) {
      Swal.fire(
        "Info",
        "QR code is not ready to download yet.",
        "info"
      );
      return;
    }
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `profile-${user?.id || "me"}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNativeShare = async () => {
    const url = getPublicProfileUrl();
    if (!url) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My project profile",
          text: "Check out my project contribution profile.",
          url,
        });
      } catch (err) {
        console.log("Share cancelled or failed", err);
      }
    } else {
      Swal.fire(
        "Info",
        "Your browser does not support native sharing. Use social icons or copy link.",
        "info"
      );
    }
  };

  const opts = (arr, labelKey = null) =>
    (Array.isArray(arr) ? arr : []).map((it) => {
      const label = labelKey
        ? it[labelKey] ?? it.name
        : it.name ?? it.branchName ?? it.semesterName ?? it.sectionName;
      return (
        <option key={it.id} value={it.id}>
          {label}
        </option>
      );
    });

  if (loading) {
    return (
      <div className="w-full min-h-[100vh] flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  // ------------- VIEW MODE -------------

  const ProfileView = () => (
    <div className="w-full">
      {/* Main profile info */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
          {user?.name
            ? user.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
            : "U"}
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-bold text-sky-400">
            {user?.name || "Unnamed"}
          </h1>
          <p className="text-sm text-gray-300">
            {user?.email || "No email"}
          </p>
          <p className="mt-2 text-sm text-gray-400">
            <strong>Role:</strong> {user?.role || "-"}
          </p>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-300">
            <div>
              <span className="text-gray-400">ID:</span>{" "}
              {user?.id ?? "-"}
            </div>
            <div>
              <span className="text-gray-400">Contact:</span>{" "}
              {user?.contactNo || "-"}
            </div>

            {user?.role === "STUDENT" && (
              <>
                <div>
                  <span className="text-gray-400">Roll No:</span>{" "}
                  {user?.rollNumber || "-"}
                </div>
                <div>
                  <span className="text-gray-400">Semester:</span>{" "}
                  {user?.semester || "-"}
                </div>
                <div>
                  <span className="text-gray-400">Branch:</span>{" "}
                  {user?.branch || "-"}
                </div>
                <div>
                  <span className="text-gray-400">Course:</span>{" "}
                  {user?.course || "-"}
                </div>
                <div>
                  <span className="text-gray-400">Section:</span>{" "}
                  {user?.section || "-"}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons bottom-right (Insta-style controls) */}
      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        {user?.role === "STUDENT" && (
          <button
            type="button"
            onClick={handleViewPublicProfile}
            className="px-4 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm text-sky-300 border border-sky-500/40 inline-flex items-center gap-2"
          >
            <FaShareAlt className="text-xs" />
            Public Profile
          </button>
        )}

        <button
          type="button"
          onClick={handleEditClick}
          className="px-4 py-1.5 rounded-full bg-yellow-500 hover:bg-yellow-600 text-xs sm:text-sm text-white inline-flex items-center gap-2"
        >
          Edit Profile
        </button>

        {user?.role === "STUDENT" && (
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="px-4 py-1.5 rounded-full bg-sky-600 hover:bg-sky-700 text-xs sm:text-sm text-white inline-flex items-center gap-2"
          >
            <FaShareAlt className="text-xs" />
            Share
          </button>
        )}
      </div>

      {/* Professional summary */}
      <div className="mt-6 bg-slate-800 p-4 rounded-md text-gray-300">
        <h3 className="text-sm text-sky-300 font-semibold mb-2">
          Professional Profile
        </h3>
        <p className="text-sm">
          {user?.role === "GUIDE"
            ? "Guide / Mentor at the institute."
            : user?.role === "ADMIN"
            ? "Administrator account for managing the system."
            : user?.role === "STUDENT"
            ? "Student profile with academic + project information. Use the share menu to copy link, scan QR or share on social media with guides or coordinators."
            : "User profile information."}
        </p>
      </div>
    </div>
  );

  // ------------- EDIT MODE -------------

  const ProfileEdit = () => (
    <form onSubmit={handleSave} className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-sky-400">
          Edit Profile
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`px-4 py-1 rounded text-white ${
              saving
                ? "bg-slate-600"
                : "bg-sky-600 hover:bg-sky-700"
            }`}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-1">
          Name
        </label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full px-3 py-2 rounded bg-slate-800 border border-white/5"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            Contact No
          </label>
          <input
            name="contactNo"
            value={form.contactNo}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-slate-800 border border-white/5"
          />
        </div>
        {user?.role === "STUDENT" ? (
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Roll Number
            </label>
            <input
              name="rollNumber"
              value={form.rollNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-slate-800 border border-white/5"
            />
          </div>
        ) : (
          <div className="flex items-end">
            <div className="text-sm text-gray-400">
              Roll Number (not applicable)
            </div>
          </div>
        )}
      </div>

      {user?.role === "STUDENT" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Course
              </label>
              <input
                name="course"
                value={form.course}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-slate-800 border border-white/5"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Branch
              </label>
              <select
                name="branchId"
                value={form.branchId || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-slate-800 border border-white/5"
              >
                <option value="">-- Select Branch --</option>
                {opts(branches, "branchName")}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Section
              </label>
              <select
                name="sectionId"
                value={form.sectionId || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-slate-800 border border-white/5"
              >
                <option value="">-- Select Section --</option>
                {opts(sections, "sectionName")}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Semester
            </label>
            <select
              name="semesterId"
              value={form.semesterId || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-slate-800 border border-white/5"
            >
              <option value="">-- Select Semester --</option>
              {opts(semesters, "semesterName")}
            </select>
          </div>
        </>
      )}
    </form>
  );

  // ------------- SHARE MODAL (Insta-style, QR top, URL hidden) -------------

  const ShareModal = () => {
    const publicUrl = getPublicProfileUrl();
    if (!publicUrl) return null;

    const encodedUrl = encodeURIComponent(publicUrl);
    const shareText = encodeURIComponent(
      "Check out my project contribution profile"
    );

    const whatsappShare = `https://wa.me/?text=${shareText}%20${encodedUrl}`;
    const emailShare = `mailto:?subject=${encodeURIComponent(
      "My Public Profile"
    )}&body=${shareText}%20${encodedUrl}`;
    const linkedinShare = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    const twitterShare = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${shareText}`;
    const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    const instagramShare = `https://www.instagram.com/`;
    const snapchatShare = `https://www.snapchat.com/`;
    const telegramShare = `https://t.me/share/url?url=${encodedUrl}&text=${shareText}`;
    const redditShare = `https://www.reddit.com/submit?url=${encodedUrl}&title=${shareText}`;
    const pinterestShare = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${shareText}`;

    const nameLabel = user?.name || "your profile";

    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
        <div className="w-full max-w-xl rounded-3xl bg-gradient-to-b from-slate-900/95 via-slate-900 to-slate-950 border border-slate-700/80 shadow-[0_20px_60px_rgba(15,23,42,0.9)] p-6 relative">
          {/* Close */}
          <button
            type="button"
            onClick={() => setShareOpen(false)}
            className="absolute top-3 right-3 text-slate-400 hover:text-white text-lg leading-none"
          >
            ✕
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-xs font-semibold">
              {user?.name
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                : "U"}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-50">
                Share {nameLabel}
              </h2>
              <p className="text-[11px] text-slate-400">
                Let others open your public contribution profile quickly.
              </p>
            </div>
          </div>

          {/* QR FIRST (top, full width) */}
          <div className="mb-5 flex flex-col items-center justify-center gap-3 border border-slate-700 rounded-2xl bg-slate-900/90 px-4 py-4">
            <div className="flex items-center gap-2 text-sky-300 text-[11px] font-semibold uppercase tracking-wide">
              <FaQrcode />
              <span>QR Scanner</span>
            </div>
            <div
              ref={qrCanvasRef}
              className="inline-block bg-white p-3 rounded-2xl"
            >
              <QRCodeCanvas
                value={publicUrl}
                size={170}
                includeMargin={true}
              />
            </div>
            <p className="text-[10px] text-slate-400 text-center max-w-xs">
              Anyone can scan this code to directly open your public profile URL.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                type="button"
                onClick={handleDownloadQr}
                className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-[11px] text-gray-100 inline-flex items-center gap-1 font-medium"
              >
                <FaDownload />
                Download QR
              </button>
              <button
                type="button"
                onClick={handleCopyPublicLink}
                className="px-3 py-1.5 rounded-full bg-sky-600 hover:bg-sky-700 text-[11px] text-white inline-flex items-center gap-1 font-medium"
              >
                {copyPublicDone ? (
                  <>
                    <FaCheck className="text-emerald-300" />
                    Link Copied
                  </>
                ) : (
                  <>
                    <FaCopy />
                    Copy profile link
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Native share button */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-[11px] text-slate-500">
              On mobile, share using your installed apps:
            </p>
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full sm:w-auto px-4 py-2 rounded-full bg-sky-500 hover:bg-sky-600 text-[11px] sm:text-xs text-white inline-flex items-center justify-center gap-2 font-medium"
            >
              <FaShareAlt className="text-xs" />
              Share via device
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700/70 to-transparent mb-3" />

          {/* Social icons grid */}
          <div>
            <p className="text-[11px] text-gray-400 mb-2">
              Or share using your social / communication apps
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {/* WhatsApp */}
              <button
                type="button"
                onClick={() =>
                  window.open(whatsappShare, "_blank", "noopener")
                }
                className="group flex flex-col items-center justify-center gap-1 rounded-2xl bg-slate-900/80 border border-emerald-600/50 hover:bg-emerald-600/10 px-2 py-2"
              >
                <span className="w-7 h-7 rounded-full bg-emerald-500 group-hover:bg-emerald-400 flex items-center justify-center text-white text-sm">
                  <FaWhatsapp />
                </span>
                <span className="text-[10px] text-slate-200">
                  WhatsApp
                </span>
              </button>

              {/* LinkedIn */}
              <button
                type="button"
                onClick={() =>
                  window.open(linkedinShare, "_blank", "noopener")
                }
                className="group flex flex-col items-center justify-center gap-1 rounded-2xl bg-slate-900/80 border border-sky-700/60 hover:bg-sky-700/10 px-2 py-2"
              >
                <span className="w-7 h-7 rounded-full bg-sky-700 group-hover:bg-sky-600 flex items-center justify-center text-white text-sm">
                  <FaLinkedin />
                </span>
                <span className="text-[10px] text-slate-200">
                  LinkedIn
                </span>
              </button>

              {/* X / Twitter */}
              <button
                type="button"
                onClick={() =>
                  window.open(twitterShare, "_blank", "noopener")
                }
                className="group flex flex-col items-center justify-center gap-1 rounded-2xl bg-slate-900/80 border border-slate-600 hover:bg-slate-700/10 px-2 py-2"
              >
                <span className="w-7 h-7 rounded-full bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center text-white text-sm">
                  <FaTwitter />
                </span>
                <span className="text-[10px] text-slate-200">
                  X / Twitter
                </span>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={() =>
                  window.open(facebookShare, "_blank", "noopener")
                }
                className="group flex flex-col items-center justify-center gap-1 rounded-2xl bg-slate-900/80 border border-blue-700/70 hover:bg-blue-700/10 px-2 py-2"
              >
                <span className="w-7 h-7 rounded-full bg-blue-700 group-hover:bg-blue-600 flex items-center justify-center text-white text-sm">
                  <FaFacebook />
                </span>
                <span className="text-[10px] text-slate-200">
                  Facebook
                </span>
              </button>

              {/* Instagram */}
              <button
                type="button"
                onClick={() =>
                  window.open(instagramShare, "_blank", "noopener")
                }
                className="group flex flex-col items-center justify-center gap-1 rounded-2xl bg-slate-900/80 border border-pink-600/70 hover:bg-pink-600/10 px-2 py-2"
              >
                <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-amber-400 flex items-center justify-center text-white text-sm">
                  <FaInstagram />
                </span>
                <span className="text-[10px] text-slate-200">
                  Instagram
                </span>
              </button>

              {/* Telegram */}
              <button
                type="button"
                onClick={() =>
                  window.open(telegramShare, "_blank", "noopener")
                }
                className="group flex flex-col items-center justify-center gap-1 rounded-2xl bg-slate-900/80 border border-sky-500/70 hover:bg-sky-500/10 px-2 py-2"
              >
                <span className="w-7 h-7 rounded-full bg-sky-500 group-hover:bg-sky-400 flex items-center justify-center text-white text-sm">
                  <FaTelegramPlane />
                </span>
                <span className="text-[10px] text-slate-200">
                  Telegram
                </span>
              </button>

              {/* Snapchat */}
              <button
                type="button"
                onClick={() =>
                  window.open(snapchatShare, "_blank", "noopener")
                }
                className="group flex flex-col items-center justify-center gap-1 rounded-2xl bg-slate-900/80 border border-yellow-400/80 hover:bg-yellow-400/10 px-2 py-2"
              >
                <span className="w-7 h-7 rounded-full bg-yellow-400 group-hover:bg-yellow-300 flex items-center justify-center text-slate-900 text-[11px] font-black">
                  SC
                </span>
                <span className="text-[10px] text-slate-200">
                  Snapchat
                </span>
              </button>

              {/* Reddit */}
              <button
                type="button"
                onClick={() =>
                  window.open(redditShare, "_blank", "noopener")
                }
                className="group flex flex-col items-center justify-center gap-1 rounded-2xl bg-slate-900/80 border border-orange-500/70 hover:bg-orange-500/10 px-2 py-2"
              >
                <span className="w-7 h-7 rounded-full bg-orange-500 group-hover:bg-orange-400 flex items-center justify-center text-white text-sm">
                  <FaRedditAlien />
                </span>
                <span className="text-[10px] text-slate-200">
                  Reddit
                </span>
              </button>

              {/* Pinterest */}
              <button
                type="button"
                onClick={() =>
                  window.open(pinterestShare, "_blank", "noopener")
                }
                className="group flex flex-col items-center justify-center gap-1 rounded-2xl bg-slate-900/80 border border-red-500/70 hover:bg-red-500/10 px-2 py-2"
              >
                <span className="w-7 h-7 rounded-full bg-red-500 group-hover:bg-red-400 flex items-center justify-center text-white text-sm">
                  <FaPinterestP />
                </span>
                <span className="text-[10px] text-slate-200">
                  Pinterest
                </span>
              </button>

              {/* Email */}
              <button
                type="button"
                onClick={() =>
                  window.open(emailShare, "_blank", "noopener")
                }
                className="group flex flex-col items-center justify-center gap-1 rounded-2xl bg-slate-900/80 border border-slate-600 hover:bg-slate-700/10 px-2 py-2"
              >
                <span className="w-7 h-7 rounded-full bg-slate-700 group-hover:bg-slate-600 flex items-center justify-center text-white text-sm">
                  <FaEnvelope />
                </span>
                <span className="text-[10px] text-slate-200">
                  Email
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-[100vh] bg-slate-900 flex items-start justify-center p-6">
      <div className="max-w-3xl w-full p-6 bg-slate-900 text-gray-100 rounded-2xl shadow relative">
        {isEdit ? <ProfileEdit /> : <ProfileView />}

        {shareOpen && user?.role === "STUDENT" && <ShareModal />}
      </div>
    </div>
  );
}
