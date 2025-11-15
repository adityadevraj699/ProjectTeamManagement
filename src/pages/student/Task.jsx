// src/components/Task.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../../context/api";
import Swal from "sweetalert2";

const PRIORITY_STYLES = {
  CRITICAL: "bg-red-600 text-white",
  HIGH: "bg-orange-500 text-white",
  MEDIUM: "bg-sky-500 text-white",
  LOW: "bg-gray-400 text-black",
  DEFAULT: "bg-gray-300 text-black"
};

const STATUS_STYLES = {
  COMPLETED: "bg-green-600 text-white",
  IN_PROGRESS: "bg-yellow-500 text-black",
  PENDING: "bg-gray-400 text-black",
  DEFAULT: "bg-gray-300 text-black"
};

const TYPE_STYLES = {
  DEVELOPMENT: "bg-indigo-600 text-white",
  TESTING: "bg-purple-600 text-white",
  DOCUMENTATION: "bg-emerald-600 text-white",
  DEPLOYMENT: "bg-teal-600 text-white",
  OTHER: "bg-gray-500 text-white",
  DEFAULT: "bg-gray-300 text-black"
};

function classForPriority(p) { return PRIORITY_STYLES[p] || PRIORITY_STYLES.DEFAULT; }
function classForStatus(s) { return STATUS_STYLES[s] || STATUS_STYLES.DEFAULT; }
function classForType(t) { return TYPE_STYLES[t] || TYPE_STYLES.DEFAULT; }

function formatDate(iso) {
  if (!iso) return "-";
  try { return new Date(iso).toLocaleDateString(); } catch { return iso; }
}

