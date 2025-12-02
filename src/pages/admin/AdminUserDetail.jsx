// src/pages/AdminUserDetail.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

// Loader
const Loader = ({ text = "Loading..." }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div className="bg-slate-900 p-6 rounded shadow flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mb-3" />
      <div className="text-sm text-gray-200">{text}</div>
    </div>
  </div>
);

// Edit modal
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
    </div>
  );
}
