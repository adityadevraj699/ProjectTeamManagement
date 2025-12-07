// src/pages/UserProfile.jsx
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
} from "recharts";

const TASK_COLORS = ["#22c55e", "#0ea5e9", "#f97316"];

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

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900 text-sky-400 text-xl">
        Loading profile...
      </div>
    );

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
  const taskPieData = [
    { name: "Completed", value: taskStats.completed || 0 },
    { name: "In Progress", value: taskStats.inProgress || 0 },
    {
      name: "Pending / Overdue",
      value: (taskStats.pending || 0) + (taskStats.overdue || 0),
    },
  ];

  const performanceLineData = [
    {
      label: "Task Completion",
      value:
        totalTasks === 0
          ? 0
          : Math.round(((taskStats.completed || 0) / totalTasks) * 100),
    },
    {
      label: "Attendance",
      value: Math.round((meetingStats.attendanceRate || 0) * 100),
    },
  ];

  const fullStars = profile.ratingStars || 0;
  const emptyStars = 5 - fullStars;

  const display = (v, fallback = "-") =>
    v !== undefined && v !== null && String(v).trim() !== "" ? v : fallback;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-gray-100 px-4 py-8 w-full">
      <div className="max-w-5xl mx-auto space-y-6">
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

        {/* Main card */}
        <motion.div
          className="relative w-full overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 shadow-xl shadow-sky-900/40 p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* glow background */}
          <div
            className={`pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(129,140,248,0.18),_transparent_55%)]`}
          />

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

        {/* Stats + Graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left stat cards */}
          <div className="space-y-3">
            <StatCard
              title="Tasks Snapshot"
              subtitle="How many tasks this student has handled and their progress."
              items={[
                { label: "Total Assigned", value: taskStats.totalTasks },
                { label: "Completed", value: taskStats.completed },
                { label: "In Progress", value: taskStats.inProgress },
                {
                  label: "Pending / Overdue",
                  value:
                    (taskStats.pending || 0) + (taskStats.overdue || 0),
                },
              ]}
            />
            <StatCard
              title="Meeting Attendance"
              subtitle="Behaviour in reviews / meetings with guide."
              items={[
                { label: "Total Meetings", value: meetingStats.totalMeetings },
                { label: "Attended", value: meetingStats.attended },
                { label: "Missed", value: meetingStats.missed },
                {
                  label: "Attendance %",
                  value: `${Math.round(
                    (meetingStats.attendanceRate || 0) * 100
                  )}%`,
                },
              ]}
            />
            <StatCard
              title="Project Experience"
              subtitle="Overall project exposure across different teams."
              items={[
                { label: "Total Projects", value: projectStats.totalProjects },
                { label: "Active Projects", value: projectStats.activeProjects },
                {
                  label: "Completed Projects",
                  value: projectStats.completedProjects,
                },
              ]}
            />
          </div>

          {/* Middle pie chart */}
          <div className="lg:col-span-1 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col">
            <h3 className="text-sm font-semibold text-sky-100 mb-1">
              Task Distribution
            </h3>
            <p className="text-[11px] text-slate-400 mb-2">
              Visual view of tasks split into completed, in progress and pending
              / overdue.
            </p>
            <div className="flex-1 min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskPieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={75}
                    label
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
                    labelStyle={{ color: "#e5e7eb", fontWeight: 600 }}
                    itemStyle={{ color: "#f9fafb", fontWeight: 600 }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span className="text-[11px] text-slate-200">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right line chart */}
          <div className="lg:col-span-1 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col">
            <h3 className="text-sm font-semibold text-sky-100 mb-1">
              Performance Indicators
            </h3>
            <p className="text-[11px] text-slate-400 mb-2">
              Comparison of task completion rate vs meeting attendance.
            </p>
            <div className="flex-1 min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceLineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#cbd5f5" }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #1e293b",
                      fontSize: 11,
                    }}
                    labelStyle={{ color: "#e5e7eb", fontWeight: 600 }}
                    itemStyle={{ color: "#f9fafb", fontWeight: 600 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, subtitle, items }) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4">
      <h3 className="text-sm font-semibold text-sky-100 mb-0.5">{title}</h3>
      {subtitle && (
        <p className="text-[11px] text-slate-500 mb-2">{subtitle}</p>
      )}
      <dl className="space-y-1">
        {items.map((it) => (
          <div
            key={it.label}
            className="flex items-center justify-between text-[11px]"
          >
            <dt className="text-slate-400">{it.label}</dt>
            <dd className="font-semibold text-sky-200">
              {it.value !== undefined && it.value !== null ? it.value : "-"}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
