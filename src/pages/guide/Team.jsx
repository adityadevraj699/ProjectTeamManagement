import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { HiSearch, HiUserGroup, HiCalendar, HiPencil, HiTrash, HiEye, HiPlus } from "react-icons/hi";

// 🔄 Reusable High-End Loader Overlay (Only for Delete Action)
const LoaderOverlay = ({ message }) => (
  <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[100] backdrop-blur-xl transition-all duration-300">
    <div className="relative w-24 h-24">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-700 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-t-4 border-sky-500 rounded-full animate-spin"></div>
    </div>
    <p className="mt-6 text-sky-400 text-lg font-bold tracking-widest uppercase animate-pulse">{message || "Loading..."}</p>
  </div>
);

// 💀 Team Page Skeleton Loader
const TeamSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] p-6 md:p-10 font-sans relative animate-pulse">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-10">
          <div className="space-y-3">
            <div className="h-8 w-64 bg-slate-800 rounded-lg"></div>
            <div className="h-4 w-96 bg-slate-800/50 rounded"></div>
          </div>
          <div className="h-10 w-32 bg-slate-800 rounded-xl"></div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="h-12 max-w-md w-full bg-slate-800/50 rounded-2xl mb-8"></div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 h-64 flex flex-col space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-4 w-16 bg-slate-700/50 rounded"></div>
                  <div className="h-6 w-40 bg-slate-700 rounded"></div>
                </div>
                <div className="h-4 w-16 bg-slate-700/50 rounded-full"></div>
              </div>
              <div className="h-12 w-full bg-slate-700/30 rounded-xl"></div>
              <div className="flex justify-between pt-4 mt-auto border-t border-slate-700/30">
                <div className="h-8 w-20 bg-slate-700 rounded-lg"></div>
                <div className="h-8 w-20 bg-slate-700 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default function Team() {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true); // ✅ Controls Skeleton
  const [deleting, setDeleting] = useState(false); // ✅ Controls Overlay Spinner
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // ✅ Redirect if not logged in
  useEffect(() => {
    if (!token) {
      Swal.fire({
        title: "Unauthorized",
        text: "Please login to access this page.",
        icon: "warning",
        confirmButtonColor: "#0ea5e9",
        background: "#1e293b",
        color: "#fff",
      }).then(() => {
        navigate("/login");
      });
    }
  }, [token, navigate]);

  // ✅ Fetch teams
  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/guide/teams/mine`,
        axiosConfig
      );

      const data = Array.isArray(res.data) ? res.data : [];
      setTeams(data);
      setFilteredTeams(data);
    } catch (err) {
      console.error("Fetch error:", err);
      const message = err.response?.data?.message || "Failed to load teams";
      
      if (err.response?.status !== 401) { 
         Swal.fire({
           title: "Error",
           text: message,
           icon: "error",
           confirmButtonColor: "#ef4444",
           background: "#1e293b",
           color: "#fff",
         });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTeams();
  }, [token]);

  // ✅ Search Logic
  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = teams.filter(
      (team) =>
        team.teamName?.toLowerCase().includes(lowerTerm) ||
        team.projectTitle?.toLowerCase().includes(lowerTerm)
    );
    setFilteredTeams(filtered);
  }, [searchTerm, teams]);

  // ✅ Delete handler
  const handleDelete = async (teamId) => {
    const confirmed = await Swal.fire({
      title: "Delete Team?",
      text: "This action cannot be undone. All project data will be lost.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it",
      background: "#1e293b",
      color: "#fff",
      customClass: { popup: 'border border-slate-700 rounded-2xl' }
    });

    if (confirmed.isConfirmed) {
      setDeleting(true);
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/guide/teams/${teamId}`,
          axiosConfig
        );

        const newTeams = teams.filter((t) => t.teamId !== teamId);
        setTeams(newTeams);
        setFilteredTeams(newTeams);
        
        Swal.fire({
          title: "Deleted!",
          text: "Team has been removed.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          background: "#1e293b",
          color: "#fff",
        });
      } catch (err) {
        Swal.fire({
            title: "Error",
            text: "Failed to delete team.",
            icon: "error",
            background: "#1e293b",
            color: "#fff",
        });
      } finally {
        setDeleting(false);
      }
    }
  };

  // ✅ Show SKELETON while loading initial data
  if (loading) return <TeamSkeleton />;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 md:p-10 font-sans selection:bg-sky-500/30">
      
      {/* Show Overlay Loader ONLY when Deleting */}
      {deleting && <LoaderOverlay message="Deleting Team..." />}

      {/* Header Area */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Team Management</h1>
            <p className="text-slate-400 mt-2 text-sm max-w-lg leading-relaxed">
              Oversee your project groups, track progress, and manage team compositions efficiently.
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/guide/create-team')} 
            className="hidden md:flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-sky-900/20 hover:shadow-sky-900/40 active:scale-95"
          >
            <HiPlus className="text-xl" />
            Create Team
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="relative group max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <HiSearch className="text-slate-500 text-lg group-focus-within:text-sky-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search by team name or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-2xl text-sm placeholder-slate-500 text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-sm hover:border-slate-600"
          />
        </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-7xl mx-auto">
        {filteredTeams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
            <div className="bg-slate-800/50 p-5 rounded-full mb-4 ring-1 ring-slate-700">
              <HiUserGroup className="text-4xl text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No teams found</h3>
            <p className="text-slate-400 text-sm">
              {searchTerm ? `No results for "${searchTerm}"` : "Get started by creating your first team."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <div
                key={team.teamId}
                className="group relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-6 hover:bg-slate-800/60 hover:border-sky-500/30 hover:shadow-xl hover:shadow-sky-900/10 transition-all duration-300 flex flex-col"
              >
                {/* Status Indicator Line */}
                <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>

                {/* Content */}
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 mb-3">
                    <span className="bg-slate-700/50 text-slate-300 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md border border-slate-600/50">
                      ID: {team.teamId}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-sky-400 transition-colors truncate">
                    {team.teamName}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2 h-10 leading-relaxed">
                    {team.projectTitle || "No Project Title Assigned"}
                  </p>
                </div>

                {/* Meta Data */}
                <div className="grid grid-cols-2 gap-4 mb-6 border-t border-slate-700/50 pt-4">
                  <div>
                    <span className="text-[11px] text-slate-500 uppercase tracking-wide font-semibold block mb-1">Members</span>
                    <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                      <HiUserGroup className="text-sky-500" />
                      {team.totalMembers || 0}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 uppercase tracking-wide font-semibold block mb-1">Timeline</span>
                    <div className="flex items-center gap-1.5 text-slate-200 text-xs">
                      <HiCalendar className="text-emerald-500" />
                      <span className="truncate">{team.projectEndDate || "Ongoing"}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => navigate(`/guide/TeamDetail/${team.teamId}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/50 text-slate-300 text-sm font-medium hover:bg-sky-600 hover:text-white transition-all group/btn"
                  >
                    <HiEye className="text-lg text-sky-400 group-hover/btn:text-white transition-colors"/> View
                  </button>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/guide/EditTeamDetail/${team.teamId}`)}
                      className="p-2.5 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-yellow-500 hover:text-white transition-all"
                      title="Edit Team"
                    >
                      <HiPencil className="text-lg" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(team.teamId)}
                      className="p-2.5 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-red-500 hover:text-white transition-all"
                      title="Delete Team"
                    >
                      <HiTrash className="text-lg" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}