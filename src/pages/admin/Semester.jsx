import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const TeamMemberInput = ({ member, index, handleChange, removeMember, canRemove, branches, semesters, sections }) => (
  <div className="flex flex-col gap-2 mb-4 border-b border-gray-600 pb-3">
    <div className="flex gap-2 items-center">
      <input
        type="email"
        placeholder="Email"
        value={member.email}
        onChange={(e) => handleChange(index, "email", e.target.value)}
        className="flex-1 p-2 rounded bg-gray-800 border border-gray-600 text-white"
        required
      />
      <input
        type="text"
        placeholder="Role"
        value={member.role}
        onChange={(e) => handleChange(index, "role", e.target.value)}
        className="flex-1 p-2 rounded bg-gray-800 border border-gray-600 text-white"
        required
      />
      <label className="flex items-center gap-1">
        <input
          type="checkbox"
          checked={member.isLeader}
          onChange={(e) => handleChange(index, "isLeader", e.target.checked)}
        />
        Leader
      </label>
      {canRemove && (
        <button type="button" onClick={() => removeMember(index)} className="bg-red-600 px-3 py-1 rounded">
          X
        </button>
      )}
    </div>
    <div className="flex gap-2">
      <select
        value={member.branchId || ""}
        onChange={(e) => handleChange(index, "branchId", e.target.value)}
        className="flex-1 p-2 rounded bg-gray-800 border border-gray-600 text-white"
        required
      >
        <option value="">Select Branch</option>
        {branches.map((b) => <option key={b.id} value={b.id}>{b.branchName}</option>)}
      </select>

      <select
        value={member.semesterId || ""}
        onChange={(e) => handleChange(index, "semesterId", e.target.value)}
        className="flex-1 p-2 rounded bg-gray-800 border border-gray-600 text-white"
        required
      >
        <option value="">Select Semester</option>
        {semesters.map((s) => <option key={s.id} value={s.id}>{s.semesterName}</option>)}
      </select>

      <select
        value={member.sectionId || ""}
        onChange={(e) => handleChange(index, "sectionId", e.target.value)}
        className="flex-1 p-2 rounded bg-gray-800 border border-gray-600 text-white"
        required
      >
        <option value="">Select Section</option>
        {sections.map((s) => <option key={s.id} value={s.id}>{s.sectionName}</option>)}
      </select>
    </div>
  </div>
);

export default function TeamManagement() {
  const navigate = useNavigate();
  const [project, setProject] = useState({ title: "", description: "", technologies: "", startDate: "", endDate: "" });
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState([{ email: "", role: "", isLeader: false, branchId: "", semesterId: "", sectionId: "" }]);
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // Axios config with token
  const axiosConfig = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    if (!token) {
      Swal.fire("Error", "You must login first", "error");
      navigate("/login");
      return;
    }

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
      } catch (err) {
        Swal.fire({
          title: "Error",
          text: err.response?.data?.message || "Failed to load branches/semesters/sections",
          icon: "error",
          background: "#0f172a",
          color: "#fff",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  const handleProjectChange = (field, value) => setProject({ ...project, [field]: value });

  const handleMemberChange = (index, field, value) => {
    const updated = [...members];
    if (field === "isLeader" && value) updated.forEach((m, i) => m.isLeader = i === index);
    updated[index][field] = value;
    setMembers(updated);
  };

  const addMember = () => setMembers([...members, { email: "", role: "", isLeader: false, branchId: "", semesterId: "", sectionId: "" }]);
  const removeMember = (index) => setMembers(members.filter((_, i) => i !== index));

  const validateForm = () => {
    if (!project.title || !teamName) { Swal.fire("Error", "Project title & team name required", "error"); return false; }
    if (members.filter(m => m.isLeader).length !== 1) { Swal.fire("Error", "Select exactly one leader", "error"); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        projectTitle: project.title,
        description: project.description,
        technologiesUsed: project.technologies,
        startDate: project.startDate || null,
        endDate: project.endDate || null,
        teamName,
        members,
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/guide/teams`, payload, axiosConfig);

      Swal.fire({
        title: "Success",
        text: "Project & Team created successfully",
        icon: "success",
        background: "#0f172a",
        color: "#fff",
      });

      setProject({ title: "", description: "", technologies: "", startDate: "", endDate: "" });
      setTeamName("");
      setMembers([{ email: "", role: "", isLeader: false, branchId: "", semesterId: "", sectionId: "" }]);
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to create team",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
      });
    }
  };

  if (loading) return <p className="text-white">Loading...</p>;

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 p-10">
      <motion.h1 className="text-3xl font-bold mb-6 text-sky-400" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        Create Project & Team
      </motion.h1>

      <form onSubmit={handleSubmit} className="bg-slate-800 border border-sky-600 rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-sky-300">Project Info</h2>
        <input type="text" placeholder="Project Title" value={project.title} onChange={e => handleProjectChange("title", e.target.value)} className="w-full p-3 mb-3 rounded-lg bg-slate-900 border border-white/20" required />
        <textarea placeholder="Description" value={project.description} onChange={e => handleProjectChange("description", e.target.value)} className="w-full p-3 mb-3 rounded-lg bg-slate-900 border border-white/20" />
        <input type="text" placeholder="Technologies Used" value={project.technologies} onChange={e => handleProjectChange("technologies", e.target.value)} className="w-full p-3 mb-3 rounded-lg bg-slate-900 border border-white/20" />
        <div className="flex gap-3 mb-3">
          <input type="date" value={project.startDate} onChange={e => handleProjectChange("startDate", e.target.value)} className="p-3 rounded-lg bg-slate-900 border border-white/20 flex-1" />
          <input type="date" value={project.endDate} onChange={e => handleProjectChange("endDate", e.target.value)} className="p-3 rounded-lg bg-slate-900 border border-white/20 flex-1" />
        </div>

        <h2 className="text-xl font-semibold mb-4 text-sky-300">Team Info</h2>
        <input type="text" placeholder="Team Name" value={teamName} onChange={e => setTeamName(e.target.value)} className="w-full p-3 mb-3 rounded-lg bg-slate-900 border border-white/20" required />

        {members.map((m, i) =>
          <TeamMemberInput key={i} member={m} index={i} handleChange={handleMemberChange} removeMember={removeMember} canRemove={members.length > 1} branches={branches} semesters={semesters} sections={sections} />
        )}

        <motion.button type="button" onClick={addMember} className="bg-sky-500 px-5 py-2 rounded-lg hover:bg-sky-600 transition" whileHover={{ scale: 1.05 }}>
          + Add Team Member
        </motion.button>
        <button type="submit" className="w-full mt-5 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold">Create Team</button>
      </form>
    </div>
  );
}
