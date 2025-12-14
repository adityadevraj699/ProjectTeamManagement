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
  HiDocumentDownload,
  HiLightningBolt,
  HiCode
} from "react-icons/hi";

// 🔄 Reusable Loader Overlay
const LoaderOverlay = ({ message }) => (
  <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[100] backdrop-blur-xl">
    <div className="relative w-24 h-24">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-700 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-t-4 border-sky-500 rounded-full animate-spin"></div>
    </div>
    <p className="mt-4 text-sky-400 text-lg font-bold tracking-widest uppercase animate-pulse">{message || "Processing Data..."}</p>
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
  const [showFilters, setShowFilters] = useState(false);

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
      Swal.fire({
        icon: 'error',
        title: 'Data Load Error',
        text: 'Failed to retrieve team reports.',
        background: '#1e293b',
        color: '#fff'
      });
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
    link.setAttribute("download", defaultName);
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
      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: 'Unable to generate report.',
        background: '#1e293b',
        color: '#fff'
      });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <LoaderOverlay message="INITIALIZING DASHBOARD..." />;

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-200 p-4 md:p-8 font-sans selection:bg-sky-500/30">
      {downloading && <LoaderOverlay message="GENERATING REPORT..." />}

      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="relative mb-10 p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/50 shadow-2xl overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
                PROJECT <span className="text-sky-500">INSIGHTS</span>
              </h1>
              <p className="text-slate-400 font-medium max-w-xl">
                Comprehensive analytics and reporting for all managed teams and projects.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => handleDownload("PDF_ALL")} 
                className="group flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95"
              >
                <HiDocumentDownload className="text-xl text-rose-500 group-hover:scale-110 transition-transform" /> 
                <span>PDF Report</span>
              </button>
              <button 
                onClick={() => handleDownload("EXCEL")} 
                className="group flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95"
              >
                <HiDownload className="text-xl text-emerald-500 group-hover:scale-110 transition-transform" /> 
                <span>Excel Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Control Bar */}
        <div className="sticky top-4 z-40 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-2xl p-2 mb-8 shadow-xl">
          <div className="flex flex-col lg:flex-row gap-2">
            
            {/* Mobile Toggle */}
            <button 
              className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-slate-800 rounded-xl text-slate-300 font-bold"
              onClick={() => setShowFilters(!showFilters)}
            >
              <span className="flex items-center gap-2"><HiFilter className="text-sky-500"/> Filters</span>
              <span className="text-xs bg-slate-700 px-2 py-1 rounded border border-slate-600">{showFilters ? "Close" : "Open"}</span>
            </button>

            <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row gap-2 w-full p-2 lg:p-0`}>
              
              {/* Branch Select */}
              <div className="relative flex-1 group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-500 transition-colors">
                  <HiOfficeBuilding className="text-lg" />
                </div>
                <select 
                  value={branchFilter} 
                  onChange={(e) => setBranchFilter(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm font-medium text-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none appearance-none transition-all hover:border-slate-600 cursor-pointer"
                >
                  <option value="">All Branches</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.branchName}</option>)}
                </select>
              </div>

              {/* Semester Select */}
              <div className="relative flex-1 group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-500 transition-colors">
                  <HiAcademicCap className="text-lg" />
                </div>
                <select 
                  value={semesterFilter} 
                  onChange={(e) => setSemesterFilter(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm font-medium text-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none appearance-none transition-all hover:border-slate-600 cursor-pointer"
                >
                  <option value="">All Semesters</option>
                  {semesters.map(s => <option key={s.id} value={s.id}>{s.semesterName}</option>)}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 lg:w-auto">
                <button 
                  onClick={fetchTeams} 
                  className="flex-1 lg:flex-none px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-sky-900/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <HiLightningBolt /> Apply
                </button>
                <button 
                  onClick={() => { setBranchFilter(""); setSemesterFilter(""); fetchTeams(); }} 
                  className="flex-1 lg:flex-none px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  title="Reset Filters"
                >
                  <HiRefresh className="text-lg" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Grid */}
        {teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700/50">
            <div className="bg-slate-800 p-6 rounded-full mb-6 ring-4 ring-slate-800/50">
              <HiUserGroup className="text-5xl text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No active teams found</h3>
            <p className="text-slate-500 font-medium">Try adjusting filters or creating a new team.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {teams.map((team) => {
              const project = team.project || {};
              const members = team.members || [];
              const isCompleted = project.status === "COMPLETED";
              const isOngoing = project.status === "ONGOING";

              return (
                <div key={team.teamId} className="group relative bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-sky-500/50 hover:shadow-2xl hover:shadow-sky-900/10 transition-all duration-300 flex flex-col">
                  
                  {/* Status Strip */}
                  <div className={`h-1.5 w-full ${isCompleted ? 'bg-emerald-500' : isOngoing ? 'bg-amber-500' : 'bg-slate-600'}`}></div>

                  <div className="p-6 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors line-clamp-1" title={team.teamName}>
                          {team.teamName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                          <span className="bg-slate-900 px-2 py-1 rounded border border-slate-700">ID: {team.teamId}</span>
                          <span className="flex items-center gap-1"><HiUserGroup className="text-sky-500"/> {members.length} Members</span>
                        </div>
                      </div>
                      
                      <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                        isCompleted ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        isOngoing ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        "bg-slate-700 text-slate-300 border-slate-600"
                      }`}>
                        {project.status || "PENDING"}
                      </div>
                    </div>

                    {/* Project Info */}
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 mb-6 flex-1">
                      <h4 className="text-sm font-bold text-slate-200 mb-1 flex items-center gap-2">
                        <HiCode className="text-sky-500"/> Project Title
                      </h4>
                      <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {project.projectTitle || "No Project Assigned"}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                          <HiCalendar className="text-slate-500 text-sm"/>
                          <span>Start: <span className="text-slate-200">{project.startDate || "N/A"}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                          <HiClock className="text-slate-500 text-sm"/>
                          <span>End: <span className="text-slate-200">{project.endDate || "N/A"}</span></span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-3 mt-auto">
                      <button 
                        onClick={() => navigate(`/guide/TeamDetail/${team.teamId}`)}
                        className="flex-1 py-2.5 bg-slate-700 hover:bg-sky-600 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 group/btn"
                      >
                        <HiEye className="text-lg text-sky-400 group-hover/btn:text-white transition-colors"/> View Details
                      </button>
                      <button 
                        onClick={() => handleDownload("PDF_TEAM", team.teamId)}
                        className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 rounded-lg text-white transition-colors group/btn"
                        title="Download Team Report"
                      >
                        <HiDocumentDownload className="text-lg text-rose-400 group-hover/btn:text-rose-300 transition-colors"/>
                      </button>
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