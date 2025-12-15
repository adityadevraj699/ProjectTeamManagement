import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import {
  FaUserGraduate,
  FaUsersCog,
  FaTasks,
  FaProjectDiagram,
  FaUserShield,
  FaUsers,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

/* ----------------------- Utilities & Constants ---------------------- */

const COLORS = [
  "#38bdf8", "#6366f1", "#22c55e", "#eab308", "#f97316", "#ec4899", "#a855f7",
];

const SLIDE_COUNT = 2; 

const formatNumber = (num) => {
  if (num == null) return "0";
  if (Number(num) >= 1000) return `${(Number(num) / 1000).toFixed(1)}k`;
  return String(num);
};

const mapToChartArray = (mapObj) =>
  mapObj && typeof mapObj === "object"
    ? Object.entries(mapObj).map(([name, value]) => ({ name, value }))
    : [];

/* ----------------------- 💀 NEW SKELETON LOADER ---------------------- */

const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-950 px-6 pt-6 pb-8 space-y-8 font-sans">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800/80 pb-4">
        <div className="space-y-3">
          <div className="w-32 h-6 bg-slate-800/50 rounded-full animate-pulse" />
          <div className="w-64 h-10 bg-slate-800 rounded-lg animate-pulse" />
          <div className="w-96 h-4 bg-slate-800/50 rounded animate-pulse" />
        </div>
        <div className="w-32 h-10 bg-slate-800 rounded-xl animate-pulse" />
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-[88px] bg-slate-900/80 border border-slate-800 rounded-3xl p-4 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-800" />
              <div className="space-y-2">
                <div className="w-16 h-3 bg-slate-800 rounded" />
                <div className="w-12 h-2 bg-slate-800/50 rounded" />
              </div>
            </div>
            <div className="w-10 h-6 bg-slate-800 rounded" />
          </div>
        ))}
      </div>

      {/* Slider/Chart Section Skeleton */}
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="w-48 h-6 bg-slate-800 rounded animate-pulse" />
            <div className="w-32 h-3 bg-slate-800/50 rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="w-24 h-8 bg-slate-800 rounded-full animate-pulse" />
            <div className="w-8 h-8 bg-slate-800 rounded-full animate-pulse" />
            <div className="w-8 h-8 bg-slate-800 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Charts Container */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 h-[600px] animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 h-full p-4 flex flex-col gap-4">
               <div className="flex justify-between">
                 <div className="w-32 h-5 bg-slate-700/50 rounded" />
                 <div className="w-16 h-5 bg-slate-700/50 rounded" />
               </div>
               <div className="flex-1 bg-slate-700/10 rounded-lg mx-auto w-full" />
            </div>
            <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 h-full p-4 flex flex-col gap-4">
               <div className="flex justify-between">
                 <div className="w-32 h-5 bg-slate-700/50 rounded" />
                 <div className="w-16 h-5 bg-slate-700/50 rounded" />
               </div>
               <div className="flex-1 bg-slate-700/10 rounded-lg mx-auto w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ----------------------------- Tooltips ---------------------------------- */

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  const name = item.name || label;
  const value = item.value ?? item.payload?.value;
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/95 px-3 py-2 shadow-lg shadow-black/50">
      {label && <p className="text-[11px] font-bold text-slate-200 mb-1">{label}</p>}
      <p className="text-[12px] font-bold text-slate-50">
        {name && <span className="mr-1">{name}:</span>}
        <span>{value}</span>
      </p>
    </div>
  );
};

const SectionTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const datum = payload[0].payload;
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/95 px-3 py-2 shadow-lg shadow-black/50">
      <p className="text-[12px] font-bold text-slate-50">{datum.name}</p>
      <p className="text-[12px] font-semibold text-slate-100 mt-1">Count: {datum.value}</p>
    </div>
  );
};

/* --------------------------- Summary & Chart Cards ------------------------ */

