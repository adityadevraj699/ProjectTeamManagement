import React, { useEffect, useState } from "react";
import api from "../../context/api";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { HiUserGroup, HiCode, HiCalendar, HiEye, HiInformationCircle } from "react-icons/hi";

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

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get("/teams/mine");
        if (!mounted) return;
        setTeams(res.data.teams || []);
      } catch (err) {
        console.error("Failed to load teams", err);
        const msg = err?.response?.data?.message || err?.message;
        Swal.fire("Error", `Could not load teams: ${msg}`, "error");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => (mounted = false);
  }, []);

  if (loading) return <LoaderOverlay message="Loading Teams..." />;

  if (!teams.length)
    return (
      <div className="min-h-screen p-6 bg-[#0f172a] flex flex-col items-center justify-center text-center">
        <div className="bg-slate-800/50 p-8 rounded-3xl border border-dashed border-slate-700">
             <HiUserGroup className="text-5xl text-slate-600 mb-4 mx-auto" />
             <h2 className="text-2xl font-semibold text-white mb-2">No Teams Found</h2>
             <p className="text-slate-400">You are not a member of any team yet.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 md:p-10 font-sans selection:bg-sky-500/30">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                 <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                    <HiUserGroup className="text-sky-500" /> My Teams
                 </h1>
                 <p className="text-slate-400 mt-2 text-sm">Projects you are collaborating on.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className="group relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/60 rounded-2xl overflow-hidden hover:bg-slate-800/60 hover:border-sky-500/30 hover:shadow-xl hover:shadow-sky-900/10 transition-all duration-300 flex flex-col"
            >
              {/* Top accent */}
              <div className="h-1.5 w-full bg-gradient-to-r from-sky-500 to-indigo-500"></div>

              <div className="p-6 flex-1 flex flex-col">
                {/* Header */}
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-sky-400 transition-colors truncate">
                        {team.teamName}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                        {team.projectTitle ? (
                            <span className="bg-slate-700/50 text-slate-300 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md border border-slate-600/50 flex items-center gap-1">
                                <HiCode className="text-sky-400"/> {team.projectTitle}
                            </span>
                        ) : (
                            <span className="text-slate-500 text-xs italic">No project linked</span>
                        )}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                        <HiCalendar/> Created: {team.createdDate || "Unknown"}
                    </div>
                </div>

                {/* Members Avatars */}
                <div className="mb-6">
                    <div className="flex -space-x-3 overflow-hidden p-1">
                        {(team.members || []).slice(0, 5).map((m) => (
                            <div
                                key={m.id}
                                title={m.name}
                                className="inline-block h-10 w-10 rounded-full ring-2 ring-[#0f172a] bg-slate-700 flex items-center justify-center text-xs font-bold text-white shadow-md relative z-0 hover:z-10 transition-all hover:scale-110 cursor-help"
                            >
                                {m.name ? m.name.charAt(0) : "U"}
                            </div>
                        ))}
                        {(team.members || []).length > 5 && (
                            <div className="inline-block h-10 w-10 rounded-full ring-2 ring-[#0f172a] bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 shadow-md">
                                +{(team.members.length - 5)}
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-slate-400 mt-2 pl-1">
                        Total Members: <span className="text-slate-200 font-semibold">{team.members?.length || 0}</span>
                    </p>
                </div>

                {/* Member List Preview (Optional, simplified) */}
                 <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50 mb-6 flex-1">
                    <div className="space-y-2">
                        {(team.members || []).slice(0, 3).map(m => (
                            <div key={m.id} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[9px] text-white">
                                        {m.name?.charAt(0)}
                                    </div>
                                    <span className="text-slate-300">{m.name}</span>
                                </div>
                                {m.leader && <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">Leader</span>}
                            </div>
                        ))}
                    </div>
                 </div>

                {/* Actions */}
                <div className="mt-auto flex gap-3">
                  <button
                    onClick={() => navigate(`/student/teams/${team.id}`)}
                    className="flex-1 py-2.5 bg-slate-700 hover:bg-sky-600 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 group/btn border border-slate-600 hover:border-transparent"
                  >
                    <HiEye className="text-lg text-sky-400 group-hover/btn:text-white transition-colors"/> View Details
                  </button>
                  
                  <button
                     onClick={() => Swal.fire("Info", "Additional team actions coming soon.", "info")}
                     className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 rounded-lg text-white transition-colors"
                     title="More Info"
                  >
                    <HiInformationCircle className="text-lg text-slate-400"/>
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}