import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { HiSearch, HiUserGroup, HiCalendar, HiPencil, HiTrash, HiEye } from "react-icons/hi";

// 🔄 Reusable Loader Overlay Component
const LoaderOverlay = ({ message }) => (
  <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
    <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-white text-lg font-medium tracking-wide">{message || "Loading..."}</p>
  </div>
);

export default function Team() {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true); // Page load
  const [deleting, setDeleting] = useState(false); // Delete loader
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
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to load teams";

      if (err.response?.status === 403) {
        Swal.fire("Forbidden", "You are not authorized for this action.", "error").then(
          () => navigate("/login")
        );
      } else if (err.code === "ERR_NETWORK") {
        Swal.fire(
          "Server Error",
          "Cannot connect to backend (port or URL issue).",
          "error"
        );
      } else {
        Swal.fire("Error", message, "error");
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

  // ✅ Delete handler with loader
  const handleDelete = async (teamId) => {
    const confirmed = await Swal.fire({
      title: "Delete Team?",
      text: "This action cannot be undone. All team data will be lost.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!",
      background: "#1e293b",
      color: "#fff",
    });

    if (confirmed.isConfirmed) {
      setDeleting(true); // start loader
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/guide/teams/${teamId}`,
          axiosConfig
        );

        const newTeams = teams.filter((t) => t.teamId !== teamId);
        setTeams(newTeams);
        setFilteredTeams(newTeams); // Update filtered list too
        
        Swal.fire({
          title: "Deleted!",
          text: "Team has been removed successfully.",
          icon: "success",
          confirmButtonColor: "#0ea5e9",
          background: "#1e293b",
          color: "#fff",
        });
      } catch (err) {
        console.error("Delete error:", err);
        const message =
          err.response?.data?.message ||
          err.response?.data ||
          "Failed to delete team";
        Swal.fire("Error", message, "error");
      } finally {
        setDeleting(false); // stop loader
      }
    }
  };

  // ✅ Page-level loader
  if (loading) return <LoaderOverlay message="Loading Your Teams..." />;

  // ✅ Main UI
  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 p-6 md:p-8 relative font-sans">
      {deleting && <LoaderOverlay message="Deleting Team..." />}

      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">My Teams</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your project teams and members</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiSearch className="text-slate-400 text-lg" />
          </div>
          <input
            type="text"
            placeholder="Search teams or projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm placeholder-slate-500 text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto">
        {filteredTeams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-700">
            <div className="bg-slate-800 p-4 rounded-full mb-4">
              <HiUserGroup className="text-4xl text-slate-500" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No teams found</h3>
            <p className="text-slate-400 text-center max-w-md">
              {searchTerm ? "Try adjusting your search terms." : "You haven't created any teams yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <div
                key={team.teamId}
                className="group bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Card Header */}
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors line-clamp-1">
                      {team.teamName}
                    </h3>
                    <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-md font-medium border border-slate-700">
                      ID: {team.teamId}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2 min-h-[2.5rem]">
                    {team.projectTitle || "No Project Title"}
                  </p>
                </div>

                {/* Card Stats */}
                <div className="bg-slate-950/50 rounded-xl p-3 mb-5 border border-slate-800/50">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center text-slate-400">
                      <HiUserGroup className="mr-1.5 text-sky-500" />
                      Members
                    </div>
                    <span className="font-semibold text-slate-200">{team.totalMembers || 0}</span>
                  </div>
                  
                  <div className="w-full h-px bg-slate-800 my-2"></div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center text-slate-400">
                      <HiCalendar className="mr-1.5 text-emerald-500" />
                      Duration
                    </div>
                    <div className="text-right">
                      <span className="block text-slate-300">{team.projectStartDate || "N/A"}</span>
                      <span className="block text-[10px] text-slate-500">to {team.projectEndDate || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2 mt-auto">
                  <button
                    onClick={() => navigate(`/guide/TeamDetail/${team.teamId}`)}
                    className="flex items-center justify-center px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:bg-sky-600 hover:text-white transition-all border border-slate-700 hover:border-transparent group/btn"
                  >
                    <HiEye className="mr-1.5 text-lg" />
                    View
                  </button>
                  
                  <button
                    onClick={() => navigate(`/guide/EditTeamDetail/${team.teamId}`)}
                    className="flex items-center justify-center px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:bg-yellow-500 hover:text-white transition-all border border-slate-700 hover:border-transparent group/btn"
                  >
                    <HiPencil className="mr-1.5 text-lg" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => handleDelete(team.teamId)}
                    className="flex items-center justify-center px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:bg-red-500 hover:text-white transition-all border border-slate-700 hover:border-transparent group/btn"
                  >
                    <HiTrash className="mr-1.5 text-lg" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}