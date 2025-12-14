import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../context/api";
import { HiCalendar, HiClock, HiVideoCamera, HiLocationMarker, HiEye } from "react-icons/hi";

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

function fmtDateTime(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

const MODE_STYLES = {
  ONLINE: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
  OFFLINE: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  DEFAULT: "bg-slate-700 text-slate-300 border border-slate-600"
};

const STATUS_STYLES = {
  SCHEDULED: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  COMPLETED: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border border-red-500/20",
  DEFAULT: "bg-slate-700 text-slate-300 border border-slate-600"
};

function classMode(m) { return MODE_STYLES[m] || MODE_STYLES.DEFAULT; }
function classStatus(s) { return STATUS_STYLES[s] || STATUS_STYLES.DEFAULT; }

export default function Meeting() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await api.get("/student/meetings");
        if (!cancelled) {
          // Sort: Latest meetings first
          const sorted = (res.data || []).sort((a, b) => new Date(b.meetingDateTime) - new Date(a.meetingDateTime));
          setMeetings(sorted);
        }
      } catch (err) {
        console.error("Error fetching meetings:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <LoaderOverlay message="Loading Schedule..." />;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 md:p-10 font-sans selection:bg-sky-500/30">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
             <HiCalendar className="text-sky-500" /> My Meetings
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Upcoming and past meetings for your project teams.</p>
        </div>

        {/* No meetings state */}
        {!loading && meetings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-800/30 rounded-3xl border border-dashed border-slate-700">
             <HiCalendar className="text-5xl text-slate-600 mb-4" />
             <h3 className="text-xl font-medium text-white mb-2">No meetings scheduled</h3>
             <p className="text-slate-400 text-sm">Check back later for updates from your guide.</p>
          </div>
        )}

        {/* Meetings table */}
        {!loading && meetings.length > 0 && (
          <div className="bg-slate-800/60 border border-slate-700/60 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Team</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Mode</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-700/50">
                  {meetings.map(m => (
                    <tr key={m.id} className="group hover:bg-slate-700/30 transition-all">
                      <td className="px-6 py-4 font-medium text-white">{m.title}</td>
                      <td className="px-6 py-4 text-slate-300">{m.teamName}</td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                        {fmtDateTime(m.meetingDateTime)}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${classMode(m.mode)}`}>
                          {m.mode === 'ONLINE' ? <HiVideoCamera/> : <HiLocationMarker/>}
                          {m.mode}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {m.durationMinutes ? <span className="flex items-center gap-1"><HiClock className="text-slate-500"/> {m.durationMinutes} min</span> : "-"}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${classStatus(m.status)}`}>
                          {m.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/student/meeting/${m.id}`)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-sky-900/20 active:scale-95"
                        >
                          <HiEye className="text-base" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}