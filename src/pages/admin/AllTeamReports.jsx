import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiRefresh, HiDownload, HiFilter, HiSearch, 
  HiUserGroup, HiCode, HiCalendar, HiOfficeBuilding, HiUser 
} from "react-icons/hi";

// 💀 Skeleton Loader
const ReportSkeleton = () => (
  <div className="space-y-6">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2 w-1/3">
            <div className="h-6 bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
          </div>
          <div className="h-8 w-24 bg-slate-700 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="h-10 bg-slate-700 rounded-lg"></div>
          <div className="h-10 bg-slate-700 rounded-lg"></div>
          <div className="h-10 bg-slate-700 rounded-lg"></div>
          <div className="h-10 bg-slate-700 rounded-lg"></div>
        </div>
        <div className="h-32 bg-slate-700 rounded-xl"></div>
      </div>
    ))}
  </div>
);

// 🏷️ Status Badge
const StatusBadge = ({ status }) => {
  let color = "bg-slate-700 text-slate-300 border-slate-600";
  if (status === "COMPLETED") color = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (status === "ONGOING") color = "bg-sky-500/10 text-sky-400 border-sky-500/20";
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${color}`}>
      {status || "N/A"}
    </span>
  );
};

export default function AllTeamReports() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  
  // Filters
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [guides, setGuides] = useState([]);
  
  const [branchFilter, setBranchFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [guideFilter, setGuideFilter] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // --- API FUNCTIONS ---

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const init = async () => {
      setLoading(true);
      await fetchAuxData();
      await fetchTeams();
      setLoading(false);
    };
    init();
  }, [token]);

  const fetchAuxData = async () => {
    try {
      const [bRes, sRes, gRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/branches`, axiosConfig).catch(() => ({ data: [] })),
        axios.get(`${import.meta.env.VITE_API_URL}/semesters`, axiosConfig).catch(() => ({ data: [] })),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/dashboard/guides`, axiosConfig).catch(() => ({ data: [] }))
      ]);
      setBranches(Array.isArray(bRes.data) ? bRes.data : []);
      setSemesters(Array.isArray(sRes.data) ? sRes.data : []);
      setGuides(Array.isArray(gRes.data) ? gRes.data : []);
    } catch (err) { console.warn("Aux fetch error", err); }
  };

  const buildQuery = (extra = {}) => {
    const params = new URLSearchParams();
    const b = extra.branchId ?? branchFilter;
    const s = extra.semesterId ?? semesterFilter;
    const g = extra.guideId ?? guideFilter;
    if (b) params.append("branchId", b);
    if (s) params.append("semesterId", s);
    if (g) params.append("guideId", g);
    return params.toString() ? `?${params.toString()}` : "";
  };

  const fetchTeams = async () => {
    try {
      const q = buildQuery();
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/dashboard/teams${q}`, axiosConfig);
      setTeams(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load teams', background: '#1e293b', color: '#fff' });
    }
  };

  const handleApplyFilters = async () => {
    setLoading(true);
    await fetchTeams();
    setLoading(false);
  };

  const handleClearFilters = async () => {
    setBranchFilter("");
    setSemesterFilter("");
    setGuideFilter("");
    setLoading(true);
    // ugly hack to ensure state update before fetch, ideally use effect or direct params
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/dashboard/teams`, axiosConfig);
    setTeams(res.data || []);
    setLoading(false);
  };

  // --- EXPORT FUNCTIONS ---

  const downloadBlob = (res, defaultName) => {
    const blob = new Blob([res.data], { type: res.headers["content-type"] });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const disposition = res.headers["content-disposition"];
    let filename = defaultName;
    if (disposition && disposition.match(/filename="?([^"]+)"?/)) {
      filename = disposition.match(/filename="?([^"]+)"?/)[1];
    }
    
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const exportData = async (type) => {
    try {
      setDownloading(true);
      const q = buildQuery();
      const endpoint = type === 'pdf' ? 'pdf' : 'excel';
      const ext = type === 'pdf' ? 'pdf' : 'xlsx';
      
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/dashboard/${endpoint}${q}`, { 
        ...axiosConfig, responseType: "blob" 
      });
      
      downloadBlob(res, `admin_report.${ext}`);
      Swal.fire({ 
        icon: 'success', title: 'Exported', 
        toast: true, position: 'top-end', showConfirmButton: false, timer: 2000,
        background: '#1e293b', color: '#fff'
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Export Failed', background: '#1e293b', color: '#fff' });
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadTeamPdf = async (teamId) => {
    try {
      setDownloading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/dashboard/pdf/${teamId}`, { ...axiosConfig, responseType: "blob" });
      downloadBlob(res, `team_${teamId}.pdf`);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', background: '#1e293b', color: '#fff' });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 p-6 md:p-10 font-sans relative">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-sky-900/10 to-transparent pointer-events-none" />

      {downloading && (
        <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-white font-medium">Generating Report...</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-400 mt-1 text-sm">Monitor all project teams, guides, and academic progress.</p>
          </div>
          
          <div className="flex gap-3">
             <button onClick={handleApplyFilters} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300 hover:text-white transition-all shadow-sm" title="Refresh Data">
               <HiRefresh className="text-xl"/>
             </button>
             <button onClick={() => exportData('pdf')} className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-rose-500/20 transition-all">
               <HiDownload className="text-lg"/> PDF Report
             </button>
             <button onClick={() => exportData('excel')} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-emerald-500/20 transition-all">
               <HiDownload className="text-lg"/> Excel Export
             </button>
          </div>
        </div>

        {/* --- FILTER BAR --- */}
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center shadow-lg">
           <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider mr-2">
             <HiFilter className="text-lg text-sky-400"/> Filters:
           </div>
           
           <select value={guideFilter} onChange={e => setGuideFilter(e.target.value)} className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2.5 outline-none focus:border-sky-500 w-full md:w-auto min-w-[160px]">
              <option value="">All Guides</option>
              {guides.map(g => <option key={g.id} value={g.id}>{g.name || g.email}</option>)}
           </select>

           <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2.5 outline-none focus:border-sky-500 w-full md:w-auto min-w-[160px]">
              <option value="">All Branches</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.branchName}</option>)}
           </select>

           <select value={semesterFilter} onChange={e => setSemesterFilter(e.target.value)} className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2.5 outline-none focus:border-sky-500 w-full md:w-auto min-w-[160px]">
              <option value="">All Semesters</option>
              {semesters.map(s => <option key={s.id} value={s.id}>{s.semesterName}</option>)}
           </select>

           <div className="flex gap-2 ml-auto">
             <button onClick={handleApplyFilters} className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg transition-colors">Apply</button>
             <button onClick={handleClearFilters} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold rounded-lg transition-colors">Reset</button>
           </div>
        </div>

        {/* --- CONTENT --- */}
        {loading ? (
          <ReportSkeleton />
        ) : teams.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-700 rounded-3xl bg-slate-800/20">
             <div className="inline-flex p-4 rounded-full bg-slate-800 mb-4 text-slate-500 text-4xl">
               <HiSearch />
             </div>
             <h3 className="text-white font-bold text-lg">No teams found</h3>
             <p className="text-slate-400 mt-1">Try adjusting the filters above.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">Showing {teams.length} Teams</p>
            
            {teams.map(team => {
              const project = team.project || {};
              const members = team.members || [];
              
              return (
                <motion.div 
                  key={team.teamId}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-lg hover:border-sky-500/30 transition-all"
                >
                  {/* Card Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-xl font-bold text-white">{team.teamName}</h2>
                        <StatusBadge status={project.status} />
                      </div>
                      <div className="text-sm text-slate-400 flex flex-wrap gap-4 mt-1">
                        <span className="flex items-center gap-1"><HiCode className="text-purple-400"/> {project.projectTitle || "Untitled Project"}</span>
                        <span className="flex items-center gap-1"><HiUser className="text-emerald-400"/> Guide: {project.guide?.name || "Unassigned"}</span>
                        <span className="flex items-center gap-1"><HiCalendar className="text-sky-400"/> {team.createdDate}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/admin/TeamDetail/${team.teamId}`)} className="px-4 py-2 bg-slate-700 hover:bg-sky-600 hover:text-white text-slate-300 text-xs font-bold rounded-lg transition-colors">
                        View Details
                      </button>
                      <button onClick={() => handleDownloadTeamPdf(team.teamId)} className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors" title="Export PDF">
                        <HiDownload className="text-lg"/>
                      </button>
                    </div>
                  </div>

                  {/* Project Meta Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/30">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Technology</p>
                      <p className="text-sm text-slate-300 truncate">{project.technologiesUsed || "N/A"}</p>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/30">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Start Date</p>
                      <p className="text-sm text-slate-300">{project.startDate || "-"}</p>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/30">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">End Date</p>
                      <p className="text-sm text-slate-300">{project.endDate || "-"}</p>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/30">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Project ID</p>
                      <p className="text-sm font-mono text-slate-300">{team.project?.projectId || "N/A"}</p>
                    </div>
                  </div>

                  {/* Members Table */}
                  <div className="bg-slate-900/30 rounded-xl overflow-hidden border border-slate-700/30">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-800/50 text-xs text-slate-400 uppercase font-bold border-b border-slate-700/30">
                        <tr>
                          <th className="px-4 py-3">Member Name</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Contact</th>
                          <th className="px-4 py-3">Role</th>
                          <th className="px-4 py-3 text-right">Academic</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/30">
                        {members.map((m, i) => (
                          <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-2 font-medium text-slate-200">
                              {m.name} {m.leader && <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded ml-2">Leader</span>}
                            </td>
                            <td className="px-4 py-2 text-slate-400">{m.email}</td>
                            <td className="px-4 py-2 text-slate-400">{m.contactNo || "-"}</td>
                            <td className="px-4 py-2 text-slate-400">{m.role || "Student"}</td>
                            <td className="px-4 py-2 text-right text-xs text-slate-500">
                              {m.branchName} • {m.semesterName} • {m.sectionName}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}