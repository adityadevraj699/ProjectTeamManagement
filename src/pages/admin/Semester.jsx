import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function Semester() {
  const [semesters, setSemesters] = useState([]);
  const [semesterName, setSemesterName] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  // ✅ Fetch all semesters
  const fetchSemesters = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/semesters`, axiosConfig);
      setSemesters(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to load semesters",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Create new semester
  const handleAddSemester = async (e) => {
    e.preventDefault();
    if (!semesterName.trim()) {
      Swal.fire("Error", "Please enter semester name", "error");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/semesters`,
        { semesterName },
        axiosConfig
      );
      Swal.fire("Created!", "Semester added successfully", "success");
      setSemesterName("");
      fetchSemesters();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to add semester",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
      });
    }
  };

  // ✅ Update semester
  const handleUpdateSemester = async (semester) => {
    const { value: newName } = await Swal.fire({
      title: "Update Semester",
      input: "text",
      inputLabel: "Semester Name",
      inputValue: semester.semesterName,
      showCancelButton: true,
      confirmButtonColor: "#38bdf8",
      cancelButtonColor: "#ef4444",
      background: "#0f172a",
      color: "#fff",
    });

    if (!newName) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/semesters/${semester.id}`,
        { semesterName: newName },
        axiosConfig
      );
      Swal.fire("Updated!", "Semester updated successfully", "success");
      fetchSemesters();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to update semester",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
      });
    }
  };

  // ✅ Delete semester
  const handleDeleteSemester = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete?",
      text: "This semester will be permanently deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#38bdf8",
      background: "#0f172a",
      color: "#fff",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/semesters/${id}`, axiosConfig);
      Swal.fire("Deleted!", "Semester deleted successfully", "success");
      fetchSemesters();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to delete semester",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
      });
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 p-10">
      <h1 className="text-3xl font-bold mb-6 text-sky-400">Manage Semesters</h1>

      {/* Add Semester Form */}
      <form
        onSubmit={handleAddSemester}
        className="bg-slate-800 border border-sky-600 rounded-2xl p-6 mb-10 shadow-lg"
      >
        <h2 className="text-xl font-semibold mb-4 text-sky-300">Add New Semester</h2>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Enter Semester Name (e.g., 1st Semester)"
            value={semesterName}
            onChange={(e) => setSemesterName(e.target.value)}
            className="p-3 rounded-lg bg-slate-900 border border-white/20 focus:ring-2 focus:ring-sky-500 flex-1"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg font-semibold shadow-lg"
          >
            Add Semester
          </button>
        </div>
      </form>

      {/* All Semesters */}
      <h2 className="text-2xl font-semibold mb-4 text-sky-300">All Semesters</h2>

      {loading ? (
        <p>Loading semesters...</p>
      ) : semesters.length === 0 ? (
        <p className="text-gray-400">No semesters available yet.</p>
      ) : (
        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
          {semesters.map((semester) => (
            <div
              key={semester.id}
              className="bg-slate-800 border border-sky-600 rounded-xl p-5 shadow-lg hover:shadow-sky-700/30 transition"
            >
              <h2 className="text-xl font-semibold text-sky-300 mb-2">
                {semester.semesterName}
              </h2>

              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => handleUpdateSemester(semester)}
                  className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded-lg text-sm font-medium"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDeleteSemester(semester.id)}
                  className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg text-sm font-medium"
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
