// src/components/TeamDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../context/api";
import Swal from "sweetalert2";
import { 
  HiUserGroup, 
  HiCode, 
  HiCalendar, 
  HiClock, 
  HiCheckCircle,
  HiBriefcase,
  HiMail
} from "react-icons/hi";

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

function fmtDate(d) {
  if (!d) return "-";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString();
  } catch (e) {
    return d;
  }
}

function InitialsAvatar({ name, size = 10 }) {
  const initials = (name || "U").split(" ").map(n => n[0]).slice(0,2).join("");
  const px = size === 12 ? "w-12 h-12 text-base" : size === 10 ? "w-10 h-10 text-sm" : "w-9 h-9 text-xs";
  return (
    <div className={`rounded-full ${px} flex items-center justify-center font-bold text-white bg-gradient-to-br from-sky-500 to-indigo-600 shadow-md`}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = (status || "").toUpperCase();
  const cls = s === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
              s === "ONGOING" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : 
              "bg-slate-700 text-slate-300 border-slate-600";
  
  return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${cls}`}>{s || "N/A"}</span>;
}

export default function TeamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  // contact form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/teams/${id}/details`);
        if (!mounted) return;
        setTeam(res.data.team);
      } catch (err) {
        console.error("Failed to load team details", err);
        Swal.fire("Error", err?.response?.data?.message || err?.message, "error");
        navigate(-1);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (id) fetch();
    return () => { mounted = false; };
  }, [id, navigate]);

  const handleContact = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      Swal.fire("Validation", "Subject and message are required", "warning");
      return;
    }
    setSending(true);
    try {
      const res = await api.post(`/teams/${id}/contact`, { subject, message });
      Swal.fire("Success", res.data.message || "Message sent", "success");
      setSubject(""); setMessage("");
    } catch (err) {
      console.error("Contact error", err);
      Swal.fire("Error", err?.response?.data?.message || "Failed to send message", "error");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoaderOverlay message="Loading Team Details..." />;

  if (!team) {
    return (
      <div className="min-h-screen bg-[#0f172a] p-6 flex items-center justify-center text-slate-400">
        Team not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 md:p-10 font-sans selection:bg-sky-500/30">
      <div className="max-w-7xl mx-auto">
        
        {/* Row 1: Team & Project Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
          {/* Team Info Card */}
          <div className="bg-slate-800/60 border border-slate-700/60 backdrop-blur-md p-8 rounded-3xl shadow-xl flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">{team.teamName}</h2>
                <div className="flex items-center gap-2 text-sm text-sky-400 font-medium bg-sky-500/10 px-3 py-1 rounded-full w-fit">
                    <HiUserGroup /> {team.totalMembers ?? (team.members || []).length} Members
                </div>
              </div>
              <div className="text-right">
                 <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Created</span>
                 <span className="text-slate-300 font-mono text-sm">{fmtDate(team.createdDate)}</span>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-700/50 flex justify-between items-center">
               <span className="text-sm font-medium text-slate-400">Project Status</span>
               <StatusBadge status={team.projectStatus || (team.projectTitle ? "PENDING" : "")} />
            </div>
          </div>

          {/* Project Details Card */}
          <div className="bg-slate-800/60 border border-slate-700/60 backdrop-blur-md p-8 rounded-3xl shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
             
             <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <HiBriefcase className="text-purple-400"/> Project Details
             </h3>

             <div className="space-y-4 text-sm">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Title</label>
                    <p className="text-lg font-medium text-slate-200">{team.projectTitle || "Not Assigned"}</p>
                </div>
                
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Tech Stack</label>
                    <div className="flex flex-wrap gap-2">
                        {team.technologiesUsed ? team.technologiesUsed.split(',').map((t,i) => (
                            <span key={i} className="px-2 py-1 bg-slate-900 rounded text-xs text-slate-300 border border-slate-700">{t.trim()}</span>
                        )) : <span className="text-slate-500">-</span>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Start</label>
                        <div className="flex items-center gap-2 text-slate-300"><HiCalendar/> {fmtDate(team.projectStart)}</div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">End</label>
                        <div className="flex items-center gap-2 text-slate-300"><HiClock/> {fmtDate(team.projectEnd)}</div>
                    </div>
                </div>
                
                <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Description</label>
                     <p className="text-slate-400 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                        {team.projectDescription || "No description available."}
                     </p>
                </div>
             </div>
          </div>
        </div>

        {/* Row 2: Members Table */}
        <div className="bg-slate-800/60 border border-slate-700/60 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden mb-10">
          <div className="p-6 border-b border-slate-700/50">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
               <HiUserGroup className="text-emerald-400"/> Team Roster
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Roll No</th>
                  <th className="px-6 py-4">Academic</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {(team.members || [])
                  .sort((a, b) => (b.leader === true) - (a.leader === true))
                  .map(m => (
                    <tr key={m.id} className={`group hover:bg-slate-700/30 transition-all ${m.leader ? "bg-[#0d1a33]/50" : ""}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <InitialsAvatar name={m.name} />
                            <div>
                                <div className="font-medium text-white">{m.name}</div>
                                <div className="text-xs text-slate-500">{m.contactNo}</div>
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs">{m.email}</td>
                      <td className="px-6 py-4 text-slate-300">{m.rollNumber || "-"}</td>
                      <td className="px-6 py-4 text-slate-300 text-xs">
                          <div className="font-medium text-white">{m.course} ({m.branch})</div>
                          <div className="text-slate-500">{m.semester} • {m.section}</div>
                      </td>
                      <td className="px-6 py-4">
                          <span className="bg-slate-700/50 border border-slate-600 px-2.5 py-1 rounded-lg text-xs text-slate-300">{m.role || "-"}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {m.leader ? (
                           <span className="inline-flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-400/10 px-2 py-1 rounded-md border border-amber-400/20">
                             ★ LEADER
                           </span>
                        ) : <span className="text-slate-500 text-xs">Member</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/profile/${encodeURIComponent(m.email)}`)}
                          className="px-4 py-2 bg-slate-700 hover:bg-sky-600 text-white text-xs font-bold rounded-lg transition-all border border-slate-600 hover:border-transparent"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Row 3: Guide & Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Guide Card */}
            <div className="lg:col-span-1 bg-slate-800/60 border border-slate-700/60 backdrop-blur-md p-6 rounded-2xl shadow-xl">
                 <h4 className="text-lg font-bold text-violet-400 mb-4">Project Guide</h4>
                 {team.guide ? (
                    <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                        <InitialsAvatar name={team.guide.name} size={12} />
                        <div>
                            <div className="font-bold text-white">{team.guide.name}</div>
                            <div className="text-xs text-slate-400">{team.guide.email}</div>
                            <div className="text-xs text-slate-500 mt-1">{team.guide.contactNo}</div>
                        </div>
                    </div>
                 ) : <div className="text-slate-500 italic">No guide assigned.</div>}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/60 backdrop-blur-md p-6 rounded-2xl shadow-xl">
                <h4 className="text-lg font-bold text-sky-400 mb-4 flex items-center gap-2">
                    <HiMail/> Contact Guide
                </h4>
                <form onSubmit={handleContact} className="space-y-4">
                    <input
                        placeholder="Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all placeholder-slate-600"
                    />
                    <textarea
                        placeholder="Message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all placeholder-slate-600 resize-none"
                    />
                    <div className="flex gap-3 justify-end">
                        <button type="button" onClick={() => { setSubject(""); setMessage(""); }} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold rounded-xl transition-all">Clear</button>
                        <button type="submit" disabled={sending} className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-900/20 active:scale-95 transition-all disabled:opacity-50">
                            {sending ? "Sending..." : "Send Message"}
                        </button>
                    </div>
                </form>
            </div>
        </div>

      </div>
    </div>
  );
}