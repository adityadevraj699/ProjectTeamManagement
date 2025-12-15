// src/pages/AdminUserDetail.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

/* --- Icons --- */
const Icons = {
  Pdf: () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l3 3 3-3"/><path d="M12 18v-6"/></svg>),
  Excel: () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h8"/><path d="M8 17h8"/><path d="M10 9h4"/></svg>),
  Upload: () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>),
  Search: () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>),
  Spinner: () => (<svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>),
  Edit: () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>),
  View: () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>)
};

/* --- Table Skeleton (Data Fetching Load) --- */
const TableSkeleton = () => (
    <tbody className="divide-y divide-slate-800 animate-pulse">
        {[...Array(8)].map((_, i) => (
            <tr key={i} className="bg-slate-900/40">
                <td className="p-4"><div className="h-4 bg-slate-700 rounded w-4/5 mb-1"></div><div className="h-3 bg-slate-800 rounded w-3/5"></div></td>
                <td className="p-4"><div className="h-4 bg-slate-700 rounded w-1/2"></div></td>
                <td className="p-4"><div className="h-4 bg-slate-700 rounded w-2/3 mb-1"></div><div className="h-3 bg-slate-800 rounded w-1/3"></div></td>
                <td className="p-4"><div className="h-5 bg-slate-700 rounded w-full"></div></td>
                <td className="p-4"><div className="h-4 bg-slate-700 rounded w-3/4"></div></td>
                <td className="p-4 text-right"><div className="flex justify-end gap-2"><div className="h-7 w-12 bg-slate-700/50 rounded"></div><div className="h-7 w-12 bg-slate-700/50 rounded"></div></div></td>
            </tr>
        ))}
    </tbody>
);

/* --- Full Admin Detail Skeleton (Initial Load) --- */
const AdminDetailSkeleton = () => (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans animate-pulse">
        
        {/* Header & Stats Section Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="md:col-span-1 space-y-2">
                <div className="h-7 w-48 bg-slate-800 rounded"></div>
                <div className="h-4 w-32 bg-slate-800 rounded"></div>
            </div>

            {/* Total Students Card Skeleton */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex items-center justify-between">
                <div>
                    <div className="h-3 w-24 bg-slate-800 rounded mb-2"></div>
                    <div className="h-6 w-16 bg-slate-700 rounded"></div>
                </div>
                <div className="h-10 w-10 bg-indigo-500/10 rounded-lg"></div>
            </div>

            {/* Currently Showing Card Skeleton */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex items-center justify-between">
                <div>
                    <div className="h-3 w-28 bg-slate-800 rounded mb-2"></div>
                    <div className="h-6 w-16 bg-slate-700 rounded"></div>
                </div>
                <div className="h-10 w-10 bg-emerald-500/10 rounded-lg"></div>
            </div>

            {/* Export/Upload Buttons Skeleton */}
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg flex flex-col justify-center gap-2">
                <div className="flex gap-2">
                    <div className="h-9 flex-1 bg-rose-600/50 rounded"></div>
                    <div className="h-9 flex-1 bg-amber-600/50 rounded"></div>
                </div>
                <div className="h-9 w-full bg-indigo-600/50 rounded"></div>
            </div>
        </div>

        {/* Filters & Search Skeleton */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className={`md:col-span-${i < 3 ? 2 : 4}`}>
                        <div className="h-3 w-16 bg-slate-800 rounded mb-2"></div>
                        <div className="h-10 w-full bg-slate-800 rounded-lg"></div>
                    </div>
                ))}
                <div className="md:col-span-2">
                    <div className="h-10 w-full bg-slate-700/50 rounded-lg"></div>
                </div>
            </div>
        </div>

        {/* Data Table Skeleton */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-800/50 border-b border-slate-700 text-xs uppercase text-slate-400">
                            <th className="p-4 font-semibold">Name / Email</th>
                            <th className="p-4 font-semibold">Roll No</th>
                            <th className="p-4 font-semibold">Branch</th>
                            <th className="p-4 font-semibold">Sem / Sec</th>
                            <th className="p-4 font-semibold">Contact</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <TableSkeleton />
                </table>
            </div>
        </div>
    </div>
);


/* --- EditModal --- */
function EditModal({ open, onClose, student, branches, semesters, sections, onSaved }) {
  const [form, setForm] = useState({});
  useEffect(() => {
    if (!student) return setForm({});
    setForm({
      name: student.name || "",
      email: student.email || "",
      contactNo: student.contactNo || "",
      rollNumber: student.rollNumber || "",
      branchId: student.branchId || (student.branch ? student.branch.id : ""),
      semesterId: student.semesterId || (student.semester ? student.semester.id : ""),
      sectionId: student.sectionId || (student.section ? student.section.id : "")
    });
  }, [student]);

  if (!open) return null;
  const token = localStorage.getItem("token");

  const save = async () => {
    try {
      const payload = {
        name: form.name,
        email: form.email,
        contactNo: form.contactNo,
        rollNumber: form.rollNumber,
        branchId: form.branchId ? Number(form.branchId) : null,
        semesterId: form.semesterId ? Number(form.semesterId) : null,
        sectionId: form.sectionId ? Number(form.sectionId) : null
      };
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/admin/students/${student.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire({ icon: "success", title: "Saved successfully", timer: 1500, showConfirmButton: false });
      onSaved(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || "Save failed" });
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 z-10">
        <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-3">
          <h3 className="text-xl font-bold text-white">Edit Student Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">✕</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['name', 'email', 'contactNo', 'rollNumber'].map((field) => (
                <div key={field}>
                    <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-1 block">{field.replace(/([A-Z])/g, ' $1')}</label>
                    <input className="w-full p-2.5 bg-slate-800 border border-slate-600 focus:border-indigo-500 text-white rounded outline-none transition-all" value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})} />
                </div>
            ))}
            {[
                { label: 'Branch', key: 'branchId', opts: branches, dKey: 'branchName' },
                { label: 'Semester', key: 'semesterId', opts: semesters, dKey: 'semesterName' },
                { label: 'Section', key: 'sectionId', opts: sections, dKey: 'sectionName' },
            ].map((item) => (
                <div key={item.key} className={item.key === 'sectionId' ? "md:col-span-2" : ""}>
                    <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-1 block">{item.label}</label>
                    <select className="w-full p-2.5 bg-slate-800 border border-slate-600 focus:border-indigo-500 text-white rounded outline-none transition-all" value={form[item.key]} onChange={e => setForm({...form, [item.key]: e.target.value})}>
                        <option value="">— Select {item.label} —</option>
                        {item.opts.map(o => <option key={o.id} value={o.id}>{o[item.dKey]}</option>)}
                    </select>
                </div>
            ))}
        </div>
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded text-white transition-colors">Cancel</button>
          <button onClick={save} className="px-6 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 rounded text-white font-medium shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-105">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

