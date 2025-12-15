import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { FaStar, FaRegStar, FaCopy, FaCheck } from "react-icons/fa";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// Task colors: Completed, In Progress, Pending/Overdue
const TASK_COLORS = ["#22c55e", "#0ea5e9", "#f97316"]; 

// --- 1. Skeleton Loader Component ---
// 
const ProfileSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 w-full">
    <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
      {/* Top Bar Skeleton */}
      <div className="flex justify-between items-center py-2">
        <div className="h-4 w-64 bg-slate-800 rounded"></div>
        <div className="flex gap-2">
          <div className="h-7 w-16 bg-slate-800 rounded-full"></div>
          <div className="h-7 w-32 bg-sky-600/30 rounded-full"></div>
        </div>
      </div>

      {/* Main ID-card Skeleton */}
      <div className="w-full h-64 rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-24 h-24 rounded-3xl bg-slate-800 flex-shrink-0"></div>
          <div className="flex-1 space-y-4">
            <div className="h-8 w-1/2 bg-slate-800 rounded"></div>
            <div className="space-y-1">
              <div className="h-3 w-1/4 bg-slate-800 rounded"></div>
              <div className="h-3 w-1/3 bg-slate-800 rounded"></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="h-12 bg-slate-800/80 rounded-2xl"></div>
              <div className="h-12 bg-slate-800/80 rounded-2xl"></div>
              <div className="h-12 bg-slate-800/80 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphs Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 h-[300px]">
            <div className="h-4 w-1/3 bg-slate-800 rounded mb-4"></div>
            <div className="h-[200px] bg-slate-800 rounded-2xl"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- Reusable Mini Stat List Component ---
