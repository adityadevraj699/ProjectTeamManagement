import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiOutlineAcademicCap, 
  HiOutlinePlus, 
  HiOutlinePencilAlt, 
  HiOutlineTrash, 
  HiSearch,
  HiOutlineCalendar
} from "react-icons/hi";

// 💀 Skeleton Loader
const SemesterSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 animate-pulse flex flex-col items-center">
        <div className="h-8 w-16 bg-slate-700 rounded mb-2"></div>
        <div className="h-4 w-24 bg-slate-700 rounded"></div>
      </div>
    ))}
  </div>
);

export default function Semester() {
  const [semesters, setSemesters] = useState([]);
  const [semesterName, setSemesterName] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  // ✅ Create new semester
  const handleAddSemester = async (e) => {
    e.preventDefault();
    if (!semesterName.trim()) {
      Swal.fire({ icon: 'warning', title: "Input Required", text: "Please enter semester name", background: "#1e293b", color: "#fff" });
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/semesters`,
        { semesterName },
        axiosConfig
      );
      Swal.fire({ 
        icon: 'success', title: "Created!", text: "Semester added successfully", 
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, 
        background: "#1e293b", color: "#fff" 
      });
      setSemesterName("");
      fetchSemesters();
    } catch (err) {
      Swal.fire({ icon: 'error', title: "Error", text: "Failed to add semester", background: "#1e293b", color: "#fff" });
    }
  };

  // ✅ Update semester
  const handleUpdateSemester = async (semester) => {
    const { value: newName } = await Swal.fire({
      title: "Update Semester",
      html: `
        <input id="swal-input-sem" class="swal2-input bg-slate-700 text-white border-slate-600 focus:ring-sky-500" placeholder="Semester Name" value="${semester.semesterName}">
      `,
      showCancelButton: true,
      confirmButtonText: "Update",
      confirmButtonColor: "#0ea5e9",
      cancelButtonColor: "#64748b",
      background: "#0f172a",
      color: "#fff",
      focusConfirm: false,
      preConfirm: () => {
        return document.getElementById('swal-input-sem').value;
      }
    });

    if (!newName) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/semesters/${semester.id}`,
        { semesterName: newName },
        axiosConfig
      );
      Swal.fire({ 
        icon: 'success', title: "Updated!", text: "Semester updated successfully", 
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, 
        background: "#1e293b", color: "#fff" 
      });
      fetchSemesters();
    } catch (err) {
      Swal.fire({ icon: 'error', title: "Error", text: "Failed to update", background: "#1e293b", color: "#fff" });
    }
  };

  // ✅ Delete semester
  const handleDeleteSemester = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
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
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/semesters/${id}`, axiosConfig);
      Swal.fire({ 
        icon: 'success', title: "Deleted!", text: "Semester deleted successfully", 
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, 
        background: "#1e293b", color: "#fff" 
      });
      fetchSemesters();
    } catch (err) {
      Swal.fire({ icon: 'error', title: "Error", text: "Failed to delete", background: "#1e293b", color: "#fff" });
    }
  };

  // Filter Logic
  const filteredSemesters = semesters.filter(s => 
    s.semesterName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span className="p-2 bg-sky-500/10 rounded-lg text-sky-400"><HiOutlineCalendar /></span>
              Semester Management
            </h1>
            <p className="text-slate-400 mt-1 ml-1">Configure academic semesters (e.g. 1st, 2nd, 3rd).</p>
          </div>
          
          <div className="relative w-full md:w-auto group">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search semesters..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder-slate-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Create Form */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl sticky top-6">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
                <HiOutlinePlus className="text-sky-400" /> Add Semester
              </h2>

              <form onSubmit={handleAddSemester} className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Semester Name</label>
                  <div className="relative">
                    <HiOutlineAcademicCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. 1st Semester"
                      value={semesterName}
                      onChange={(e) => setSemesterName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm transition-all text-white placeholder-slate-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 mt-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-sky-900/20 transition-all transform hover:scale-[1.02] active:scale-95 flex justify-center items-center gap-2"
                >
                  <HiOutlinePlus className="text-lg" /> Create Semester
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: List */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">All Semesters</h2>
                    <span className="text-xs font-medium px-2 py-1 bg-slate-800 rounded-md text-slate-400 border border-slate-700">
                        Total: {filteredSemesters.length}
                    </span>
                </div>

                {loading ? (
                    <SemesterSkeleton />
                ) : filteredSemesters.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                        <HiOutlineCalendar className="text-5xl mb-3 opacity-30" />
                        <p>No semesters found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {filteredSemesters.map((semester) => (
                                
                                <motion.div
                                    key={semester.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="group relative bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300 overflow-hidden"
                                >
                                    {/* Gradient Background Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="relative z-10 text-center">
                                        <h3 className="text-2xl font-bold text-white group-hover:text-sky-400 transition-colors">
                                            {semester.semesterName}
                                        </h3>
                                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Academic Term</span>
                                    </div>

                                    {/* Hover Actions */}
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-[-5px] group-hover:translate-y-0 duration-200">
                                        <button 
                                            onClick={() => handleUpdateSemester(semester)} 
                                            className="p-1.5 bg-slate-700/80 hover:bg-sky-500/20 hover:text-sky-400 text-slate-400 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <HiOutlinePencilAlt size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteSemester(semester.id)} 
                                            className="p-1.5 bg-slate-700/80 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <HiOutlineTrash size={16} />
                                        </button>
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
    </div>
  );
}