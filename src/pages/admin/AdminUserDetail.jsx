// src/pages/AdminUserDetail.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

/* -------------------- Loader -------------------- */
const Loader = ({ text = "Loading..." }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div className="bg-slate-900 p-6 rounded shadow flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mb-3" />
      <div className="text-sm text-gray-200">{text}</div>
    </div>
  </div>
);

/* -------------------- EditModal -------------------- */
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
      Swal.fire({ icon: "success", title: "Saved" });
      onSaved(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data || "Save failed" });
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-slate-900 rounded p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Edit Student</h3>
          <button onClick={onClose} className="text-gray-300 px-2">Close</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-300">Name</label>
            <input className="w-full mt-1 p-2 bg-slate-800 text-white rounded" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div>
            <label className="text-sm text-gray-300">Email</label>
            <input className="w-full mt-1 p-2 bg-slate-800 text-white rounded" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>

          <div>
            <label className="text-sm text-gray-300">Contact</label>
            <input className="w-full mt-1 p-2 bg-slate-800 text-white rounded" value={form.contactNo} onChange={e => setForm({...form, contactNo: e.target.value})} />
          </div>

          <div>
            <label className="text-sm text-gray-300">Roll No</label>
            <input className="w-full mt-1 p-2 bg-slate-800 text-white rounded" value={form.rollNumber} onChange={e => setForm({...form, rollNumber: e.target.value})} />
          </div>

          <div>
            <label className="text-sm text-gray-300">Branch</label>
            <select className="w-full mt-1 p-2 bg-slate-800 text-white rounded" value={form.branchId} onChange={e => setForm({...form, branchId: e.target.value})}>
              <option value="">— none —</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.branchName}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-300">Semester</label>
            <select className="w-full mt-1 p-2 bg-slate-800 text-white rounded" value={form.semesterId} onChange={e => setForm({...form, semesterId: e.target.value})}>
              <option value="">— none —</option>
              {semesters.map(s => <option key={s.id} value={s.id}>{s.semesterName}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-300">Section</label>
            <select className="w-full mt-1 p-2 bg-slate-800 text-white rounded" value={form.sectionId} onChange={e => setForm({...form, sectionId: e.target.value})}>
              <option value="">— none —</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.sectionName}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 bg-slate-700 rounded text-white">Cancel</button>
          <button onClick={save} className="px-3 py-2 bg-emerald-600 rounded text-white">Save</button>
        </div>
      </div>
    </div>
  );
}