function MiniStatList({ title, description, items, percentageValue = null }) {
  return (
    <div className="w-full lg:w-1/3 flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-semibold text-sky-100 mb-0.5">{title}</h3>
        {description && (
          <p className="text-[11px] text-slate-500 mb-2">{description}</p>
        )}
      </div>
      
      {/* Highlighted Percentage Metric - NEW ADDITION */}
      {percentageValue !== null && (
        <div className="py-2 px-3 mb-2 rounded-xl bg-sky-900/50 border border-sky-700/50 text-center">
          <p className="text-sm text-slate-300 font-medium">{percentageValue.label}</p>
          <p className="text-3xl font-bold text-sky-300">
            {percentageValue.value !== undefined && percentageValue.value !== null ? percentageValue.value : "-"}
          </p>
        </div>
      )}

      <dl className="space-y-1">
        {items.map((it) => (
          <div
            key={it.label}
            className="flex items-center justify-between text-[11px]"
          >
            <dt className="text-slate-400">{it.label}</dt>
            <dd className={`font-semibold ${it.isKey ? 'text-sky-300 text-sm' : 'text-sky-200'}`}>
              {it.value !== undefined && it.value !== null ? it.value : "-"}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// --- User Profile Main Component ---
export default function UserProfile() {
  const { email } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copyDone, setCopyDone] = useState(false);

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/profile/user/email/${encodeURIComponent(
            email
          )}`,
          axiosConfig
        );
        setProfile(res.data);
      } catch (err) {
        console.error("[UserProfile] error:", err);
        const msg =
          err.response?.data?.message ||
          err.response?.data ||
          "Failed to load profile";
        Swal.fire("Error", msg, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [email]);

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 1500);
    } catch (e) {
      console.warn("Clipboard copy failed", e);
    }
  };

  if (loading) return <ProfileSkeleton />; // Use Skeleton Loader

  if (!profile)
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900 text-gray-400 text-lg">
        Profile not found.
      </div>
    );

  // Role-based accent color
  const roleColors = {
    ADMIN: "from-red-500 to-red-700",
    GUIDE: "from-emerald-500 to-emerald-700",
    STUDENT: "from-sky-500 to-sky-700",
  };
  const accent = roleColors[profile.role] || "from-gray-500 to-gray-700";

  const initials = profile.name
    ? profile.name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const taskStats = profile.taskStats || {};
  const meetingStats = profile.meetingStats || {};
  const projectStats = profile.projectStats || {};

  const totalTasks = taskStats.totalTasks || 0;

  // Percentage calculations
  const taskCompletionRate = 
    totalTasks === 0 ? 0 : Math.round(((taskStats.completed || 0) / totalTasks) * 100);
  const attendanceRate = Math.round((meetingStats.attendanceRate || 0) * 100);

  // ---------- CHART DATA ----------

  // Tasks Snapshot – Bar chart (Counts only)
  const taskBarData = [
    { name: "Completed", value: taskStats.completed || 0 },
    { name: "In Progress", value: taskStats.inProgress || 0 },
    { name: "Pending/Overdue", value: (taskStats.pending || 0) + (taskStats.overdue || 0) },
  ];

  // Meeting Attendance – Bar chart (Counts only)
  const meetingBarData = [
    { name: "Total Meetings", value: meetingStats.totalMeetings || 0, color: "#f59e0b" },
    { name: "Attended", value: meetingStats.attended || 0, color: "#22c55e" },
    { name: "Missed", value: meetingStats.missed || 0, color: "#ef4444" },
  ];

  // Project Experience – Bar chart (Counts only)
  const projectBarData = [
    { name: "Total", value: projectStats.totalProjects || 0 },
    { name: "Active", value: projectStats.activeProjects || 0 },
    { name: "Completed", value: projectStats.completedProjects || 0 },
  ];

  // Task Distribution – Pie chart (Values)
  const taskPieData = [
    { name: "Completed", value: taskStats.completed || 0 },
    { name: "In Progress", value: taskStats.inProgress || 0 },
    { name: "Pending / Overdue", value: (taskStats.pending || 0) + (taskStats.overdue || 0) },
  ].filter(d => d.value > 0); // Filter out zero values for better pie chart visualization

  // Performance Indicators – Line chart (Percentages)
  const performanceLineData = [
    { label: "Task Completion %", value: taskCompletionRate },
    { label: "Attendance %", value: attendanceRate },
  ];

  const fullStars = profile.ratingStars || 0;
  const emptyStars = 5 - fullStars;

  const display = (v, fallback = "-") =>
    v !== undefined && v !== null && String(v).trim() !== "" ? v : fallback;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-gray-100 px-4 py-8 w-full">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-sky-100 tracking-tight">
              Public Contribution Profile
            </h1>
            <p className="text-xs text-slate-400">
              Email-based profile URL – share with guides, coordinators or
              recruiters.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-1.5 text-xs rounded-full bg-slate-800 text-slate-100 hover:bg-slate-700 transition"
            >
              ← Back
            </button>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-full border border-sky-500 text-sky-300 hover:bg-sky-500/10 transition"
            >
              {copyDone ? (
                <>
                  <FaCheck className="text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <FaCopy />
                  Copy Profile Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main ID-card summary */}
        <motion.div
          className="relative w-full overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 shadow-xl shadow-sky-900/40 p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* glow background */}
          <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(129,140,248,0.18),_transparent_55%)]" />

          <div className="relative flex flex-col md:flex-row gap-6">
            {/* Avatar + tags */}
            <div className="flex flex-col items-center md:items-start gap-3">
              <div
                className={`w-24 h-24 rounded-3xl bg-gradient-to-tr ${accent} flex items-center justify-center text-white text-3xl font-semibold shadow-lg shadow-sky-900/60 border border-white/10`}
              >
                {initials}
              </div>
              <div className="text-[11px] px-3 py-1 rounded-full border border-slate-700 bg-slate-900/70 text-slate-300 uppercase tracking-wide">
                Role:{" "}
                <span className="font-semibold text-sky-300">
                  {display(profile.role)}
                </span>
              </div>
              {profile.teamName && (
                <div className="text-[11px] px-3 py-1 rounded-full border border-emerald-600 bg-emerald-900/40 text-emerald-100">
                  Team: <span className="font-semibold">{profile.teamName}</span>
                </div>
              )}
            </div>

            {/* Right side info */}
            <div className="flex-1 flex flex-col justify-between gap-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <h2 className="text-2xl md:text-3xl font-semibold text-sky-50 tracking-tight">
                    {display(profile.name)}
                  </h2>
                  <p className="text-xs text-slate-300">
                    {display(profile.email)}
                  </p>
                  <p className="mt-2 text-[11px] text-slate-400">
                    Roll No:{" "}
                    <span className="font-medium text-slate-100">
                      {display(profile.rollNumber)}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Course / Branch:{" "}
                    <span className="font-medium text-slate-100">
                      {display(profile.course)}
                      {profile.branch ? ` | ${profile.branch}` : ""}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Semester / Section:{" "}
                    <span className="font-medium text-slate-100">
                      {display(profile.semester)}
                      {profile.section ? ` | ${profile.section}` : ""}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Contact:{" "}
                    <span className="font-medium text-slate-100">
                      {display(profile.contactNo)}
                    </span>
                  </p>
                </div>

                {/* Rating & score */}
                <div className="text-right space-y-1">
                  <div className="flex justify-end gap-1">
                    {Array.from({ length: fullStars }).map((_, i) => (
                      <FaStar
                        key={`full-${i}`}
                        className="text-yellow-400 text-sm"
                      />
                    ))}
                    {Array.from({ length: emptyStars }).map((_, i) => (
                      <FaRegStar
                        key={`empty-${i}`}
                        className="text-slate-600 text-sm"
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Contribution Score:{" "}
                    <span className="font-semibold text-sky-300">
                      {profile.contributionScore?.toFixed
                        ? profile.contributionScore.toFixed(1)
                        : profile.contributionScore || 0}{" "}
                      / 10
                    </span>
                  </p>
                  <p className="text-[11px] text-emerald-300/90 max-w-xs ml-auto">
                    {display(profile.summaryTagline)}
                  </p>
                </div>
              </div>

              {/* Project & guide summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-200 mt-2">
                <div className="border border-slate-700 rounded-2xl px-3 py-2 bg-slate-900/80">
                  <div className="text-slate-400 mb-1">Current Project</div>
                  <div className="font-semibold text-sky-200 truncate">
                    {display(profile.projectTitle)}
                  </div>
                  <div className="text-[10px] mt-1 text-slate-400">
                    Status:{" "}
                    <span className="uppercase text-emerald-300">
                      {display(profile.projectStatus)}
                    </span>
                  </div>
                </div>
                <div className="border border-slate-700 rounded-2xl px-3 py-2 bg-slate-900/80">
                  <div className="text-slate-400 mb-1">Guide / Mentor</div>
                  <div className="font-medium text-sky-200 truncate">
                    {display(profile.guideName)}
                  </div>
                  <div className="text-[10px] mt-1 text-slate-400">
                    This helps understand student’s working style.
                  </div>
                </div>
                <div className="border border-slate-700 rounded-2xl px-3 py-2 bg-slate-900/80">
                  <div className="text-slate-400 mb-1">Profile Email Key</div>
                  <div className="font-mono text-sky-200 text-xs break-all">
                    {decodeURIComponent(email)}
                  </div>
                  <div className="text-[10px] mt-1 text-slate-400">
                    This URL can be shared as public profile.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* --------- GRAPHS + NUMERIC DETAIL (real industry style) --------- */}

        {/* Row 1: Tasks Snapshot + Meeting Attendance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Tasks Snapshot (Number based) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col lg:flex-row gap-4">
            <MiniStatList
              title="Tasks Snapshot"
              description="How many tasks this student has handled and their progress."
              items={[
                { label: "Total Assigned", value: taskStats.totalTasks, isKey: true },
                { label: "Completed", value: taskStats.completed },
                { label: "In Progress", value: taskStats.inProgress },
                {
                  label: "Pending / Overdue",
                  value: (taskStats.pending || 0) + (taskStats.overdue || 0),
                },
              ]}
            />
            {/* Chart side: Task Counts */}
            <div className="flex-1 min-h-[220px]">
                {/*  */}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#cbd5f5" }}
                    axisLine={{ stroke: "#475569" }}
                    tickLine={{ stroke: "#475569" }}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={{ stroke: "#475569" }} tickLine={{ stroke: "#475569" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #1e293b",
                      fontSize: 11,
                    }}
                    labelStyle={{ color: "#f9fafb", fontWeight: 700 }}
                    itemStyle={{ color: "#f9fafb", fontWeight: 600 }}
                  />
                  <Bar dataKey="value" fill="#38bdf8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Meeting Attendance (Number & Percentage combined with highlight) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col lg:flex-row gap-4">
            <MiniStatList
              title="Meeting Attendance"
              description="Behaviour in reviews / meetings with guide."
              percentageValue={{ 
                label: "Attendance Rate", 
                value: `${attendanceRate}%` 
              }} // Highlighted %
              items={[
                { label: "Total Meetings", value: meetingStats.totalMeetings, isKey: true },
                { label: "Attended", value: meetingStats.attended },
                { label: "Missed", value: meetingStats.missed },
              ]}
            />
            {/* Chart side: Meeting Counts */}
            <div className="flex-1 min-h-[220px]">
                {/*  */}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={meetingBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#cbd5f5" }}
                    axisLine={{ stroke: "#475569" }}
                    tickLine={{ stroke: "#475569" }}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={{ stroke: "#475569" }} tickLine={{ stroke: "#475569" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #1e293b",
                      fontSize: 11,
                    }}
                    labelStyle={{ color: "#f9fafb", fontWeight: 700 }}
                    itemStyle={{ color: "#f9fafb", fontWeight: 600 }}
                  />
                  <Bar dataKey="value">
                    {meetingBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 2: Project Experience + Task Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Project Experience (Number based) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col lg:flex-row gap-4">
            <MiniStatList
              title="Project Experience"
              description="Overall project exposure across different teams."
              items={[
                { label: "Total Projects", value: projectStats.totalProjects, isKey: true },
                { label: "Active Projects", value: projectStats.activeProjects },
                {
                  label: "Completed Projects",
                  value: projectStats.completedProjects,
                },
              ]}
            />
            {/* Chart side: Project Counts */}
            <div className="flex-1 min-h-[220px]">
                {/*  */}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#cbd5f5" }}
                    axisLine={{ stroke: "#475569" }}
                    tickLine={{ stroke: "#475569" }}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={{ stroke: "#475569" }} tickLine={{ stroke: "#475569" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #1e293b",
                      fontSize: 11,
                    }}
                    labelStyle={{ color: "#f9fafb", fontWeight: 700 }}
                    itemStyle={{ color: "#f9fafb", fontWeight: 600 }}
                  />
                  <Bar dataKey="value" fill="#a855f7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Task Distribution – Pie (Percentage based visually) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col lg:flex-row gap-4">
            <MiniStatList
              title="Task Distribution"
              description="Visual share of tasks in different states relative to total."
              percentageValue={{ 
                label: "Task Completion Rate", 
                value: `${taskCompletionRate}%` 
              }} // Highlighted %
              items={[
                { label: "Total Assigned", value: totalTasks, isKey: true },
                { label: "Completed", value: taskStats.completed },
                { label: "In Progress", value: taskStats.inProgress },
                {
                  label: "Pending / Overdue",
                  value: (taskStats.pending || 0) + (taskStats.overdue || 0),
                },
              ]}
            />
            {/* Chart side: Pie Chart */}
            <div className="flex-1 min-h-[220px] flex items-center justify-center">
                {/*  */}
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskPieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={85} // Slightly larger for better visual
                    fill="#8884d8"
                  >
                    {taskPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={TASK_COLORS[index % TASK_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #1e293b",
                      fontSize: 11,
                    }}
                    labelStyle={{ color: "#f9fafb", fontWeight: 700 }}
                    itemStyle={{ color: "#f9fafb", fontWeight: 600 }}
                    formatter={(value, name) => [value, name]}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: '10px' }}
                    formatter={(value) => (
                      <span className="text-[11px] text-slate-200 font-medium">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 3: Performance Indicators – FULL WIDTH (Percentage based) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col lg:flex-row gap-4 w-full">
          {/* Numeric card left */}
          <MiniStatList
            title="Overall Performance Score"
            description="Comparison of key productivity and engagement metrics in percentages."
            items={[
              {
                label: "Task Completion %",
                value: `${taskCompletionRate}%`,
                isKey: true
              },
              {
                label: "Attendance %",
                value: `${attendanceRate}%`,
                isKey: true
              },
            ]}
          />
          {/* Line chart right */}
          <div className="flex-1 min-h-[260px] lg:min-h-[320px]">
            {/*  */}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceLineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#cbd5f5" }}
                  axisLine={{ stroke: "#475569" }}
                  tickLine={{ stroke: "#475569" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  domain={[0, 100]}
                  label={{ value: 'Percentage', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
                  axisLine={{ stroke: "#475569" }}
                  tickLine={{ stroke: "#475569" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                    fontSize: 11,
                  }}
                  labelStyle={{ color: "#f9fafb", fontWeight: 700 }}
                  itemStyle={{ color: "#f9fafb", fontWeight: 600 }}
                  formatter={(value) => [`${value}%`, 'Value']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// NOTE: The `MiniStatList` function component has been moved above `UserProfile`
// in the provided code to satisfy the requirement of having a single file.