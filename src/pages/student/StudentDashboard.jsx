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
  FaTasks,
  FaUsers,
  FaCalendarCheck,
  FaCalendarTimes,
  FaFileAlt
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// 🔄 Reusable High-End Loader Overlay (Original Loader, now used only for its visual style/overlay)
const LoaderOverlay = ({ message }) => (
  <div className className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[100] backdrop-blur-xl transition-all duration-300">
    <div className="relative w-24 h-24">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-700 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-t-4 border-sky-500 rounded-full animate-spin"></div>
    </div>
    <p className="mt-6 text-sky-400 text-lg font-bold tracking-widest uppercase animate-pulse">{message || "Loading..."}</p>
  </div>
);

// 💀 Student Dashboard Skeleton Loader
const StudentDashboardSkeleton = () => (
  <div className="min-h-screen bg-slate-950 px-6 pt-6 pb-8 space-y-6 font-sans animate-pulse">
    {/* Header Skeleton */}
    <header className="flex flex-col md:flex-row justify-between items-start pb-4 border-b border-slate-800/80">
      <div className="space-y-3">
        <div className="h-4 w-32 bg-emerald-500/10 rounded-full" />
        <div className="h-8 w-80 bg-slate-800 rounded-lg" />
        <div className="h-4 w-96 bg-slate-800/50 rounded" />
      </div>
      <div className="w-32 h-10 bg-slate-800 rounded-xl mt-4 md:mt-0" />
    </header>

    {/* Summary Cards Skeleton */}
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-900/80 border border-slate-800/50 rounded-3xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-2xl bg-slate-800" />
              <div className="space-y-1.5">
                <div className="w-16 h-3 bg-slate-800 rounded" />
                <div className="w-12 h-2 bg-slate-800/50 rounded" />
              </div>
            </div>
            <div className="w-10 h-6 bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    </section>

    {/* Charts Row 1 Skeleton (3 Charts) */}
    <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-80 bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-4">
          <div className="h-5 w-40 bg-slate-800 rounded" />
          <div className="flex-1 h-64 bg-slate-800/50 rounded-xl" />
        </div>
      ))}
    </section>

    {/* Charts Row 2 Skeleton (3 Charts) */}
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       {[...Array(3)].map((_, i) => (
        <div key={i} className="h-80 bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-4">
          <div className="h-5 w-40 bg-slate-800 rounded" />
          <div className="flex-1 h-64 bg-slate-800/50 rounded-xl" />
        </div>
      ))}
    </section>
  </div>
);

const COLORS = [
  "#38bdf8", "#6366f1", "#22c55e", "#eab308", "#f97316", "#ec4899", "#a855f7"
];

const mapToChartArray = (obj) =>
  obj
    ? Object.entries(obj).map(([name, value]) => ({ name, value }))
    : [];

// 🔹 Custom tooltip
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

const formatNumber = (num) => {
  if (num == null) return "0";
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
};

