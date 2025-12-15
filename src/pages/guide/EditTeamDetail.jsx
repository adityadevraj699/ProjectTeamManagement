import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  HiPencil, 
  HiSave, 
  HiX, 
  HiOfficeBuilding, 
  HiCode, 
  HiCalendar, 
  HiInformationCircle 
} from "react-icons/hi";

// 🔄 Reusable High-End Loader Component (Still used for 'Saving...' state)
const LoaderOverlay = ({ message }) => (
  <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[100] backdrop-blur-xl transition-all duration-300">
    <div className="relative w-24 h-24">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-700 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-t-4 border-sky-500 rounded-full animate-spin"></div>
    </div>
    <p className="mt-6 text-sky-400 text-lg font-bold tracking-widest uppercase animate-pulse">{message || "Loading..."}</p>
  </div>
);

// 💀 Edit Team Detail Skeleton Loader
const EditTeamDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] p-6 md:p-10 font-sans relative">
      <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
        
        {/* Header Skeleton */}
        <div className="space-y-3">
          <div className="h-8 w-64 bg-slate-800 rounded-lg"></div>
          <div className="h-4 w-96 bg-slate-800/50 rounded"></div>
        </div>

        {/* Form Card Skeleton */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 space-y-8">
          
          {/* Team Name Field */}
          <div className="space-y-2">
            <div className="h-3 w-24 bg-slate-700 rounded"></div>
            <div className="h-12 w-full bg-slate-700/50 rounded-xl"></div>
          </div>

          {/* Project Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-3 w-32 bg-slate-700 rounded"></div>
              <div className="h-12 w-full bg-slate-700/50 rounded-xl"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-24 bg-slate-700 rounded"></div>
              <div className="h-12 w-full bg-slate-700/50 rounded-xl"></div>
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <div className="h-3 w-24 bg-slate-700 rounded"></div>
            <div className="h-32 w-full bg-slate-700/50 rounded-xl"></div>
          </div>

          {/* Tech & Dates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3 space-y-2">
              <div className="h-3 w-40 bg-slate-700 rounded"></div>
              <div className="h-12 w-full bg-slate-700/50 rounded-xl"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-700 rounded"></div>
              <div className="h-12 w-full bg-slate-700/50 rounded-xl"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-700 rounded"></div>
              <div className="h-12 w-full bg-slate-700/50 rounded-xl"></div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-slate-700/30">
            <div className="h-12 w-32 bg-slate-700 rounded-xl"></div>
            <div className="h-12 w-40 bg-slate-700 rounded-xl"></div>
          </div>

        </div>
      </div>
    </div>
  );
};

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

  // ✅ Loading states
  const [loading, setLoading] = useState(true); // For fetching details
  const [actionLoading, setActionLoading] = useState(false); // For saving changes

  // ✅ Fetch Team Details
  const fetchTeamDetail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/guide/teams/details/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
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
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch team details',
        background: '#1e293b',
        color: '#fff'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamDetail();
  }, [id]);

  // ✅ Submit Updated Details
  const handleSubmit = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/guide/teams/update`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Team details saved successfully.',
        background: '#1e293b',
        color: '#fff',
        timer: 1500,
        showConfirmButton: false
      });
      navigate("/guide/team");
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err.response?.data || "Something went wrong.",
        background: '#1e293b',
        color: '#fff'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Show Skeleton Loader while fetching data
  if (loading) return <EditTeamDetailSkeleton />;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 md:p-10 font-sans selection:bg-sky-500/30 relative">
      
      {/* Show Overlay Loader ONLY when saving */}
      {actionLoading && <LoaderOverlay message="Saving Changes..." />}

      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <HiPencil className="text-sky-500" /> Edit Project Details
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Update team information, project scope, and timelines.</p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl">
          
          {/* Team Name */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
              Team Name
            </label>
            <div className="relative group">
              <HiOfficeBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-500 transition-colors text-lg" />
              <input
                type="text"
                className="w-full bg-slate-900 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all placeholder-slate-600"
                value={form.teamName}
                onChange={(e) => setForm({ ...form, teamName: e.target.value })}
                placeholder="Enter team name..."
              />
            </div>
          </div>

          {/* Project Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
                Project Title
              </label>
              <div className="relative group">
                <HiCode className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-500 transition-colors text-lg" />
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all placeholder-slate-600"
                  value={form.projectTitle}
                  onChange={(e) => setForm({ ...form, projectTitle: e.target.value })}
                  placeholder="Enter project title..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
                Project Status
              </label>
              <div className="relative">
                <select
                  className="w-full bg-slate-900 border border-slate-700 text-white pl-4 pr-10 py-3 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all appearance-none cursor-pointer"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="ONGOING">🟢 Ongoing</option>
                  <option value="COMPLETED">✅ Completed</option>
                  <option value="PENDING">🕓 Pending</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
              Description
            </label>
            <div className="relative group">
              <textarea
                className="w-full bg-slate-900 border border-slate-700 text-white p-4 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all placeholder-slate-600 min-h-[120px] resize-y"
                rows="4"
                placeholder="Enter detailed project description..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          {/* Technologies & Dates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
                Technologies Used
              </label>
              <div className="relative group">
                <HiInformationCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-500 transition-colors text-lg" />
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all placeholder-slate-600"
                  placeholder="e.g. React, Spring Boot, MySQL..."
                  value={form.technologiesUsed}
                  onChange={(e) => setForm({ ...form, technologiesUsed: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
                Start Date
              </label>
              <div className="relative group">
                <HiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-500 transition-colors text-lg" />
                <input
                  type="date"
                  className="w-full bg-slate-900 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-sm uppercase"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
                End Date
              </label>
              <div className="relative group">
                <HiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-500 transition-colors text-lg" />
                <input
                  type="date"
                  className="w-full bg-slate-900 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-sm uppercase"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse md:flex-row justify-end gap-4 mt-10 pt-6 border-t border-slate-700/50">
            <button
              onClick={() => navigate('/guide/team')}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded-xl font-bold transition-all flex items-center justify-center gap-2 hover:text-white active:scale-95"
            >
              <HiX className="text-lg" /> Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-sky-900/20 active:scale-95 flex items-center justify-center gap-2"
            >
              <HiSave className="text-lg" /> Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}