// src/components/Profile.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

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

api.interceptors.request.use(cfg => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      cfg.headers = cfg.headers || {};
      cfg.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {}
  return cfg;
}, err => Promise.reject(err));

api.interceptors.response.use(res => res, err => {
  const status = err?.response?.status;
  if (status === 401 || status === 403) {
    try { localStorage.removeItem("token"); localStorage.removeItem("user"); } catch {}
    setTimeout(() => window.location.href = "/login", 150);
  }
  return Promise.reject(err);
});

export default function Profile() {
  const { user: ctxUser, token: ctxToken, login: ctxLogin } = useContext(AuthContext);
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
    semesterId: ""
  });
  const [isEdit, setIsEdit] = useState(false);
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sections, setSections] = useState([]);
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
          api.get("/sections").catch(() => ({ data: [] }))
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
        try { localStorage.setItem("user", JSON.stringify(u)); } catch (e) {}
      } catch (err) {
        console.error("[Profile] fetchAll error:", err);
        const msg = err?.response?.data?.message || err?.message;
        Swal.fire("Warning", `Could not fetch profile or lists: ${msg}`, "warning");
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctxUser]);

  const setFormFromUser = (u) => {
    setForm({
      name: u?.name || "",
      contactNo: u?.contactNo || "",
      rollNumber: u?.rollNumber || "",
      course: u?.course || "",
      branchId: u?.branchId ?? (u?.branch ? (u.branch.id || u.branchId || "") : ""),
      sectionId: u?.sectionId ?? (u?.section ? (u.section.id || u.sectionId || "") : ""),
      semesterId: u?.semesterId ?? (u?.semester ? (u.semester.id || u.semesterId || "") : "")
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditClick = () => setIsEdit(true);
  const handleCancel = () => { setFormFromUser(user); setIsEdit(false); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { Swal.fire("Validation", "Name is required", "warning"); return; }

    setSaving(true);
    try {
      const payload = {
        id: user?.id,
        name: form.name,
        contactNo: form.contactNo,
        rollNumber: form.rollNumber,
        course: form.course,
        ...(user?.role === "STUDENT" ? {
          branchId: form.branchId ? Number(form.branchId) : null,
          sectionId: form.sectionId ? Number(form.sectionId) : null,
          semesterId: form.semesterId ? Number(form.semesterId) : null
        } : {}),
      };

      console.log("[Profile] POST /profile payload:", payload);
      const res = await api.post("/profile", payload);
      const updated = res.data.user;

      // update local component state
      setUser(updated);
      setFormFromUser(updated);
      try { localStorage.setItem("user", JSON.stringify(updated)); } catch (e) {}

      // update global AuthContext so navbar and other components reflect new user
      try {
        const tokenToKeep = ctxToken || localStorage.getItem("token") || null;
        if (ctxLogin) {
          ctxLogin(updated, tokenToKeep);
        } else {
          // fallback: set local storage directly (navbar uses context but this helps if no context)
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
      Swal.fire("Error", err?.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  // Note: logout removed from this component — navbar handles logout via AuthContext

  const opts = (arr, labelKey = null) => (Array.isArray(arr) ? arr : []).map(it => {
    const label = labelKey ? (it[labelKey] ?? it.name) : (it.name ?? it.branchName ?? it.semesterName ?? it.sectionName);
    return <option key={it.id} value={it.id}>{label}</option>;
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

  const ProfileView = () => (
    <div className="relative w-full">
      {/* Edit button only (no logout here) */}
      <div className="absolute top-0 right-0 flex gap-2">
        <button onClick={handleEditClick} className="px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-white">Edit</button>
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
          {user?.name ? user.name.split(" ").map(n => n[0]).slice(0,2).join("") : "U"}
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-bold text-sky-400">{user?.name || "Unnamed"}</h1>
          <p className="text-sm text-gray-300">{user?.email || "No email"}</p>
          <p className="mt-2 text-sm text-gray-400"><strong>Role:</strong> {user?.role || "-"}</p>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-300">
            <div><span className="text-gray-400">ID:</span> {user?.id ?? "-"}</div>
            <div><span className="text-gray-400">Contact:</span> {user?.contactNo || "-"}</div>

            {user?.role === "STUDENT" && (
              <>
                <div><span className="text-gray-400">Roll No:</span> {user?.rollNumber || "-"}</div>
                <div><span className="text-gray-400">Semester:</span> {user?.semester || "-"}</div>
                <div><span className="text-gray-400">Branch:</span> {user?.branch || "-"}</div>
                <div><span className="text-gray-400">Course:</span> {user?.course || "-"}</div>
                <div><span className="text-gray-400">Section:</span> {user?.section || "-"}</div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-slate-800 p-4 rounded-md text-gray-300">
        <h3 className="text-sm text-sky-300 font-semibold mb-2">Professional Profile</h3>
        <p className="text-sm">
          {user?.role === "GUIDE" ? "Guide / Mentor at the institute." :
           user?.role === "ADMIN" ? "Administrator" :
           user?.role === "STUDENT" ? "Student profile details." :
           "User profile information."}
        </p>
      </div>
    </div>
  );

  const ProfileEdit = () => (
    <form onSubmit={handleSave} className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-sky-400">Edit Profile</h2>
        <div className="flex gap-2">
          <button type="button" onClick={handleCancel} className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white">Cancel</button>
          <button type="submit" disabled={saving} className={`px-4 py-1 rounded text-white ${saving ? "bg-slate-600" : "bg-sky-600 hover:bg-sky-700"}`}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-1">Name</label>
        <input name="name" value={form.name} onChange={handleChange} className="w-full px-3 py-2 rounded bg-slate-800 border border-white/5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Contact No</label>
          <input name="contactNo" value={form.contactNo} onChange={handleChange} className="w-full px-3 py-2 rounded bg-slate-800 border border-white/5" />
        </div>
        {user?.role === "STUDENT" ? (
          <div>
            <label className="block text-sm text-gray-300 mb-1">Roll Number</label>
            <input name="rollNumber" value={form.rollNumber} onChange={handleChange} className="w-full px-3 py-2 rounded bg-slate-800 border border-white/5" />
          </div>
        ) : (
          <div className="flex items-end"><div className="text-sm text-gray-400">Roll Number (not applicable)</div></div>
        )}
      </div>

      {user?.role === "STUDENT" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Course</label>
              <input name="course" value={form.course} onChange={handleChange} className="w-full px-3 py-2 rounded bg-slate-800 border border-white/5" />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Branch</label>
              <select name="branchId" value={form.branchId || ""} onChange={handleChange} className="w-full px-3 py-2 rounded bg-slate-800 border border-white/5">
                <option value="">-- Select Branch --</option>
                {opts(branches, "branchName")}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Section</label>
              <select name="sectionId" value={form.sectionId || ""} onChange={handleChange} className="w-full px-3 py-2 rounded bg-slate-800 border border-white/5">
                <option value="">-- Select Section --</option>
                {opts(sections, "sectionName")}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Semester</label>
            <select name="semesterId" value={form.semesterId || ""} onChange={handleChange} className="w-full px-3 py-2 rounded bg-slate-800 border border-white/5">
              <option value="">-- Select Semester --</option>
              {opts(semesters, "semesterName")}
            </select>
          </div>
        </>
      )}
    </form>
  );

  return (
    <div className="w-full min-h-[100vh] bg-slate-900 flex items-start justify-center p-6">
      <div className="max-w-3xl w-full p-6 bg-slate-900 text-gray-100 rounded-2xl shadow">
        {isEdit ? <ProfileEdit /> : <ProfileView />}
      </div>
    </div>
  );
}
