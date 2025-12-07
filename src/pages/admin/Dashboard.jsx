import React, { useEffect, useState } from "react";
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
  CartesianGrid
} from "recharts";
import {
  FaUserGraduate,
  FaUsersCog,
  FaTasks,
  FaProjectDiagram,
  FaUserShield,
  FaUsers
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const LoaderOverlay = ({ message }) => (
  <div className="fixed inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-[60] backdrop-blur">
    <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-white text-lg font-medium tracking-wide">
      {message || "Loading..."}
    </p>
  </div>
);

const COLORS = [
  "#38bdf8",
  "#6366f1",
  "#22c55e",
  "#eab308",
  "#f97316",
  "#ec4899",
  "#a855f7"
];

const mapToChartArray = (mapObj) =>
  Object.entries(mapObj || {}).map(([name, value]) => ({ name, value }));

const formatNumber = (num) => {
  if (num == null) return "0";
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
};

// 🔹 Custom tooltip – sabhi charts me bold, white text ke sath
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0];
  const name = item.name || label;
  const value = item.value;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/95 px-3 py-2 shadow-lg shadow-black/50">
      {label && (
        <p className="text-[11px] font-bold text-slate-200 mb-1">{label}</p>
      )}
      <p className="text-[12px] font-bold text-slate-50">
        {name && <span className="mr-1">{name}:</span>}
        <span>{value}</span>
      </p>
    </div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedChart, setExpandedChart] = useState(null); // { key, title, subtitle }

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      Swal.fire("Unauthorized", "Please login first", "warning");
      return;
    }
    fetchDashboard();
    // eslint-disable-next-line
  }, [token]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/dashboard`,
        axiosConfig
      );
      setStats(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load admin dashboard", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSummaryClick = (type) => {
    switch (type) {
      case "students":
        navigate("/admin/user-detail");
        break;
      case "guides":
        navigate("/admin/add-teacher");
        break;
      case "teams":
      case "projects":
      case "tasks":
        navigate("/admin/reports");
        break;
      default:
        // admins = no navigation
        break;
    }
  };

  if (loading || !stats) {
    return <LoaderOverlay message="Loading admin dashboard..." />;
  }

  const studentsByCourse = mapToChartArray(stats.studentsByCourse);
  const studentsByBranch = mapToChartArray(stats.studentsByBranch);
  const projectsByStatus = mapToChartArray(stats.projectsByStatus);
  const tasksByStatus = mapToChartArray(stats.tasksByStatus);
  const tasksByPriority = mapToChartArray(stats.tasksByPriority);
  const studentsBySemester = mapToChartArray(stats.studentsBySemester);
  const studentsBySection = mapToChartArray(stats.studentsBySection);

  // --------- Modal content for expanded chart ----------
  const renderExpandedChart = () => {
    if (!expandedChart) return null;

    const height = 360;
    switch (expandedChart.key) {
      case "studentsByCourse":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={studentsByCourse}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#e5e7eb" }} />
              <YAxis tick={{ fontSize: 12, fill: "#e5e7eb" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value">
                {studentsByCourse.map((entry, index) => (
                  <Cell
                    key={`course-cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
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
                {studentsByBranch.map((entry, index) => (
                  <Cell
                    key={`branch-cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case "projectsByStatus":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={projectsByStatus}
                dataKey="value"
                nameKey="name"
                outerRadius={140}
                label
              >
                {projectsByStatus.map((entry, index) => (
                  <Cell
                    key={`proj-cell-${entry.name}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
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
              <Pie
                data={tasksByStatus}
                dataKey="value"
                nameKey="name"
                outerRadius={140}
                label
              >
                {tasksByStatus.map((entry, index) => (
                  <Cell
                    key={`taskstat-cell-${entry.name}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case "tasksByPriority":
        // 🔹 Expanded view me line chart (Tasks by Priority)
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={tasksByPriority}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#e5e7eb" }} />
              <YAxis tick={{ fontSize: 12, fill: "#e5e7eb" }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ r: 4, stroke: "#0f172a", strokeWidth: 1.5 }}
              />
            </LineChart>
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
                {studentsBySemester.map((entry, index) => (
                  <Cell
                    key={`sem-cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case "studentsBySection":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={studentsBySection}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#e5e7eb" }} />
              <YAxis tick={{ fontSize: 12, fill: "#e5e7eb" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value">
                {studentsBySection.map((entry, index) => (
                  <Cell
                    key={`sec-cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100">
      {/* Gradient header strip */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 via-cyan-400/10 to-fuchsia-500/10 blur-3xl opacity-70 pointer-events-none" />
        <header className="relative px-6 pt-6 pb-3 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-sky-200 tracking-wide">
                Admin · Control Center
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-sky-100 tracking-tight">
              Project Management Overview
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Monitor students, guides, teams, projects & tasks in one place with
              real-time insights.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              onClick={fetchDashboard}
              className="px-4 py-2 rounded-xl bg-slate-900/80 border border-sky-500/40 text-sm font-medium shadow-lg shadow-sky-500/20 hover:bg-slate-900 hover:border-sky-400 transition flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Refresh snapshot</span>
            </button>
            <span className="text-[11px] text-slate-400">
              Updated just now • Admin view
            </span>
          </div>
        </header>
      </div>

      <main className="px-6 pb-8 pt-2 space-y-6">
        {/* Top summary cards */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
            <SummaryCard
              label="Students"
              value={stats.totalStudents}
              icon={<FaUserGraduate className="w-5 h-5" />}
              accent="from-sky-500/20 to-emerald-500/10"
              chip="Active enrolments"
              onClick={() => handleSummaryClick("students")}
            />
            <SummaryCard
              label="Guides"
              value={stats.totalGuides}
              icon={<FaUsersCog className="w-5 h-5" />}
              accent="from-violet-500/20 to-sky-500/10"
              chip="Faculty mentors"
              onClick={() => handleSummaryClick("guides")}
            />
            <SummaryCard
              label="Teams"
              value={stats.totalTeams}
              icon={<FaUsers className="w-5 h-5" />}
              accent="from-emerald-500/20 to-lime-500/10"
              chip="Project teams"
              onClick={() => handleSummaryClick("teams")}
            />
            <SummaryCard
              label="Projects"
              value={stats.totalProjects}
              icon={<FaProjectDiagram className="w-5 h-5" />}
              accent="from-fuchsia-500/20 to-sky-500/10"
              chip="Registered projects"
              onClick={() => handleSummaryClick("projects")}
            />
            <SummaryCard
              label="Tasks"
              value={stats.totalTasks}
              icon={<FaTasks className="w-5 h-5" />}
              accent="from-yellow-500/20 to-orange-500/10"
              chip="Total tasks"
              onClick={() => handleSummaryClick("tasks")}
            />
            <SummaryCard
              label="Admins"
              value={stats.totalAdmins}
              icon={<FaUserShield className="w-5 h-5" />}
              accent="from-sky-500/20 to-slate-500/10"
              chip="System Admins"
            />
          </div>
        </section>

        {/* Mid charts row */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Students by Course */}
          <ChartCard
            title="Students by Course"
            subtitle="How students are distributed across courses"
            onExpand={() =>
              setExpandedChart({
                key: "studentsByCourse",
                title: "Students by Course",
                subtitle:
                  "Detailed view of student count per course across the institute."
              })
            }
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={studentsByCourse}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                <YAxis tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value">
                  {studentsByCourse.map((entry, index) => (
                    <Cell
                      key={`course-bar-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Students by Branch */}
          <ChartCard
            title="Students by Branch"
            subtitle="Branch-wise distribution of students"
            onExpand={() =>
              setExpandedChart({
                key: "studentsByBranch",
                title: "Students by Branch",
                subtitle:
                  "Compare how many students are enrolled in each branch."
              })
            }
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={studentsByBranch}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                <YAxis tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value">
                  {studentsByBranch.map((entry, index) => (
                    <Cell
                      key={`branch-bar-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Project Status */}
          <ChartCard
            title="Projects by Status"
            subtitle="Health of all registered projects"
            badge={stats.totalProjects ? `${stats.totalProjects} projects` : ""}
            onExpand={() =>
              setExpandedChart({
                key: "projectsByStatus",
                title: "Projects by Status",
                subtitle: "Distribution of projects across different statuses."
              })
            }
          >
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={projectsByStatus}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {projectsByStatus.map((entry, index) => (
                    <Cell
                      key={`proj-pie-${entry.name}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        {/* Tasks + guide load */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks by Status */}
          <ChartCard
            title="Tasks by Status"
            subtitle="Overall progress of action items"
            badge={stats.totalTasks ? `${stats.totalTasks} tasks` : ""}
            onExpand={() =>
              setExpandedChart({
                key: "tasksByStatus",
                title: "Tasks by Status",
                subtitle: "How tasks are progressing across the system."
              })
            }
          >
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={tasksByStatus}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {tasksByStatus.map((entry, index) => (
                    <Cell
                      key={`taskstat-pie-${entry.name}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Tasks by Priority – 🔹 line chart yaha */}
          <ChartCard
            title="Tasks by Priority"
            subtitle="Workload pressure by priority"
            onExpand={() =>
              setExpandedChart({
                key: "tasksByPriority",
                title: "Tasks by Priority",
                subtitle: "See how many tasks are low, medium, high or critical."
              })
            }
          >
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={tasksByPriority}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                <YAxis tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ r: 4, stroke: "#0f172a", strokeWidth: 1.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Guide load table */}
          <div className="bg-slate-900/80 rounded-2xl border border-sky-500/10 shadow-xl shadow-sky-500/20 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-semibold text-sky-300">
                  Guide Workload
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Teams mapped to each guide
                </p>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-200 border border-sky-500/30">
                {(stats.guideStats || []).length} guides
              </span>
            </div>
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
                    <tr>
                      <td
                        className="py-4 px-2 text-center text-gray-500"
                        colSpan={3}
                      >
                        No guide data available.
                      </td>
                    </tr>
                  ) : (
                    stats.guideStats.map((g) => (
                      <tr
                        key={g.guideId}
                        className="border-t border-slate-800 hover:bg-slate-800/60 transition"
                      >
                        <td className="py-2 px-2">
                          <span className="font-medium text-slate-100">
                            {g.name || "-"}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-sky-400">
                          {g.email || "-"}
                        </td>
                        <td className="py-2 px-2 text-right font-semibold text-slate-100">
                          {g.teamCount}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Students by Semester & Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Students by Semester"
            subtitle="Which semesters are most loaded"
            onExpand={() =>
              setExpandedChart({
                key: "studentsBySemester",
                title: "Students by Semester",
                subtitle: "Check how students are distributed by semester."
              })
            }
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={studentsBySemester}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                <YAxis tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value">
                  {studentsBySemester.map((entry, index) => (
                    <Cell
                      key={`sem-bar-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Students by Section"
            subtitle="Section-wise student split"
            onExpand={() =>
              setExpandedChart({
                key: "studentsBySection",
                title: "Students by Section",
                subtitle: "See how many students are in each section."
              })
            }
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={studentsBySection}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                <YAxis tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value">
                  {studentsBySection.map((entry, index) => (
                    <Cell
                      key={`sec-bar-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>
      </main>

      {/* Expanded chart modal */}
      {expandedChart && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex items-center justify-center px-4">
          <div className="bg-slate-950/95 border border-sky-500/30 rounded-3xl shadow-2xl shadow-sky-500/30 max-w-5xl w-full max-h-[90vh] flex flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-sky-100">
                  {expandedChart.title}
                </h2>
                {expandedChart.subtitle && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {expandedChart.subtitle}
                  </p>
                )}
              </div>
              <button
                onClick={() => setExpandedChart(null)}
                className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-200 hover:bg-slate-800 hover:border-sky-500 transition"
              >
                Close ✕
              </button>
            </div>
            {/* fixed height so charts always visible */}
            <div className="mt-4 w-full h-[360px]">
              {renderExpandedChart()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon, accent, chip, onClick }) {
  const clickable = !!onClick;
  return (
    <div className="relative group">
      <div
        className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-100 blur-xl transition duration-300`}
      />
      <div
        onClick={onClick}
        className={`relative bg-slate-900/80 rounded-3xl border border-sky-500/10 px-4 py-3 flex flex-col gap-2 shadow-lg shadow-sky-500/10 ${
          clickable ? "hover:shadow-sky-500/30 hover:-translate-y-1 cursor-pointer" : ""
        } transition`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-sky-500/10 text-sky-300 border border-sky-500/30">
              {icon}
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wide text-slate-400">
                {label}
              </span>
              {chip && (
                <span className="text-[11px] text-slate-500">{chip}</span>
              )}
            </div>
          </div>
          <span className="text-xl font-semibold text-sky-100">
            {formatNumber(value)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, badge, children, onExpand }) {
  return (
    <div className="bg-slate-900/80 rounded-2xl border border-sky-500/10 shadow-lg shadow-sky-500/15 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className={onExpand ? "cursor-pointer" : ""} onClick={onExpand}>
          <h2 className="text-base font-semibold text-sky-200 flex items-center gap-2">
            {title}
            {onExpand && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-600">
                Click to expand
              </span>
            )}
          </h2>
          {subtitle && (
            <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {badge && (
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-600">
            {badge}
          </span>
        )}
      </div>
      <div className="flex-1 min-h-[220px]">{children}</div>
    </div>
  );
}