export default function StudentDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

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
        `${import.meta.env.VITE_API_URL}/student/dashboard`,
        axiosConfig
      );
      setStats(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load student dashboard", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (type) => {
    switch (type) {
      case "tasks":
        navigate("/student/tasks");
        break;
      case "teams":
        navigate("/student/team");
        break;
      case "meetings":
        navigate("/student/meetings");
        break;
      case "mom":
        navigate("/student/meetings");
        break;
      default:
        break;
    }
  };

  // 🛑 Use Skeleton Loader here
  if (loading || !stats) {
    return <StudentDashboardSkeleton />;
  }

  const tasksByStatus = mapToChartArray(stats.tasksByStatus);
  const tasksByPriority = mapToChartArray(stats.tasksByPriority);
  const tasksByType = mapToChartArray(stats.tasksByType);
  const tasksByMonth = mapToChartArray(stats.tasksByMonth);
  const meetingsByStatus = mapToChartArray(stats.meetingsByStatus);
  const attendanceByFlag = mapToChartArray(stats.attendanceByFlag);

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 font-sans selection:bg-sky-500/30">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-sky-500/10 to-violet-500/15 blur-3xl opacity-70 pointer-events-none" />
        <header className="relative px-6 pt-6 pb-3 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-200 tracking-wide">
                Student · Project Overview
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-sky-100 tracking-tight">
              Your Project & Task Summary
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Track your tasks, meetings, team, and MOM – all in one focused dashboard.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              onClick={fetchDashboard}
              className="px-4 py-2 rounded-xl bg-slate-900/80 border border-emerald-500/40 text-sm font-medium shadow-lg shadow-emerald-500/20 hover:bg-slate-900 hover:border-emerald-400 transition flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Refresh</span>
            </button>
            <span className="text-[11px] text-slate-400">
              Updated just now • Student view
            </span>
          </div>
        </header>
      </div>

      <main className="px-6 pb-8 pt-2 space-y-6">
        {/* Top summary cards */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
            <SummaryCard
              label="My Tasks"
              value={stats.totalTasks}
              icon={<FaTasks className="w-5 h-5" />}
              accent="from-sky-500/20 to-emerald-500/10"
              chip="Assigned to you / your team"
              onClick={() => handleCardClick("tasks")}
            />
            <SummaryCard
              label="My Teams"
              value={stats.totalTeams}
              icon={<FaUsers className="w-5 h-5" />}
              accent="from-violet-500/20 to-sky-500/10"
              chip={`Leader in ${stats.leaderTeams || 0} team(s)`}
              onClick={() => handleCardClick("teams")}
            />
            <SummaryCard
              label="Total Meetings"
              value={stats.totalMeetings}
              icon={<FaCalendarCheck className="w-5 h-5" />}
              accent="from-emerald-500/20 to-lime-500/10"
              chip="All project meetings"
              onClick={() => handleCardClick("meetings")}
            />
            <SummaryCard
              label="Meetings Attended"
              value={stats.meetingsAttended}
              icon={<FaCalendarCheck className="w-5 h-5" />}
              accent="from-emerald-500/20 to-sky-500/10"
              chip="Present"
              onClick={() => handleCardClick("meetings")}
            />
            <SummaryCard
              label="Meetings Missed"
              value={stats.meetingsMissed}
              icon={<FaCalendarTimes className="w-5 h-5" />}
              accent="from-rose-500/20 to-orange-500/10"
              chip="Absent"
              onClick={() => handleCardClick("meetings")}
            />
            <SummaryCard
              label="Minutes of Meeting"
              value={stats.totalMom}
              icon={<FaFileAlt className="w-5 h-5" />}
              accent="from-fuchsia-500/20 to-sky-500/10"
              chip="Recorded MoMs"
              onClick={() => handleCardClick("mom")}
            />
          </div>
        </section>

        {/* Tasks charts row */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Tasks by Status */}
          <ChartCard
            title="Tasks by Status"
            subtitle="Pending vs In-progress vs Completed"
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={tasksByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                <YAxis tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value">
                  {tasksByStatus.map((entry, index) => (
                    <Cell
                      key={`status-bar-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Tasks by Priority */}
          <ChartCard
            title="Tasks by Priority"
            subtitle="Low / Medium / High / Critical"
          >
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={tasksByPriority}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {tasksByPriority.map((entry, index) => (
                    <Cell
                      key={`prio-pie-${entry.name}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Tasks over Time (Line chart) */}
          <ChartCard
            title="Tasks by Month"
            subtitle="Deadlines distribution over months"
          >
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={tasksByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                <YAxis tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        {/* Meetings + Attendance */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Meetings by Status */}
          <ChartCard
            title="Meetings by Status"
            subtitle="Scheduled / Completed / Cancelled"
          >
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={meetingsByStatus}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {meetingsByStatus.map((entry, index) => (
                    <Cell
                      key={`meet-pie-${entry.name}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Attendance chart */}
          <ChartCard
            title="My Meeting Attendance"
            subtitle="Present vs Absent"
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={attendanceByFlag}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                <YAxis tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value">
                  {attendanceByFlag.map((entry, index) => (
                    <Cell
                      key={`att-bar-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Tasks by Type */}
          <ChartCard
            title="Tasks by Type"
            subtitle="Development, Testing, Docs, etc."
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={tasksByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                <YAxis tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value">
                  {tasksByType.map((entry, index) => (
                    <Cell
                      key={`type-bar-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>
      </main>
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
        className={`relative bg-slate-900/80 rounded-3xl border border-emerald-500/10 px-4 py-3 flex flex-col gap-2 shadow-lg shadow-emerald-500/10 ${
          clickable
            ? "hover:shadow-emerald-500/30 hover:-translate-y-1 cursor-pointer"
            : ""
        } transition`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
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

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-slate-900/80 rounded-2xl border border-sky-500/10 shadow-lg shadow-sky-500/15 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div>
          <h2 className="text-base font-semibold text-sky-200">{title}</h2>
          {subtitle && (
            <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-[220px]">{children}</div>
    </div>
  );
}