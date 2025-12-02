import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

// 🔄 Reusable Loader Overlay Component
const LoaderOverlay = ({ message }) => (
  <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
    <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-white text-lg font-medium">{message || "Loading..."}</p>
  </div>
);

export default function AdminTeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false); // ✅ New loader for status update
  const [newStatus, setNewStatus] = useState("PENDING");

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // ✅ Fetch team detail
  const fetchTeamDetail = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/guide/teams/details/${id}`,
        axiosConfig
      );
      setTeam(res.data);
      setNewStatus(res.data.status);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch team details", "error");
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
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/guide/projects/${team.projectId}/status?status=${newStatus}`,
        {},
        axiosConfig
      );

      Swal.fire("✅ Success", res.data, "success");
      fetchTeamDetail();
    } catch (err) {
      console.error("Status update error:", err);
      Swal.fire("Error", err.response?.data || "Forbidden", "error");
    } finally {
      setUpdating(false); // hide overlay
    }
  };

  // ✅ Page-level loader
  if (loading) return <LoaderOverlay message="Loading Team Details..." />;

  // ✅ If no team found
  if (!team) {
    return (
      <div className="text-center text-gray-400 mt-10">Team not found.</div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100 p-8 relative">
      {updating && <LoaderOverlay message="Updating Status..." />}

      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-5 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg text-white transition-all"
      >
        ← Back
      </button>

      {/* --- Team + Project Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Team Info Card */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-sky-800/20 hover:border-sky-500/40 transition-all">
          <h1 className="text-3xl font-bold text-sky-400 mb-4">
            {team.teamName}
          </h1>
          <p className="text-gray-400 text-sm mb-3">
            <span className="font-semibold text-gray-300">Created:</span>{" "}
            {team.createdDate}
          </p>

          <div className="space-y-2">
            <p>
              <strong className="text-gray-300">Members:</strong>{" "}
              {team.members.length}
            </p>
            <p>
              <strong className="text-gray-300">Status:</strong>{" "}
              <span
                className={`${
                  team.status === "COMPLETED"
                    ? "text-green-400"
                    : team.status === "ONGOING"
                    ? "text-yellow-400"
                    : "text-gray-400"
                } font-semibold`}
              >
                {team.status}
              </span>
            </p>
          </div>
        </div>

        {/* Project Info Card */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-purple-800/20 hover:border-purple-500/40 transition-all">
          <h2 className="text-2xl font-semibold text-purple-400 mb-3">
            Project Details
          </h2>
          <p>
            <strong className="text-gray-300">Title:</strong>{" "}
            {team.projectTitle}
          </p>
          <p className="mt-1">
            <strong className="text-gray-300">Tech Stack:</strong>{" "}
            {team.technologiesUsed}
          </p>
          <p className="mt-1">
            <strong className="text-gray-300">Start:</strong>{" "}
            {team.startDate || "N/A"} |{" "}
            <strong className="text-gray-300">End:</strong>{" "}
            {team.endDate || "N/A"}
          </p>
          <p className="mt-2 text-gray-300 leading-snug">
            <strong>Description:</strong> {team.description}
          </p>

          {/* ✅ Status Update Section */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:ring-2 focus:ring-purple-500"
            >
              <option value="PENDING">Pending</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <button
              onClick={handleStatusChange}
              className="px-5 py-2 bg-purple-600 rounded text-white font-semibold hover:bg-purple-700 transition-all"
            >
              Update Status
            </button>
          </div>
        </div>
      </div>

      {/* --- Team Members Table --- */}
      <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-white/10">
        <h2 className="text-2xl font-semibold text-sky-400 mb-4">
          Team Members
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border border-slate-700 rounded-xl overflow-hidden">
            <thead className="bg-slate-700 text-gray-200">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Roll No</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3">Section</th>
                <th className="px-4 py-3">Semester</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Leader</th>
                <th className="px-4 py-3">Profile</th>
              </tr>
            </thead>
           <tbody className="divide-y divide-slate-700">
  {(team.members || [])
    .sort((a, b) => (b.leader === true) - (a.leader === true)) // Leader on top
    .map((m, index) => (
      <tr
        key={index}
        className={
          `hover:bg-slate-800/70 transition-all ` +
          (m.leader ? "bg-[#0d1a33] ring-1 ring-green-500/20" : "")
        }
      >
        <td className="px-4 py-2">{m.name}</td>
        <td className="px-4 py-2 text-sky-400">{m.email}</td>
        <td className="px-4 py-2">{m.rollNumber || "N/A"}</td>
        <td className="px-4 py-2">{m.course}</td>
        <td className="px-4 py-2">{m.branch}</td>
        <td className="px-4 py-2">{m.section}</td>
        <td className="px-4 py-2">{m.semester}</td>
        <td className="px-4 py-2">{m.role}</td>

        <td className="px-4 py-2">
          {m.leader ? (
            <span className="text-green-400 font-semibold">
              ✔ Leader
            </span>
          ) : (
            <span className="text-yellow-400 font-semibold">
              Member
            </span>
          )}
        </td>

        <td className="px-4 py-2">
          <button
            onClick={() =>
              navigate(`/profile/${encodeURIComponent(m.email)}`)
            }
            className="px-3 py-1 bg-sky-600 hover:bg-sky-700 rounded text-white transition-all"
          >
            View
          </button>
        </td>
      </tr>
    ))}
</tbody>

          </table>
        </div>
      </div>
    </div>
  );
}
