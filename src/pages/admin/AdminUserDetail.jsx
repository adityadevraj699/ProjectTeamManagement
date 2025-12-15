import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiSearch, HiFilter, HiDownload, HiUpload, HiPencil, 
  HiUser, HiAcademicCap, HiOfficeBuilding, HiX, HiCheck 
} from "react-icons/hi";

/* -------------------- UI COMPONENTS -------------------- */

// 💀 Skeleton Loader for Table
const TableSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
        <div className="w-10 h-10 rounded-full bg-slate-700"></div>
        <div className="flex-1 grid grid-cols-4 gap-4">
          <div className="h-3 bg-slate-700 rounded w-3/4"></div>
          <div className="h-3 bg-slate-700 rounded w-1/2"></div>
          <div className="h-3 bg-slate-700 rounded w-1/2"></div>
          <div className="h-3 bg-slate-700 rounded w-1/4"></div>
        </div>
      </div>
    ))}
  </div>
);

// 📊 Stat Card
const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl flex items-center gap-4 shadow-lg">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

/* -------------------- EDIT MODAL -------------------- */
function EditModal({ open, onClose, student, branches, semesters, sections, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    try {
      const payload = {
        ...form,
        branchId: form.branchId ? Number(form.branchId) : null,
        semesterId: form.semesterId ? Number(form.semesterId) : null,
        sectionId: form.sectionId ? Number(form.sectionId) : null
      };
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/admin/students/${student.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire({ icon: "success", title: "Updated", timer: 1500, showConfirmButton: false, background: '#1e293b', color: '#fff' });
      onSaved(res.data);
      onClose();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data || "Save failed", background: '#1e293b', color: '#fff' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-6 z-10 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2"><HiPencil className="text-sky-400"/> Edit Student</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><HiX className="text-xl"/></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputGroup label="Name" value={form.name} onChange={v => setForm({...form, name: v})} />
          <InputGroup label="Email" value={form.email} onChange={v => setForm({...form, email: v})} />
          <InputGroup label="Roll Number" value={form.rollNumber} onChange={v => setForm({...form, rollNumber: v})} />
          <InputGroup label="Contact No" value={form.contactNo} onChange={v => setForm({...form, contactNo: v})} />
          
          <SelectGroup label="Branch" value={form.branchId} onChange={v => setForm({...form, branchId: v})} options={branches} displayKey="branchName" />
          <SelectGroup label="Semester" value={form.semesterId} onChange={v => setForm({...form, semesterId: v})} options={semesters} displayKey="semesterName" />
          <SelectGroup label="Section" value={form.sectionId} onChange={v => setForm({...form, sectionId: v})} options={sections} displayKey="sectionName" className="md:col-span-2" />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm font-medium transition">Cancel</button>
          <button onClick={save} disabled={saving} className="px-6 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg text-white text-sm font-bold shadow-lg shadow-sky-500/20 transition disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Helper Inputs
const InputGroup = ({ label, value, onChange }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-400 mb-1 ml-1">{label}</label>
    <input 
      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-sky-500 outline-none transition-colors text-sm"
      value={value} onChange={e => onChange(e.target.value)} 
    />
  </div>
);
const SelectGroup = ({ label, value, onChange, options, displayKey, className="" }) => (
  <div className={className}>
    <label className="block text-xs font-semibold text-slate-400 mb-1 ml-1">{label}</label>
    <select 
      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-sky-500 outline-none transition-colors text-sm"
      value={value} onChange={e => onChange(e.target.value)}
    >
      <option value="">Select...</option>
      {options.map(o => <option key={o.id} value={o.id}>{o[displayKey]}</option>)}
    </select>
  </div>
);

/* -------------------- UPLOAD MODAL -------------------- */
function UploadModal({ open, onClose, branches, semesters, sections, onUploaded }) {
  const [branchId, setBranchId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewRows, setPreviewRows] = useState([]);

  useEffect(() => {
    if (!open) {
      setFile(null); setPreviewRows([]);
    }
  }, [open]);

  if (!open) return null;
  const token = localStorage.getItem("token");

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    
    // Preview logic
    const data = await f.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    setPreviewRows(rows.slice(0, 5));
  };

  const submit = async () => {
    if (!file) return Swal.fire({icon: 'warning', title: 'No File', text: 'Please select an Excel file', background: '#1e293b', color: '#fff'});
    
    const formData = new FormData();
    formData.append("file", file);
    if(branchId) formData.append("branchId", branchId);
    if(semesterId) formData.append("semesterId", semesterId);
    if(sectionId) formData.append("sectionId", sectionId);

    setUploading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/admin/students/import`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      Swal.fire({
        icon: "success", title: "Import Successful",
        html: `<div class='text-sm text-slate-300'>Created: <b>${res.data.created}</b><br/>Updated: <b>${res.data.updated}</b></div>`,
        background: '#1e293b', color: '#fff'
      });
      onUploaded && onUploaded(res.data);
      onClose();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Upload Failed", text: err.response?.data?.error || "Error processing file", background: '#1e293b', color: '#fff' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-6 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><HiUpload className="text-emerald-400"/> Bulk Import</h3>
            <p className="text-xs text-slate-400">Upload an Excel sheet to create or update students in bulk.</p>
          </div>
          <button onClick={onClose}><HiX className="text-slate-400 hover:text-white text-xl"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
          {/* Left: Config */}
          <div className="w-full md:w-1/3 space-y-4">
            <SelectGroup label="Default Branch" value={branchId} onChange={setBranchId} options={branches} displayKey="branchName" />
            <SelectGroup label="Default Semester" value={semesterId} onChange={setSemesterId} options={semesters} displayKey="semesterName" />
            <SelectGroup label="Default Section" value={sectionId} onChange={setSectionId} options={sections} displayKey="sectionName" />
            
            <div className="pt-4 border-t border-slate-700">
              <label className="block w-full cursor-pointer bg-slate-800 hover:bg-slate-700 border-2 border-dashed border-slate-600 hover:border-emerald-500 rounded-xl p-6 text-center transition-all group">
                <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />
                <HiUpload className="mx-auto text-3xl text-slate-500 group-hover:text-emerald-400 mb-2"/>
                <span className="text-sm text-slate-300 font-medium group-hover:text-white">Click to Upload Excel</span>
                <p className="text-xs text-slate-500 mt-1">.xlsx or .xls files only</p>
              </label>
              {file && <div className="mt-2 text-xs text-emerald-400 font-mono text-center truncate">{file.name}</div>}
            </div>
          </div>

          {/* Right: Preview */}
          <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 overflow-x-auto">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Data Preview (First 5 Rows)</h4>
            {previewRows.length > 0 ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    {Object.keys(previewRows[0]).map(key => <th key={key} className="p-2">{key}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr key={i} className="border-b border-slate-800/50 text-slate-300">
                      {Object.values(row).map((val, j) => <td key={j} className="p-2 truncate max-w-[100px]">{val}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-sm">
                <p>No file selected</p>
                <p className="text-xs opacity-50 mt-1">Select a file to see a preview here.</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-800 border-t border-slate-700 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-300 hover:text-white text-sm">Cancel</button>
          <button onClick={submit} disabled={uploading || !file} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg shadow-lg">
            {uploading ? "Importing..." : "Start Import"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* -------------------- MAIN PAGE -------------------- */
export default function AdminUserDetail() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [sections, setSections] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [branchId, setBranchId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [q, setQ] = useState("");

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
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
    fetchSummary();
  }, [branchId, sectionId, semesterId, q]);

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
    setLoading(true);
    try {
      const params = { branchId, sectionId, semesterId, q };
      // Clean empty params
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/students`, { params, headers });
      setStudents(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const params = { branchId, sectionId, semesterId, q };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/students/summary`, { params, headers });
      setSummary(res.data || { totalStudents: 0, filteredStudents: 0 });
    } catch (err) { console.error(err); }
  };

  const exportData = async (type) => {
    try {
      const params = { branchId, sectionId, semesterId, q };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/students/${type}`, {
        params, responseType: "blob", headers
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `students_export.${type === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      Swal.fire({ icon: 'success', title: 'Downloaded', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, background: '#1e293b', color: '#fff' });
    } catch(err) {
      Swal.fire({ icon: 'error', title: 'Export Failed', background: '#1e293b', color: '#fff' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 p-6 md:p-10 font-sans">
      
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Student Directory</h1>
            <p className="text-slate-400 mt-1 text-sm">Manage student records, assignments, and access.</p>
          </div>
          
          <div className="flex gap-4">
             <StatCard label="Total" value={summary.totalStudents} icon={<HiUser/>} color="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" />
             <StatCard label="Filtered" value={summary.filteredStudents} icon={<HiFilter/>} color="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" />
          </div>
        </div>

        {/* --- ACTIONS BAR --- */}
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 mb-8 flex flex-col xl:flex-row gap-4 justify-between items-center shadow-lg">
           
           {/* Filters */}
           <div className="flex flex-wrap gap-3 w-full xl:w-auto">
              <select value={branchId} onChange={e => setBranchId(e.target.value)} className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2.5 outline-none focus:border-sky-500">
                 <option value="">All Branches</option>
                 {branches.map(b => <option key={b.id} value={b.id}>{b.branchName}</option>)}
              </select>
              <select value={semesterId} onChange={e => setSemesterId(e.target.value)} className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2.5 outline-none focus:border-sky-500">
                 <option value="">All Semesters</option>
                 {semesters.map(s => <option key={s.id} value={s.id}>{s.semesterName}</option>)}
              </select>
              <select value={sectionId} onChange={e => setSectionId(e.target.value)} className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2.5 outline-none focus:border-sky-500">
                 <option value="">All Sections</option>
                 {sections.map(s => <option key={s.id} value={s.id}>{s.sectionName}</option>)}
              </select>
           </div>

           {/* Search & Actions */}
           <div className="flex flex-wrap gap-3 w-full xl:w-auto items-center">
              <div className="relative flex-1 xl:flex-none">
                 <HiSearch className="absolute left-3 top-3 text-slate-500"/>
                 <input 
                   type="text" 
                   placeholder="Search name, email, roll..." 
                   value={q} 
                   onChange={e => setQ(e.target.value)}
                   className="w-full xl:w-64 bg-slate-900 border border-slate-700 text-white text-xs rounded-lg pl-9 pr-3 py-2.5 outline-none focus:border-sky-500"
                 />
              </div>
              
              <div className="h-8 w-px bg-slate-700 hidden xl:block mx-2"></div>

              <button onClick={() => setUploadOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-500/20 transition">
                 <HiUpload className="text-sm"/> Import
              </button>
              <button onClick={() => exportData('excel')} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg transition border border-slate-600">
                 <HiDownload className="text-sm"/> Excel
              </button>
           </div>
        </div>

        {/* --- TABLE --- */}
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
           {loading ? (
             <div className="p-8"><TableSkeleton /></div>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                 <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-700/50 uppercase text-[10px] font-bold tracking-wider">
                   <tr>
                     <th className="px-6 py-4">Student Name</th>
                     <th className="px-6 py-4">Academic Info</th>
                     <th className="px-6 py-4">Contact</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-700/50">
                   {students.length === 0 ? (
                     <tr><td colSpan={4} className="p-8 text-center text-slate-500">No students found. Try adjusting filters.</td></tr>
                   ) : (
                     students.map(s => (
                       <tr key={s.id} className="hover:bg-slate-700/30 transition-colors group">
                         <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                               {s.name.charAt(0)}
                             </div>
                             <div>
                               <div className="font-bold text-white group-hover:text-sky-400 transition-colors">{s.name}</div>
                               <div className="text-xs text-slate-500">{s.email}</div>
                             </div>
                           </div>
                         </td>
                         <td className="px-6 py-4">
                           <div className="flex flex-col gap-1">
                             <span className="text-slate-300 font-medium">{s.branch?.branchName || "—"}</span>
                             <div className="flex gap-2">
                               <span className="text-[10px] bg-slate-700/50 px-2 py-0.5 rounded text-slate-400 border border-slate-600">{s.semester?.semesterName || "—"}</span>
                               <span className="text-[10px] bg-slate-700/50 px-2 py-0.5 rounded text-slate-400 border border-slate-600">{s.section?.sectionName || "—"}</span>
                             </div>
                           </div>
                         </td>
                         <td className="px-6 py-4">
                           <div className="text-xs text-slate-400 space-y-1">
                             <p>Roll: <span className="text-slate-200">{s.rollNumber || "N/A"}</span></p>
                             <p>Ph: <span className="text-slate-200">{s.contactNo || "N/A"}</span></p>
                           </div>
                         </td>
                         <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                             <button 
                               onClick={() => navigate(`/profile/${encodeURIComponent(s.email)}`)}
                               className="p-2 rounded-lg bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-400 transition-colors shadow-sm border border-slate-700" 
                               title="View Profile"
                             >
                               <HiUser className="text-lg" />
                             </button>
                             <button 
                               onClick={() => { setEditingStudent(s); setEditOpen(true); }}
                               className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-400 transition-colors shadow-sm border border-slate-700"
                               title="Edit Student"
                             >
                               <HiPencil className="text-lg" />
                             </button>
                           </div>
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
             </div>
           )}
        </div>

        {/* Footer Info */}
        <div className="mt-4 text-right text-xs text-slate-500">
           Showing top 100 results for performance. Use filters to narrow down.
        </div>

      </div>

      {/* Modals */}
      <EditModal 
        open={editOpen} onClose={() => setEditOpen(false)} 
        student={editingStudent} 
        branches={branches} semesters={semesters} sections={sections} 
        onSaved={onSaved} 
      />
      
      <UploadModal 
        open={uploadOpen} onClose={() => setUploadOpen(false)} 
        branches={branches} semesters={semesters} sections={sections} 
        onUploaded={handleUploadCompleted} 
      />

    </div>
  );
}