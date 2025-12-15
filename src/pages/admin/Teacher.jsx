import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiSearch, HiPlus, HiPencil, HiTrash, 
  HiAcademicCap, HiUser, HiX, HiOutlineMail 
} from "react-icons/hi";

// 🔄 Button Loader
const ButtonLoader = () => (
  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
);

// 💀 Skeleton Loader Component
const TeacherSkeleton = () => (
  <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-full bg-slate-700/50"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/2 bg-slate-700/50 rounded"></div>
        <div className="h-3 w-3/4 bg-slate-700/50 rounded"></div>
      </div>
    </div>
    <div className="mt-6 flex gap-3">
      <div className="h-9 flex-1 bg-slate-700/50 rounded-lg"></div>
      <div className="h-9 flex-1 bg-slate-700/50 rounded-lg"></div>
    </div>
  </div>
);

export default function Teacher() {
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  // --- API FUNCTIONS ---

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/teachers`, axiosConfig);
      setTeachers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      // Silent fail or toast
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    setSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/admin/teachers`, formData, axiosConfig);
      Swal.fire({
        icon: 'success',
        title: 'Added',
        text: 'Teacher created successfully',
        background: '#1e293b',
        color: '#fff',
        timer: 1500,
        showConfirmButton: false
      });
      setFormData({ name: "", email: "" });
      setShowAddForm(false);
      fetchTeachers();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || "Failed to add teacher",
        background: '#1e293b',
        color: '#fff'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeacher = async (teacher) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Remove ${teacher.name} from the faculty list?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, delete it',
      background: '#1e293b',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        const id = teacher.id || teacher._id;
        await axios.delete(`${import.meta.env.VITE_API_URL}/admin/teachers/${id}`, axiosConfig);
        Swal.fire({
          icon: 'success', 
          title: 'Deleted', 
          background: '#1e293b', 
          color: '#fff', 
          timer: 1000, 
          showConfirmButton: false
        });
        fetchTeachers();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Could not delete teacher', background: '#1e293b', color: '#fff' });
      }
    }
  };

  const handleUpdateTeacher = async (teacher) => {
    const { value: formValues } = await Swal.fire({
      title: `<span class="text-white">Update Faculty</span>`,
      html: `
        <div class="flex flex-col gap-3">
          <input id="swal-name" class="w-full bg-slate-700 border border-slate-600 rounded p-3 text-white focus:outline-none focus:border-sky-500" placeholder="Name" value="${teacher.name}">
          <input id="swal-email" class="w-full bg-slate-700 border border-slate-600 rounded p-3 text-white focus:outline-none focus:border-sky-500" placeholder="Email" value="${teacher.email}">
        </div>
      `,
      background: '#0f172a',
      showCancelButton: true,
      confirmButtonColor: '#0ea5e9',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Save Changes',
      preConfirm: () => ({
        name: document.getElementById("swal-name").value,
        email: document.getElementById("swal-email").value,
      }),
    });

    if (formValues) {
      try {
        const id = teacher.id || teacher._id;
        await axios.put(`${import.meta.env.VITE_API_URL}/admin/teachers/${id}`, formValues, axiosConfig);
        Swal.fire({ icon: 'success', title: 'Updated', background: '#1e293b', color: '#fff', timer: 1000, showConfirmButton: false });
        fetchTeachers();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', background: '#1e293b', color: '#fff' });
      }
    }
  };

  useEffect(() => { fetchTeachers(); }, []);

  // --- FILTER LOGIC ---
  const filteredTeachers = teachers.filter(t => 
    t.name?.toLowerCase().includes(search.toLowerCase()) || 
    t.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 p-6 md:p-10 relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold uppercase tracking-wider text-sky-400 mb-2">
              <HiAcademicCap className="text-lg" /> Faculty Management
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Teachers Directory</h1>
            <p className="text-slate-400 mt-2">Manage faculty access, update details, and monitor registrations.</p>
          </div>

          {/* Stats Badge */}
          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
                <p className="text-xs text-slate-500 uppercase font-bold">Total Faculty</p>
                <p className="text-2xl font-bold text-white">{teachers.length}</p>
             </div>
             <button 
               onClick={() => setShowAddForm(!showAddForm)}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
                 showAddForm 
                 ? "bg-slate-700 text-slate-300 hover:bg-slate-600" 
                 : "bg-sky-500 hover:bg-sky-400 text-white hover:shadow-sky-500/25"
               }`}
             >
               {showAddForm ? <><HiX className="text-lg"/> Cancel</> : <><HiPlus className="text-lg"/> Add Teacher</>}
             </button>
          </div>
        </div>

        {/* --- ADD TEACHER FORM (Collapsible) --- */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-slate-800/50 backdrop-blur-md border border-sky-500/30 p-6 rounded-2xl shadow-xl">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span> New Faculty Details
                </h3>
                <form onSubmit={handleAddTeacher} className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex-1 w-full space-y-1">
                    <label className="text-xs text-slate-400 ml-1">Full Name</label>
                    <div className="relative">
                      <HiUser className="absolute left-3 top-3.5 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="Ex: Dr. John Doe" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-sky-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex-1 w-full space-y-1">
                    <label className="text-xs text-slate-400 ml-1">Email Address</label>
                    <div className="relative">
                      <HiOutlineMail className="absolute left-3 top-3.5 text-slate-500" />
                      <input 
                        type="email" 
                        placeholder="Ex: john@college.edu" 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-sky-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full md:w-auto mt-auto bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <ButtonLoader /> : "Create Account"}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- SEARCH BAR --- */}
        <div className="mb-8 relative max-w-2xl">
           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <HiSearch className="text-slate-500 text-xl" />
           </div>
           <input 
             type="text"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             placeholder="Search faculty by name or email..."
             className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-sm"
           />
           {search && (
             <div className="absolute right-4 top-4 text-xs font-bold text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded">
               Found {filteredTeachers.length}
             </div>
           )}
        </div>

        {/* --- GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {loading ? (
            // Skeletons
            Array(6).fill(0).map((_, i) => <TeacherSkeleton key={i} />)
          ) : filteredTeachers.length === 0 ? (
            // Empty State
            <div className="col-span-full py-20 text-center border border-dashed border-slate-700 rounded-3xl bg-slate-800/20">
               <div className="inline-flex p-4 rounded-full bg-slate-800 mb-4 text-slate-500 text-3xl">
                 <HiUser />
               </div>
               <h3 className="text-white font-bold text-lg">No teachers found</h3>
               <p className="text-slate-400">Try adjusting your search or add a new teacher.</p>
            </div>
          ) : (
            // Cards
            <AnimatePresence>
              {filteredTeachers.map((teacher) => (
                <TeacherCard 
                  key={teacher.id || teacher._id} 
                  teacher={teacher} 
                  onEdit={() => handleUpdateTeacher(teacher)}
                  onDelete={() => handleDeleteTeacher(teacher)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

      </div>
    </div>
  );
}

// 🪪 Detailed Card Component
const TeacherCard = ({ teacher, onEdit, onDelete }) => {
  // Generate initials
  const initials = teacher.name 
    ? teacher.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() 
    : "T";
  
  // Deterministic color based on name length
  const colors = ["bg-sky-500", "bg-emerald-500", "bg-purple-500", "bg-pink-500", "bg-orange-500"];
  const avatarColor = colors[teacher.name?.length % colors.length] || "bg-sky-500";

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group bg-slate-800/40 backdrop-blur-md border border-slate-700/50 hover:border-sky-500/30 p-6 rounded-2xl shadow-lg hover:shadow-sky-500/10 transition-all duration-300 relative overflow-hidden"
    >
      {/* Top Decoration */}
      <div className={`absolute top-0 left-0 w-full h-1 ${avatarColor.replace('bg-', 'bg-gradient-to-r from-transparent via-')}/50 to-transparent`} />

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className={`w-14 h-14 rounded-2xl ${avatarColor} flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-105 transition-transform`}>
          {initials}
        </div>
        
        {/* Text */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-lg truncate group-hover:text-sky-400 transition-colors">
            {teacher.name}
          </h3>
          <p className="text-slate-400 text-sm truncate flex items-center gap-1.5 mt-0.5">
            <HiOutlineMail className="text-slate-500"/>
            {teacher.email}
          </p>
          <div className="mt-2 flex items-center gap-2">
             <span className="text-[10px] uppercase font-bold text-slate-500 border border-slate-700 px-2 py-0.5 rounded bg-slate-900">Faculty</span>
             <span className="text-[10px] uppercase font-bold text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded bg-emerald-500/10">Active</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 pt-4 border-t border-slate-700/50 flex gap-3">
        <button 
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-700 hover:bg-sky-600 hover:text-white text-slate-300 text-sm font-medium transition-colors"
        >
          <HiPencil /> Edit
        </button>
        <button 
          onClick={onDelete}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-700 hover:bg-red-500 hover:text-white text-slate-300 text-sm font-medium transition-colors"
        >
          <HiTrash /> Delete
        </button>
      </div>
    </motion.div>
  );
};