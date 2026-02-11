import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiUserAdd, 
  HiTrash, 
  HiCode,
  HiCalendar,
  HiCheckCircle,
  HiPlus,
  HiOfficeBuilding, 
  HiAcademicCap, 
  HiUserGroup,
  HiOfficeBuilding as HiBranch,
  HiAcademicCap as HiSemester,
  HiUserGroup as HiSection
} from "react-icons/hi";

// 🔄 Reusable High-End Loader Overlay (For Submitting)
const LoaderOverlay = ({ message }) => (
  <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[100] backdrop-blur-xl transition-all duration-300">
    <div className="relative w-24 h-24">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-700 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-t-4 border-sky-500 rounded-full animate-spin"></div>
    </div>
    <p className="mt-6 text-sky-400 text-lg font-bold tracking-widest uppercase animate-pulse">{message || "Loading..."}</p>
  </div>
);

// 💀 Team Management Page Skeleton Loader
const TeamManagementSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#0b1120] p-4 md:p-8 font-sans relative animate-pulse">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Skeleton */}
        <div className="space-y-3 pt-4">
          <div className="h-8 w-64 bg-slate-800 rounded-lg"></div>
          <div className="h-4 w-96 bg-slate-800/50 rounded"></div>
        </div>

        {/* Project Details Skeleton */}
        <div className="bg-slate-800/60 border border-slate-700/60 p-8 rounded-3xl space-y-6">
          <div className="h-6 w-40 bg-slate-700/80 rounded"></div>
          <div className="h-10 w-full bg-slate-700/50 rounded-xl"></div>
          <div className="h-20 w-full bg-slate-700/50 rounded-xl"></div>
          <div className="grid grid-cols-2 gap-6">
            <div className="h-10 bg-slate-700/50 rounded-xl"></div>
            <div className="h-10 bg-slate-700/50 rounded-xl"></div>
            <div className="h-10 w-full bg-slate-700/50 rounded-xl"></div>
            <div className="h-10 w-full bg-slate-700/50 rounded-xl"></div>
          </div>
        </div>

        {/* Team Members Skeleton */}
        <div className="bg-slate-800/60 border border-slate-700/60 p-8 rounded-3xl space-y-6">
          <div className="h-6 w-48 bg-slate-700/80 rounded"></div>
          <div className="h-10 w-32 bg-slate-700/50 rounded-xl mb-4"></div>
          
          {/* Member Row Skeleton */}
          {[1, 2].map((i) => (
            <div key={i} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 space-y-4">
              <div className="h-4 w-24 bg-slate-700/50 rounded"></div>
              <div className="grid grid-cols-4 gap-4">
                <div className="h-10 bg-slate-700/30 rounded-lg"></div>
                <div className="h-10 bg-slate-700/30 rounded-lg"></div>
                <div className="h-10 bg-slate-700/30 rounded-lg"></div>
                <div className="h-10 bg-slate-700/30 rounded-lg"></div>
              </div>
              <div className="h-10 w-full bg-slate-700/30 rounded-lg"></div>
            </div>
          ))}
        </div>

        {/* Submit Button Skeleton */}
        <div className="flex justify-end">
          <div className="h-12 w-56 bg-emerald-600/50 rounded-xl"></div>
        </div>

      </div>
    </div>
  );
};