/* --- UploadModal --- */
function UploadModal({ open, onClose, branches, semesters, sections, onUploaded }) {
  const [branchId, setBranchId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewRows, setPreviewRows] = useState([]); 
  const [previewHeaders, setPreviewHeaders] = useState([]); 

  useEffect(() => {
    if (!open) {
      setBranchId(""); setSemesterId(""); setSectionId(""); setFile(null);
      setUploading(false); setPreviewRows([]); setPreviewHeaders([]);
    }
  }, [open]);

  if (!open) return null;
  const token = localStorage.getItem("token");

  const parseExcel = async (f) => {
    try {
      const data = await f.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) return; 
      const sheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      setPreviewRows(Array.isArray(rows) ? rows.slice(0, 10) : []);
      setPreviewHeaders(rows.length > 0 ? Object.keys(rows[0]) : []);
    } catch (err) { Swal.fire({ icon: "error", title: "Parse error", text: "Invalid Excel file" }); }
  };

  const onDrop = async (e) => {
    e.preventDefault(); e.stopPropagation();
    const f = e.dataTransfer?.files?.[0];
    if (f) { setFile(f); await parseExcel(f); }
  };

  const onFileChange = async (e) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); await parseExcel(f); }
  };

  const submit = async () => {
    if (!file) return Swal.fire({ icon: "warning", title: "No file", text: "Please select a file first." });
    const formData = new FormData();
    formData.append("file", file);
    if (branchId) formData.append("branchId", branchId);
    if (semesterId) formData.append("semesterId", semesterId);
    if (sectionId) formData.append("sectionId", sectionId);

    try {
      setUploading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/admin/students/import`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-form" }
      });
      Swal.fire({ icon: "success", title: "Import Successful", text: `Created: ${res.data.created}, Updated: ${res.data.updated}` });
      onUploaded && onUploaded(res.data);
      onClose();
    } catch (err) {
        const msg = err.response?.data?.error || err.message;
        Swal.fire({ icon: "error", title: "Import failed", text: String(msg) });
    } finally { setUploading(false); }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 rounded-xl p-6 z-10 shadow-2xl border border-slate-700 w-[90vw] max-w-[1100px] h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
          <div><h3 className="text-xl font-bold text-white">Import Students</h3><p className="text-sm text-gray-400">Upload .xlsx file</p></div>
          <button onClick={onClose} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-gray-300">Close</button>
        </div>
        <div className="flex-1 overflow-hidden mt-6 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2 flex flex-col gap-4 overflow-y-auto">
            <div className="grid grid-cols-3 gap-2">
                <select value={branchId} onChange={e=>setBranchId(e.target.value)} className="bg-slate-800 border border-slate-600 text-white rounded p-2 text-sm"><option value="">Branch...</option>{branches.map(b=><option key={b.id} value={b.id}>{b.branchName}</option>)}</select>
                <select value={semesterId} onChange={e=>setSemesterId(e.target.value)} className="bg-slate-800 border border-slate-600 text-white rounded p-2 text-sm"><option value="">Semester...</option>{semesters.map(s=><option key={s.id} value={s.id}>{s.semesterName}</option>)}</select>
                <select value={sectionId} onChange={e=>setSectionId(e.target.value)} className="bg-slate-800 border border-slate-600 text-white rounded p-2 text-sm"><option value="">Section...</option>{sections.map(s=><option key={s.id} value={s.id}>{s.sectionName}</option>)}</select>
            </div>
            <div onDrop={onDrop} onDragOver={e=>{e.preventDefault()}} className="flex-1 min-h-[200px] border-2 border-dashed border-slate-600 bg-slate-800/30 rounded-lg flex flex-col items-center justify-center p-6">
                 <Icons.Upload />
                 <p className="mt-4 text-sm text-gray-300 font-medium">{file ? file.name : "Drag & drop Excel file"}</p>
                 <label className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded cursor-pointer text-white text-sm font-medium transition-colors">Browse File <input type="file" accept=".xlsx,.xls" onChange={onFileChange} className="hidden" /></label>
            </div>
          </div>
          <div className="w-full md:w-1/2 bg-slate-800 rounded-lg p-4 border border-slate-700 flex flex-col">
            <h4 className="text-sm font-bold text-gray-200 mb-3">Preview</h4>
            <div className="flex-1 overflow-auto bg-slate-900 rounded p-2 border border-slate-700">
                {previewRows.length > 0 ? (
                    <table className="w-full text-xs text-left">
                        <thead><tr className="text-gray-400 border-b border-slate-700">{previewHeaders.map((h,i)=><th key={i} className="p-2 whitespace-nowrap">{h}</th>)}</tr></thead>
                        <tbody>{previewRows.map((r,i)=><tr key={i} className="text-gray-300 border-b border-slate-800/50 hover:bg-slate-800">{previewHeaders.map((h,j)=><td key={j} className="p-2 whitespace-nowrap">{r[h]}</td>)}</tr>)}</tbody>
                    </table>
                ) : <div className="text-gray-500 text-center mt-10 text-sm">Upload a file to see preview</div>}
            </div>
            <div className="mt-4 flex justify-end"><button onClick={submit} disabled={uploading || !file} className={`px-6 py-2 rounded text-white font-medium shadow-lg ${uploading ? 'bg-slate-600' : 'bg-emerald-600 hover:bg-emerald-500'}`}>{uploading ? "Importing..." : "Start Import"}</button></div>
        </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
  MAIN COMPONENT
  ========================================================================= */
export default function AdminUserDetail() {
  const navigate = useNavigate();

  // Data States
  const [students, setStudents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [sections, setSections] = useState([]);
  const [semesters, setSemesters] = useState([]);
  
  // UI States
  const [loading, setLoading] = useState(true); // Initial hard load
  const [fetching, setFetching] = useState(false); // Filter/search fetch
  const [exporting, setExporting] = useState(null); 

  // Filter States
  const [branchId, setBranchId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [q, setQ] = useState("");
  
  // 1. ADD DEBOUNCE STATE for search
  const [debouncedQ, setDebouncedQ] = useState("");

  // Modals
  const [editOpen, setEditOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  // Stats
  const [summary, setSummary] = useState({ totalStudents: 0, filteredStudents: 0 });

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchMaster();
    fetchData(true); // Initial fetch, ignore debounce for now
    // eslint-disable-next-line
  }, []);

  // 2. DEBOUNCE LOGIC: Update debouncedQ 500ms after user stops typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQ(q);
    }, 500); 

    return () => clearTimeout(handler);
  }, [q]);

  // 3. AUTO TRIGGER: Fetch data when Dropdowns OR Debounced Search changes
  useEffect(() => {
    fetchData();
    fetchSummary();
    // eslint-disable-next-line
  }, [branchId, sectionId, semesterId, debouncedQ]); 

  const fetchMaster = async () => {
    try {
      const [bRes, sRes, semRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/branches`),
        axios.get(`${import.meta.env.VITE_API_URL}/sections`),
        axios.get(`${import.meta.env.VITE_API_URL}/semesters`)
      ]);
      setBranches(bRes.data || []);
      setSections(sRes.data || []);
      setSemesters(semRes.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchData = async () => {
    setFetching(true);
    try {
      // 4. Use debouncedQ here
      const params = { branchId, sectionId, semesterId, q: debouncedQ };
      Object.keys(params).forEach(key => !params[key] && delete params[key]);

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/students`, { params, headers });
      setStudents(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
      setLoading(false); // Initial load is done now
    }
  };

  const fetchSummary = async () => {
    try {
      const params = { branchId, sectionId, semesterId, q: debouncedQ };
      Object.keys(params).forEach(key => !params[key] && delete params[key]);
      
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/students/summary`, { params, headers });
      setSummary(res.data || { totalStudents: 0, filteredStudents: 0 });
    } catch (err) { console.error(err); }
  };

  const confirmExport = async (type) => {
    const result = await Swal.fire({
      title: `Export to ${type.toUpperCase()}`,
      text: `Do you want to download the ${type.toUpperCase()} file for the current filtered list?`,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Yes, Download",
      confirmButtonColor: type === 'pdf' ? '#e11d48' : '#d97706',
      background: '#1e293b',
      color: '#fff'
    });

    if (!result.isConfirmed) return;
    setExporting(type);

    try {
      // Use debouncedQ for export too
      const params = { branchId, sectionId, semesterId, q: debouncedQ };
      Object.keys(params).forEach(key => !params[key] && delete params[key]);

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/students/${type}`, {
        params,
        responseType: "blob",
        headers
      });

      let filename = `students_export.${type === "pdf" ? "pdf" : "xlsx"}`;
      const disposition = res.headers["content-disposition"];
      if (disposition) {
        const m = disposition.match(/filename\*?=?(?:UTF-8''|")?(.*?)"?$/);
        if (m && m[1]) filename = decodeURIComponent(m[1]);
      }

      const blob = new Blob([res.data], { type: res.data.type });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      Swal.fire({ icon: "success", title: "Download Started", toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Export Failed", text: "Something went wrong on the server." });
    } finally {
      setExporting(null);
    }
  };

  // 🚫 REMOVED: The old `if (loading) return <Loader... />` block
  // 🟢 NEW: Use AdminDetailSkeleton when loading is true.

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
        {loading ? (
            <AdminDetailSkeleton />
        ) : (
            <>
                {/* 1. Header & Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="md:col-span-1">
                        <h1 className="text-2xl font-bold text-white tracking-tight">Student Management</h1>
                        <p className="text-slate-400 text-sm mt-1">Admin Dashboard / Students</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Students</p>
                            <p className="text-2xl font-bold text-white mt-1">{summary.totalStudents}</p>
                        </div>
                        <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Currently Showing</p>
                            <p className="text-2xl font-bold text-white mt-1">{summary.filteredStudents}</p>
                        </div>
                        <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg flex flex-col justify-center gap-2">
                        <div className="flex gap-2">
                            <button onClick={() => confirmExport("pdf")} disabled={exporting !== null} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium transition-all ${exporting === 'pdf' ? 'bg-rose-900/50 text-rose-200 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20'}`}>
                                {exporting === 'pdf' ? <Icons.Spinner /> : <Icons.Pdf />} {exporting === 'pdf' ? "Generating..." : "PDF"}
                            </button>
                            <button onClick={() => confirmExport("excel")} disabled={exporting !== null} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium transition-all ${exporting === 'excel' ? 'bg-amber-900/50 text-amber-200 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20'}`}>
                                {exporting === 'excel' ? <Icons.Spinner /> : <Icons.Excel />} {exporting === 'excel' ? "Generating..." : "Excel"}
                            </button>
                        </div>
                        <button onClick={() => setUploadOpen(true)} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-medium shadow-lg shadow-indigo-900/20 transition-all">
                            <Icons.Upload /> Upload Excel
                        </button>
                    </div>
                </div>

                {/* 2. Filters & Search */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-2">
                            <label className="text-xs text-slate-400 font-semibold uppercase mb-1 block">Branch</label>
                            <select value={branchId} onChange={e=>setBranchId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none">
                                <option value="">All Branches</option>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.branchName}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs text-slate-400 font-semibold uppercase mb-1 block">Semester</label>
                            <select value={semesterId} onChange={e=>setSemesterId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none">
                                <option value="">All Semesters</option>
                                {semesters.map(s => <option key={s.id} value={s.id}>{s.semesterName}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs text-slate-400 font-semibold uppercase mb-1 block">Section</label>
                            <select value={sectionId} onChange={e=>setSectionId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none">
                                <option value="">All Sections</option>
                                {sections.map(s => <option key={s.id} value={s.id}>{s.sectionName}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-4">
                            <label className="text-xs text-slate-400 font-semibold uppercase mb-1 block">Search Student</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400"><Icons.Search /></div>
                                <input type="text" value={q} onChange={e=>setQ(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg pl-10 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Search by name, email, or roll no..." />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <button onClick={() => { setBranchId(""); setSemesterId(""); setSectionId(""); setQ(""); }} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg text-sm px-4 py-2.5 transition-colors">Reset Filters</button>
                        </div>
                    </div>
                </div>

                {/* 3. Data Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
                    {/* Loading Indicator for filter/search updates */}
                    {fetching && <div className="p-4 text-center text-indigo-400 bg-indigo-500/10 text-sm font-medium animate-pulse">Updating list...</div>}
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-800/50 border-b border-slate-700 text-xs uppercase text-slate-400">
                                    <th className="p-4 font-semibold">Name / Email</th>
                                    <th className="p-4 font-semibold">Roll No</th>
                                    <th className="p-4 font-semibold">Branch</th>
                                    <th className="p-4 font-semibold">Sem / Sec</th>
                                    <th className="p-4 font-semibold">Contact</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            {/* Conditional rendering of Table content vs. Skeleton */}
                            {fetching ? (
                                <TableSkeleton />
                            ) : (
                                <tbody className="divide-y divide-slate-800">
                                    {students.length > 0 ? students.map((s) => (
                                        <tr key={s.id} className="hover:bg-slate-800/40 transition-colors group">
                                            <td className="p-4">
                                                <div className="font-medium text-white">{s.name}</div>
                                                <div className="text-xs text-slate-500">{s.email}</div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-300 font-mono">{s.rollNumber || "N/A"}</td>
                                            <td className="p-4 text-sm text-slate-300">
                                                {s.branch?.branchName || "-"}
                                                <div className="text-[10px] text-slate-500">{s.branch?.course?.courseName}</div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-300">
                                                <span className="inline-block bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-700 mr-1">{s.semester?.semesterName || "-"}</span>
                                                <span className="inline-block bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-700">{s.section?.sectionName || "-"}</span>
                                            </td>
                                            <td className="p-4 text-sm text-slate-400">{s.contactNo || "-"}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setEditingStudent(s) || setEditOpen(true)} className="px-3 py-1.5 text-xs font-medium bg-emerald-600/10 text-emerald-400 border border-emerald-600/20 hover:bg-emerald-600 hover:text-white rounded transition-all flex items-center gap-1"><Icons.Edit />Edit</button>
                                                    <button onClick={() => navigate(`/profile/${encodeURIComponent(s.email)}`)} className="px-3 py-1.5 text-xs font-medium bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 hover:bg-indigo-600 hover:text-white rounded transition-all flex items-center gap-1"><Icons.View />View</button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="6" className="p-8 text-center text-slate-500 italic">No student records found matching filters.</td></tr>
                                    )}
                                </tbody>
                            )}
                        </table>
                    </div>
                </div>

                <EditModal open={editOpen} onClose={() => setEditOpen(false)} student={editingStudent} branches={branches} semesters={semesters} sections={sections} onSaved={(updated) => { 
                    setStudents(prev => prev.map(s => s.id === updated.id ? updated : s)); 
                    fetchSummary(); 
                }} />

                <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} branches={branches} semesters={semesters} sections={sections} onUploaded={() => { fetchData(); fetchSummary(); }} />
            </>
        )}
    </div>
  );
}