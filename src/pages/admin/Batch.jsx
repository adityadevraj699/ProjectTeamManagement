import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function Batch() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [batchInputs, setBatchInputs] = useState([{ branchName: "", fullName: "" }]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    fetchCourses();
    fetchBatches();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/courses`, axiosConfig);
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to load courses",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
      });
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/branches`, axiosConfig);
      setBatches(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to load batches",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddInput = () => setBatchInputs([...batchInputs, { branchName: "", fullName: "" }]);
  const handleRemoveInput = (index) => {
    const newInputs = batchInputs.filter((_, i) => i !== index);
    setBatchInputs(newInputs);
  };

  const handleInputChange = (index, field, value) => {
    const newInputs = [...batchInputs];
    newInputs[index][field] = value;
    setBatchInputs(newInputs);
  };

  const handleCreateBatches = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) {
      Swal.fire("Error", "Please select a course", "error");
      return;
    }

    const payload = batchInputs
      .filter((b) => b.branchName.trim() && b.fullName.trim())
      .map((b) => ({ branchName: b.branchName, fullName: b.fullName, courseId: selectedCourseId }));

    if (!payload.length) {
      Swal.fire("Error", "Enter at least one batch with both names", "error");
      return;
    }

    try {
      for (let batch of payload) {
        await axios.post(`${import.meta.env.VITE_API_URL}/admin/branches`, batch, axiosConfig);
      }
      Swal.fire("Created!", "Batches created successfully", "success");
      setBatchInputs([{ branchName: "", fullName: "" }]);
      setSelectedCourseId("");
      fetchBatches();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to create batches",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
      });
    }
  };

  const handleUpdate = async (batch) => {
    const { value: formValues } = await Swal.fire({
      title: "Update Batch",
      html: `
        <input id="swal-branchName" class="swal2-input" placeholder="Short Name" value="${batch.branchName || ""}">
        <input id="swal-fullName" class="swal2-input" placeholder="Full Name" value="${batch.fullName || ""}">
      `,
      confirmButtonColor: "#38bdf8",
      focusConfirm: false,
      background: "#0f172a",
      color: "#fff",
      preConfirm: () => ({
        branchName: document.getElementById("swal-branchName").value,
        fullName: document.getElementById("swal-fullName").value,
        courseId: batch.courseId,
      }),
    });

    if (!formValues) return;

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/admin/branches/${batch.id}`, formValues, axiosConfig);
      Swal.fire("Updated!", "Batch updated successfully", "success");
      fetchBatches();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to update batch",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
      });
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete?",
      text: "This batch will be permanently deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#38bdf8",
      background: "#0f172a",
      color: "#fff",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/branches/${id}`, axiosConfig);
      Swal.fire("Deleted!", "Batch deleted successfully", "success");
      fetchBatches();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to delete batch",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 p-10">
      <h1 className="text-3xl font-bold mb-6 text-sky-400">Manage Batches</h1>

      {/* Create Batches Form */}
      <form
        onSubmit={handleCreateBatches}
        className="bg-slate-800 border border-sky-600 rounded-2xl p-6 mb-10 shadow-lg"
      >
        <h2 className="text-xl font-semibold mb-4 text-sky-300">Create New Batches</h2>

        {/* Course Select */}
        <div className="mb-4">
          <label className="block mb-2">Select Course</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="p-3 rounded-lg bg-slate-900 border border-white/20 focus:ring-2 focus:ring-sky-500 w-full"
          >
            <option value="">-- Select Course --</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.courseName}
              </option>
            ))}
          </select>
        </div>

        {/* Batch Inputs */}
        {batchInputs.map((b, index) => (
          <div key={index} className="flex gap-3 mb-3 items-center">
            <input
              type="text"
              placeholder="Short Name"
              value={b.branchName}
              onChange={(e) => handleInputChange(index, "branchName", e.target.value)}
              className="p-3 rounded-lg bg-slate-900 border border-white/20 focus:ring-2 focus:ring-sky-500 flex-1"
              required
            />
            <input
              type="text"
              placeholder="Full Name"
              value={b.fullName}
              onChange={(e) => handleInputChange(index, "fullName", e.target.value)}
              className="p-3 rounded-lg bg-slate-900 border border-white/20 focus:ring-2 focus:ring-sky-500 flex-1"
              required
            />
            {batchInputs.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveInput(index)}
                className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg"
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleAddInput}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg"
          >
            Add Another Batch
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg font-semibold shadow-lg"
          >
            Create Batches
          </button>
        </div>
      </form>

      {/* All Batches */}
      <h2 className="text-2xl font-semibold mb-4 text-sky-300">All Batches</h2>
      {loading ? (
        <p>Loading batches...</p>
      ) : batches.length === 0 ? (
        <p className="text-gray-400">No batches available yet.</p>
      ) : (
        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className="bg-slate-800 border border-sky-600 rounded-xl p-5 shadow-lg hover:shadow-sky-700/30 transition"
            >
              <h2 className="text-xl font-semibold text-sky-300 mb-1">{batch.branchName}</h2>
              <p className="text-gray-300 text-sm mb-1">{batch.fullName}</p>
              <p className="text-gray-400 text-sm mb-3">Course: {batch.courseName || "N/A"}</p>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => handleUpdate(batch)}
                  className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded-lg text-sm font-medium"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(batch.id)}
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
