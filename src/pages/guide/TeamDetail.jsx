import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  HiArrowLeft, 
  HiUserGroup, 
  HiCode, 
  HiCalendar, 
  HiClock,
  HiBriefcase
} from "react-icons/hi";

// 🔄 Reusable High-End Loader Overlay (Used for Status Updates)
const LoaderOverlay = ({ message }) => (
  <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[100] backdrop-blur-xl transition-all duration-300">
    <div className="relative w-24 h-24">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-700 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-t-4 border-sky-500 rounded-full animate-spin"></div>
    </div>
    <p className="mt-6 text-sky-400 text-lg font-bold tracking-widest uppercase animate-pulse">{message || "Loading..."}</p>
  </div>
);

// 💀 Team Detail Skeleton Loader
const TeamDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] p-6 md:p-10 font-sans relative animate-pulse">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Back Button Skeleton */}
        <div className="h-8 w-32 bg-slate-800 rounded-full mb-10"></div>

        {/* --- Team & Project Section Skeleton --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
          {/* Team Info Card Skeleton */}
          <div className="bg-slate-800/60 border border-slate-700/60 p-8 rounded-3xl h-64 space-y-4">
            <div className="h-8 w-48 bg-slate-700 rounded"></div>
            <div className="h-4 w-32 bg-slate-700/50 rounded-full"></div>
            <div className="h-1 bg-slate-700/50 w-full mt-8"></div>
            <div className="flex justify-between pt-4">
              <div className="h-4 w-20 bg-slate-700/50 rounded"></div>
              <div className="h-6 w-24 bg-slate-700 rounded-lg"></div>
            </div>
          </div>

          {/* Project Info Card Skeleton */}
          <div className="bg-slate-800/60 border border-slate-700/60 p-8 rounded-3xl h-64 space-y-4">
            <div className="h-6 w-32 bg-slate-700 rounded"></div>
            <div className="h-8 w-64 bg-slate-700 rounded"></div>
            <div className="h-4 w-40 bg-slate-700/50 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-slate-700/50 rounded"></div>
              <div className="h-10 bg-slate-700/50 rounded"></div>
            </div>
          </div>
        </div>

        {/* --- Members Table Skeleton --- */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
            <div className="h-6 w-40 bg-slate-700 rounded"></div>
            <div className="h-4 w-16 bg-slate-700 rounded"></div>
          </div>
          
          <div className="overflow-x-auto">
            {/* Table Header */}
            <div className="h-12 bg-slate-900/50 w-full"></div>
            
            {/* Table Rows */}
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 w-full border-b border-slate-700/50 flex items-center px-6">
                <div className="w-1/4 h-8 bg-slate-700/50 rounded-lg"></div>
                <div className="w-1/4 h-4 bg-slate-700/50 rounded-lg ml-6"></div>
                <div className="w-1/4 h-8 bg-slate-700/50 rounded-lg ml-6"></div>
                <div className="w-1/4 flex justify-end">
                  <div className="h-8 w-24 bg-slate-700 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Controls Skeleton
  const [updating, setUpdating] = useState(false); // ✅ Controls Overlay
  const [newStatus, setNewStatus] = useState("PENDING");

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // ✅ Fetch team detail
  const fetchTeamDetail = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/guide/teams/details/${id}`,
        axiosConfig
      );
      setTeam(res.data);
      setNewStatus(res.data.status);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch team details',
        background: '#1e293b',
        color: '#fff'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamDetail();
  }, [id]);

  // ✅ Update project status with loader
  const handleStatusChange = async () => {
    if (!team?.projectId) {
      Swal.fire("Error", "Project ID missing!", "error");
      return;
    }

    setUpdating(true); // show overlay

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/guide/projects/${team.projectId}/status?status=${newStatus}`,
        {},
        axiosConfig
      );

      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Project status changed successfully.',
        background: '#1e293b',
        color: '#fff',
        timer: 1500,
        showConfirmButton: false
      });
      fetchTeamDetail();
    } catch (err) {
      console.error("Status update error:", err);
      Swal.fire("Error", err.response?.data || "Forbidden", "error");
    } finally {
      setUpdating(false); // hide overlay
    }
  };

  // ✅ Page-level loader
  if (loading) return <TeamDetailSkeleton />;

  // ✅ If no team found
  if (!team) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-slate-400">
        <h2 className="text-2xl font-bold text-white mb-2">Team Not Found</h2>
        <p>The requested team details could not be loaded.</p>
        <button 
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 md:p-10 font-sans selection:bg-sky-500/30 relative">
      {updating && <LoaderOverlay message="Updating Status..." />}

      <div className="max-w-7xl mx-auto">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          <div className="p-2 bg-slate-800 rounded-full group-hover:bg-slate-700 transition-colors">
            <HiArrowLeft />
          </div>
          <span className="font-medium">Back to Teams</span>
        </button>

        {/* --- Team + Project Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
          {/* Team Info Card */}
          <div className="bg-slate-800/60 border border-slate-700/60 backdrop-blur-md p-8 rounded-3xl shadow-xl flex flex-col">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
                  {team.teamName}
                </h1>
                <div className="flex items-center gap-2 text-sm text-sky-400 font-medium bg-sky-500/10 px-3 py-1 rounded-full w-fit">
                  <HiUserGroup /> {team.members.length} Members
                </div>
              </div>
              <div className="text-right">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Created On</span>
                <span className="text-slate-300 font-mono text-sm">{team.createdDate}</span>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-700/50">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-400">Current Status</span>
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${
                    team.status === "COMPLETED"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : team.status === "ONGOING"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-slate-700 text-slate-300 border-slate-600"
                  }`}
                >
                  {team.status}
                </span>
              </div>
            </div>
          </div>

          {/* Project Info Card */}
          <div className="bg-slate-800/60 border border-slate-700/60 backdrop-blur-md p-8 rounded-3xl shadow-xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <HiBriefcase className="text-purple-400"/> Project Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Title</label>
                <p className="text-lg font-medium text-slate-200">{team.projectTitle}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Tech Stack</label>
                <div className="flex flex-wrap gap-2">
                  {team.technologiesUsed?.split(',').map((tech, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-900 rounded text-xs text-slate-300 border border-slate-700">
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Start Date</label>
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <HiCalendar className="text-slate-500"/> {team.startDate || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">End Date</label>
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <HiClock className="text-slate-500"/> {team.endDate || "N/A"}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Description</label>
                <p className="text-sm text-slate-400 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                  {team.description || "No description provided."}
                </p>
              </div>
            </div>

            {/* ✅ Status Update Section */}
            <div className="mt-6 pt-6 border-t border-slate-700/50 flex flex-wrap items-center gap-3">
              <div className="relative flex-1">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-900 text-white rounded-xl px-4 py-2.5 border border-slate-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none appearance-none cursor-pointer text-sm"
                >
                  <option value="PENDING">Pending</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">▼</div>
              </div>

              <button
                onClick={handleStatusChange}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-purple-900/20 active:scale-95"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>

        {/* --- Team Members Table --- */}
        <div className="bg-slate-800/60 border border-slate-700/60 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HiUserGroup className="text-emerald-400"/> Team Roster
            </h2>
            <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-md font-medium">
              Total: {team.members.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Academic Details</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {(team.members || [])
                  .sort((a, b) => (b.leader === true) - (a.leader === true)) // Leader on top
                  .map((m, index) => (
                    <tr
                      key={index}
                      className={`group hover:bg-slate-700/30 transition-all ${
                        m.leader ? "bg-[#0d1a33]/50" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${m.leader ? "bg-amber-500 text-black" : "bg-slate-700 text-slate-300"}`}>
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-white">{m.name}</div>
                            <div className="text-xs text-slate-500">{m.rollNumber || "N/A"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                        {m.email}
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-xs">
                        <div className="font-medium text-white">{m.course} ({m.branch})</div>
                        <div className="text-slate-500">{m.semester} • {m.section}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-700/50 border border-slate-600 px-2.5 py-1 rounded-lg text-xs text-slate-300">
                          {m.role}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        {m.leader ? (
                          <span className="inline-flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-400/10 px-2 py-1 rounded-md border border-amber-400/20">
                            ★ LEADER
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">Member</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            navigate(`/profile/${encodeURIComponent(m.email)}`)
                          }
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
      </div>
    </div>
  );
}