/* -------------------- UploadModal (with excel preview) -------------------- */
function UploadModal({ open, onClose, branches, semesters, sections, onUploaded }) {
  const [branchId, setBranchId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewRows, setPreviewRows] = useState([]); // parsed rows
  const [previewHeaders, setPreviewHeaders] = useState([]); // header order

  useEffect(() => {
    if (!open) {
      // reset modal state on close
      setBranchId("");
      setSemesterId("");
      setSectionId("");
      setFile(null);
      setUploading(false);
      setDragOver(false);
      setPreviewRows([]);
      setPreviewHeaders([]);
    }
  }, [open]);

  if (!open) return null;
  const token = localStorage.getItem("token");

  const parseExcel = async (f) => {
    try {
      const data = await f.arrayBuffer();
      // read as array
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        setPreviewRows([]);
        setPreviewHeaders([]);
        Swal.fire({ icon: "warning", title: "Empty workbook", text: "No sheets found in Excel." });
        return;
      }
      const sheet = workbook.Sheets[firstSheetName];
      // convert to JSON; defval: '' to avoid undefined
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      setPreviewRows(Array.isArray(rows) ? rows.slice(0, 10) : []);
      setPreviewHeaders(rows.length > 0 ? Object.keys(rows[0]) : []);
    } catch (err) {
      console.error("Excel parse error", err);
      setPreviewRows([]);
      setPreviewHeaders([]);
      Swal.fire({ icon: "error", title: "Parse error", text: "Could not read the Excel file." });
    }
  };

  const onDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer?.files && e.dataTransfer.files[0];
    if (!f) return;
    setFile(f);
    // parse preview
    await parseExcel(f);
  };

  const onFileChange = async (e) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    setFile(f);
    await parseExcel(f);
  };

  const submit = async () => {
    if (!file) {
      Swal.fire({ icon: "warning", title: "Select file", text: "Please choose an .xlsx file to upload." });
      return;
    }

    const nameLower = file.name.toLowerCase();
    if (!nameLower.endsWith(".xlsx") && !nameLower.endsWith(".xls")) {
      Swal.fire({ icon: "warning", title: "Wrong file type", text: "Please upload an .xlsx/.xls file." });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    if (branchId) formData.append("branchId", branchId);
    if (semesterId) formData.append("semesterId", semesterId);
    if (sectionId) formData.append("sectionId", sectionId);

    try {
      setUploading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/admin/students/import`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      Swal.fire({
        icon: "success",
        title: "Import completed",
        html: `<div>Created: <b>${res.data.created}</b><br/>Updated: <b>${res.data.updated}</b><br/>Skipped: <b>${res.data.skipped}</b></div>`,
        width: 450
      });

      onUploaded && onUploaded(res.data);
      onClose();
    } catch (err) {
      console.error("Import failed", err);
      const msg = err.response?.data?.error || err.response?.data || err.message || "Upload failed";
      Swal.fire({ icon: "error", title: "Import failed", text: String(msg) });
    } finally {
      setUploading(false);
    }
  };

  // inline styles: modal width 80vw (max capped) and safe min widths for columns so preview doesn't overlap
  const modalStyle = {
    width: "80vw",
    maxWidth: "1100px",
    minWidth: "640px",
    height: "80vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  const leftPanelStyle = {
    minWidth: 420,
    maxWidth: "60%",
    overflow: "auto",
    boxSizing: "border-box"
  };

  const rightPanelStyle = {
    minWidth: 300,
    maxWidth: "40%",
    overflow: "auto",
    boxSizing: "border-box"
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center px-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* modal card: centered, 80vw width on desktop */}
      <div
        className="relative bg-slate-900 rounded-lg p-4 z-10 shadow-2xl"
        style={modalStyle}
        role="dialog"
        aria-modal="true"
        aria-label="Upload students from Excel"
      >
        {/* header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-700">
          <div>
            <h3 className="text-lg font-semibold text-white">Upload students from Excel</h3>
            <p className="text-sm text-gray-400">Choose branch/semester/section to assign, then upload the file.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white px-2 py-1 rounded-md bg-slate-800/50"
              aria-label="Close upload modal"
            >
              Close
            </button>
          </div>
        </div>

        {/* body: two columns (left: form, right: preview/errors) */}
        <div className="flex-1 overflow-hidden mt-4 flex gap-4">
          {/* left: selection + file drop */}
          <div className="p-3 bg-slate-800 rounded flex flex-col gap-4" style={leftPanelStyle}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-gray-300">Branch</label>
                <select value={branchId} onChange={e => setBranchId(e.target.value)} className="w-full mt-1 p-2 bg-slate-700 rounded text-white">
                  <option value="">— none —</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.branchName}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-300">Semester</label>
                <select value={semesterId} onChange={e => setSemesterId(e.target.value)} className="w-full mt-1 p-2 bg-slate-700 rounded text-white">
                  <option value="">— none —</option>
                  {semesters.map(s => <option key={s.id} value={s.id}>{s.semesterName}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-300">Section</label>
                <select value={sectionId} onChange={e => setSectionId(e.target.value)} className="w-full mt-1 p-2 bg-slate-700 rounded text-white">
                  <option value="">— none —</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.sectionName}</option>)}
                </select>
              </div>
            </div>

            {/* drag & drop area */}
            <div
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
              className={`mt-2 flex flex-col items-center justify-center gap-3 p-6 rounded border-2 ${dragOver ? "border-dashed border-sky-400 bg-slate-700/50" : "border-dashed border-slate-700"} text-center`}
              style={{ minHeight: 180 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h10a4 4 0 004-4M16 7l-4-4m0 0L8 7m4-4v11" />
              </svg>

              <div className="text-sm text-gray-300">
                <div className="font-medium">{file ? file.name : "Drag & drop your Excel file here"}</div>
                <div className="text-xs text-gray-400 mt-1">or</div>

                <label className="inline-block mt-2">
                  <input type="file" accept=".xlsx,.xls" onChange={onFileChange} className="hidden" />
                  <span className="inline-block px-4 py-2 mt-1 bg-sky-600 rounded cursor-pointer text-white text-sm">Browse file</span>
                </label>
              </div>

              <div className="text-xs text-gray-400 mt-2">
                Expected header (first sheet): <span className="font-medium">s.no | name | email | roll number</span><br />
                Optional: contact number in next column.<br />
                Max file size: your server config decides.
              </div>
            </div>

            {/* small helpful notes */}
            <div className="text-xs text-gray-400">
              <ul className="list-disc pl-4">
                <li>Header row must be present in first sheet.</li>
                <li>Empty rows are skipped.</li>
                <li>Existing users matched by email will be updated (branch/section/semester applied if selected).</li>
              </ul>
            </div>

            <div className="mt-auto flex items-center justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 bg-slate-700 rounded text-white">Cancel</button>
              <button onClick={submit} disabled={uploading} className={`px-4 py-2 rounded text-white ${uploading ? "bg-slate-600 cursor-wait" : "bg-indigo-600 hover:bg-indigo-500"}`}>
                {uploading ? "Uploading..." : "Upload & Register"}
              </button>
            </div>
          </div>

          {/* right: preview / result / errors */}
          <div className="p-3 bg-slate-800 rounded h-full" style={rightPanelStyle}>
            <h4 className="text-sm font-semibold text-white mb-2">Preview & quick checks</h4>

            <div className="mb-3 text-xs text-gray-400">
              When file is selected you'll see a preview of the first few rows here (client-only preview).
            </div>

            {file ? (
              <div className="bg-slate-900/50 rounded p-3 overflow-auto">
                <div className="text-xs text-gray-300 mb-2">Selected file: <span className="font-medium text-white">{file.name}</span></div>
                <div className="text-xs text-gray-400 mb-2">File size: {(file.size / 1024).toFixed(1)} KB • Type: {file.type || "—"}</div>
                <div className="text-xs text-gray-400 mb-2">Important: server will validate each row and return a summary after upload.</div>

                <div className="mt-3 text-xs text-gray-300">
                  <div className="font-medium mb-1">Preview (first {previewRows.length ? previewRows.length : 0} rows)</div>
                  <div className="overflow-auto">
                    {previewRows.length > 0 ? (
                      <table className="w-full text-xs table-fixed border-collapse">
                        <thead>
                          <tr className="text-left text-gray-300">
                            {previewHeaders.map((h, idx) => <th key={idx} className="pb-1">{h}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {previewRows.map((row, rIdx) => (
                            <tr className="text-gray-400" key={rIdx}>
                              {previewHeaders.map((h, cIdx) => (
                                <td key={cIdx} className="align-top py-1">{String(row[h] ?? "")}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      // fallback: show your example required format if no preview rows parsed
                      <div>
                        <div className="text-xs text-gray-400 mb-2">No preview rows found — showing example format:</div>
                        <table className="w-full text-xs table-fixed border-collapse">
                          <thead>
                            <tr className="text-left text-gray-300">
                              <th className="pb-1">s.no</th>
                              <th className="pb-1">name</th>
                              <th className="pb-1">email</th>
                              <th className="pb-1">roll number</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="text-gray-400">
                              <td>1</td>
                              <td>Anjali Shah</td>
                              <td>anjali.shah.cs.2022@mitmeerut.ac.in</td>
                              <td>2202920100024</td>
                            </tr>
                            <tr className="text-gray-400">
                              <td>2</td>
                              <td>Juhi Kumari</td>
                              <td>juhi.kumari.cs.2022@mitmeerut.ac.in</td>
                              <td>2202920100050</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-center text-gray-500 py-6">No file selected</div>
            )}

            <div className="mt-4 text-xs text-gray-400">
              After import you will receive a summary with created/updated/skipped counts. Rows with issues are returned in `errors` array from the server.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Main page component -------------------- */
export default function AdminUserDetail() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [sections, setSections] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  // filters
  const [branchId, setBranchId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [q, setQ] = useState("");

  // modal
  const [editOpen, setEditOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // upload modal
  const [uploadOpen, setUploadOpen] = useState(false);

  // summary
  const [summary, setSummary] = useState({ totalStudents: 0, filteredStudents: 0, subtitle: "All students" });

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchMaster();
    fetchData();
    // eslint-disable-next-line
  }, []);

  // whenever filters change we re-fetch data & summary
  useEffect(() => {
    fetchData();
    fetchSummary();
    // eslint-disable-next-line
  }, [branchId, sectionId, semesterId]);

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
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    setFetching(true);
    try {
      const params = {};
      if (branchId) params.branchId = branchId;
      if (sectionId) params.sectionId = sectionId;
      if (semesterId) params.semesterId = semesterId;
      if (q) params.q = q;

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/students`, {
        params,
        headers
      });
      setStudents(res.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Fetch failed", text: err.response?.data || "Could not fetch students" });
    } finally {
      setFetching(false);
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const params = {};
      if (branchId) params.branchId = branchId;
      if (sectionId) params.sectionId = sectionId;
      if (semesterId) params.semesterId = semesterId;
      if (q) params.q = q;
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/students/summary`, { params, headers });
      setSummary(res.data || { totalStudents: 0, filteredStudents: 0, subtitle: "All students" });
    } catch (err) {
      console.error("Summary fetch failed", err);
    }
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setEditOpen(true);
  };

  const onSaved = (updated) => {
    setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
    // refresh counts
    fetchSummary();
  };

  // after successful upload -> refresh everything
  const handleUploadCompleted = (result) => {
    fetchData();
    fetchSummary();
    // optionally display detailed errors
    if (result && result.errors && result.errors.length) {
      const list = result.errors.map(e => `Row ${e.row}: ${e.reason}`).slice(0, 10).join("<br/>");
      Swal.fire({ icon: "info", title: "Some rows had errors", html: list });
    }
  };

  // Export (pdf or excel)
  const confirmExport = async (type) => {
    const answer = await Swal.fire({
      title: `Export ${type.toUpperCase()}`,
      text: `Export filtered results to ${type === "pdf" ? "PDF" : "Excel"}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, export"
    });
    if (!answer.isConfirmed) return;

    try {
      const params = {};
      if (branchId) params.branchId = branchId;
      if (sectionId) params.sectionId = sectionId;
      if (semesterId) params.semesterId = semesterId;
      if (q) params.q = q;

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/students/${type}`, {
        params,
        responseType: "blob",
        headers
      });

      let filename = `${type === "pdf" ? "students_report.pdf" : "students_report.xlsx"}`;
      const disposition = res.headers["content-disposition"] || res.headers["Content-Disposition"];
      if (disposition) {
        const m = disposition.match(/filename\*?=?(?:UTF-8''|")?(.*?)"?$/);
        if (m && m[1]) filename = decodeURIComponent(m[1]);
      }

      const blob = new Blob([res.data], { type: res.data.type || "" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      Swal.fire({ icon: "success", title: "Downloaded", text: `${type.toUpperCase()} exported` });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Export failed", text: err.response?.data || "Could not export" });
    }
  };

  if (loading) return <Loader text="Preparing..." />;

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100">
      {fetching && <Loader text="Loading students..." />}

      {/* TOP: Institute header + quick summary */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-sm text-gray-300 mt-1">{summary.subtitle}</div>
          </div>

          <div className="ml-auto flex gap-4 items-center">
            <div className="bg-slate-800 p-3 rounded text-center">
              <div className="text-xs text-gray-400">Total students</div>
              <div className="text-xl font-semibold text-white">{summary.totalStudents}</div>
            </div>

            <div className="bg-slate-800 p-3 rounded text-center">
              <div className="text-xs text-gray-400">Showing (filtered)</div>
              <div className="text-xl font-semibold text-white">{summary.filteredStudents}</div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => confirmExport("pdf")} className="px-3 py-2 bg-rose-600 rounded text-white">Export PDF</button>
              <button onClick={() => confirmExport("excel")} className="px-3 py-2 bg-amber-600 rounded text-white">Export Excel</button>
              <button onClick={() => setUploadOpen(true)} className="px-3 py-2 bg-indigo-600 rounded text-white">Upload Excel</button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 p-4 rounded mb-6 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
        <div>
          <label className="text-sm text-gray-300">Branch</label>
          <select value={branchId} onChange={e => setBranchId(e.target.value)} className="w-full mt-1 p-2 bg-slate-700 rounded text-white">
            <option value="">All</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.branchName}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-300">Semester</label>
          <select value={semesterId} onChange={e => setSemesterId(e.target.value)} className="w-full mt-1 p-2 bg-slate-700 rounded text-white">
            <option value="">All</option>
            {semesters.map(s => <option key={s.id} value={s.id}>{s.semesterName}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-300">Section</label>
          <select value={sectionId} onChange={e => setSectionId(e.target.value)} className="w-full mt-1 p-2 bg-slate-700 rounded text-white">
            <option value="">All</option>
            {sections.map(s => <option key={s.id} value={s.id}>{s.sectionName}</option>)}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm text-gray-300">Search (name/email/roll)</label>
          <div className="flex gap-2 mt-1">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." className="flex-1 p-2 bg-slate-700 rounded text-white" />
            <button onClick={() => { fetchData(); fetchSummary(); }} className="px-3 py-2 bg-sky-600 rounded text-white">Apply</button>
            <button onClick={() => { setBranchId(""); setSemesterId(""); setSectionId(""); setQ(""); fetchData(); fetchSummary(); }} className="px-3 py-2 bg-slate-600 rounded text-white">Reset</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-700 text-gray-200">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Roll</th>
              <th className="px-3 py-2">Branch</th>
              <th className="px-3 py-2">Course</th>
              <th className="px-3 py-2">Semester</th>
              <th className="px-3 py-2">Section</th>
              <th className="px-3 py-2">Contact</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} className="border-b border-slate-700">
                <td className="px-3 py-2">{s.name}</td>
                <td className="px-3 py-2 text-sky-300">{s.email}</td>
                <td className="px-3 py-2">{s.rollNumber ?? "-"}</td>
                <td className="px-3 py-2">{s.branch ? s.branch.branchName : "-"}</td>
                <td className="px-3 py-2">{s.branch && s.branch.course ? s.branch.course.courseName : "-"}</td>
                <td className="px-3 py-2">{s.semester ? s.semester.semesterName : "-"}</td>
                <td className="px-3 py-2">{s.section ? s.section.sectionName : "-"}</td>
                <td className="px-3 py-2">{s.contactNo ?? "-"}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/profile/${encodeURIComponent(s.email)}`)} className="px-2 py-1 bg-sky-600 rounded text-white text-xs">Profile</button>
                    <button onClick={() => handleOpenEdit(s)} className="px-2 py-1 bg-emerald-600 rounded text-white text-xs">Edit</button>
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-4 text-center text-gray-400">No students found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        student={editingStudent}
        branches={branches}
        semesters={semesters}
        sections={sections}
        onSaved={(updated) => onSaved(updated)}
      />

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        branches={branches}
        semesters={semesters}
        sections={sections}
        onUploaded={(res) => handleUploadCompleted(res)}
      />
    </div>
  );
}
