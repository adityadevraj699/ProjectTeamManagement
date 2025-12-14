import React, { useEffect, useState } from "react";
import api from "../../context/api";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { 
  HiUserGroup, 
  HiCode, 
  HiCalendar, 
  HiEye, 
  HiInformationCircle 
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
      <div className="min-h-screen p-6 bg-[#0f172a] flex flex-col items-center justify-center text-center font-sans">
        <div className="bg-slate-800/50 p-10 rounded-3xl border border-dashed border-slate-700 max-w-md">
             <div className="bg-slate-800 p-6 rounded-full inline-block mb-6 shadow-xl shadow-black/20">
                <HiUserGroup className="text-5xl text-slate-500" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">No Teams Found</h2>
             <p className="text-slate-400 text-sm leading-relaxed">
               You haven't been added to any project teams yet. Contact your guide or admin for assignment.
             </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 md:p-10 font-sans selection:bg-sky-500/30">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
                 <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                    <span className="bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">My Teams</span>
                 </h1>
                 <p className="text-slate-400 mt-2 text-sm font-medium">Collaborate, track progress, and manage your projects.</p>
            </div>
            <div className="bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700 text-xs font-semibold text-slate-300">
               Total Teams: <span className="text-white">{teams.length}</span>
            </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teams.map((team) => (
            <div
              key={team.id}
              className="group relative bg-slate-800/30 backdrop-blur-xl border border-slate-700/60 rounded-3xl overflow-hidden hover:bg-slate-800/50 hover:border-sky-500/30 hover:shadow-2xl hover:shadow-sky-900/10 transition-all duration-300 flex flex-col"
            >
              {/* Gradient Accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 opacity-70 group-hover:opacity-100 transition-opacity"></div>

              <div className="p-7 flex-1 flex flex-col">
                
                {/* Header Info */}
                <div className="mb-6">
                    <div className="flex justify-between items-start mb-3">
                        <span className="px-2.5 py-1 rounded-md bg-slate-700/50 border border-slate-600/50 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                           ID: {team.id}
                        </span>
                        {team.createdDate && (
                            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                                <HiCalendar className="text-slate-400"/> {team.createdDate}
                            </div>
                        )}
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-sky-400 transition-colors truncate tracking-tight">
                        {team.teamName}
                    </h3>
                    
                    <div className="min-h-[24px]">
                        {team.projectTitle ? (
                            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                                <HiCode className="text-indigo-400"/> {team.projectTitle}
                            </div>
                        ) : (
                            <span className="text-slate-500 text-xs italic flex items-center gap-1">
                                <HiInformationCircle/> No project linked
                            </span>
                        )}
                    </div>
                </div>

                {/* Members Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                        <span>Team Members</span>
                        <span className="bg-slate-700 text-white px-1.5 rounded">{team.members?.length || 0}</span>
                    </div>

                    <div className="flex items-center -space-x-3 overflow-hidden pl-1 py-1">
                        {(team.members || []).slice(0, 5).map((m, idx) => (
                            <div
                                key={m.id}
                                title={m.name}
                                className="relative w-10 h-10 rounded-full ring-2 ring-[#0f172a] bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-white shadow-lg transition-transform hover:scale-110 hover:z-10 cursor-help"
                                style={{ zIndex: 5 - idx }} 
                            >
                                {m.name ? m.name.charAt(0) : "?"}
                            </div>
                        ))}
                        {(team.members || []).length > 5 && (
                            <div className="relative w-10 h-10 rounded-full ring-2 ring-[#0f172a] bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 shadow-lg z-0">
                                +{(team.members.length - 5)}
                            </div>
                        )}
                        {(team.members || []).length === 0 && (
                            <span className="text-slate-500 text-xs italic">No members added.</span>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto grid grid-cols-4 gap-3">
                  <button
                    onClick={() => navigate(`/student/teams/${team.id}`)}
                    className="col-span-3 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-sky-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <HiEye className="text-lg"/> View Dashboard
                  </button>
                  
                  <button
                     onClick={() => Swal.fire({
                        title: 'Team Details',
                        text: `Team: ${team.teamName}\nProject: ${team.projectTitle || 'N/A'}`,
                        icon: 'info',
                        background: '#1e293b',
                        color: '#fff',
                        confirmButtonColor: '#0ea5e9'
                     })}
                     className="col-span-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-xl transition-all border border-slate-600 flex items-center justify-center"
                     title="Quick Info"
                  >
                    <HiInformationCircle className="text-xl"/>
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