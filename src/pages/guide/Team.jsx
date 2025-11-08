import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

// 🔄 Reusable Loader Overlay Component
const LoaderOverlay = ({ message }) => (
  <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
    <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-white text-lg font-medium">{message || "Loading..."}</p>
  </div>
);

export default function Team() {
  const [teams, setTeams] = useState([]);
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
      Swal.fire("Unauthorized", "Please login first", "warning").then(() => {
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

      setTeams(Array.isArray(res.data) ? res.data : []);
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

  // ✅ Delete handler with loader
  const handleDelete = async (teamId) => {
    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the team.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmed.isConfirmed) {
      setDeleting(true); // start loader
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/guide/teams/${teamId}`,
          axiosConfig
        );

        setTeams((prev) => prev.filter((t) => t.teamId !== teamId));
        Swal.fire("Deleted!", "Team has been removed successfully.", "success");
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
    <div className="min-h-screen bg-slate-900 text-gray-100 p-6 relative">
      {deleting && <LoaderOverlay message="Deleting Team..." />}

      <h1 className="text-3xl font-bold mb-6 text-sky-400">My Teams</h1>

      {teams.length === 0 ? (
        <p className="text-center text-gray-400 mt-10">No teams found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div
              key={team.teamId}
              className="bg-slate-800 border border-white/10 p-5 rounded-2xl shadow hover:shadow-xl hover:border-sky-600 transition-all"
            >
              <h3 className="text-xl font-semibold text-sky-400 mb-1">
                {team.teamName}
              </h3>
              <p className="text-sm mb-1">
                <strong>Project:</strong> {team.projectTitle || "N/A"}
              </p>
              <p className="text-sm mb-1">
                <strong>Members:</strong> {team.totalMembers || 0}
              </p>
              <p className="text-sm mb-1">
                <strong>Start:</strong> {team.projectStartDate || "N/A"}
              </p>
              <p className="text-sm mb-3">
                <strong>End:</strong> {team.projectEndDate || "N/A"}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/guide/TeamDetail/${team.teamId}`)}
                  className="px-4 py-1.5 rounded bg-sky-600 text-white hover:bg-sky-700 transition-colors"
                >
                  View
                </button>
                <button
                  onClick={() =>
                    navigate(`/guide/EditTeamDetail/${team.teamId}`)
                  }
                  className="px-4 py-1.5 rounded bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(team.teamId)}
                  className="px-4 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