// ✅ Component for a single team member input row
const TeamMemberInput = ({
  member,
  index,
  handleChange,
  removeMember,
  canRemove,
  branches,
  semesters,
  sections,
  token,
}) => {
const handleEmailBlur = async (email) => {
  if (!email) return;

  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/check-email`, {
      params: { email },
      headers: { Authorization: `Bearer ${token}` },
    });

    const { exists, isStudent, data } = res.data;
    if (!exists) return;

    if (isStudent) {
      const perf = data.performance || {};
      const score = perf.score || 0;
      const attendance = perf.attendanceRate || 0;
      const reliabilityIndex = perf.reliabilityIndex || 0;
      
      // ⭐ Star Rating Logic (0-5 scale from backend)
      const starsCount = perf.stars || 0;
      const starsHTML = `<span style="color: #f59e0b; font-size: 1.5rem;">${"★".repeat(starsCount)}${"☆".repeat(5 - starsCount)}</span>`;
      
      const statusColor = score >= 7.5 ? "#10b981" : score >= 5 ? "#f59e0b" : "#ef4444";

      await Swal.fire({
        title: null,
        background: "#0b1120",
        color: "#fff",
        width: '95vw',
        padding: '0',
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-[24px] border border-slate-700/50 shadow-2xl overflow-hidden',
        },
        html: `
          <div style="display: flex; flex-direction: row; height: 500px; font-family: 'Inter', sans-serif; overflow: hidden;">
            
            <div style="flex: 0.3; background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); padding: 40px; border-right: 1px solid #334155; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
              <div style="position: relative; margin-bottom: 20px;">
                <svg width="150" height="150" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" stroke="#0f172a" stroke-width="8" fill="transparent" />
                  <circle cx="50" cy="50" r="45" stroke="${statusColor}" stroke-width="8" fill="transparent" 
                    stroke-dasharray="283" stroke-dashoffset="${283 - (283 * score / 10)}" 
                    stroke-linecap="round" style="transition: stroke-dashoffset 2s ease;" />
                </svg>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                  <span style="font-size: 2.5rem; font-weight: 900; color: #fff;">${score.toFixed(1)}</span>
                </div>
              </div>
              <h3 style="margin: 0; font-size: 1.8rem; font-weight: 800;">${data.name}</h3>
              <p style="color: #64748b; font-size: 1rem; margin: 5px 0 15px 0;">Roll: ${data.rollNumber}</p>
              
              <div style="margin-bottom: 10px;">${starsHTML}</div>
              <p style="color: #94a3b8; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px;">Expert Reliability Stars</p>

              <div style="margin-top: 20px; background: ${statusColor}20; color: ${statusColor}; padding: 8px 25px; border-radius: 99px; font-size: 0.8rem; font-weight: 800; border: 1px solid ${statusColor}40;">
                ${perf.experienceLevel || 'QUALIFIED RESEARCHER'}
              </div>
            </div>

            <div style="flex: 0.7; padding: 40px; background: #0b1120; display: flex; flex-direction: column; justify-content: space-between;">
              
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <h4 style="margin: 0; font-size: 1rem; text-transform: uppercase; letter-spacing: 3px; color: #0ea5e9;">Research Intelligence Analysis</h4>
                  <p style="margin: 5px 0 0 0; color: #475569; font-size: 0.9rem;">Analytical data mapped to SDG-4 (Quality Education) Standards.</p>
                </div>
                <div style="background: rgba(14, 165, 233, 0.1); padding: 12px 25px; border-radius: 16px; border: 1px solid rgba(14, 165, 233, 0.2); text-align: right;">
                   <span style="display: block; font-size: 0.7rem; color: #0ea5e9; text-transform: uppercase; font-weight: 800; margin-bottom: 2px;">Reliability Index</span>
                   <span style="font-size: 1.8rem; font-weight: 900; color: #0ea5e9;">${reliabilityIndex}%</span>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div style="background: rgba(30, 41, 59, 0.3); padding: 20px; border-radius: 20px; border: 1px solid #1e293b;">
                   <span style="display: block; font-size: 0.7rem; color: #64748b; text-transform: uppercase; margin-bottom: 12px; font-weight: 700;">Meeting Attendance</span>
                   <div style="display: flex; align-items: center; gap: 15px;">
                      <div style="flex: 1; height: 10px; background: #0f172a; border-radius: 10px; overflow: hidden;">
                         <div style="width: ${attendance}%; height: 100%; background: linear-gradient(90deg, #0ea5e9, #2dd4bf);"></div>
                      </div>
                      <span style="font-size: 1.1rem; font-weight: 800; color: #fff;">${attendance.toFixed(0)}%</span>
                   </div>
                </div>
                <div style="background: rgba(30, 41, 59, 0.3); padding: 20px; border-radius: 20px; border: 1px solid #1e293b;">
                   <span style="display: block; font-size: 0.7rem; color: #64748b; text-transform: uppercase; margin-bottom: 8px; font-weight: 700;">Contribution History</span>
                   <div style="display: flex; align-items: baseline; gap: 8px;">
                      <span style="font-size: 1.8rem; font-weight: 900; color: #10b981;">${perf.totalProjects}</span>
                      <span style="font-size: 0.9rem; color: #64748b;">Previous Projects</span>
                   </div>
                </div>
              </div>

              <div style="background: rgba(15, 23, 42, 0.4); padding: 25px; border-radius: 20px; border: 1px solid #1e293b; display: grid; grid-template-columns: 1fr 1fr 1fr; text-align: center;">
                 <div style="border-right: 1px solid #334155;">
                    <span style="display: block; font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px;">Tasks Completed</span>
                    <span style="font-size: 1.6rem; font-weight: 800; color: #fff;">${perf.tasksCompleted}</span>
                 </div>
                 <div style="border-right: 1px solid #334155;">
                    <span style="display: block; font-size: 0.65rem; color: #ef4444; text-transform: uppercase; margin-bottom: 5px;">Overdue Alerts</span>
                    <span style="font-size: 1.6rem; font-weight: 800; color: #ef4444;">${perf.overdueCount}</span>
                 </div>
                 <div>
                    <span style="display: block; font-size: 0.65rem; color: #10b981; text-transform: uppercase; margin-bottom: 5px;">Work Efficiency</span>
                    <span style="font-size: 1.3rem; font-weight: 800; color: #10b981;">${perf.taskEfficiency || 'Steady'}</span>
                 </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #1e293b; padding-top: 25px;">
                <div style="font-size: 0.9rem; color: #94a3b8; font-style: italic; max-width: 450px;">
                   "Insight: ${perf.tagline}"
                </div>
                <div style="display: flex; gap: 15px;">
                  <button id="swal-cancel" style="padding: 12px 30px; background: transparent; color: #94a3b8; border: 1px solid #334155; border-radius: 12px; cursor: pointer; font-weight: 600;">Decline</button>
                  <button id="swal-confirm" style="padding: 12px 40px; background: #0ea5e9; color: #fff; border: none; border-radius: 12px; cursor: pointer; font-weight: 800; box-shadow: 0 10px 20px -10px rgba(14, 165, 233, 0.5);">Recruit Student</button>
                </div>
              </div>

            </div>
          </div>
        `,
        didOpen: () => {
          document.getElementById('swal-confirm').onclick = () => Swal.clickConfirm();
          document.getElementById('swal-cancel').onclick = () => Swal.clickDeny();
        }
      }).then((result) => {
        if (result.isConfirmed) {
          handleChange(index, "name", data.name);
          handleChange(index, "rollNumber", data.rollNumber);
          handleChange(index, "branchId", data.branchId);
          handleChange(index, "semesterId", data.semesterId);
          handleChange(index, "sectionId", data.sectionId);
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Non-Student Role',
        text: "Only students can be assigned to research project teams.",
        background: "#0b1120",
        color: "#fff",
        confirmButtonColor: "#0ea5e9"
      });
    }
  } catch (err) {
    console.error("Profile Retrieval Error:", err);
  }
};

  return (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 mb-4 transition-all hover:border-sky-500/50"
    >
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
            <HiUserGroup className="text-sky-500"/> Member {index + 1}
        </h4>
        {canRemove && (
          <button
            type="button"
            onClick={() => removeMember(index)}
            className="text-rose-400 hover:text-rose-500 transition-colors p-1"
            title="Remove Member"
          >
            <HiTrash className="text-lg" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <input
          type="email"
          placeholder="Email Address"
          value={member.email}
          onChange={(e) => handleChange(index, "email", e.target.value)}
          onBlur={(e) => handleEmailBlur(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none placeholder-slate-600"
          required
        />
        <input
          type="text"
          placeholder="Full Name"
          value={member.name}
          onChange={(e) => handleChange(index, "name", e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none placeholder-slate-600"
          required
        />
        <input
          type="text"
          placeholder="Roll Number"
          value={member.rollNumber}
          onChange={(e) => handleChange(index, "rollNumber", e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none placeholder-slate-600"
          required
        />
        <input
          type="text"
          placeholder="Project Role"
          value={member.role}
          onChange={(e) => handleChange(index, "role", e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none placeholder-slate-600"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <select
          value={member.branchId || ""}
          onChange={(e) => handleChange(index, "branchId", e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
          required
        >
          <option value="">Select Branch</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.branchName}
            </option>
          ))}
        </select>

        <select
          value={member.semesterId || ""}
          onChange={(e) => handleChange(index, "semesterId", e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
          required
        >
          <option value="">Select Semester</option>
          {semesters.map((s) => (
            <option key={s.id} value={s.id}>
              {s.semesterName}
            </option>
          ))}
        </select>

        <select
          value={member.sectionId || ""}
          onChange={(e) => handleChange(index, "sectionId", e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
          required
        >
          <option value="">Select Section</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.sectionName}
            </option>
          ))}
        </select>
      </div>

      <label className="inline-flex items-center gap-2 cursor-pointer group">
        <input
          type="checkbox"
          checked={member.isLeader}
          onChange={(e) => handleChange(index, "isLeader", e.target.checked)}
          className="w-4 h-4 rounded border-slate-600 text-sky-600 focus:ring-sky-500 bg-slate-800"
        />
        <span className={`text-sm font-medium transition-colors ${member.isLeader ? "text-sky-400" : "text-slate-400 group-hover:text-slate-300"}`}>
          Assign as Team Leader
        </span>
      </label>
    </motion.div>
  );
};

// ✅ Main Team Management Component
export default function TeamManagement() {
  const [project, setProject] = useState({
    title: "",
    description: "",
    technologies: "",
    startDate: "",
    endDate: "",
  });
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState([
    {
      name: "",
      email: "",
      rollNumber: "",
      role: "",
      isLeader: false,
      branchId: "",
      semesterId: "",
      sectionId: "",
    },
  ]);
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // new form loading

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bRes, sRes, secRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/branches`, axiosConfig),
          axios.get(`${import.meta.env.VITE_API_URL}/semesters`, axiosConfig),
          axios.get(`${import.meta.env.VITE_API_URL}/sections`, axiosConfig),
        ]);
        setBranches(bRes.data);
        setSemesters(sRes.data);
        setSections(secRes.data);
      } catch {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load academic data',
            background: '#1e293b',
            color: '#fff'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleProjectChange = (field, value) =>
    setProject({ ...project, [field]: value });

  const handleMemberChange = (index, field, value) => {
    const updated = [...members];
    if (field === "isLeader" && value)
      updated.forEach((m, i) => (m.isLeader = i === index));
    updated[index][field] = value;
    setMembers(updated);
  };

  const addMember = () =>
    setMembers([
      ...members,
      {
        name: "",
        email: "",
        rollNumber: "",
        role: "",
        isLeader: false,
        branchId: "",
        semesterId: "",
        sectionId: "",
      },
    ]);

  const removeMember = (index) =>
    setMembers(members.filter((_, i) => i !== index));

  const validateForm = () => {
    if (!project.title || !teamName) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Info',
        text: 'Project title & Team name are required.',
        background: '#1e293b',
        color: '#fff'
      });
      return false;
    }
    if (members.filter((m) => m.isLeader).length !== 1) {
        Swal.fire({
            icon: 'warning',
            title: 'Leader Required',
            text: 'Please select exactly one team leader.',
            background: '#1e293b',
            color: '#fff'
        });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true); // start loader

    const payload = {
      projectTitle: project.title,
      description: project.description,
      technologiesUsed: project.technologies,
      startDate: project.startDate || null,
      endDate: project.endDate || null,
      teamName,
      members: members.map((m) => ({
        name: m.name,
        email: m.email,
        rollNumber: m.rollNumber,
        role: m.role,
        isLeader: m.isLeader,
        branchId: m.branchId,
        semesterId: m.semesterId,
        sectionId: m.sectionId,
      })),
    };

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/guide/teams`,
        payload,
        axiosConfig
      );
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Project & Team created successfully.',
        background: '#1e293b',
        color: '#fff',
        timer: 2000,
        showConfirmButton: false
      });
      // Reset form (Optional: reset to default state)
      setProject({
        title: "",
        description: "",
        technologies: "",
        startDate: "",
        endDate: "",
      });
      setTeamName("");
      setMembers([
        {
          name: "",
          email: "",
          rollNumber: "",
          role: "",
          isLeader: false,
          branchId: "",
          semesterId: "",
          sectionId: "",
        },
      ]);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data || "Something went wrong",
        background: '#1e293b',
        color: '#fff'
      });
    } finally {
      setSubmitting(false); // stop loader
    }
  };

  if (loading) return <LoaderOverlay message="Initializing..." />; // Should use Skeleton here

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-200 p-4 md:p-8 font-sans selection:bg-sky-500/30">
      {submitting && <LoaderOverlay message="Creating Project & Team..." />}

      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <HiUserGroup className="text-sky-500" /> Create Project & Team
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Define project scope and assemble your team roster.</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Project Details Section */}
          <div className="bg-slate-800/60 border border-slate-700/60 backdrop-blur-xl p-8 rounded-3xl shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-700/50 pb-4">
              <HiCode className="text-sky-400"/> Project Details
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Project Title</label>
                <input
                  type="text"
                  placeholder="Enter project title..."
                  value={project.title}
                  onChange={(e) => handleProjectChange("title", e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all placeholder-slate-600"
                  required
                />
              </div>

              <div>
                 <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Description</label>
                 <textarea
                   placeholder="Project description..."
                   value={project.description}
                   onChange={(e) => handleProjectChange("description", e.target.value)}
                   className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all placeholder-slate-600 min-h-[100px]"
                 />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Technologies</label>
                   <input
                     type="text"
                     placeholder="e.g. React, Node.js..."
                     value={project.technologies}
                     onChange={(e) => handleProjectChange("technologies", e.target.value)}
                     className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all placeholder-slate-600"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Team Name</label>
                   <input
                     type="text"
                     placeholder="Enter team name"
                     value={teamName}
                     onChange={(e) => setTeamName(e.target.value)}
                     className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all placeholder-slate-600"
                     required
                   />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide flex items-center gap-2"><HiCalendar/> Start Date</label>
                     <input
                       type="date"
                       value={project.startDate}
                       onChange={(e) => handleProjectChange("startDate", e.target.value)}
                       className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all uppercase text-sm"
                       min={new Date().toISOString().split("T")[0]}
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide flex items-center gap-2"><HiCalendar/> End Date</label>
                     <input
                       type="date"
                       value={project.endDate}
                       onChange={(e) => handleProjectChange("endDate", e.target.value)}
                       className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all uppercase text-sm"
                       min={project.startDate || new Date().toISOString().split("T")[0]}
                     />
                  </div>
              </div>
            </div>
          </div>

          {/* Team Members Section */}
          <div className="bg-slate-800/60 border border-slate-700/60 backdrop-blur-xl p-8 rounded-3xl shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b border-slate-700/50 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <HiUserAdd className="text-emerald-400"/> Team Members
              </h2>
              <button
                type="button"
                onClick={addMember}
                className="flex items-center gap-2 bg-sky-600/10 text-sky-400 px-4 py-2 rounded-lg hover:bg-sky-600/20 transition-colors font-medium text-sm border border-sky-600/20"
              >
                <HiPlus className="text-lg"/> Add Member
              </button>
            </div>
            
            <div className="space-y-4">
              {members.map((member, idx) => (
                <TeamMemberInput
                  key={idx}
                  member={member}
                  index={idx}
                  handleChange={handleMemberChange}
                  removeMember={removeMember}
                  canRemove={members.length > 1}
                  branches={branches}
                  semesters={semesters}
                  sections={sections}
                  token={token}
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={submitting}
              className={`px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2 ${submitting ? "opacity-50 cursor-not-allowed" : "active:scale-95"}`}
            >
              {submitting ? <Spinner /> : <HiCheckCircle className="text-xl"/>}
              {submitting ? "Creating..." : "Create Project & Team"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}