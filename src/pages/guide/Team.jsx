import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function Team() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch token safely
  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // ✅ Redirect to login if token not found
  useEffect(() => {
    if (!token) {
      Swal.fire("Unauthorized", "Please login first", "warning").then(() => {
        navigate("/login");
      });
    }
  }, [token, navigate]);

  // ✅ Fetch all teams of the logged-in guide
  const fetchTeams = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/guide/teams/mine`,
        axiosConfig
      );

      if (Array.isArray(res.data)) {
        setTeams(res.data);
      } else {
        setTeams([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to load teams";

      // ✅ Handle 403 (forbidden) explicitly
      if (err.response?.status === 403) {
        Swal.fire("Forbidden", "You are not authorized for this action.", "error").then(() => {
          navigate("/login");
        });
      } else if (err.code === "ERR_NETWORK") {
        Swal.fire("Server Error", "Cannot connect to backend (port or URL issue).", "error");
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

  // ✅ Delete handler
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
      }
    }
  };

  // ✅ Loading UI
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-300 text-lg">Loading teams...</p>
      </div>
    );
  }

  // ✅ Main UI
  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 p-6">
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
                  onClick={() => navigate(`/guide/EditTeamDetail/${team.teamId}`)}

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
