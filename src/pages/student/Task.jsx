import React, { useEffect, useMemo, useState } from "react";
import api from "../../context/api";
import Swal from "sweetalert2";
import { HiSearch, HiFilter, HiRefresh, HiUpload, HiCheck, HiExternalLink, HiLockClosed } from "react-icons/hi";

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

const PRIORITY_STYLES = {
  CRITICAL: "bg-red-500/10 text-red-400 border border-red-500/20",
  HIGH: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  MEDIUM: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  LOW: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
  DEFAULT: "bg-gray-500/10 text-gray-400 border border-gray-500/20"
};

const STATUS_STYLES = {
  COMPLETED: "bg-green-500/10 text-green-400 border border-green-500/20",
  IN_PROGRESS: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  PENDING: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
  DEFAULT: "bg-gray-500/10 text-gray-400 border border-gray-500/20"
};

const TYPE_STYLES = {
  DEVELOPMENT: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
  TESTING: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  DOCUMENTATION: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  DEPLOYMENT: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
  OTHER: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
  DEFAULT: "bg-gray-500/10 text-gray-400 border border-gray-500/20"
};

function classForPriority(p) { return PRIORITY_STYLES[p] || PRIORITY_STYLES.DEFAULT; }
function classForStatus(s) { return STATUS_STYLES[s] || STATUS_STYLES.DEFAULT; }
function classForType(t) { return TYPE_STYLES[t] || TYPE_STYLES.DEFAULT; }

function formatDate(iso) {
  if (!iso) return "-";
  try { return new Date(iso).toLocaleDateString(); } catch { return iso; }
}

// 🕒 Helper to check if deadline is passed
function isTaskExpired(deadline) {
  if (!deadline) return false;
  const deadlineDate = new Date(deadline);
  const now = new Date();
  // Set time to end of day to be fair, or exact comparison depending on requirement.
  // Here assuming strict datetime comparison.
  return now > deadlineDate;
}

