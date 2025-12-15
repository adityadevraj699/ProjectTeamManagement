import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiOutlineBookOpen, 
  HiOutlineAcademicCap, 
  HiOutlinePlus, 
  HiOutlineTrash, 
  HiOutlinePencilAlt, 
  HiSearch,
  HiOutlineCollection
} from "react-icons/hi";

// 💀 Skeleton Loader Component
const CourseSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-1/3 mb-3"></div>
        <div className="h-4 bg-slate-700 rounded w-2/3 mb-4"></div>
        <div className="flex gap-2">
          <div className="h-8 w-16 bg-slate-700 rounded"></div>
          <div className="h-8 w-16 bg-slate-700 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function CreateCourse() {
  const [courseName, setCourseName] = useState("");
  const [fullName, setFullName] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");

  const axiosConfig = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/courses`,
        axiosConfig
      );
      setCourses(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!courseName.trim() || !fullName.trim()) return;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/courses`,
        { courseName, fullName },
        axiosConfig
      );
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Course created successfully',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        background: "#1e293b",
        color: "#fff"
      });

      setCourseName("");
      setFullName("");
      fetchCourses();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to create course",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
      });
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      background: "#0f172a",
      color: "#fff",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!"
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/courses/${id}`,
        axiosConfig
      );
      Swal.fire({
        title: "Deleted!",
        text: "Course has been deleted.",
        icon: "success",
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        background: "#1e293b",
        color: "#fff",
      });
      fetchCourses();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: "Failed to delete course",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
      });
    }
  };

  const handleUpdate = async (course) => {
    const { value: formValues } = await Swal.fire({
      title: "Update Course",
      html: `
        <div class="flex flex-col gap-3">
            <input id="swal-courseName" class="swal2-input bg-slate-700 text-white border-slate-600 focus:ring-sky-500" placeholder="Course Name" value="${course.courseName || ""}">
            <input id="swal-fullName" class="swal2-input bg-slate-700 text-white border-slate-600 focus:ring-sky-500" placeholder="Full Name" value="${course.fullName || ""}">
        </div>
      `,
      background: "#0f172a",
      color: "#fff",
      confirmButtonText: "Update",
      confirmButtonColor: "#0ea5e9",
      showCancelButton: true,
      cancelButtonColor: "#64748b",
      focusConfirm: false,
      preConfirm: () => ({
        courseName: document.getElementById("swal-courseName").value,
        fullName: document.getElementById("swal-fullName").value,
      }),
    });

    if (!formValues) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/courses/${course.id}`,
        formValues,
        axiosConfig
      );
      Swal.fire({
        icon: "success",
        title: "Updated",
        text: "Course updated successfully",
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false,
        background: "#1e293b",
        color: "#fff",
      });
      fetchCourses();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: "Failed to update course",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
      });
    }
  };

  // Filter courses based on search
  const filteredCourses = courses.filter(c => 
    c.courseName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span className="p-2 bg-sky-500/10 rounded-lg text-sky-400"><HiOutlineCollection /></span>
              Course Management
            </h1>
            <p className="text-slate-400 mt-1 ml-1">Create and manage academic courses.</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-auto group">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search courses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-72 pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder-slate-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Create Form */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl sticky top-6">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
                <HiOutlinePlus className="text-sky-400" /> Add New Course
              </h2>

              <form onSubmit={handleCreateCourse} className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Short Name</label>
                  <div className="relative">
                    <HiOutlineBookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. B.Tech"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm transition-all text-white placeholder-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Full Name</label>
                  <div className="relative">
                    <HiOutlineAcademicCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. Bachelor of Technology"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm transition-all text-white placeholder-slate-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 mt-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-sky-900/20 transition-all transform hover:scale-[1.02] active:scale-95 flex justify-center items-center gap-2"
                >
                  <HiOutlinePlus className="text-lg" /> Create Course
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: Course List */}
          <div className="lg:col-span-2">
             <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Available Courses</h2>
                    <span className="text-xs font-medium px-2 py-1 bg-slate-800 rounded-md text-slate-400 border border-slate-700">
                        Total: {filteredCourses.length}
                    </span>
                </div>

                {loading ? (
                    <CourseSkeleton />
                ) : filteredCourses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                        <HiOutlineCollection className="text-5xl mb-3 opacity-30" />
                        <p>No courses found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence>
                            {filteredCourses.map((course) => (
                                
                                <motion.div
                                    key={course.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="group relative bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300 overflow-hidden"
                                >
                                    {/* Decorative Gradient Background */}
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none" />

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors">
                                                {course.courseName}
                                            </h3>
                                            
                                            {/* Action Buttons */}
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                                                <button 
                                                    onClick={() => handleUpdate(course)} 
                                                    className="p-2 bg-slate-700/50 hover:bg-sky-500/20 hover:text-sky-400 text-slate-400 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <HiOutlinePencilAlt size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(course.id)} 
                                                    className="p-2 bg-slate-700/50 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <HiOutlineTrash size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <p className="text-sm text-slate-400 font-medium">
                                            {course.fullName}
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
    </div>
  );
}