export default function Task() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const [files, setFiles] = useState({});
  const [dark] = useState(() => {
    try { return localStorage.getItem("pref_dark") === "1"; } catch { return true; }
  });

  // FILTER STATE
  const [filterTeam, setFilterTeam] = useState("");
  const [filterDeadlineBefore, setFilterDeadlineBefore] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  useEffect(() => { fetchTasks(); }, []);

  function getToken() {
    try { return localStorage.getItem("token"); } catch { return null; }
  }

  async function fetchTasks() {
    setLoading(true);
    try {
      const res = await api.get("/tasks/my");
      setTasks(res.data || []);
    } catch (err) {
      const r = err?.response;
      const msg = r?.data?.message || r?.data || err?.message || "Could not fetch tasks";
      console.error("Fetch tasks error:", err);
      Swal.fire("Error", msg.toString(), "error");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(taskId, status) {
    try {
      await api.put(`/tasks/${taskId}/status`, { status });
      Swal.fire("Saved", "Status updated", "success");
      fetchTasks();
    } catch (err) {
      const r = err?.response;
      console.error("Update status failed:", { message: err?.message, status: r?.status, data: r?.data });
      Swal.fire("Error", r?.data?.error || r?.data?.message || "Could not update status", "error");
    }
  }

  function handleFileChange(e, taskId) {
    const f = e.target.files[0];
    setFiles(prev => ({ ...prev, [taskId]: f }));
  }

  async function submitFile(taskId, markCompleted = false) {
    const file = files[taskId];
    if (!file) {
      Swal.fire("Select file", "Please choose a file to upload", "warning");
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
      Swal.fire("Uploaded", "File uploaded successfully", "success");
      setFiles(prev => ({ ...prev, [taskId]: null }));
      fetchTasks();
    } catch (err) {
      const r = err?.response;
      console.error("Submit file failed:", { message: err?.message, status: r?.status, data: r?.data });
      Swal.fire("Error", r?.data?.error || r?.data?.message || "Upload failed", "error");
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

  const prioritiesList = useMemo(() => {
    const s = new Set();
    tasks.forEach(t => { if (t.priority) s.add(t.priority); });
    return Array.from(s).sort();
  }, [tasks]);

  const typesList = useMemo(() => {
    const s = new Set();
    tasks.forEach(t => { if (t.type) s.add(t.type); });
    return Array.from(s).sort();
  }, [tasks]);

  const statusesList = useMemo(() => {
    const s = new Set();
    tasks.forEach(t => { if (t.status) s.add(t.status); });
    return Array.from(s).sort();
  }, [tasks]);

  // Apply filters (client-side)
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
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
  }, [tasks, filterTeam, filterPriority, filterType, filterStatus, filterDeadlineBefore]);

  // ---------- NEW: sort filteredTasks newest-first ----------
  const sortedTasks = useMemo(() => {
    // copy then sort by assignedDate desc, fallback to id desc
    return filteredTasks.slice().sort((a, b) => {
      const aDate = a.assignedDate ? Date.parse(a.assignedDate) : 0;
      const bDate = b.assignedDate ? Date.parse(b.assignedDate) : 0;
      if (bDate !== aDate) return bDate - aDate;
      // fallback to id (newer id on top)
      const aId = a.id || 0;
      const bId = b.id || 0;
      return bId - aId;
    });
  }, [filteredTasks]);
  // ---------------------------------------------------------

  function clearFilters() {
    setFilterTeam("");
    setFilterDeadlineBefore("");
    setFilterPriority("");
    setFilterType("");
    setFilterStatus("");
  }

  if (loading) return (
    <div className="min-h-[200px] flex items-center justify-center bg-[#071226] dark:bg-[#071226]">
      <div className="text-lg font-medium text-slate-200">Loading tasks...</div>
    </div>
  );

  if (!tasks.length) return (
    <div className="p-6 bg-[#071226] min-h-[200px]">
      <h2 className="text-2xl font-semibold text-sky-300">My Tasks</h2>
      <div className="text-slate-400 mt-3">No tasks found</div>
    </div>
  );

  return (
    <div className="p-4 bg-[#071226] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-sky-300">My Tasks</h2>
        </div>

        {/* FILTER BAR */}
        <div className="mb-4 bg-[#0b1220] p-3 rounded-lg ring-1 ring-white/5 flex flex-wrap gap-3 items-center">
          {/* Team */}
          <div className="flex flex-col text-xs text-slate-300">
            <label className="mb-1">Team</label>
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="px-2 py-1 rounded bg-[#071226] text-slate-200 border border-gray-700"
            >
              <option value="">All</option>
              {teamsList.map(team => <option key={team} value={team}>{team}</option>)}
            </select>
          </div>

          {/* Deadline (due before) */}
          <div className="flex flex-col text-xs text-slate-300">
            <label className="mb-1">Due before</label>
            <input
              type="date"
              value={filterDeadlineBefore}
              onChange={(e) => setFilterDeadlineBefore(e.target.value)}
              className="px-2 py-1 rounded bg-[#071226] text-slate-200 border border-gray-700"
            />
          </div>

          {/* Priority */}
          <div className="flex flex-col text-xs text-slate-300">
            <label className="mb-1">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-2 py-1 rounded bg-[#071226] text-slate-200 border border-gray-700"
            >
              <option value="">All</option>
              {["CRITICAL","HIGH","MEDIUM","LOW"].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
              {prioritiesList.filter(p => !["CRITICAL","HIGH","MEDIUM","LOW"].includes(p)).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Type */}
          <div className="flex flex-col text-xs text-slate-300">
            <label className="mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2 py-1 rounded bg-[#071226] text-slate-200 border border-gray-700"
            >
              <option value="">All</option>
              {["DEVELOPMENT","TESTING","DOCUMENTATION","DEPLOYMENT","OTHER"].map(tp => (
                <option key={tp} value={tp}>{tp}</option>
              ))}
              {typesList.filter(tp => !["DEVELOPMENT","TESTING","DOCUMENTATION","DEPLOYMENT","OTHER"].includes(tp)).map(tp => <option key={tp} value={tp}>{tp}</option>)}
            </select>
          </div>

          {/* Status */}
          <div className="flex flex-col text-xs text-slate-300">
            <label className="mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2 py-1 rounded bg-[#071226] text-slate-200 border border-gray-700"
            >
              <option value="">All</option>
              {["PENDING","IN_PROGRESS","COMPLETED"].map(s => <option key={s} value={s}>{s}</option>)}
              {statusesList.filter(s => !["PENDING","IN_PROGRESS","COMPLETED"].includes(s)).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Clear */}
          <div className="ml-auto">
            <button
              onClick={clearFilters}
              className="px-3 py-1 rounded bg-slate-700 text-sm text-slate-200"
            >
              Clear
            </button>
          </div>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block bg-[#0b1220] rounded-lg shadow ring-1 ring-white/5 overflow-auto">
          <table className="min-w-full">
            <thead className="bg-[#071226]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">#</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Description</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Assigned</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Project</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Team</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Deadline</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Priority</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Attachment</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {sortedTasks.map((t, idx) => (
                <tr key={t.id} className="hover:bg-[#0f1724]">
                  <td className="px-4 py-3 text-sm text-slate-200">{idx + 1}</td>

                  <td className="px-4 py-3 max-w-xs text-sm text-slate-200 break-words">
                    <div className="font-medium text-slate-100">{t.taskDescription}</div>
                    <div className="text-xs text-slate-400 mt-1">{t.comments}</div>
                    <div className="text-xs text-slate-500 mt-1">Assigned on: {t.assignedDate ? formatDate(t.assignedDate) : "-"}</div>
                  </td>

                  <td className="px-4 py-3 text-sm text-slate-200">{t.assignedToName || "Whole Team"}</td>

                  <td className="px-4 py-3 text-sm text-slate-200">{t.projectTitle || "-"}</td>

                  <td className="px-4 py-3 text-sm text-slate-200">{t.teamName || "-"}</td>

                  <td className="px-4 py-3 text-sm text-slate-200">{formatDate(t.deadline)}</td>

                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${classForPriority(t.priority)}`}>
                      {t.priority || "MEDIUM"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${classForType(t.type)}`}>
                      {t.type || "OTHER"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${classForStatus(t.status)}`}>
                      {t.status || "PENDING"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-sm">
                    {t.attachmentUrl ? (
                      <a href={t.attachmentUrl} target="_blank" rel="noreferrer" className="underline text-sky-300">Open</a>
                    ) : (
                      <div className="text-xs text-slate-500">No file</div>
                    )}
                  </td>

                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-col md:flex-row gap-2">
                      <select
                        value={t.status || "PENDING"}
                        onChange={(e) => updateStatus(t.id, e.target.value)}
                        className="px-2 py-1 border rounded text-sm bg-[#071226] text-slate-200 border-gray-700"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>

                      {!t.attachmentUrl && (
                        <>
                          <label className="px-2 py-1 border rounded cursor-pointer text-xs text-slate-200 bg-[#0b1220] border-gray-700">
                            <input type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => handleFileChange(e, t.id)} />
                            Choose
                          </label>

                          <button
                            onClick={() => submitFile(t.id, false)}
                            disabled={uploadingId === t.id}
                            className="px-2 py-1 rounded border text-sm text-slate-200 border-gray-700"
                          >
                            {uploadingId === t.id ? "Uploading..." : "Upload"}
                          </button>

                          <button
                            onClick={() => submitFile(t.id, true)}
                            disabled={uploadingId === t.id}
                            className="px-2 py-1 rounded bg-emerald-600 text-white text-sm"
                          >
                            {uploadingId === t.id ? "Uploading..." : "Submit & Complete"}
                          </button>
                        </>
                      )}

                      {t.attachmentUrl && (
                        <button
                          onClick={() => window.open(t.attachmentUrl, "_blank")}
                          className="px-2 py-1 rounded border text-sm text-slate-200 border-gray-700"
                        >
                          Open
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-4">
          {sortedTasks.map((t, idx) => (
            <div key={t.id} className="bg-[#0b1220] rounded-lg shadow p-4 ring-1 ring-white/5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-100">{t.taskDescription}</h3>
                    <div className="text-xs text-slate-400">{formatDate(t.deadline)}</div>
                  </div>

                  <div className="mt-2 text-xs text-slate-400">{t.comments}</div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${classForPriority(t.priority)}`}>
                      {t.priority}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${classForType(t.type)}`}>
                      {t.type}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${classForStatus(t.status)}`}>
                      {t.status}
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-slate-300">
                    <div><strong>Assigned:</strong> {t.assignedToName || "Whole Team"}</div>
                    <div><strong>Project:</strong> {t.projectTitle || "-"}</div>
                    <div><strong>Team:</strong> {t.teamName || "-"}</div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <select
                  value={t.status || "PENDING"}
                  onChange={(e) => updateStatus(t.id, e.target.value)}
                  className="px-2 py-1 border rounded text-sm bg-[#071226] text-slate-200 border-gray-700"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>

                {!t.attachmentUrl && (
                  <>
                    <label className="px-2 py-1 border rounded cursor-pointer text-xs text-slate-200 bg-[#0b1220] border-gray-700">
                      <input type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => handleFileChange(e, t.id)} />
                      Choose
                    </label>

                    <button
                      onClick={() => submitFile(t.id, false)}
                      disabled={uploadingId === t.id}
                      className="px-2 py-1 rounded border text-sm text-slate-200 border-gray-700"
                    >
                      {uploadingId === t.id ? "Uploading..." : "Upload"}
                    </button>

                    <button
                      onClick={() => submitFile(t.id, true)}
                      disabled={uploadingId === t.id}
                      className="px-2 py-1 rounded bg-emerald-600 text-white text-sm"
                    >
                      {uploadingId === t.id ? "Uploading..." : "Submit & Complete"}
                    </button>
                  </>
                )}

                {t.attachmentUrl && (
                  <button
                    onClick={() => window.open(t.attachmentUrl, "_blank")}
                    className="px-2 py-1 rounded border text-sm text-slate-200 border-gray-700"
                  >
                    Open
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