export default function Task() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const [files, setFiles] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // FILTER STATE
  const [filterTeam, setFilterTeam] = useState("");
  const [filterDeadlineBefore, setFilterDeadlineBefore] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => { fetchTasks(); }, []);

  async function fetchTasks() {
    setLoading(true);
    try {
      const res = await api.get("/tasks/my");
      setTasks(res.data || []);
    } catch (err) {
      console.error("Fetch tasks error:", err);
      Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Could not fetch tasks',
          background: '#1e293b',
          color: '#fff'
      });
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(taskId, status) {
    try {
      await api.put(`/tasks/${taskId}/status`, { status });
      Swal.fire({
          icon: 'success',
          title: 'Updated',
          text: 'Status updated successfully',
          timer: 1500,
          showConfirmButton: false,
          background: '#1e293b',
          color: '#fff'
      });
      fetchTasks();
    } catch (err) {
      console.error("Update status failed:", err);
      Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Could not update status',
          background: '#1e293b',
          color: '#fff'
      });
    }
  }

  function handleFileChange(e, taskId) {
    const f = e.target.files[0];
    setFiles(prev => ({ ...prev, [taskId]: f }));
  }

  async function submitFile(taskId, markCompleted = false) {
    const file = files[taskId];
    if (!file) {
      Swal.fire({
          icon: 'warning',
          title: 'Select File',
          text: 'Please choose a file to upload',
          background: '#1e293b',
          color: '#fff'
      });
      return;
    }
    const form = new FormData();
    form.append("file", file);
    form.append("markCompleted", markCompleted ? "true" : "false");

    try {
      setUploadingId(taskId);
      await api.post(`/tasks/${taskId}/submit`, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      Swal.fire({
          icon: 'success',
          title: 'Uploaded',
          text: 'File uploaded successfully',
          timer: 1500,
          showConfirmButton: false,
          background: '#1e293b',
          color: '#fff'
      });
      setFiles(prev => ({ ...prev, [taskId]: null }));
      fetchTasks();
    } catch (err) {
      console.error("Submit file failed:", err);
      Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: 'Could not upload file',
          background: '#1e293b',
          color: '#fff'
      });
    } finally {
      setUploadingId(null);
    }
  }

  // Derived lists for filter dropdown options
  const teamsList = useMemo(() => {
    const s = new Set();
    tasks.forEach(t => { if (t.teamName) s.add(t.teamName); });
    return Array.from(s).sort();
  }, [tasks]);

  // Apply filters & Search & Sorting
  const filteredTasks = useMemo(() => {
    let result = tasks.filter(t => {
      // Search Filter
      if (searchTerm) {
          const lowerTerm = searchTerm.toLowerCase();
          const matchesSearch = 
              t.taskDescription?.toLowerCase().includes(lowerTerm) ||
              t.teamName?.toLowerCase().includes(lowerTerm) ||
              t.assignedToName?.toLowerCase().includes(lowerTerm);
          if (!matchesSearch) return false;
      }

      if (filterTeam && (t.teamName || "") !== filterTeam) return false;
      if (filterPriority && (t.priority || "") !== filterPriority) return false;
      if (filterType && (t.type || "") !== filterType) return false;
      if (filterStatus && (t.status || "") !== filterStatus) return false;
      if (filterDeadlineBefore) {
        const comp = Date.parse(filterDeadlineBefore);
        const taskDate = t.deadline ? Date.parse(t.deadline) : null;
        if (!taskDate) return false;
        if (isNaN(comp) || taskDate > comp) return false;
      }
      return true;
    });

    // Sort: Latest tasks on top (by ID descending as proxy for creation time)
    return result.sort((a, b) => b.id - a.id);
  }, [tasks, searchTerm, filterTeam, filterPriority, filterType, filterStatus, filterDeadlineBefore]);


  function clearFilters() {
    setSearchTerm("");
    setFilterTeam("");
    setFilterDeadlineBefore("");
    setFilterPriority("");
    setFilterType("");
    setFilterStatus("");
  }

  if (loading) return <LoaderOverlay message="Loading tasks..." />;

  return (
    <div className="p-6 md:p-10 bg-[#0f172a] min-h-screen text-slate-200 font-sans selection:bg-sky-500/30">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                  <HiFilter className="text-sky-500" /> My Tasks
              </h1>
              <p className="text-slate-400 mt-2 text-sm">Track progress, manage deadlines, and submit your work.</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiSearch className="text-slate-500 text-lg" />
              </div>
              <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm placeholder-slate-500 text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-sm"
              />
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="mb-8 bg-slate-800/40 border border-slate-700/60 backdrop-blur-md p-4 rounded-2xl flex flex-wrap gap-4 items-center shadow-lg">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1">Team</label>
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:border-sky-500 focus:outline-none transition-colors"
            >
              <option value="">All Teams</option>
              {teamsList.map(team => <option key={team} value={team}>{team}</option>)}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1">Due Before</label>
            <input
              type="date"
              value={filterDeadlineBefore}
              onChange={(e) => setFilterDeadlineBefore(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:border-sky-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:border-sky-500 focus:outline-none transition-colors"
            >
              <option value="">All</option>
              {["CRITICAL","HIGH","MEDIUM","LOW"].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:border-sky-500 focus:outline-none transition-colors"
            >
              <option value="">All</option>
              {["PENDING","IN_PROGRESS","COMPLETED"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="ml-auto mt-auto">
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-bold text-white transition-colors border border-slate-600"
            >
              <HiRefresh className="text-lg"/> Reset Filters
            </button>
          </div>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block bg-slate-800/60 border border-slate-700/60 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Task Info</th>
                <th className="px-6 py-4">Assigned To</th>
                <th className="px-6 py-4">Project / Team</th>
                <th className="px-6 py-4">Tags</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Submission</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredTasks.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-slate-500">No tasks found.</td></tr>
              ) : (
                  filteredTasks.map((t) => {
                    const isExpired = isTaskExpired(t.deadline);
                    const isSubmitted = !!t.attachmentUrl;
                    
                    return (
                    <tr key={t.id} className="hover:bg-slate-700/30 transition-all group">
                      <td className="px-6 py-4 max-w-xs">
                        <div className="font-bold text-white line-clamp-2">{t.taskDescription}</div>
                        {t.comments && <div className="text-xs text-slate-400 mt-1 italic line-clamp-1">"{t.comments}"</div>}
                        <div className={`text-[10px] mt-2 font-mono ${isExpired && !isSubmitted ? "text-red-400 font-bold" : "text-slate-500"}`}>
                            Due: {formatDate(t.deadline)} {isExpired && !isSubmitted && "(EXPIRED)"}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                         {t.assignedToName ? (
                             <div className="flex items-center gap-2">
                                 <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">{t.assignedToName.charAt(0)}</div>
                                 {t.assignedToName}
                             </div>
                         ) : (
                             <span className="text-yellow-400 text-xs font-bold border border-yellow-400/20 bg-yellow-400/10 px-2 py-1 rounded">TEAM</span>
                         )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-slate-200 font-medium">{t.projectTitle || "-"}</div>
                        <div className="text-xs text-slate-500">{t.teamName || "-"}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 items-start">
                           <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${classForPriority(t.priority)}`}>
                             {t.priority || "MEDIUM"}
                           </span>
                           <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${classForType(t.type)}`}>
                             {t.type || "OTHER"}
                           </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {/* 🔥 STATUS LOCKED LOGIC: Locked if Expired OR Submitted */}
                        <div className="relative">
                            <select
                                value={t.status || "PENDING"}
                                onChange={(e) => updateStatus(t.id, e.target.value)}
                                disabled={isExpired || isSubmitted} 
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border bg-slate-900 outline-none focus:ring-1 focus:ring-sky-500 
                                ${isExpired || isSubmitted ? "opacity-50 cursor-not-allowed border-slate-700 text-slate-500" : "cursor-pointer"}
                                ${
                                    t.status === 'COMPLETED' ? 'text-green-400 border-green-500/30' :
                                    t.status === 'IN_PROGRESS' ? 'text-yellow-400 border-yellow-500/30' :
                                    'text-slate-400 border-slate-600'
                                }`}
                            >
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                            {(isExpired || isSubmitted) && <HiLockClosed className="absolute right-2 top-2 text-slate-500" />}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {t.attachmentUrl ? (
                          <a href={t.attachmentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 hover:underline text-xs font-medium">
                             <HiExternalLink/> View File
                          </a>
                        ) : (
                          <span className="text-xs text-slate-500">Not submitted</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                         <div className="flex flex-col gap-2 items-end">
                            {!t.attachmentUrl && (
                                <>
                                    {/* 🔥 SUBMIT LOCKED LOGIC: Hide upload if expired */}
                                    {isExpired ? (
                                        <div className="flex items-center gap-1 text-red-500 text-xs font-bold bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                                            <HiLockClosed /> Deadline Expired
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <label className="cursor-pointer p-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors border border-slate-600" title="Select File">
                                                <input type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => handleFileChange(e, t.id)} />
                                                <HiUpload className="text-lg"/>
                                            </label>
                                            
                                            {files[t.id] && (
                                                <button
                                                    onClick={() => submitFile(t.id, true)}
                                                    disabled={uploadingId === t.id}
                                                    className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-1"
                                                >
                                                    {uploadingId === t.id ? "..." : <><HiCheck/> Submit</>}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                         </div>
                      </td>
                    </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-4">
          {filteredTasks.length === 0 ? <p className="text-center text-slate-500">No tasks found.</p> :
            filteredTasks.map((t) => {
              const isExpired = isTaskExpired(t.deadline);
              const isSubmitted = !!t.attachmentUrl;

              return (
                <div key={t.id} className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 shadow-lg relative overflow-hidden">
                {/* Priority Stripe */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${
                    t.priority === 'CRITICAL' ? 'bg-red-500' : 
                    t.priority === 'HIGH' ? 'bg-orange-500' : 'bg-sky-500'
                }`}></div>

                <div className="pl-3">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm font-bold text-white leading-tight">{t.taskDescription}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${classForStatus(t.status)}`}>{t.status}</span>
                    </div>

                    <div className={`text-xs mb-3 font-mono ${isExpired && !isSubmitted ? "text-red-400 font-bold" : "text-slate-400"}`}>
                        Due: {formatDate(t.deadline)} {isExpired && !isSubmitted && " (EXPIRED)"}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${classForType(t.type)}`}>{t.type}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mb-4 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                        <div><span className="text-slate-500 block text-[10px] uppercase">Project</span>{t.projectTitle || "-"}</div>
                        <div><span className="text-slate-500 block text-[10px] uppercase">Assigned To</span>{t.assignedToName || "Team"}</div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-700/50">
                        {/* 🔥 STATUS MOBILE: Disabled if Expired or Submitted */}
                        <select
                            value={t.status || "PENDING"}
                            onChange={(e) => updateStatus(t.id, e.target.value)}
                            disabled={isExpired || isSubmitted}
                            className={`bg-slate-900 text-white text-xs border border-slate-600 rounded px-2 py-1.5 outline-none focus:border-sky-500 ${isExpired || isSubmitted ? 'opacity-50' : ''}`}
                        >
                            <option value="PENDING">PENDING</option>
                            <option value="IN_PROGRESS">IN PROGRESS</option>
                            <option value="COMPLETED">COMPLETED</option>
                        </select>

                        {!t.attachmentUrl && (
                            <div className="flex items-center gap-2">
                                {/* 🔥 SUBMIT MOBILE: Hide if Expired */}
                                {isExpired ? (
                                    <span className="text-[10px] font-bold text-red-400 border border-red-500/30 px-2 py-1 rounded bg-red-500/10 uppercase">Expired</span>
                                ) : (
                                    <>
                                        <label className="p-1.5 rounded bg-slate-700 text-white cursor-pointer">
                                            <input type="file" className="hidden" onChange={(e) => handleFileChange(e, t.id)} />
                                            <HiUpload/>
                                        </label>
                                        <button onClick={() => submitFile(t.id, true)} className="bg-emerald-600 text-white px-3 py-1.5 rounded text-xs font-bold">Submit</button>
                                    </>
                                )}
                            </div>
                        )}
                        
                        {t.attachmentUrl && (
                            <button onClick={() => window.open(t.attachmentUrl, "_blank")} className="text-sky-400 text-xs font-bold hover:underline">View File</button>
                        )}
                    </div>
                </div>
                </div>
              );
          })}
        </div>

      </div>
    </div>
  );
}