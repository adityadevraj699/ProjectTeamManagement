import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiOutlineAcademicCap, 
  HiOutlinePlus, 
  HiOutlineTrash, 
  HiOutlinePencilAlt, 
  HiOutlineSearch,
  HiOutlineCollection
} from "react-icons/hi";

export default function Batch() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [batchInputs, setBatchInputs] = useState([{ branchName: "", fullName: "" }]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
      console.error(err);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/branches`, axiosConfig);
      setBatches(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
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
      Swal.fire({ icon: 'warning', title: "Select Course", text: "Please select a course first", background: "#1e293b", color: "#fff" });
      return;
    }

    const payload = batchInputs
      .filter((b) => b.branchName.trim() && b.fullName.trim())
      .map((b) => ({ branchName: b.branchName, fullName: b.fullName, courseId: selectedCourseId }));

    if (!payload.length) {
      Swal.fire({ icon: 'warning', title: "Empty Fields", text: "Please fill at least one batch details", background: "#1e293b", color: "#fff" });
      return;
    }

    try {
      for (let batch of payload) {
        await axios.post(`${import.meta.env.VITE_API_URL}/admin/branches`, batch, axiosConfig);
      }
      Swal.fire({ icon: 'success', title: "Created!", text: "Batches added successfully", background: "#1e293b", color: "#fff", timer: 1500, showConfirmButton: false });
      setBatchInputs([{ branchName: "", fullName: "" }]);
      fetchBatches();
    } catch (err) {
      Swal.fire({ icon: 'error', title: "Error", text: err.response?.data?.message || "Failed", background: "#1e293b", color: "#fff" });
    }
  };

  const handleUpdate = async (batch) => {
    const { value: formValues } = await Swal.fire({
      title: "Update Batch",
      html: `
        <div class="flex flex-col gap-3">
            <input id="swal-branchName" class="swal2-input bg-slate-700 text-white border-slate-600" placeholder="Short Name" value="${batch.branchName || ""}">
            <input id="swal-fullName" class="swal2-input bg-slate-700 text-white border-slate-600" placeholder="Full Name" value="${batch.fullName || ""}">
        </div>
      `,
      confirmButtonText: 'Update',
      confirmButtonColor: "#0ea5e9",
      background: "#0f172a",
      color: "#fff",
      focusConfirm: false,
      preConfirm: () => ({
        branchName: document.getElementById("swal-branchName").value,
        fullName: document.getElementById("swal-fullName").value,
        courseId: batch.courseId,
      }),
    });

    if (!formValues) return;

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/admin/branches/${batch.id}`, formValues, axiosConfig);
      Swal.fire({ icon: 'success', title: "Updated!", text: "Batch updated successfully", background: "#1e293b", color: "#fff", timer: 1500 });
      fetchBatches();
    } catch (err) {
      Swal.fire({ icon: 'error', title: "Error", text: "Failed to update", background: "#1e293b", color: "#fff" });
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      background: "#0f172a",
      color: "#fff",
      confirmButtonText: "Yes, delete it!"
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/branches/${id}`, axiosConfig);
      Swal.fire({ icon: 'success', title: "Deleted!", text: "Batch has been deleted.", background: "#1e293b", color: "#fff", timer: 1500 });
      fetchBatches();
    } catch (err) {
      Swal.fire({ icon: 'error', title: "Error", text: "Failed to delete", background: "#1e293b", color: "#fff" });
    }
  };

  // Filter batches for search
  const filteredBatches = batches.filter(b => 
    b.branchName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span className="p-2 bg-sky-500/10 rounded-lg text-sky-400"><HiOutlineCollection /></span>
              Batch Management
            </h1>
            <p className="text-slate-400 mt-1 ml-1">Manage branches and link them to courses.</p>
          </div>
          <div className="relative w-full md:w-auto">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search batches..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder-slate-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Create Form */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl sticky top-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <HiOutlinePlus className="text-sky-400" /> Create New Batch
              </h2>

              <form onSubmit={handleCreateBatches} className="space-y-4">
                {/* Course Select */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Course</label>
                  <div className="relative">
                    <HiOutlineAcademicCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm transition-all appearance-none cursor-pointer hover:bg-slate-750"
                    >
                      <option value="">Select a Course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>{course.courseName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dynamic Inputs */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                  {batchInputs.map((b, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl space-y-2 group hover:border-sky-500/30 transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-slate-500">Batch {index + 1}</span>
                        {batchInputs.length > 1 && (
                          <button type="button" onClick={() => handleRemoveInput(index)} className="text-slate-500 hover:text-red-400 transition-colors">
                            <HiOutlineTrash />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Short Name (e.g. CSE)"
                        value={b.branchName}
                        onChange={(e) => handleInputChange(index, "branchName", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:border-sky-500 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Full Name (e.g. Computer Science)"
                        value={b.fullName}
                        onChange={(e) => handleInputChange(index, "fullName", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:border-sky-500 outline-none"
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleAddInput}
                    className="w-full py-2.5 border border-dashed border-slate-600 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-sky-400 hover:border-sky-500/50 transition-all text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <HiOutlinePlus /> Add Another Field
                  </button>
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-sky-500/20 transition-all transform hover:scale-[1.02] active:scale-95"
                  >
                    Create Batches
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT: Display Grid */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-32 bg-slate-800 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : filteredBatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/50 text-slate-500">
                <HiOutlineCollection className="text-4xl mb-2 opacity-50" />
                <p>No batches found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {filteredBatches.map((batch) => (
                    
                    <motion.div
                      key={batch.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300 relative overflow-hidden"
                    >
                      {/* Hover Gradient Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors">
                              {batch.branchName}
                            </h3>
                            <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 mt-1 inline-block">
                              {batch.courseName || "No Course"}
                            </span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                            <button onClick={() => handleUpdate(batch)} className="p-2 bg-slate-800 hover:bg-sky-500/20 hover:text-sky-400 text-slate-400 rounded-lg transition-colors" title="Edit">
                              <HiOutlinePencilAlt size={18} />
                            </button>
                            <button onClick={() => handleDelete(batch.id)} className="p-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-lg transition-colors" title="Delete">
                              <HiOutlineTrash size={18} />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-slate-400 border-t border-slate-800 pt-3 mt-2">
                          {batch.fullName}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}