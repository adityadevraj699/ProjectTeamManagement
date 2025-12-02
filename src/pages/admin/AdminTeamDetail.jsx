import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

// 🔄 Reusable Loader Overlay Component
const LoaderOverlay = ({ message }) => (
  <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
    <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-white text-lg font-medium">{message || "Loading..."}</p>
  </div>
);

// ---------- Modal for showing Task/Meeting details ----------
function DetailModal({ open, onClose, kind, payload }) {
  // open: boolean, kind: 'task'|'meeting', payload: object
  if (!open) return null;

  const renderTask = (t) => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">{t.taskDescription || `Task #${t.id}`}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-sm text-gray-300"><strong>Status:</strong> <span className="font-semibold text-gray-100">{t.status ?? "N/A"}</span></div>
          <div className="text-sm text-gray-300"><strong>Priority:</strong> {t.priority ?? "N/A"}</div>
          <div className="text-sm text-gray-300"><strong>Type:</strong> {t.type ?? "N/A"}</div>
          <div className="text-sm text-gray-300"><strong>Deadline:</strong> {t.deadline ?? "-"}</div>
          <div className="text-sm text-gray-300"><strong>Assigned Date:</strong> {t.assignedDate ?? "-"}</div>
          <div className="text-sm text-gray-300"><strong>Assigned To:</strong> {t.assignedTo ? `${t.assignedTo.name} (${t.assignedTo.email})` : "Unassigned"}</div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-300"><strong>Created By:</strong> {t.createdBy ? `${t.createdBy.name} (${t.createdBy.email ?? ""})` : "-"}</div>
          <div className="text-sm text-gray-300"><strong>Created At:</strong> {t.createdAt ?? "-"}</div>
          <div className="text-sm text-gray-300"><strong>Updated At:</strong> {t.updatedAt ?? "-"}</div>
          <div className="text-sm text-gray-300"><strong>Meeting ID:</strong> {t.meetingId ?? "-"}</div>
          <div className="text-sm text-gray-300"><strong>Attachment:</strong> {t.attachmentUrl ? <a href={t.attachmentUrl} target="_blank" rel="noreferrer" className="text-sky-300 underline">Open</a> : "None"}</div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-200">Comments / Description</h3>
        <p className="mt-1 text-sm text-gray-300 whitespace-pre-wrap">{t.comments ?? "-"}</p>
      </div>
    </div>
  );

  const renderMeeting = (m) => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">{m.title || `Meeting #${m.id}`}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-sm text-gray-300"><strong>Date/Time:</strong> {m.meetingDateTime ?? "N/A"}</div>
          <div className="text-sm text-gray-300"><strong>Duration:</strong> {m.durationMinutes ?? "-"} min</div>
          <div className="text-sm text-gray-300"><strong>Location:</strong> {m.location ?? "-"}</div>
          <div className="text-sm text-gray-300"><strong>Mode:</strong> {m.mode ?? "-"}</div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-300"><strong>Status:</strong> {m.status ?? "-"}</div>
          <div className="text-sm text-gray-300"><strong>Organizer:</strong> {m.createdBy ? `${m.createdBy.name} (${m.createdBy.email ?? ""})` : "-"}</div>
          <div className="text-sm text-gray-300"><strong>Meeting ID:</strong> {m.id}</div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-200">Agenda</h3>
        <p className="mt-1 text-sm text-gray-300 whitespace-pre-wrap">{m.agenda ?? "No agenda provided."}</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-200">Minutes / Summary</h3>
        {m.minutes ? (
          <div className="mt-1 text-sm text-gray-300 space-y-1">
            <p><strong>Summary:</strong> {m.minutes.summary ?? "-"}</p>
            <p><strong>Action Items:</strong> {m.minutes.actionItems ?? "-"}</p>
            <p><strong>Next Steps:</strong> {m.minutes.nextSteps ?? "-"}</p>
            <p><strong>Remarks:</strong> {m.minutes.remarks ?? "-"}</p>
          </div>
        ) : (
          <p className="mt-1 text-sm text-gray-500">No minutes recorded.</p>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-200">Attendance</h3>
        {Array.isArray(m.attendance) && m.attendance.length > 0 ? (
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            {m.attendance.map((a) => (
              <div key={a.id} className="p-2 bg-slate-800 rounded flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-200">{a.user ? a.user.name : "Unknown"}</div>
                  <div className="text-xs text-gray-400">{a.user ? a.user.email : ""}</div>
                </div>
                <div className="text-sm">
                  {a.present ? <span className="text-green-400 font-semibold">Present</span> : <span className="text-red-400 font-semibold">Absent</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-sm text-gray-500">No attendance records.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* modal */}
      <div className="relative w-full max-w-5xl h-[80vh] bg-slate-900 rounded-lg shadow-xl overflow-auto border border-slate-700 z-10 p-6">
        <div className="flex items-start justify-between gap-4 sticky top-0 bg-slate-900/80 backdrop-blur-sm -mx-6 px-6 pt-4 pb-4 z-20">
          <div>
            <div className="text-sm text-sky-300 uppercase font-semibold">{kind === "task" ? "Task Details" : "Meeting Details"}</div>
            <div className="text-lg font-bold text-white">{kind === "task" ? (payload?.taskDescription ?? `Task #${payload?.id}`) : (payload?.title ?? `Meeting #${payload?.id}`)}</div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-white">
              Close
            </button>
          </div>
        </div>

        <div className="mt-4">
          {kind === "task" ? renderTask(payload || {}) : renderMeeting(payload || {})}
        </div>
      </div>
    </div>
  );
}

// ---------- Main component ----------
export default function AdminTeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKind, setModalKind] = useState(null); // 'task' or 'meeting'
  const [modalPayload, setModalPayload] = useState(null);

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // Fetch team detail from admin controller
  const fetchTeamDetail = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/teams/${id}`, axiosConfig);
      setTeam(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.response?.data || "Failed to fetch team details",
      });
      setTeam(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamDetail();
    // eslint-disable-next-line
  }, [id]);

  // Download PDF using SweetAlert confirmation
  const handleDownloadPdf = async () => {
    const answer = await Swal.fire({
      title: "Export PDF",
      text: "Export this team's full report to PDF?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, export",
      cancelButtonText: "Cancel",
    });

    if (!answer.isConfirmed) return;

    try {
      setDownloading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/teams/${id}/pdf`, {
        ...axiosConfig,
        responseType: "blob",
      });

      // try read filename from content-disposition
      let filename = `team_${id}.pdf`;
      const disposition = res.headers["content-disposition"] || res.headers["Content-Disposition"];
      if (disposition) {
        const match = disposition.match(/filename\*?=?(?:UTF-8''|")?(.*?)"?$/);
        if (match && match[1]) filename = decodeURIComponent(match[1]);
      }

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      Swal.fire({ icon: "success", title: "Downloaded", text: "PDF exported successfully." });
    } catch (err) {
      console.error("PDF download error:", err);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to download PDF" });
    } finally {
      setDownloading(false);
    }
  };

  // Download attachments (if any attachmentUrl present in tasks)
  const handleDownloadAttachment = (url) => {
    if (!url) {
      Swal.fire({ icon: "info", title: "No Attachment", text: "No attachment URL available." });
      return;
    }
    window.open(url, "_blank");
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTeamDetail();
    setRefreshing(false);
  };

  // open modal helper
  const openModalFor = (kind, payload) => {
    setModalKind(kind);
    setModalPayload(payload);
    setModalOpen(true);
    // scroll to top of modal automatically by letting it render
  };

  if (loading) return <LoaderOverlay message="Loading Team Details..." />;

  if (!team) {
    return <div className="text-center text-gray-400 mt-10">Team not found or access denied.</div>;
  }

  const projectStatusColor = (status) =>
    status === "COMPLETED" ? "text-green-400" : status === "ONGOING" ? "text-yellow-400" : "text-gray-400";

  // Ensure arrays exist safely
  const tasks = Array.isArray(team.tasks) ? team.tasks : [];
  const meetings = Array.isArray(team.meetings) ? team.meetings : [];
  const members = Array.isArray(team.members) ? team.members : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100 p-8 relative">
      {(downloading || refreshing) && <LoaderOverlay message={downloading ? "Preparing PDF..." : "Refreshing..."} />}

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold text-sky-400">Team Detail</h1>

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="px-3 py-2 bg-slate-600 hover:bg-slate-500 rounded text-white text-sm"
            title="Refresh"
          >
            Refresh
          </button>

          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded text-white shadow"
            title="Export this team as PDF"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* TOP: Team + Project */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 bg-slate-800 p-6 rounded-2xl border border-sky-800/20">
          <h2 className="text-2xl font-semibold text-sky-400 mb-2">{team.teamName}</h2>
          <p className="text-sm text-gray-400 mb-4"><strong>Created:</strong> {team.createdDate ?? "N/A"}</p>

          <div className="space-y-2">
            <p className="text-sm text-gray-300"><strong className="text-gray-200">Members:</strong> {members.length ?? 0}</p>
            <p className="text-sm">
              <strong className="text-gray-200">Status:</strong>{" "}
              <span className={`${projectStatusColor(team.status)} font-semibold`}>{team.status ?? "N/A"}</span>
            </p>
            {team.guide && (
              <p className="text-sm text-gray-300 mt-2">
                <strong className="text-gray-200">Guide:</strong>{" "}
                {team.guide.name ?? team.guide.email ?? "N/A"}
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl border border-purple-800/20">
          <h3 className="text-xl font-semibold text-purple-400 mb-3">Project</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-300"><strong className="text-gray-200">Title:</strong> {team.projectTitle}</p>
              <p className="text-sm text-gray-300 mt-1"><strong className="text-gray-200">Tech stack:</strong> {team.technologiesUsed}</p>
              <p className="text-sm text-gray-300 mt-1"><strong className="text-gray-200">Start:</strong> {team.startDate}</p>
              <p className="text-sm text-gray-300 mt-1"><strong className="text-gray-200">End:</strong> {team.endDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-300"><strong className="text-gray-200">Status:</strong> {team.status}</p>
              <p className="text-sm text-gray-300 mt-1"><strong className="text-gray-200">Project ID:</strong> {team.projectId}</p>
              {team.guide && <p className="text-sm text-gray-300 mt-1"><strong className="text-gray-200">Guide Email:</strong> {team.guide.email}</p>}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-300"><strong>Description:</strong></p>
            <p className="text-sm text-gray-400 mt-1">{team.description ?? "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-white/10 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-sky-400">Team Members</h2>
          <div className="text-sm text-gray-400">Total: {members.length ?? 0}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-700 text-gray-200">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Roll</th>
                <th className="px-3 py-2">Course</th>
                <th className="px-3 py-2">Branch</th>
                <th className="px-3 py-2">Section</th>
                <th className="px-3 py-2">Semester</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Leader</th>
                <th className="px-3 py-2">Profile</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-700">
              {(members || [])
                .sort((a, b) => (b.leader === true) - (a.leader === true))
                .map((m, idx) => (
                  <tr key={idx} className={`hover:bg-slate-800/70 transition-all ${m.leader ? "bg-[#0d1a33] ring-1 ring-green-500/20" : ""}`}>
                    <td className="px-3 py-2">{m.name}</td>
                    <td className="px-3 py-2 text-sky-400">{m.email}</td>
                    <td className="px-3 py-2">{m.rollNumber ?? "N/A"}</td>
                    <td className="px-3 py-2">{m.course ?? "-"}</td>
                    <td className="px-3 py-2">{m.branch ?? "-"}</td>
                    <td className="px-3 py-2">{m.section ?? "-"}</td>
                    <td className="px-3 py-2">{m.semester ?? "-"}</td>
                    <td className="px-3 py-2">{m.role ?? "-"}</td>
                    <td className="px-3 py-2">
                      {m.leader ? <span className="text-green-400 font-semibold">✔ Leader</span> : <span className="text-yellow-400 font-semibold">Member</span>}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => navigate(`/profile/${encodeURIComponent(m.email)}`)}
                        className="px-3 py-1 bg-sky-600 hover:bg-sky-700 rounded text-white"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TWO-COLUMN: Left = Tasks, Right = Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* LEFT: Tasks */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-emerald-400">Tasks</h2>
            <div className="text-sm text-gray-400">Total: {tasks.length}</div>
          </div>

          {tasks.length === 0 ? (
            <div className="text-gray-400">No tasks found for this team.</div>
          ) : (
            <div className="space-y-3">
              {tasks.map((t) => (
                <div key={t.id} className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-200 truncate">{t.taskDescription || `Task #${t.id}`}</h3>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{t.comments ?? ""}</p>
                      <div className="mt-2 text-xs text-gray-400">
                        <span className="mr-2">Type: {t.type ?? "N/A"}</span>
                        <span className="mr-2">Priority: {t.priority ?? "N/A"}</span>
                        <span>Assigned: {t.assignedTo ? t.assignedTo.name : "Unassigned"}</span>
                      </div>
                    </div>

                    <div className="text-right text-sm flex flex-col items-end gap-2">
                      <div className="text-gray-300">Status: <span className="font-semibold">{t.status ?? "N/A"}</span></div>
                      <div className="text-gray-400">Deadline: {t.deadline ?? "-"}</div>
                      <div className="mt-2 flex gap-2">
                        {t.attachmentUrl && (
                          <button onClick={() => handleDownloadAttachment(t.attachmentUrl)} className="px-3 py-1 bg-sky-600 rounded text-white text-xs">
                            Open Attachment
                          </button>
                        )}
                        <button onClick={() => openModalFor("task", t)} className="px-3 py-1 bg-slate-600 rounded text-white text-xs">
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Meetings */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-indigo-400">Meetings</h2>
            <div className="text-sm text-gray-400">Total: {meetings.length}</div>
          </div>

          {meetings.length === 0 ? (
            <div className="text-gray-400">No meetings found for this team.</div>
          ) : (
            <div className="space-y-4">
              {meetings.map((m) => (
                <div key={m.id} className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                  <div className="flex justify-between">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-200 truncate">{m.title ?? `Meeting #${m.id}`}</h3>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{m.agenda ?? "No agenda provided."}</p>
                      <p className="text-xs text-gray-400 mt-1">When: {m.meetingDateTime ?? "N/A"} • Duration: {m.durationMinutes ?? "-" } min</p>
                    </div>

                    <div className="text-right text-sm flex flex-col items-end gap-2">
                      <div className="text-gray-300">Organizer: {m.createdBy ? m.createdBy.name : "-"}</div>
                      <div className="text-gray-400">Location: {m.location ?? "-"}</div>
                      <div className="mt-2">
                        <button onClick={() => openModalFor("meeting", m)} className="px-3 py-1 bg-slate-600 rounded text-white text-xs">
                          Details
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* summary preview */}
                  {m.minutes ? (
                    <div className="mt-3 p-3 bg-slate-800 rounded text-sm text-gray-300">
                      <strong>Minutes:</strong> {m.minutes.summary ? (m.minutes.summary.length > 140 ? m.minutes.summary.slice(0, 140) + "..." : m.minutes.summary) : "-"}
                    </div>
                  ) : (
                    <div className="mt-3 text-sm text-gray-500">No minutes recorded.</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <DetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        kind={modalKind}
        payload={modalPayload}
      />
    </div>
  );
}
