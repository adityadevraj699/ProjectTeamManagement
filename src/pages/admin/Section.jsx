import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function Section() {
  const [sections, setSections] = useState([]);
  const [sectionName, setSectionName] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  // ✅ Fetch all sections
  const fetchSections = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/sections`, axiosConfig);
      setSections(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to load sections",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add new section
  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!sectionName.trim()) {
      Swal.fire("Error", "Please enter section name", "error");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/sections`,
        { sectionName },
        axiosConfig
      );
      Swal.fire("Created!", "Section added successfully", "success");
      setSectionName("");
      fetchSections();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to add section",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
      });
    }
  };

  // ✅ Update section
  const handleUpdateSection = async (section) => {
    const { value: newName } = await Swal.fire({
      title: "Update Section",
      input: "text",
      inputLabel: "Section Name",
      inputValue: section.sectionName,
      showCancelButton: true,
      confirmButtonColor: "#38bdf8",
      cancelButtonColor: "#ef4444",
      background: "#0f172a",
      color: "#fff",
    });

    if (!newName) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/sections/${section.id}`,
        { sectionName: newName },
        axiosConfig
      );
      Swal.fire("Updated!", "Section updated successfully", "success");
      fetchSections();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to update section",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
      });
    }
  };

  // ✅ Delete section
  const handleDeleteSection = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete?",
      text: "This section will be permanently deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#38bdf8",
      background: "#0f172a",
      color: "#fff",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/sections/${id}`, axiosConfig);
      Swal.fire("Deleted!", "Section deleted successfully", "success");
      fetchSections();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to delete section",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
      });
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 p-10">
      <h1 className="text-3xl font-bold mb-6 text-sky-400">Manage Sections</h1>

      {/* Add Section Form */}
      <form
        onSubmit={handleAddSection}
        className="bg-slate-800 border border-sky-600 rounded-2xl p-6 mb-10 shadow-lg"
      >
        <h2 className="text-xl font-semibold mb-4 text-sky-300">Add New Section</h2>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Enter Section Name (e.g., A)"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            className="p-3 rounded-lg bg-slate-900 border border-white/20 focus:ring-2 focus:ring-sky-500 flex-1"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg font-semibold shadow-lg"
          >
            Add Section
          </button>
        </div>
      </form>

      {/* All Sections */}
      <h2 className="text-2xl font-semibold mb-4 text-sky-300">All Sections</h2>

      {loading ? (
        <p>Loading sections...</p>
      ) : sections.length === 0 ? (
        <p className="text-gray-400">No sections available yet.</p>
      ) : (
        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-slate-800 border border-sky-600 rounded-xl p-5 shadow-lg hover:shadow-sky-700/30 transition"
            >
              <h2 className="text-xl font-semibold text-sky-300 mb-2">
                {section.sectionName}
              </h2>

              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => handleUpdateSection(section)}
                  className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded-lg text-sm font-medium"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDeleteSection(section.id)}
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
