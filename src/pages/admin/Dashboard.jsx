import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const LoaderOverlay = ({ message }) => (
  <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
    <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-white text-lg font-medium">{message || "Loading..."}</p>
  </div>
);

export default function Dashboard() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [guides, setGuides] = useState([]);
  const [branchFilter, setBranchFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [guideFilter, setGuideFilter] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!token) {
      Swal.fire("Unauthorized", "Please login first", "warning").then(() => {
        navigate("/login");
      });
      return;
    }
    fetchAuxData();
    fetchTeams();
    // eslint-disable-next-line
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
    } catch (err) {
      console.warn("Could not fetch auxiliary data", err);
    }
  };

  const buildQuery = (extra = {}) => {
    const params = new URLSearchParams();
    const b = extra.branchId ?? branchFilter;
    const s = extra.semesterId ?? semesterFilter;
    const g = extra.guideId ?? guideFilter;
    if (b) params.append("branchId", b);
    if (s) params.append("semesterId", s);
    if (g) params.append("guideId", g);
    const q = params.toString();
    return q ? `?${q}` : "";
  };

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const q = buildQuery();
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/dashboard/teams${q}`, axiosConfig);
      setTeams(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load teams", "error");
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    fetchTeams();
  };

  const handleClearFilters = () => {
    setBranchFilter("");
    setSemesterFilter("");
    setGuideFilter("");
    fetchTeams();
  };

  const downloadBlob = (res, defaultName) => {
    const blob = new Blob([res.data], { type: res.headers["content-type"] || "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const disposition = res.headers["content-disposition"] || res.headers["Content-Disposition"];
    let filename = defaultName;
    if (disposition) {
      const match = disposition.match(/filename\*?=?(?:UTF-8''|")?(.*?)"?$/);
      if (match && match[1]) filename = decodeURIComponent(match[1]);
    }
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadPdfAll = async () => {
    try {
      setDownloading(true);
      const q = buildQuery();
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/dashboard/pdf${q}`, { ...axiosConfig, responseType: "blob" });
      downloadBlob(res, "admin_guide_report.pdf");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to download PDF", "error");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadTeamPdf = async (teamId) => {
    try {
      setDownloading(true);
      const q = buildQuery();
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/dashboard/pdf/${teamId}${q}`, { ...axiosConfig, responseType: "blob" });
      downloadBlob(res, `team_${teamId}.pdf`);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to download team PDF", "error");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setDownloading(true);
      const q = buildQuery();
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/dashboard/excel${q}`, { ...axiosConfig, responseType: "blob" });
      downloadBlob(res, "admin_guide_report.xlsx");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to download Excel", "error");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <LoaderOverlay message="Loading admin data..." />;

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 p-6 relative">
      {downloading && <LoaderOverlay message="Preparing export..." />}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-sky-400">Admin Dashboard</h1>

        <div className="flex items-center gap-3">
          <button onClick={fetchTeams} className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 transition">Refresh</button>
          <button onClick={handleDownloadPdfAll} className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-700 transition text-white">
            Export PDF (All / Filtered)
          </button>
          <button onClick={handleDownloadExcel} className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 transition text-white">
            Export Excel (All / Filtered)
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 p-4 rounded-md border border-white/5 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-xs text-gray-400">Guide</label>
            <select value={guideFilter} onChange={(e) => setGuideFilter(e.target.value)} className="block mt-1 bg-slate-700 text-white px-3 py-2 rounded">
              <option value="">All Guides</option>
              {guides.map(g => (<option key={g.id} value={g.id}>{g.name || g.email}</option>))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400">Branch</label>
            <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="block mt-1 bg-slate-700 text-white px-3 py-2 rounded">
              <option value="">All Branches</option>
              {branches.map(b => (<option key={b.id} value={b.id}>{b.branchName}</option>))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400">Semester</label>
            <select value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)} className="block mt-1 bg-slate-700 text-white px-3 py-2 rounded">
              <option value="">All Semesters</option>
              {semesters.map(s => (<option key={s.id} value={s.id}>{s.semesterName}</option>))}
            </select>
          </div>

          <div className="flex gap-2">
            <button onClick={handleApplyFilters} className="px-4 py-2 bg-sky-600 rounded">Apply</button>
            <button onClick={handleClearFilters} className="px-4 py-2 bg-gray-600 rounded">Clear</button>
          </div>
        </div>
      </div>

      {/* Table & details (same look as guide page but includes guide name in table) */}
      <div className="overflow-x-auto bg-slate-800 p-4 rounded-2xl border border-white/10">
        <table className="min-w-full text-left">
          <thead>
            <tr className="text-xs text-gray-400">
              <th className="py-3 px-4">Team Name</th>
              <th className="py-3 px-4">Guide</th>
              <th className="py-3 px-4">Project Title</th>
              <th className="py-3 px-4">Members</th>
              <th className="py-3 px-4">Start</th>
              <th className="py-3 px-4">End</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {teams.length === 0 ? (
              <tr>
                <td className="py-6 px-4 text-center text-gray-400" colSpan={9}>No teams found for the selected filters.</td>
              </tr>
            ) : (
              teams.map(team => {
                const project = team.project || {};
                const members = team.members || [];
                return (
                  <tr key={team.teamId} className="border-t border-slate-700">
                    <td className="py-3 px-4 font-medium">{team.teamName || "-"}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">{project.guide?.name || project.guide?.email || "-"}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">{project.projectTitle || "-"}</td>
                    <td className="py-3 px-4 text-sm">{members.length}</td>
                    <td className="py-3 px-4 text-sm">{project.startDate || "-"}</td>
                    <td className="py-3 px-4 text-sm">{project.endDate || "-"}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={ `px-2 py-1 rounded text-xs font-semibold ` + (project.status === "COMPLETED" ? "bg-green-800 text-green-300" : project.status === "ONGOING" ? "bg-yellow-900 text-yellow-300" : "bg-slate-700 text-gray-300") }>
                        {project.status || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{team.createdDate || "-"}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/admin/TeamDetail/${team.teamId}`)} className="px-3 py-1 bg-sky-600 rounded text-white text-sm hover:bg-sky-700 transition">View</button>
                        <button onClick={() => handleDownloadTeamPdf(team.teamId)} className="px-3 py-1 bg-gray-600 rounded text-white text-sm hover:bg-gray-700 transition">Export</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Expanded details per team — includes guide info */}
        <div className="mt-6 space-y-4">
          {teams.length === 0 ? (
            <div className="text-center text-gray-400">Use the filters above to find teams. Buttons remain available to export the current selection.</div>
          ) : (
            teams.map(team => {
              const members = team.members || [];
              return (
                <div key={`detail-${team.teamId}`} className="bg-slate-900 p-4 rounded-md border border-slate-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-sky-400">{team.teamName}</h3>
                      <p className="text-sm text-gray-300 mt-1"><strong>Project:</strong> {team.project?.projectTitle || "N/A"}</p>
                      <p className="text-sm text-gray-300 mt-1"><strong>Guide:</strong> {team.project?.guide?.name || team.project?.guide?.email || "N/A"}</p>
                      <p className="text-sm text-gray-300 mt-1"><strong>Tech:</strong> {team.project?.technologiesUsed || "N/A"}</p>
                      <p className="text-sm text-gray-300 mt-1"><strong>Description:</strong> {team.project?.description || "N/A"}</p>
                    </div>

                    <div className="text-right text-sm">
                      <p><strong>Members:</strong> {members.length}</p>
                      <p className="mt-1"><strong>Status:</strong> {team.project?.status || "N/A"}</p>
                    </div>
                  </div>

                  {/* Members table */}
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-xs text-gray-400">
                        <tr>
                          <th className="px-3 py-2">Name</th>
                          <th className="px-3 py-2">Email</th>
                          <th className="px-3 py-2">Contact</th>
                          <th className="px-3 py-2">Roll</th>
                          <th className="px-3 py-2">Role</th>
                          <th className="px-3 py-2">Branch</th>
                          <th className="px-3 py-2">Course</th>
                          <th className="px-3 py-2">Section</th>
                          <th className="px-3 py-2">Semester</th>
                          <th className="px-3 py-2">Leader</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.length === 0 ? (
                          <tr>
                            <td className="px-3 py-4 text-center text-gray-400" colSpan={10}>No members match the current filters.</td>
                          </tr>
                        ) : members.map((m, idx) => (
                          <tr key={idx} className={m.leader ? "bg-[#0d1a33] ring-1 ring-green-500/20" : ""}>
                            <td className="px-3 py-2">{m.name || "-"}</td>
                            <td className="px-3 py-2 text-sky-400">{m.email || "-"}</td>
                            <td className="px-3 py-2">{m.contactNo || "-"}</td>
                            <td className="px-3 py-2">{m.rollNumber || "-"}</td>
                            <td className="px-3 py-2">{m.role || "-"}</td>
                            <td className="px-3 py-2">{m.branchName || "-"}</td>
                            <td className="px-3 py-2">{m.courseName || "-"}</td>
                            <td className="px-3 py-2">{m.sectionName || "-"}</td>
                            <td className="px-3 py-2">{m.semesterName || "-"}</td>
                            <td className="px-3 py-2">{m.leader ? <span className="text-green-400 font-semibold">✔</span> : "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
