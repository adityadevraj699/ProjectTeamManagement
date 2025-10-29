import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

export default function EditTeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    teamId: "",
    teamName: "",
    projectId: "",
    projectTitle: "",
    description: "",
    technologiesUsed: "",
    startDate: "",
    endDate: "",
    status: "ONGOING",
  });

  useEffect(() => {
    fetchTeamDetail();
  }, [id]);

  const fetchTeamDetail = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:8800/api/guide/teams/details/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = res.data;
      setForm({
        teamId: data.teamId,
        teamName: data.teamName,
        projectId: data.projectId,
        projectTitle: data.projectTitle,
        description: data.description,
        technologiesUsed: data.technologiesUsed,
        startDate: data.startDate || "",
        endDate: data.endDate || "",
        status: data.status,
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch team details", "error");
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:8800/api/guide/teams/update`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("✅ Success", "Team updated successfully!", "success");
      navigate("/guide/team");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.response?.data || "Update failed", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1a2b] text-white py-10">
      <div className="max-w-5xl mx-auto bg-[#13233a] p-10 rounded-3xl shadow-2xl border border-gray-700">
        <h2 className="text-4xl font-bold mb-8 text-sky-400 border-b border-gray-600 pb-3 text-center">
          ✏️ Edit Team & Project Details
        </h2>

        {/* Team Name */}
        <div className="mb-6">
          <label className="block text-gray-300 font-semibold mb-2">
            🧑‍🤝‍🧑 Team Name
          </label>
          <input
            type="text"
            className="bg-[#0e1c2e] border border-gray-600 text-white focus:border-sky-400 focus:ring-2 focus:ring-sky-300 p-3 w-full rounded-lg"
            value={form.teamName}
            onChange={(e) => setForm({ ...form, teamName: e.target.value })}
            placeholder="Enter team name..."
          />
        </div>

        {/* Project Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-300 font-semibold mb-2">
              💡 Project Title
            </label>
            <input
              type="text"
              className="bg-[#0e1c2e] border border-gray-600 text-white focus:border-sky-400 focus:ring-2 focus:ring-sky-300 p-3 w-full rounded-lg"
              value={form.projectTitle}
              onChange={(e) =>
                setForm({ ...form, projectTitle: e.target.value })
              }
              placeholder="Enter project title..."
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-2">
              📈 Status
            </label>
            <select
              className="bg-[#0e1c2e] border border-gray-600 text-white focus:border-sky-400 focus:ring-2 focus:ring-sky-300 p-3 w-full rounded-lg"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="ONGOING">🟢 Ongoing</option>
              <option value="COMPLETED">✅ Completed</option>
              <option value="PENDING">🕓 Pending</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <label className="block text-gray-300 font-semibold mb-2">
            📝 Description
          </label>
          <textarea
            className="bg-[#0e1c2e] border border-gray-600 text-white focus:border-sky-400 focus:ring-2 focus:ring-sky-300 p-3 w-full rounded-lg"
            rows="4"
            placeholder="Enter project description..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Technologies & Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div>
            <label className="block text-gray-300 font-semibold mb-2">
              ⚙️ Technologies Used
            </label>
            <input
              type="text"
              className="bg-[#0e1c2e] border border-gray-600 text-white focus:border-sky-400 focus:ring-2 focus:ring-sky-300 p-3 w-full rounded-lg"
              placeholder="React, Spring Boot, MySQL..."
              value={form.technologiesUsed}
              onChange={(e) =>
                setForm({ ...form, technologiesUsed: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-2">
              🗓️ Start Date
            </label>
            <input
              type="date"
              className="bg-[#0e1c2e] border border-gray-600 text-white focus:border-sky-400 focus:ring-2 focus:ring-sky-300 p-3 w-full rounded-lg"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-2">
              🏁 End Date
            </label>
            <input
              type="date"
              className="bg-[#0e1c2e] border border-gray-600 text-white focus:border-sky-400 focus:ring-2 focus:ring-sky-300 p-3 w-full rounded-lg"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center mt-10 gap-4">
          <button
            onClick={handleSubmit}
            className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-10 py-3 rounded-xl shadow-lg transition-all"
          >
            💾 Save Changes
          </button>
          <button
            onClick={() => navigate("/guide/team")}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-10 py-3 rounded-xl shadow-lg transition-all"
          >
            🔙 Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
