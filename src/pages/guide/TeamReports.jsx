import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { 
  HiDownload, 
  HiRefresh, 
  HiFilter, 
  HiOfficeBuilding, 
  HiAcademicCap, 
  HiUserGroup, 
  HiCalendar, 
  HiCheckCircle, 
  HiClock,
  HiEye,
  HiDocumentDownload
} from "react-icons/hi";

// 🔄 Reusable Loader Overlay
const LoaderOverlay = ({ message }) => (
  <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-[100] backdrop-blur-md">
    <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-6 shadow-2xl shadow-sky-500/20"></div>
    <p className="text-white text-lg font-semibold tracking-wide animate-pulse">{message || "Processing..."}</p>
  </div>
);

export default function TeamReports() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  
  // Filters
  const [branchFilter, setBranchFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false); // For mobile toggle

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // --- 1. Init ---
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchAuxData();
    fetchTeams();
  }, [token]);

  // --- 2. API Calls ---
  const fetchAuxData = async () => {
    try {
      const [bRes, sRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/branches`, axiosConfig).catch(() => ({ data: [] })),
        axios.get(`${import.meta.env.VITE_API_URL}/semesters`, axiosConfig).catch(() => ({ data: [] }))
      ]);
      setBranches(Array.isArray(bRes.data) ? bRes.data : []);
      setSemesters(Array.isArray(sRes.data) ? sRes.data : []);
    } catch (err) {
      console.warn("Aux fetch failed", err);
    }
  };

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (branchFilter) params.append("branchId", branchFilter);
    if (semesterFilter) params.append("semesterId", semesterFilter);
    const q = params.toString();
    return q ? `?${q}` : "";
  };

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const q = buildQuery();
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/guide/dashboard/teams${q}`, axiosConfig);
      setTeams(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      Swal.fire("Error", "Failed to load teams", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Downloads ---
  const downloadBlob = (res, defaultName) => {
    const blob = new Blob([res.data], { type: res.headers["content-type"] });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", defaultName); // Simplified for brevity
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDownload = async (type, teamId = null) => {
    setDownloading(true);
    try {
      const q = buildQuery();
      let url, filename;

      if (type === "PDF_ALL") {
        url = `${import.meta.env.VITE_API_URL}/guide/dashboard/pdf${q}`;
        filename = "guide_report.pdf";
      } else if (type === "EXCEL") {
        url = `${import.meta.env.VITE_API_URL}/guide/dashboard/excel${q}`;
        filename = "guide_report.xlsx";
      } else if (type === "PDF_TEAM") {
        url = `${import.meta.env.VITE_API_URL}/guide/dashboard/pdf/${teamId}${q}`;
        filename = `team_${teamId}.pdf`;
      }

      const res = await axios.get(url, { ...axiosConfig, responseType: "blob" });
      downloadBlob(res, filename);
    } catch (err) {
      Swal.fire("Error", "Download failed", "error");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <LoaderOverlay message="Gathering Intelligence..." />;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8 font-sans selection:bg-sky-500/30">
      {downloading && <LoaderOverlay message="Generating Report..." />}

      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Dashboard <span className="text-sky-500">Overview</span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm md:text-base max-w-2xl">
              Real-time insights into team performance, project status, and academic distribution.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <button 
              onClick={() => handleDownload("PDF_ALL")} 
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-rose-900/20 active:scale-95"
            >
              <HiDocumentDownload className="text-lg" /> Export PDF
            </button>
            <button 
              onClick={() => handleDownload("EXCEL")} 
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
            >
              <HiDownload className="text-lg" /> Export Excel
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 mb-8 backdrop-blur-sm">
          <div className="flex items-center justify-between lg:hidden mb-4 cursor-pointer" onClick={() => setShowFilters(!showFilters)}>
            <span className="font-semibold text-slate-300 flex items-center gap-2"><HiFilter /> Filter Results</span>
            <span className="text-xs bg-slate-700 px-2 py-1 rounded">{showFilters ? "Hide" : "Show"}</span>
          </div>

          <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row gap-4 items-end`}>
            <div className="w-full lg:w-1/4">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Branch</label>
              <div className="relative">
                <HiOfficeBuilding className="absolute left-3 top-3 text-slate-500" />
                <select 
                  value={branchFilter} 
                  onChange={(e) => setBranchFilter(e.target.value)} 
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 appearance-none transition-all"
                >
                  <option value="">All Branches</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.branchName}</option>)}
                </select>
              </div>
            </div>

            <div className="w-full lg:w-1/4">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Semester</label>
              <div className="relative">
                <HiAcademicCap className="absolute left-3 top-3 text-slate-500" />
                <select 
                  value={semesterFilter} 
                  onChange={(e) => setSemesterFilter(e.target.value)} 
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 appearance-none transition-all"
                >
                  <option value="">All Semesters</option>
                  {semesters.map(s => <option key={s.id} value={s.id}>{s.semesterName}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 w-full lg:w-auto mt-2 lg:mt-0">
              <button 
                onClick={fetchTeams} 
                className="flex-1 lg:flex-none px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-sky-900/20 active:scale-95 flex items-center justify-center gap-2"
              >
                Apply
              </button>
              <button 
                onClick={() => { setBranchFilter(""); setSemesterFilter(""); fetchTeams(); }} 
                className="flex-1 lg:flex-none px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                <HiRefresh /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Data Display */}
        {teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-800/30 rounded-3xl border border-dashed border-slate-700">
            <HiUserGroup className="text-5xl text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No teams found</h3>
            <p className="text-slate-400 text-sm">Try adjusting your filters to see results.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {teams.map((team) => {
              const project = team.project || {};
              const members = team.members || [];
              const isCompleted = project.status === "COMPLETED";
              const isOngoing = project.status === "ONGOING";

              return (
                <div key={team.teamId} className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden hover:border-sky-500/30 transition-all duration-300 shadow-xl">
                  
                  {/* Card Header (Clickable/Expandable Logic can be added) */}
                  <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                    
                    {/* Team & Project Info */}
                    <div className="lg:col-span-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-sky-500/10 rounded-lg">
                          <HiUserGroup className="text-sky-400 text-xl" />
                        </div>
                        <h3 className="text-lg font-bold text-white truncate">{team.teamName}</h3>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-1 pl-11">{project.projectTitle || "No Title"}</p>
                    </div>

                    {/* Status & Timeline */}
                    <div className="lg:col-span-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          isCompleted ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          isOngoing ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                          "bg-slate-700 text-slate-300 border-slate-600"
                        }`}>
                          {isCompleted ? <HiCheckCircle /> : <HiClock />}
                          {project.status || "PENDING"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                        <HiCalendar />
                        {project.startDate} — {project.endDate || "Present"}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="lg:col-span-1 flex gap-8">
                      <div>
                        <span className="block text-xs font-bold text-slate-500 uppercase">Members</span>
                        <span className="text-lg font-mono text-white">{members.length}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-500 uppercase">Tech</span>
                        <span className="text-sm text-slate-300 line-clamp-1 max-w-[150px]" title={project.technologiesUsed}>
                          {project.technologiesUsed || "-"}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-1 flex justify-start lg:justify-end gap-3">
                      <button 
                        onClick={() => navigate(`/guide/TeamDetail/${team.teamId}`)}
                        className="p-2.5 rounded-xl bg-slate-700/50 text-sky-400 hover:bg-sky-500 hover:text-white transition-all border border-slate-600 hover:border-transparent"
                        title="View Details"
                      >
                        <HiEye className="text-lg" />
                      </button>
                      <button 
                        onClick={() => handleDownload("PDF_TEAM", team.teamId)}
                        className="p-2.5 rounded-xl bg-slate-700/50 text-rose-400 hover:bg-rose-500 hover:text-white transition-all border border-slate-600 hover:border-transparent"
                        title="Export Team Report"
                      >
                        <HiDocumentDownload className="text-lg" />
                      </button>
                    </div>
                  </div>

                  {/* Members Table Preview (Hidden on very small screens if desired, but good for context) */}
                  <div className="bg-slate-900/50 border-t border-slate-700/50 px-6 py-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-xs text-slate-500 uppercase">
                            <th className="pb-2 font-semibold">Student</th>
                            <th className="pb-2 font-semibold">Roll No</th>
                            <th className="pb-2 font-semibold">Role</th>
                            <th className="pb-2 font-semibold">Branch</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                          {members.slice(0, 3).map((m, idx) => (
                            <tr key={idx}>
                              <td className="py-2 text-slate-300 font-medium">{m.name} {m.leader && <span className="text-amber-400 text-xs ml-1">★</span>}</td>
                              <td className="py-2 text-slate-400 font-mono text-xs">{m.rollNumber}</td>
                              <td className="py-2 text-slate-400">{m.role}</td>
                              <td className="py-2 text-slate-400">{m.branchName}</td>
                            </tr>
                          ))}
                          {members.length > 3 && (
                            <tr>
                              <td colSpan={4} className="pt-2 text-xs text-sky-500 cursor-pointer hover:underline" onClick={() => navigate(`/guide/TeamDetail/${team.teamId}`)}>
                                + {members.length - 3} more members...
                              </td>
                            </tr>
                          )}
                          {members.length === 0 && (
                            <tr><td colSpan={4} className="py-2 text-slate-500 italic">No members assigned yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}