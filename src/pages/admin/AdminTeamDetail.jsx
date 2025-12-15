import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiArrowLeft, HiRefresh, HiDownload, HiUserGroup, 
  HiCode, HiCalendar, HiCheckCircle, HiClock, HiExclamation, 
  HiLocationMarker, HiDocumentText, HiChat, HiPaperClip, HiUser 
} from "react-icons/hi";

// 🔄 Loading Skeleton
const TeamSkeleton = () => (
  <div className="animate-pulse space-y-6 max-w-7xl mx-auto p-6">
    <div className="h-10 w-1/3 bg-slate-800 rounded-lg"></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="h-48 bg-slate-800 rounded-2xl"></div>
      <div className="h-48 bg-slate-800 rounded-2xl lg:col-span-2"></div>
    </div>
    <div className="h-64 bg-slate-800 rounded-2xl"></div>
  </div>
);

// 🏷️ Status Badge Component
const StatusBadge = ({ status }) => {
  let color = "bg-slate-700 text-slate-300 border-slate-600";
  if (status === "COMPLETED" || status === "Present") color = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (status === "ONGOING" || status === "IN_PROGRESS") color = "bg-sky-500/10 text-sky-400 border-sky-500/20";
  if (status === "PENDING") color = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  if (status === "CRITICAL" || status === "Absent") color = "bg-rose-500/10 text-rose-400 border-rose-500/20";

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${color}`}>
      {status || "N/A"}
    </span>
  );
};

// 📂 Detail Modal Component
function DetailModal({ open, onClose, kind, payload }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${kind === 'task' ? 'bg-sky-500/10 text-sky-400' : 'bg-purple-500/10 text-purple-400'}`}>
              {kind === 'task' ? <HiDocumentText className="text-xl"/> : <HiUserGroup className="text-xl"/>}
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold">{kind === 'task' ? 'Task Details' : 'Meeting Details'}</p>
              <h3 className="text-lg font-bold text-white truncate max-w-md">
                {kind === 'task' ? (payload?.taskDescription || `Task #${payload?.id}`) : (payload?.title || `Meeting #${payload?.id}`)}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          
          {/* --- TASK VIEW --- */}
          {kind === 'task' && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoBox label="Status" content={<StatusBadge status={payload.status} />} />
                <InfoBox label="Priority" content={<StatusBadge status={payload.priority} />} />
                <InfoBox label="Type" content={payload.type} />
                <InfoBox label="Deadline" content={payload.deadline} icon={<HiCalendar/>} />
              </div>

              <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                <h4 className="text-sm font-bold text-slate-300 mb-2">Description / Comments</h4>
                <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{payload.comments || "No description provided."}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase">Assignment</h4>
                  <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                      {payload.assignedTo?.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{payload.assignedTo?.name || "Unassigned"}</p>
                      <p className="text-xs text-slate-500">{payload.assignedTo?.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase">Attachment</h4>
                  {payload.attachmentUrl ? (
                    <a href={payload.attachmentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sky-400 hover:text-sky-300 hover:underline text-sm bg-sky-500/10 p-3 rounded-lg border border-sky-500/20 transition-colors">
                      <HiPaperClip /> View Attached File
                    </a>
                  ) : (
                    <div className="text-sm text-slate-500 italic p-3">No files attached</div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* --- MEETING VIEW --- */}
          {kind === 'meeting' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <InfoBox label="Date & Time" content={payload.meetingDateTime} icon={<HiCalendar/>} />
                <InfoBox label="Location" content={payload.location} icon={<HiLocationMarker/>} />
                <InfoBox label="Duration" content={`${payload.durationMinutes || 0} mins`} icon={<HiClock/>} />
                <InfoBox label="Status" content={<StatusBadge status={payload.status} />} />
              </div>

              <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                <h4 className="text-sm font-bold text-slate-300 mb-2">Agenda</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{payload.agenda || "No agenda set."}</p>
              </div>

              {/* Minutes Section */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase">Minutes of Meeting (MOM)</h4>
                {payload.minutes ? (
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-3">
                    <div><span className="text-emerald-400 text-xs font-bold">Summary:</span> <span className="text-slate-300 text-sm">{payload.minutes.summary}</span></div>
                    <div><span className="text-sky-400 text-xs font-bold">Action Items:</span> <span className="text-slate-300 text-sm">{payload.minutes.actionItems}</span></div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 italic">No minutes recorded yet.</div>
                )}
              </div>

              {/* Attendance Section */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase">Attendance</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {payload.attendance?.map(a => (
                    <div key={a.id} className="flex justify-between items-center p-2 bg-slate-800/30 rounded border border-slate-700/30">
                      <span className="text-sm text-slate-300">{a.user?.name || "Unknown"}</span>
                      <StatusBadge status={a.present ? "Present" : "Absent"} />
                    </div>
                  ))}
                  {(!payload.attendance || payload.attendance.length === 0) && <p className="text-slate-500 text-sm">No attendance records.</p>}
                </div>
              </div>
            </>
          )}

        </div>
        
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors">Close Details</button>
        </div>
      </motion.div>
    </div>
  );
}

// Helper for modal info grid
const InfoBox = ({ label, content, icon }) => (
  <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">{label}</p>
    <div className="text-sm text-white font-medium flex items-center gap-1.5">
      {icon && <span className="text-slate-400">{icon}</span>}
      {content || "-"}
    </div>
  </div>
);


// ---------- MAIN COMPONENT ----------
export default function AdminTeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKind, setModalKind] = useState(null);
  const [modalPayload, setModalPayload] = useState(null);

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchTeamDetail = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/teams/${id}`, axiosConfig);
      setTeam(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error", text: "Team not found", background: '#1e293b', color: '#fff' });
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchTeamDetail();
      setLoading(false);
    };
    init();
  }, [id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTeamDetail();
    setRefreshing(false);
  };

  const handleDownloadPdf = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/teams/${id}/pdf`, {
        ...axiosConfig, responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `team_${id}_report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      Swal.fire({ icon: "success", title: "Exported", toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, background: '#1e293b', color: '#fff' });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Export Failed", background: '#1e293b', color: '#fff' });
    }
  };

  const openModal = (kind, payload) => {
    setModalKind(kind);
    setModalPayload(payload);
    setModalOpen(true);
  };

  if (loading) return <div className="min-h-screen bg-[#0f172a] pt-10"><TeamSkeleton /></div>;
  if (!team) return <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">Team not found</div>;

  const tasks = team.tasks || [];
  const meetings = team.meetings || [];
  const members = team.members || [];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 font-sans relative">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-sky-900/20 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        
        {/* --- HEADER ACTIONS --- */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
            <HiArrowLeft /> Back to List
          </button>
          <div className="flex gap-3">
            <button onClick={handleRefresh} className={`p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-all ${refreshing ? 'animate-spin' : ''}`}>
              <HiRefresh className="text-lg" />
            </button>
            <button onClick={handleDownloadPdf} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-emerald-500/20 transition-all">
              <HiDownload /> Report PDF
            </button>
          </div>
        </div>

        {/* --- HERO SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Team Info */}
          <div className="lg:col-span-1 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
            
            <div className="mb-4">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1 block">Team Profile</span>
              <h1 className="text-2xl font-extrabold text-white leading-tight">{team.teamName}</h1>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                <span className="text-sm text-slate-400">Status</span>
                <StatusBadge status={team.status} />
              </div>
              <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                <span className="text-sm text-slate-400">Created</span>
                <span className="text-sm text-white font-mono">{team.createdDate}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm text-slate-400">Members</span>
                <div className="flex -space-x-2">
                  {members.slice(0,4).map((m,i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-slate-700 border border-slate-800 flex items-center justify-center text-[9px] text-white font-bold" title={m.name}>
                      {m.name.charAt(0)}
                    </div>
                  ))}
                  {members.length > 4 && <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] text-slate-400">+{members.length-4}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Project Info */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1 block">Project Details</span>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <HiCode className="text-purple-400"/> {team.projectTitle}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Project ID</span>
                <span className="text-sm font-mono text-slate-300">{team.projectId}</span>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed mb-6 line-clamp-2">
              {team.description || "No project description available."}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/30">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Tech Stack</p>
                <p className="text-sm text-slate-200 truncate" title={team.technologiesUsed}>{team.technologiesUsed || "N/A"}</p>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/30">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Guide</p>
                <p className="text-sm text-slate-200 truncate">{team.guide?.name || "Unassigned"}</p>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/30">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Start Date</p>
                <p className="text-sm text-slate-200">{team.startDate || "N/A"}</p>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/30">
                <p className="text-[10px] text-slate-500 uppercase font-bold">End Date</p>
                <p className="text-sm text-slate-200">{team.endDate || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- MEMBERS TABLE --- */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden mb-8 shadow-lg">
          <div className="px-6 py-4 bg-slate-800/60 border-b border-slate-700/50 flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2"><HiUserGroup className="text-sky-400"/> Team Members</h3>
            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">{members.length} Students</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-900/50 text-slate-400 font-semibold uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Branch/Sem</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow ${m.leader ? 'bg-amber-500' : 'bg-slate-600'}`}>
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{m.name}</p>
                          <p className="text-xs text-slate-500">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {m.leader ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                          👑 Leader
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">Member</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {m.branch || "?"} <span className="text-slate-600 mx-1">•</span> {m.semester || "?"}
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                      {m.rollNumber || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/profile/${encodeURIComponent(m.email)}`)}
                        className="p-2 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-all"
                        title="View Profile"
                      >
                        <HiUser className="text-lg"/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- TASKS & MEETINGS (SPLIT VIEW) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Tasks Column */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl flex flex-col h-[500px]">
            <div className="px-6 py-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/60 rounded-t-2xl">
              <h3 className="font-bold text-white flex items-center gap-2"><HiDocumentText className="text-sky-400"/> Tasks</h3>
              <span className="text-xs bg-slate-900 border border-slate-700 px-2 py-1 rounded text-slate-400">{tasks.length}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {tasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <HiDocumentText className="text-4xl opacity-20 mb-2"/>
                  <p className="text-sm">No tasks assigned yet</p>
                </div>
              ) : tasks.map((t) => (
                <motion.div 
                  key={t.id} 
                  whileHover={{ scale: 1.01 }}
                  onClick={() => openModal('task', t)}
                  className="bg-slate-900/80 border border-slate-700/50 p-4 rounded-xl cursor-pointer hover:border-sky-500/50 transition-all shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-slate-200 text-sm line-clamp-1">{t.taskDescription}</h4>
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className={`px-1.5 py-0.5 rounded border ${t.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                        {t.priority}
                      </span>
                      <span>{t.deadline}</span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 border border-slate-700" title={t.assignedTo?.name}>
                      {t.assignedTo?.name?.charAt(0) || "?"}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Meetings Column */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl flex flex-col h-[500px]">
            <div className="px-6 py-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/60 rounded-t-2xl">
              <h3 className="font-bold text-white flex items-center gap-2"><HiChat className="text-purple-400"/> Meetings</h3>
              <span className="text-xs bg-slate-900 border border-slate-700 px-2 py-1 rounded text-slate-400">{meetings.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {meetings.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <HiChat className="text-4xl opacity-20 mb-2"/>
                  <p className="text-sm">No meetings scheduled</p>
                </div>
              ) : meetings.map((m) => (
                <motion.div 
                  key={m.id} 
                  whileHover={{ scale: 1.01 }}
                  onClick={() => openModal('meeting', m)}
                  className="bg-slate-900/80 border border-slate-700/50 p-4 rounded-xl cursor-pointer hover:border-purple-500/50 transition-all shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-slate-200 text-sm line-clamp-1">{m.title || "Untitled Meeting"}</h4>
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{m.meetingDateTime?.split(' ')[0]}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">{m.agenda || "No agenda details."}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><HiClock/> {m.durationMinutes} min</span>
                    <span className="flex items-center gap-1"><HiLocationMarker/> {m.mode || "Online"}</span>
                    {m.minutes && <span className="flex items-center gap-1 text-emerald-400 ml-auto"><HiCheckCircle/> MOM Ready</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>

      </div>

      <DetailModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        kind={modalKind} 
        payload={modalPayload} 
      />
    </div>
  );
}