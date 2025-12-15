import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiOutlineViewGrid, 
  HiOutlinePlus, 
  HiOutlinePencilAlt, 
  HiOutlineTrash, 
  HiSearch,
  HiOutlineTemplate
} from "react-icons/hi";

// 💀 Skeleton Loader
const SectionSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 animate-pulse flex flex-col items-center">
        <div className="h-8 w-12 bg-slate-700 rounded mb-2"></div>
        <div className="h-4 w-20 bg-slate-700 rounded"></div>
      </div>
    ))}
  </div>
);

export default function Section() {
  const [sections, setSections] = useState([]);
  const [sectionName, setSectionName] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  // ✅ Add new section
  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!sectionName.trim()) {
        Swal.fire({ icon: 'warning', title: "Input Required", text: "Please enter section name", background: "#1e293b", color: "#fff" });
        return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/sections`,
        { sectionName },
        axiosConfig
      );
      Swal.fire({ 
        icon: 'success', 
        title: "Created!", 
        text: "Section added successfully", 
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, 
        background: "#1e293b", color: "#fff" 
      });
      setSectionName("");
      fetchSections();
    } catch (err) {
      Swal.fire({ icon: 'error', title: "Error", text: "Failed to add section", background: "#1e293b", color: "#fff" });
    }
  };

  // ✅ Update section
  const handleUpdateSection = async (section) => {
    const { value: newName } = await Swal.fire({
      title: "Update Section",
      html: `
        <input id="swal-input1" class="swal2-input bg-slate-700 text-white border-slate-600 focus:ring-sky-500" placeholder="Section Name" value="${section.sectionName}">
      `,
      showCancelButton: true,
      confirmButtonText: "Update",
      confirmButtonColor: "#0ea5e9",
      cancelButtonColor: "#64748b",
      background: "#0f172a",
      color: "#fff",
      focusConfirm: false,
      preConfirm: () => {
        return document.getElementById('swal-input1').value;
      }
    });

    if (!newName) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/sections/${section.id}`,
        { sectionName: newName },
        axiosConfig
      );
      Swal.fire({ 
        icon: 'success', title: "Updated!", text: "Section updated successfully", 
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, 
        background: "#1e293b", color: "#fff" 
      });
      fetchSections();
    } catch (err) {
        Swal.fire({ icon: 'error', title: "Error", text: "Failed to update", background: "#1e293b", color: "#fff" });
    }
  };

  // ✅ Delete section
  const handleDeleteSection = async (id) => {
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
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/sections/${id}`, axiosConfig);
      Swal.fire({ 
        icon: 'success', title: "Deleted!", text: "Section deleted successfully", 
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, 
        background: "#1e293b", color: "#fff" 
      });
      fetchSections();
    } catch (err) {
        Swal.fire({ icon: 'error', title: "Error", text: "Failed to delete", background: "#1e293b", color: "#fff" });
    }
  };

  // Filter Logic
  const filteredSections = sections.filter(s => 
    s.sectionName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span className="p-2 bg-sky-500/10 rounded-lg text-sky-400"><HiOutlineViewGrid /></span>
              Section Management
            </h1>
            <p className="text-slate-400 mt-1 ml-1">Manage class sections (e.g., A, B, C).</p>
          </div>
          
          <div className="relative w-full md:w-auto group">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search sections..." 
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
                <HiOutlinePlus className="text-sky-400" /> Add Section
              </h2>

              <form onSubmit={handleAddSection} className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Section Name</label>
                  <div className="relative">
                    <HiOutlineTemplate className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. A, B, Alpha"
                      value={sectionName}
                      onChange={(e) => setSectionName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm transition-all text-white placeholder-slate-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 mt-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-sky-900/20 transition-all transform hover:scale-[1.02] active:scale-95 flex justify-center items-center gap-2"
                >
                  <HiOutlinePlus className="text-lg" /> Create Section
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: List */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">All Sections</h2>
                    <span className="text-xs font-medium px-2 py-1 bg-slate-800 rounded-md text-slate-400 border border-slate-700">
                        Total: {filteredSections.length}
                    </span>
                </div>

                {loading ? (
                    <SectionSkeleton />
                ) : filteredSections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                        <HiOutlineViewGrid className="text-5xl mb-3 opacity-30" />
                        <p>No sections found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {filteredSections.map((section) => (
                                <motion.div
                                    key={section.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="group relative bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300 overflow-hidden"
                                >
                                    {/* Gradient Background Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="relative z-10 text-center">
                                        <h3 className="text-3xl font-extrabold text-white group-hover:text-sky-400 transition-colors">
                                            {section.sectionName}
                                        </h3>
                                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Section</span>
                                    </div>

                                    {/* Hover Actions */}
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-[-5px] group-hover:translate-y-0 duration-200">
                                        <button 
                                            onClick={() => handleUpdateSection(section)} 
                                            className="p-1.5 bg-slate-700/80 hover:bg-sky-500/20 hover:text-sky-400 text-slate-400 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <HiOutlinePencilAlt size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteSection(section.id)} 
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