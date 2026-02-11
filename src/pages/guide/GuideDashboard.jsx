import React, { useEffect, useState, useMemo } from "react";
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
  FaUsers,
  FaProjectDiagram,
  FaTasks,
  FaCalendarCheck,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Marquee ke liye zaroori hai


const MeetingMarquee = ({ meetings }) => {
  const navigate = useNavigate();

  if (!meetings || meetings.length === 0) return null;

  const now = new Date();
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // 1. Future meetings aur Past missing MOM meetings filter karein
  const filteredMeetings = meetings.filter((m) => {
    const mDate = new Date(m.meetingDateTime);
    const isFuture = mDate > now;
    const isPastMissingMOM = mDate <= now && !m.momPresent;
    return isFuture || isPastMissingMOM;
  });

  if (filteredMeetings.length === 0) return null;

  // 2. Infinity Loop Content (Ensuring no gaps)
  const loopCount = filteredMeetings.length < 3 ? 4 : 2; 
  const loopedMeetings = Array(loopCount).fill(filteredMeetings).flat();

  return (
    <div className="relative z-10 w-full overflow-hidden py-1">
      {/* 🎇 Top Glow Line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-slate-700/40 to-transparent" />
      
      <div className="bg-transparent py-2 whitespace-nowrap relative">
        <motion.div
          initial={{ x: "0%" }}
          animate={{ x: `-${100 / loopCount}%` }} 
          transition={{ 
            repeat: Infinity, 
            /* 🚀 ULTRA SPEED: Multiplier 2 rakha hai (Smaller = Faster) 
               Math.max ensures it doesn't get too dizzying with very few items */
            duration: Math.max(loopedMeetings.length * 2, 8), 
            ease: "linear" 
          }}
          whileHover={{ animationPlayState: "paused" }} 
          className="inline-flex items-center gap-8"
        >
          {loopedMeetings.map((m, idx) => {
            const mDate = new Date(m.meetingDateTime);
            const isUrgent = mDate > now && mDate <= next24Hours;
            const isMissedMOM = mDate <= now && !m.momPresent;

            let bgColor = "bg-slate-900/50";
            let textColor = "text-sky-400";
            let borderColor = "border-slate-800";
            let label = "Upcoming";

            if (isMissedMOM) {
              bgColor = "bg-amber-500/15";
              textColor = "text-amber-500";
              borderColor = "border-amber-500/30";
              label = "MOM PENDING";
            } else if (isUrgent) {
              bgColor = "bg-rose-500/15";
              textColor = "text-rose-500";
              borderColor = "border-rose-500/30";
              label = "DUE SOON";
            }

            return (
              <div 
                key={`${m.id}-${idx}`} 
                onClick={() => navigate(`/guide/meeting/${m.id}`)}
                className={`flex-shrink-0 flex items-center gap-3 cursor-pointer ${bgColor} px-5 py-1.5 rounded-full border ${borderColor} transition-all duration-300 group/item hover:border-white/40 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]`}
              >
                <div className="flex items-center justify-center">
                   <span className={`h-2 w-2 rounded-full ${
                     isMissedMOM ? "bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]" : 
                     isUrgent ? "bg-rose-500 animate-pulse shadow-[0_0_8px_#ef4444]" : 
                     "bg-sky-500"
                   }`} />
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black uppercase tracking-tighter ${textColor}`}>
                    {label}
                  </span>
                  <span className="text-slate-700 font-thin">|</span>
                  <p className="text-xs font-bold flex items-center gap-2">
                    <span className="text-slate-100 group-hover/item:text-white transition-colors tracking-tight">
                      {m.title}
                    </span> 
                    <span className="text-slate-500 font-medium text-[10px]">
                      {mDate.toLocaleString('en-IN', { 
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                      })}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* 🌫️ Seamless Edge Fades */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent pointer-events-none z-20" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-950 via-slate-950/40 to-transparent pointer-events-none z-20" />

      {/* 🎇 Bottom Glow Line */}
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-slate-700/40 to-transparent" />
    </div>
  );
};

// 💀 Sophisticated Skeleton Loader Component
const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-950 px-6 pt-6 pb-8 space-y-8 font-sans selection:bg-sky-500/30">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-[88px] bg-slate-900/80 border border-slate-800 rounded-3xl p-4 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-800" />
              <div className="space-y-2">
                <div className="w-24 h-3 bg-slate-800 rounded" />
                <div className="w-16 h-2 bg-slate-800/50 rounded" />
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

        {/* Charts Container Skeleton */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 h-[600px] animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-slate-800/30 rounded-xl border border-slate-700/30 h-full p-4 flex flex-col gap-4">
                 <div className="flex justify-between">
                   <div className="w-32 h-5 bg-slate-700/50 rounded" />
                   <div className="w-16 h-5 bg-slate-700/50 rounded" />
                 </div>
                 {/* Chart Placeholder Area */}
                 <div className="flex-1 flex items-end justify-center gap-2 px-8 pb-4">
                    <div className="w-full h-[60%] bg-slate-700/20 rounded-t-lg" />
                    <div className="w-full h-[80%] bg-slate-700/20 rounded-t-lg" />
                    <div className="w-full h-[40%] bg-slate-700/20 rounded-t-lg" />
                    <div className="w-full h-[70%] bg-slate-700/20 rounded-t-lg" />
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const COLORS = [
  "#38bdf8",
  "#6366f1",
  "#22c55e",
  "#eab308",
  "#f97316",
  "#ec4899",
  "#a855f7",
];

const mapToChartArray = (mapObj) =>
  Object.entries(mapObj || {}).map(([name, value]) => ({ name, value }));

const formatNumber = (num) => {
  if (num == null) return "0";
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
};

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

const SLIDE_COUNT = 2; 

export default function GuideDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Section filters
  const [sectionFilters, setSectionFilters] = useState({
    course: "ALL",
    branch: "ALL",
    semester: "ALL",
  });

  const sectionDetailed = stats?.studentsBySectionDetailed || [];

  const studentsBySectionFiltered = useMemo(() => {
    const map = new Map();

    sectionDetailed.forEach((s) => {
      if (
        (sectionFilters.course !== "ALL" && s.courseName !== sectionFilters.course) ||
        (sectionFilters.branch !== "ALL" && s.branchName !== sectionFilters.branch) ||
        (sectionFilters.semester !== "ALL" && s.semesterName !== sectionFilters.semester)
      ) return;

      map.set(s.sectionName, {
        name: s.sectionName,
        value: (map.get(s.sectionName)?.value || 0) + 1,
      });
    });

    return Array.from(map.values());
  }, [sectionDetailed, sectionFilters]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const token = localStorage.getItem("token");
  const axiosConfig = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);
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
        `${import.meta.env.VITE_API_URL}/guide/dashboard`,
        axiosConfig
      );
      setStats(res.data);
      console.log("Guide dashboard data:", res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load guide dashboard", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDE_COUNT);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay]);

  const handleSummaryClick = (type) => {
    switch (type) {
      case "students": navigate("/guide/add-student"); break;
      case "teams": navigate("/guide/team"); break;
      case "projects": navigate("/guide/reports"); break;
      case "tasks": navigate("/guide/tasks"); break;
      case "meetings": navigate("/guide/meetings"); break;
      default: break;
    }
  };

  /* ---------------------- 💀 Use Skeleton Loader ---------------------- */
  if (loading || !stats) {
    return <DashboardSkeleton />;
  }

  // ---- Chart data ----
  const studentsByCourse = mapToChartArray(stats.studentsByCourse);
  const studentsByBranch = mapToChartArray(stats.studentsByBranch);
  const studentsBySemester = mapToChartArray(stats.studentsBySemester);
  const projectsByStatus = mapToChartArray(stats.projectsByStatus);
  const tasksByStatus = mapToChartArray(stats.tasksByStatus);
  const tasksByPriority = mapToChartArray(stats.tasksByPriority);
  const meetingsByStatus = mapToChartArray(stats.meetingsByStatus);
  const meetingsByMode = mapToChartArray(stats.meetingsByMode);

  const tasksStatusLineData = tasksByStatus;

  const goToNextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDE_COUNT);
  const goToPrevSlide = () => setCurrentSlide((prev) => (prev - 1 + SLIDE_COUNT) % SLIDE_COUNT);

  const slideTitle = currentSlide === 0 ? "Project, Task & Meeting Overview" : "Student Insights";
  const slideSubtitle = currentSlide === 0 
    ? "Your projects, tasks and meetings at a glance." 
    : "Course, branch, semester & section distribution for your mentees.";

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 font-sans selection:bg-sky-500/30">
      
      {/* Gradient header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 via-emerald-400/10 to-fuchsia-500/10 blur-3xl opacity-70 pointer-events-none" />
        <header className="relative px-6 pt-6 pb-3 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-200 tracking-wide">
                Guide · Project Insights
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-sky-100 tracking-tight">
              My Project Space
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Track your teams, students, projects, meetings & tasks – all in one focused dashboard.
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
              Updated just now • Guide view
            </span>
          </div>
        </header>
      </div>

      {/* Marquee with real data integration */}
    <MeetingMarquee meetings={stats?.upcomingMeetings} />

      <main className="px-6 pb-8 pt-2 space-y-6">
        {/* Top summary cards */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            <SummaryCard
              label="Students under me"
              value={stats.totalStudents}
              icon={<FaUserGraduate className="w-5 h-5" />}
              accent="from-sky-500/20 to-emerald-500/10"
              chip="Active mentees"
              onClick={() => handleSummaryClick("students")}
            />
            <SummaryCard
              label="My Teams"
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
              chip="Assigned projects"
              onClick={() => handleSummaryClick("projects")}
            />
            <SummaryCard
              label="Tasks"
              value={stats.totalTasks}
              icon={<FaTasks className="w-5 h-5" />}
              accent="from-yellow-500/20 to-orange-500/10"
              chip="Across all teams"
              onClick={() => handleSummaryClick("tasks")}
            />
            <SummaryCard
              label="Meetings"
              value={stats.totalMeetings}
              icon={<FaCalendarCheck className="w-5 h-5" />}
              accent="from-cyan-500/20 to-violet-500/10"
              chip="Scheduled / completed"
              onClick={() => handleSummaryClick("meetings")}
            />
          </div>
        </section>

        {/* 🔹 MAIN SLIDER */}
        <section className="mt-2 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-sky-200">
                {slideTitle}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {slideSubtitle}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] border ${autoPlay ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-200" : "bg-slate-800/70 border-slate-600 text-slate-200"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${autoPlay ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`} />
                {autoPlay ? "Auto sliding" : "Manual mode"}
              </span>

              <button onClick={() => setAutoPlay((prev) => !prev)} className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-[11px] text-slate-100 hover:border-sky-500 hover:bg-slate-800 transition">
                {autoPlay ? "Pause slider" : "Play slider"}
              </button>

              <div className="flex items-center gap-1">
                <button onClick={goToPrevSlide} className="px-2 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-200 hover:border-sky-500 hover:bg-slate-800 transition">◀</button>
                <button onClick={goToNextSlide} className="px-2 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-200 hover:border-sky-500 hover:bg-slate-800 transition">▶</button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-2xl border border-sky-500/10 shadow-xl shadow-sky-500/15 overflow-hidden">
            <div className="p-4">
              {/* Slide 0 – Projects, Tasks, Priority, Meetings */}
              {currentSlide === 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <ChartCard title="Projects by Status" subtitle="Health of your assigned projects" badge={stats.totalProjects ? `${stats.totalProjects} projects` : ""}>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={projectsByStatus} dataKey="value" nameKey="name" outerRadius={90} label>
                          {projectsByStatus.map((entry, index) => <Cell key={`proj-pie-${entry.name}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="Tasks by Status" subtitle="Pending, in-progress, completed tasks" badge={stats.totalTasks ? `${stats.totalTasks} tasks` : ""}>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={tasksByStatus} dataKey="value" nameKey="name" outerRadius={90} label>
                          {tasksByStatus.map((entry, index) => <Cell key={`taskstat-pie-${entry.name}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="Tasks by Priority" subtitle="Load split into Low / Medium / High / Critical">
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={tasksStatusLineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="mt-3 h-[130px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={tasksByPriority}>
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                          <YAxis tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value">
                            {tasksByPriority.map((entry, index) => <Cell key={`prio-bar-${index}`} fill={COLORS[index % COLORS.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>

                  <ChartCard title="Meetings Overview" subtitle="Status & mode of your meetings" badge={stats.totalMeetings ? `${stats.totalMeetings} meetings` : ""}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={meetingsByStatus} dataKey="value" nameKey="name" outerRadius={70} label>
                            {meetingsByStatus.map((entry, index) => <Cell key={`meetstat-pie-${entry.name}`} fill={COLORS[index % COLORS.length]} />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={meetingsByMode}>
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                          <YAxis tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value">
                            {meetingsByMode.map((entry, index) => <Cell key={`meetmode-bar-${index}`} fill={COLORS[index % COLORS.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>
                </div>
              )}

              {/* Slide 1 – Students */}
              {currentSlide === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <ChartCard title="Students by Course" subtitle="Course-wise distribution under your guidance">
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={studentsByCourse}>
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value">{studentsByCourse.map((entry, index) => <Cell key={`course-bar-${index}`} fill={COLORS[index % COLORS.length]} />)}</Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="Students by Branch" subtitle="See how your students are split by branch">
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={studentsByBranch}>
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value">{studentsByBranch.map((entry, index) => <Cell key={`branch-bar-${index}`} fill={COLORS[index % COLORS.length]} />)}</Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="Students by Semester" subtitle="Semester-wise load under you">
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={studentsBySemester}>
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value">{studentsBySemester.map((entry, index) => <Cell key={`sem-bar-${index}`} fill={COLORS[index % COLORS.length]} />)}</Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                  
                  <ChartCard title="Students by Section" subtitle="Section-wise student split (Course / Branch / Semester filter)">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <select value={sectionFilters.course} onChange={(e) => setSectionFilters((f) => ({ ...f, course: e.target.value }))} className="bg-slate-800 text-xs px-2 py-1 rounded border border-slate-600 text-slate-200 outline-none focus:border-sky-500">
                        <option value="ALL">All Courses</option>
                        {[...new Set(sectionDetailed.map(s => s.courseName))].map(course => <option key={course} value={course}>{course}</option>)}
                      </select>
                      <select value={sectionFilters.branch} onChange={(e) => setSectionFilters((f) => ({ ...f, branch: e.target.value }))} className="bg-slate-800 text-xs px-2 py-1 rounded border border-slate-600 text-slate-200 outline-none focus:border-sky-500">
                        <option value="ALL">All Branches</option>
                        {[...new Set(sectionDetailed.map(s => s.branchName))].map(branch => <option key={branch} value={branch}>{branch}</option>)}
                      </select>
                      <select value={sectionFilters.semester} onChange={(e) => setSectionFilters((f) => ({ ...f, semester: e.target.value }))} className="bg-slate-800 text-xs px-2 py-1 rounded border border-slate-600 text-slate-200 outline-none focus:border-sky-500">
                        <option value="ALL">All Semesters</option>
                        {[...new Set(sectionDetailed.map(s => s.semesterName))].map(sem => <option key={sem} value={sem}>{sem}</option>)}
                      </select>
                    </div>

                    {studentsBySectionFiltered.length === 0 ? (
                      <div className="flex items-center justify-center h-[260px] text-sm text-slate-400">No section data available</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={studentsBySectionFiltered}>
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#e5e7eb" }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" radius={[6, 6, 0, 0]}>{studentsBySectionFiltered.map((entry, index) => <Cell key={`sec-bar-${entry.name}`} fill={COLORS[index % COLORS.length]} />)}</Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </ChartCard>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 pb-3">
              {Array.from({ length: SLIDE_COUNT }).map((_, idx) => (
                <button key={idx} onClick={() => setCurrentSlide(idx)} className={`w-2.5 h-2.5 rounded-full transition ${currentSlide === idx ? "bg-sky-400" : "bg-slate-600"}`} />
              ))}
            </div>
          </div>
        </section>

        {/* Team relation table */}
        <section>
          <div className="bg-slate-900/80 rounded-2xl border border-sky-500/10 shadow-xl shadow-sky-500/20 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-semibold text-sky-300">Teams & Project Activity</h2>
                <p className="text-xs text-slate-400 mt-0.5">How each team is performing under your guidance.</p>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-200 border border-sky-500/30">{stats.teamSummaries?.length || 0} teams</span>
            </div>

            <div className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700/80 scrollbar-track-transparent">
              <table className="w-full text-sm">
                <thead className="text-[11px] text-gray-400 sticky top-0 bg-slate-900/90 backdrop-blur z-10">
                  <tr>
                    <th className="py-2 px-2 text-left font-medium">Team</th>
                    <th className="py-2 px-2 text-left font-medium">Project</th>
                    <th className="py-2 px-2 text-right font-medium">Students</th>
                    <th className="py-2 px-2 text-right font-medium">Tasks</th>
                    <th className="py-2 px-2 text-right font-medium">Meetings</th>
                    <th className="py-2 px-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!stats.teamSummaries || stats.teamSummaries.length === 0 ? (
                    <tr><td className="py-4 px-2 text-center text-gray-500" colSpan={6}>No team data available.</td></tr>
                  ) : (
                    stats.teamSummaries.map((t) => (
                      <tr key={t.teamId} className="border-t border-slate-800 hover:bg-slate-800/60 transition">
                        <td className="py-2 px-2 text-slate-100 font-medium">{t.teamName || "-"}</td>
                        <td className="py-2 px-2 text-slate-300">{t.projectTitle || "-"}</td>
                        <td className="py-2 px-2 text-right">{t.studentCount}</td>
                        <td className="py-2 px-2 text-right">{t.taskCount}</td>
                        <td className="py-2 px-2 text-right">{t.meetingCount}</td>
                        <td className="py-2 px-2 text-right">
                          <button onClick={() => navigate(`/guide/TeamDetail/${t.teamId}`)} className="text-[11px] px-3 py-1 rounded-full bg-sky-500/10 text-sky-200 border border-sky-500/40 hover:bg-sky-500/20 transition">View team</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function SummaryCard({ label, value, icon, accent, chip, onClick }) {
  const clickable = !!onClick;
  return (
    <div className="relative group">
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-100 blur-xl transition duration-300`} />
      <div onClick={onClick} className={`relative bg-slate-900/80 rounded-3xl border border-sky-500/10 px-4 py-3 flex flex-col gap-2 shadow-lg shadow-sky-500/10 ${clickable ? "hover:shadow-sky-500/30 hover:-translate-y-1 cursor-pointer" : ""} transition`}>
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

function ChartCard({ title, subtitle, badge, children }) {
  return (
    <div className="bg-slate-900/80 rounded-2xl border border-sky-500/10 shadow-lg shadow-sky-500/15 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div>
          <h2 className="text-base font-semibold text-sky-200">{title}</h2>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {badge && <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-600">{badge}</span>}
      </div>
      <div className="flex-1 min-h-[220px]">{children}</div>
    </div>
  );
}