import React, { useEffect, useState, useContext, useRef } from "react";
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

// 🔄 Reusable High-End Loader Overlay
const LoaderOverlay = ({ message }) => (
  <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[100] backdrop-blur-xl transition-all duration-300">
    <div className="relative w-24 h-24">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-700 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-t-4 border-sky-500 rounded-full animate-spin"></div>
    </div>
    <p className="mt-6 text-sky-400 text-lg font-bold tracking-widest uppercase animate-pulse">{message || "Loading..."}</p>
  </div>
);

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
        
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
             Swal.fire(
              "Warning",
              `Could not fetch profile or lists: ${msg}`,
              "warning"
            );
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
    return <LoaderOverlay message="Loading Profile..." />;
  }

  // ------------- VIEW MODE -------------

  const ProfileView = () => (
    <div className="w-full">
      {/* Main profile info */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-slate-800">
          {user?.name
            ? user.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
            : "U"}
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {user?.name || "Unnamed"}
          </h1>
          <p className="text-sm text-sky-400 font-medium">
            {user?.email || "No email"}
          </p>
          <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
            Role: <span className="ml-1 text-white">{user?.role || "-"}</span>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm border-t border-slate-800 pt-6">
            <div className="flex justify-between md:block">
              <span className="text-slate-500 block text-xs uppercase font-bold mb-1">User ID</span>
              <span className="text-slate-200 font-mono">#{user?.id ?? "-"}</span>
            </div>
            <div className="flex justify-between md:block">
              <span className="text-slate-500 block text-xs uppercase font-bold mb-1">Contact</span>
              <span className="text-slate-200">{user?.contactNo || "-"}</span>
            </div>

            {user?.role === "STUDENT" && (
              <>
                <div className="flex justify-between md:block">
                  <span className="text-slate-500 block text-xs uppercase font-bold mb-1">Roll No</span>
                  <span className="text-slate-200 font-mono">{user?.rollNumber || "-"}</span>
                </div>
                <div className="flex justify-between md:block">
                  <span className="text-slate-500 block text-xs uppercase font-bold mb-1">Semester</span>
                  <span className="text-slate-200">{user?.semester || "-"}</span>
                </div>
                <div className="flex justify-between md:block">
                  <span className="text-slate-500 block text-xs uppercase font-bold mb-1">Branch</span>
                  <span className="text-slate-200">{user?.branch || "-"}</span>
                </div>
                <div className="flex justify-between md:block">
                  <span className="text-slate-500 block text-xs uppercase font-bold mb-1">Course</span>
                  <span className="text-slate-200">{user?.course || "-"}</span>
                </div>
                <div className="flex justify-between md:block">
                  <span className="text-slate-500 block text-xs uppercase font-bold mb-1">Section</span>
                  <span className="text-slate-200">{user?.section || "-"}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons bottom-right (Insta-style controls) */}
      <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-end gap-3">
        {user?.role === "STUDENT" && (
          <button
            type="button"
            onClick={handleViewPublicProfile}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium text-sky-400 border border-slate-700 hover:border-sky-500/50 transition-all flex items-center gap-2"
          >
            <FaShareAlt /> Public Profile
          </button>
        )}

        <button
          type="button"
          onClick={handleEditClick}
          className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-sm font-bold text-white shadow-lg shadow-sky-900/20 transition-all active:scale-95"
        >
          Edit Profile
        </button>

        {user?.role === "STUDENT" && (
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition-all active:scale-95 flex items-center gap-2"
          >
            <FaShareAlt /> Share
          </button>
        )}
      </div>

      {/* Professional summary */}
      <div className="mt-6 bg-slate-800/50 border border-slate-700/50 p-5 rounded-2xl">
        <h3 className="text-xs font-bold text-sky-500 uppercase tracking-wide mb-2">
          About Profile
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          {user?.role === "GUIDE"
            ? "Guide / Mentor account for managing student projects and teams."
            : user?.role === "ADMIN"
            ? "Administrator account with full system access and management capabilities."
            : user?.role === "STUDENT"
            ? "Student profile showcasing academic details and project contributions. Share your public profile to demonstrate your work."
            : "User profile information."}
        </p>
      </div>
    </div>
  );

  // ------------- EDIT MODE -------------

  const ProfileEdit = () => (
    <form onSubmit={handleSave} className="space-y-6 w-full">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white">Edit Profile</h2>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2 rounded-lg text-white text-sm font-bold shadow-lg transition-all ${
              saving
                ? "bg-slate-600 cursor-not-allowed"
                : "bg-sky-600 hover:bg-sky-500 shadow-sky-900/20 active:scale-95"
            }`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
            Full Name
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all placeholder-slate-600"
            placeholder="Enter your name"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
              Contact No
            </label>
            <input
              name="contactNo"
              value={form.contactNo}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all placeholder-slate-600"
              placeholder="+91..."
            />
          </div>
          {user?.role === "STUDENT" ? (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                Roll Number
              </label>
              <input
                name="rollNumber"
                value={form.rollNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all placeholder-slate-600"
                placeholder="College Roll No"
              />
            </div>
          ) : (
            <div className="flex items-end pb-3">
              <span className="text-sm text-slate-500 italic">Roll Number not applicable for {user?.role?.toLowerCase()}s</span>
            </div>
          )}
        </div>

        {user?.role === "STUDENT" && (
          <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700/50 space-y-4">
            <h3 className="text-sm font-bold text-slate-400 border-b border-slate-700/50 pb-2 mb-4">Academic Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                  Course
                </label>
                <input
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-sky-500 outline-none text-sm"
                  placeholder="B.Tech, BCA..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                  Branch
                </label>
                <select
                  name="branchId"
                  value={form.branchId || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-sky-500 outline-none text-sm appearance-none cursor-pointer"
                >
                  <option value="">-- Select Branch --</option>
                  {opts(branches, "branchName")}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                  Section
                </label>
                <select
                  name="sectionId"
                  value={form.sectionId || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-sky-500 outline-none text-sm appearance-none cursor-pointer"
                >
                  <option value="">-- Select Section --</option>
                  {opts(sections, "sectionName")}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                Semester
              </label>
              <select
                name="semesterId"
                value={form.semesterId || ""}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-sky-500 outline-none text-sm appearance-none cursor-pointer md:w-1/3"
              >
                <option value="">-- Select Semester --</option>
                {opts(semesters, "semesterName")}
              </select>
            </div>
          </div>
        )}
      </div>
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
      <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center px-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 relative">
          {/* Close */}
          <button
            type="button"
            onClick={() => setShareOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl leading-none transition-colors"
          >
            ✕
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
              {user?.name
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                : "U"}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Share Profile
              </h2>
              <p className="text-[10px] text-slate-400">
                Share your work with others.
              </p>
            </div>
          </div>

          {/* QR FIRST (top, full width) */}
          <div className="mb-4 flex flex-col items-center justify-center gap-3 border border-slate-800 rounded-xl bg-slate-950 p-4">
            <div className="inline-block bg-white p-2 rounded-lg shadow-lg">
              <QRCodeCanvas
                value={publicUrl}
                size={140}
                includeMargin={true}
              />
            </div>
            <div className="text-center w-full">
                <div className="flex flex-wrap gap-2 justify-center w-full">
                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-white inline-flex justify-center items-center gap-1 font-medium transition-colors border border-slate-700"
                  >
                    <FaDownload /> QR
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyPublicLink}
                    className="flex-1 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-[10px] text-white inline-flex justify-center items-center gap-1 font-medium transition-colors shadow-lg shadow-sky-900/20"
                  >
                    {copyPublicDone ? (
                      <>
                        <FaCheck /> Copied!
                      </>
                    ) : (
                      <>
                        <FaCopy /> Link
                      </>
                    )}
                  </button>
                </div>
            </div>
          </div>

          {/* Native share button */}
          <div className="mb-4">
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-bold flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <FaShareAlt /> Share via...
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-3">
            <div className="h-px bg-slate-800 flex-1"></div>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Socials</span>
            <div className="h-px bg-slate-800 flex-1"></div>
          </div>

          {/* Social icons grid */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
             <SocialButton icon={<FaWhatsapp/>} color="bg-emerald-500" onClick={() => window.open(whatsappShare, "_blank")} />
             <SocialButton icon={<FaLinkedin/>} color="bg-sky-700" onClick={() => window.open(linkedinShare, "_blank")} />
             <SocialButton icon={<FaTwitter/>} color="bg-slate-700" onClick={() => window.open(twitterShare, "_blank")} />
             <SocialButton icon={<FaFacebook/>} color="bg-blue-600" onClick={() => window.open(facebookShare, "_blank")} />
             <SocialButton icon={<FaInstagram/>} color="bg-pink-600" onClick={() => window.open(instagramShare, "_blank")} />
             <SocialButton icon={<FaTelegramPlane/>} color="bg-sky-500" onClick={() => window.open(telegramShare, "_blank")} />
             <SocialButton icon={<FaRedditAlien/>} color="bg-orange-600" onClick={() => window.open(redditShare, "_blank")} />
             <SocialButton icon={<FaPinterestP/>} color="bg-red-600" onClick={() => window.open(pinterestShare, "_blank")} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-[100vh] bg-[#0b1120] flex items-start justify-center p-6 font-sans">
      <div className="max-w-4xl w-full p-8 bg-slate-900 border border-slate-800 text-gray-100 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        {isEdit ? <ProfileEdit /> : <ProfileView />}

        {shareOpen && user?.role === "STUDENT" && <ShareModal />}
      </div>
    </div>
  );
}

// Small helper for social buttons
const SocialButton = ({ icon, color, onClick }) => (
    <button
    type="button"
    onClick={onClick}
    className="group flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl hover:bg-slate-800 transition-colors"
    >
    <span className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-sm shadow-lg group-hover:scale-110 transition-transform`}>
        {icon}
    </span>
    </button>
);