function SummaryCard({ label, value, icon, accent, chip, onClick }) {
  const clickable = !!onClick;
  return (
    <div className="relative group">
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-100 blur-xl transition duration-300`} />
      <div
        onClick={onClick}
        role={clickable ? "button" : undefined}
        className={`relative bg-slate-900/80 rounded-3xl border border-sky-500/10 px-4 py-3 flex flex-col gap-2 shadow-lg shadow-sky-500/10 ${
          clickable ? "hover:shadow-sky-500/30 hover:-translate-y-1 cursor-pointer" : ""
        } transition`}
        tabIndex={clickable ? 0 : -1}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-sky-500/10 text-sky-300 border border-sky-500/30">{icon}</div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wide text-slate-400">{label}</span>
              {chip && <span className="text-[11px] text-slate-500">{chip}</span>}
            </div>
          </div>
          <span className="text-xl font-semibold text-sky-100">{formatNumber(value)}</span>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, badge, children, onExpand }) {
  const handleExpand = (e) => {
    e?.stopPropagation?.();
    if (typeof onExpand === "function") onExpand();
  };

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-sky-500/10 shadow-lg shadow-sky-500/15 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-start gap-3">
          <div className={onExpand ? "cursor-pointer select-none" : ""} onClick={handleExpand}>
            <h2 className="text-base font-semibold text-sky-200 flex items-center gap-2">
              {title}
            </h2>
            {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {badge && <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-600">{badge}</span>}

          {onExpand && (
            <button
              onClick={handleExpand}
              className="text-[11px] px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-sky-500 transition"
              title="Expand chart"
            >
              Expand
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-[220px]">{children}</div>
    </div>
  );
}

/* ------------------------------- Dashboard -------------------------------- */

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedChart, setExpandedChart] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Section filters
  const [sectionFilters, setSectionFilters] = useState({ course: "ALL", branch: "ALL", semester: "ALL" });

  const token = localStorage.getItem("token");
  const axiosConfig = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);
  const navigate = useNavigate();

  /* ------------------------ Fetch dashboard data ------------------------- */

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/dashboard`, axiosConfig);
      setStats(res.data || {});
    } catch (err) {
      console.error("fetchDashboard error:", err);
      Swal.fire("Error", "Failed to load admin dashboard", "error");
    } finally {
      setLoading(false);
    }
  }, [axiosConfig]);

  useEffect(() => {
    if (!token) {
      Swal.fire("Unauthorized", "Please login first", "warning");
      return;
    }
    fetchDashboard();
  }, [token]);

  /* ------------------------- Auto-play slider ---------------------------- */

  useEffect(() => {
    if (!autoPlay) return undefined;
    const t = setInterval(() => setCurrentSlide((s) => (s + 1) % SLIDE_COUNT), 5000);
    return () => clearInterval(t);
  }, [autoPlay]);

  /* ---------------------------- Derived data ---------------------------- */

  const studentsByCourse = useMemo(() => mapToChartArray(stats?.studentsByCourse), [stats]);
  const studentsByBranch = useMemo(() => mapToChartArray(stats?.studentsByBranch), [stats]);
  const studentsBySemester = useMemo(() => mapToChartArray(stats?.studentsBySemester), [stats]);
  const projectsByStatus = useMemo(() => mapToChartArray(stats?.projectsByStatus), [stats]);
  const tasksByStatus = useMemo(() => mapToChartArray(stats?.tasksByStatus), [stats]);
  const tasksByPriority = useMemo(() => mapToChartArray(stats?.tasksByPriority), [stats]);
  const studentsBySectionLegacy = useMemo(() => mapToChartArray(stats?.studentsBySection), [stats]);

  const sectionDetailed = useMemo(() => stats?.studentsBySectionDetailed || [], [stats]);

  const coursesList = useMemo(() => Array.from(new Set(sectionDetailed.map((s) => s.courseName).filter(Boolean))).sort(), [sectionDetailed]);
  const branchesList = useMemo(() => Array.from(new Set(sectionDetailed.map((s) => s.branchName).filter(Boolean))).sort(), [sectionDetailed]);
  const semestersList = useMemo(() => Array.from(new Set(sectionDetailed.map((s) => s.semesterName).filter(Boolean))).sort(), [sectionDetailed]);

  const filteredSectionData = useMemo(() => {
    if (!sectionDetailed.length) return studentsBySectionLegacy;
    const map = new Map();
    sectionDetailed.forEach((s) => {
      if (sectionFilters.course !== "ALL" && s.courseName !== sectionFilters.course) return;
      if (sectionFilters.branch !== "ALL" && s.branchName !== sectionFilters.branch) return;
      if (sectionFilters.semester !== "ALL" && s.semesterName !== sectionFilters.semester) return;
      const key = s.sectionName || "-";
      const cnt = Number(s.count || 0);
      const prev = map.get(key);
      if (prev) {
        prev.value += cnt;
      } else {
        map.set(key, { name: key, value: cnt });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.value - a.value);
  }, [sectionDetailed, sectionFilters, studentsBySectionLegacy]);

  /* ----------------------- Handlers & navigation ------------------------- */

  const handleSummaryClick = useCallback((type) => {
      switch (type) {
        case "students": navigate("/admin/user-detail"); break;
        case "guides": navigate("/admin/add-teacher"); break;
        case "teams":
        case "projects":
        case "tasks": navigate("/admin/reports"); break;
        default: break;
      }
    }, [navigate]);

  const onSectionFilterChange = useCallback((field, value) => {
    setSectionFilters((p) => ({ ...p, [field]: value }));
  }, []);

  const goToNextSlide = useCallback(() => setCurrentSlide((s) => (s + 1) % SLIDE_COUNT), []);
  const goToPrevSlide = useCallback(() => setCurrentSlide((s) => (s - 1 + SLIDE_COUNT) % SLIDE_COUNT), []);

  /* --------------------------- Expanded modal --------------------------- */

  const renderExpandedChart = useCallback(() => {
    if (!expandedChart) return null;
    const height = 380;

    switch (expandedChart.key) {
      case "projectsByStatus":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie data={projectsByStatus} dataKey="value" nameKey="name" outerRadius={140} label>
                {projectsByStatus.map((entry, index) => <Cell key={`proj-cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case "tasksByStatus":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie data={tasksByStatus} dataKey="value" nameKey="name" outerRadius={140} label>
                {tasksByStatus.map((entry, index) => <Cell key={`taskstat-cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case "tasksByPriority":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={tasksByPriority}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#e5e7eb" }} />
              <YAxis tick={{ fontSize: 12, fill: "#e5e7eb" }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} dot={{ r: 4, stroke: "#0f172a", strokeWidth: 1.5 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case "studentsByCourse":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={studentsByCourse}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#e5e7eb" }} />
              <YAxis tick={{ fontSize: 12, fill: "#e5e7eb" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value">
                {studentsByCourse.map((entry, idx) => <Cell key={`course-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case "studentsByBranch":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={studentsByBranch}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#e5e7eb" }} />
              <YAxis tick={{ fontSize: 12, fill: "#e5e7eb" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value">
                {studentsByBranch.map((entry, idx) => <Cell key={`branch-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case "studentsBySemester":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={studentsBySemester}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#e5e7eb" }} />
              <YAxis tick={{ fontSize: 12, fill: "#e5e7eb" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value">
                {studentsBySemester.map((entry, idx) => <Cell key={`sem-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case "studentsBySection":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={filteredSectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#e5e7eb" }} />
              <YAxis tick={{ fontSize: 12, fill: "#e5e7eb" }} />
              <Tooltip content={<SectionTooltip />} />
              <Bar dataKey="value">
                {filteredSectionData.map((entry, idx) => <Cell key={`sec-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  }, [expandedChart, projectsByStatus, tasksByStatus, tasksByPriority, studentsByCourse, studentsByBranch, studentsBySemester, filteredSectionData]);

  /* ------------------------------- Render -------------------------------- */

  // ✅ Use DashboardSkeleton instead of LoaderOverlay
  if (loading || !stats) {
    return <DashboardSkeleton />;
  }

  const slideTitle = currentSlide === 0 ? "Project & Task Overview" : "Student Insights";
  const slideSubtitle = currentSlide === 0 ? "Projects, tasks & guide workload at a glance." : "Course, branch, semester & section distribution.";

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 via-cyan-400/10 to-fuchsia-500/10 blur-3xl opacity-70 pointer-events-none" />
        <header className="relative px-6 pt-6 pb-3 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-sky-200 tracking-wide">Admin · Control Center</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-sky-100 tracking-tight">Project Management Overview</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">Monitor students, guides, teams, projects & tasks in one place with real-time insights.</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <button onClick={fetchDashboard} className="px-4 py-2 rounded-xl bg-slate-900/80 border border-sky-500/40 text-sm font-medium shadow-lg shadow-sky-500/20 hover:bg-slate-900 hover:border-sky-400 transition flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Refresh snapshot</span>
              </button>
            </div>
            <span className="text-[11px] text-slate-400">Updated just now • Admin view</span>
          </div>
        </header>
      </div>

      <main className="px-6 pb-8 pt-2 space-y-6">
        {/* Summary */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
            <SummaryCard label="Students" value={stats.totalStudents} icon={<FaUserGraduate className="w-5 h-5" />} accent="from-sky-500/20 to-emerald-500/10" chip="Active enrolments" onClick={() => handleSummaryClick("students")} />
            <SummaryCard label="Guides" value={stats.totalGuides} icon={<FaUsersCog className="w-5 h-5" />} accent="from-violet-500/20 to-sky-500/10" chip="Faculty mentors" onClick={() => handleSummaryClick("guides")} />
            <SummaryCard label="Teams" value={stats.totalTeams} icon={<FaUsers className="w-5 h-5" />} accent="from-emerald-500/20 to-lime-500/10" chip="Project teams" onClick={() => handleSummaryClick("teams")} />
            <SummaryCard label="Projects" value={stats.totalProjects} icon={<FaProjectDiagram className="w-5 h-5" />} accent="from-fuchsia-500/20 to-sky-500/10" chip="Registered projects" onClick={() => handleSummaryClick("projects")} />
            <SummaryCard label="Tasks" value={stats.totalTasks} icon={<FaTasks className="w-5 h-5" />} accent="from-yellow-500/20 to-orange-500/10" chip="Total tasks" onClick={() => handleSummaryClick("tasks")} />
            <SummaryCard label="Admins" value={stats.totalAdmins} icon={<FaUserShield className="w-5 h-5" />} accent="from-sky-500/20 to-slate-500/10" chip="System Admins" />
          </div>
        </section>

        {/* Slider + Charts */}
        <section className="mt-2 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-sky-200">{slideTitle}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{slideSubtitle}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] border ${autoPlay ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-200" : "bg-slate-800/70 border-slate-600 text-slate-200"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${autoPlay ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`} />
                {autoPlay ? "Auto sliding" : "Manual mode"}
              </span>

              <button onClick={() => setAutoPlay((p) => !p)} className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-[11px] text-slate-100 hover:border-sky-500 hover:bg-slate-800 transition">
                {autoPlay ? "Pause slider" : "Play slider"}
              </button>

              <div className="flex items-center gap-1">
                <button onClick={goToPrevSlide} className="px-2 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-200 hover:border-sky-500 hover:bg-slate-800 transition">◀</button>
                <button onClick={goToNextSlide} className="px-2 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-200 hover:border-sky-500 hover:bg-slate-800 transition">▶</button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-2xl border border-sky-500/10 shadow-xl shadow-sky-500/15 overflow-hidden">
            <div className="p-4 relative">
              {/* Slide 0 */}
              <div className={`transition-opacity duration-500 ${currentSlide === 0 ? "opacity-100 relative" : "opacity-0 pointer-events-none absolute -z-10"}`}>
                {currentSlide === 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ChartCard title="Projects by Status" subtitle="Health of all registered projects" badge={stats.totalProjects ? `${stats.totalProjects} projects` : ""} onExpand={() => setExpandedChart({ key: "projectsByStatus", title: "Projects by Status", subtitle: "Distribution of projects across different statuses." })}>
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie data={projectsByStatus} dataKey="value" nameKey="name" outerRadius={90} label>
                            {projectsByStatus.map((entry, index) => <Cell key={`proj-pie-${index}`} fill={COLORS[index % COLORS.length]} />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Tasks by Status" subtitle="Overall progress of action items" badge={stats.totalTasks ? `${stats.totalTasks} tasks` : ""} onExpand={() => setExpandedChart({ key: "tasksByStatus", title: "Tasks by Status", subtitle: "How tasks are progressing across the system." })}>
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie data={tasksByStatus} dataKey="value" nameKey="name" outerRadius={90} label>
                            {tasksByStatus.map((entry, index) => <Cell key={`task-pie-${index}`} fill={COLORS[index % COLORS.length]} />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Tasks by Priority" subtitle="Workload pressure by priority" onExpand={() => setExpandedChart({ key: "tasksByPriority", title: "Tasks by Priority", subtitle: "See how many tasks are low, medium, high or critical." })}>
                      <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={tasksByPriority}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                          <YAxis tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} dot={{ r: 4, stroke: "#0f172a", strokeWidth: 1.5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Guide Workload" subtitle="Teams mapped to each guide" badge={(stats.guideStats || []).length ? `${(stats.guideStats || []).length} guides` : ""}>
                      <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700/80 scrollbar-track-transparent">
                        <table className="w-full text-sm">
                          <thead className="text-[11px] text-gray-400 sticky top-0 bg-slate-900/90 backdrop-blur">
                            <tr>
                              <th className="py-2 px-2 text-left font-medium">Guide</th>
                              <th className="py-2 px-2 text-left font-medium">Email</th>
                              <th className="py-2 px-2 text-right font-medium">Teams</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(stats.guideStats || []).length === 0 ? (
                              <tr><td className="py-4 px-2 text-center text-gray-500" colSpan={3}>No guide data available.</td></tr>
                            ) : (
                              stats.guideStats.map((g) => (
                                <tr key={g.guideId} className="border-t border-slate-800 hover:bg-slate-800/60 transition">
                                  <td className="py-2 px-2"><span className="font-medium text-slate-100">{g.name || "-"}</span></td>
                                  <td className="py-2 px-2 text-sky-400">{g.email || "-"}</td>
                                  <td className="py-2 px-2 text-right font-semibold text-slate-100">{g.teamCount}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </ChartCard>
                  </div>
                )}
              </div>

              {/* Slide 1 */}
              <div className={`transition-opacity duration-500 ${currentSlide === 1 ? "opacity-100 relative" : "opacity-0 pointer-events-none absolute -z-10"}`}>
                {currentSlide === 1 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ChartCard title="Students by Course" subtitle="How students are distributed across courses" onExpand={() => setExpandedChart({ key: "studentsByCourse", title: "Students by Course", subtitle: "Detailed view of student count per course across the institute." })}>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={studentsByCourse}>
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                          <YAxis tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value">{studentsByCourse.map((_, idx) => <Cell key={`c-${idx}`} fill={COLORS[idx % COLORS.length]} />)}</Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Students by Branch" subtitle="Branch-wise distribution of students" onExpand={() => setExpandedChart({ key: "studentsByBranch", title: "Students by Branch", subtitle: "Compare how many students are enrolled in each branch." })}>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={studentsByBranch}>
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                          <YAxis tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value">{studentsByBranch.map((_, idx) => <Cell key={`b-${idx}`} fill={COLORS[idx % COLORS.length]} />)}</Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Students by Semester" subtitle="Which semesters are most loaded" onExpand={() => setExpandedChart({ key: "studentsBySemester", title: "Students by Semester", subtitle: "Check how students are distributed by semester." })}>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={studentsBySemester}>
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                          <YAxis tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value">{studentsBySemester.map((_, idx) => <Cell key={`s-${idx}`} fill={COLORS[idx % COLORS.length]} />)}</Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Students by Section" subtitle="Section-wise student split (filter by Course / Branch / Semester)" onExpand={() => setExpandedChart({ key: "studentsBySection", title: "Students by Section", subtitle: "See sections (filtered)" })}>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <label className="text-[12px] text-slate-300">Course</label>
                          <select value={sectionFilters.course} onChange={(e) => onSectionFilterChange("course", e.target.value)} className="bg-slate-900 border border-slate-700 text-slate-100 text-sm px-2 py-1 rounded">
                            <option value="ALL">All</option>
                            {coursesList.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-[12px] text-slate-300">Branch</label>
                          <select value={sectionFilters.branch} onChange={(e) => onSectionFilterChange("branch", e.target.value)} className="bg-slate-900 border border-slate-700 text-slate-100 text-sm px-2 py-1 rounded">
                            <option value="ALL">All</option>
                            {branchesList.map((b) => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-[12px] text-slate-300">Semester</label>
                          <select value={sectionFilters.semester} onChange={(e) => onSectionFilterChange("semester", e.target.value)} className="bg-slate-900 border border-slate-700 text-slate-100 text-sm px-2 py-1 rounded">
                            <option value="ALL">All</option>
                            {semestersList.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>

                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={filteredSectionData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                          <YAxis tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                          <Tooltip content={<SectionTooltip />} />
                          <Bar dataKey="value">{filteredSectionData.map((_, idx) => <Cell key={`sec-${idx}`} fill={COLORS[idx % COLORS.length]} />)}</Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </div>
                )}
              </div>

              {/* Slider dots */}
              <div className="flex items-center justify-center gap-2 pb-3 mt-4">
                {Array.from({ length: SLIDE_COUNT }).map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentSlide(idx)} className={`w-2.5 h-2.5 rounded-full transition ${currentSlide === idx ? "bg-sky-400" : "bg-slate-600"}`} aria-label={`Go to slide ${idx + 1}`} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Expanded chart modal */}
      {expandedChart && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[120] flex items-center justify-center px-4">
          <div className="bg-slate-950/95 border border-sky-500/30 rounded-3xl shadow-2xl shadow-sky-500/30 max-w-6xl w-full max-h-[92vh] flex flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-sky-100">{expandedChart.title}</h2>
                {expandedChart.subtitle && <p className="text-xs text-slate-400 mt-0.5">{expandedChart.subtitle}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setExpandedChart(null)} className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-200 hover:bg-slate-800 hover:border-sky-500 transition">
                  Close ✕
                </button>
              </div>
            </div>

            <div className="mt-4 w-full h-[420px]">
              {renderExpandedChart()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}