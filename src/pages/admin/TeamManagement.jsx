import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

// Reusable Team Member Input
const TeamMemberInput = ({ member, index, handleChange, removeMember, canRemove }) => (
  <div className="flex gap-2 items-center mb-2">
    <input
      type="email"
      placeholder="Email"
      value={member.email}
      onChange={(e) => handleChange(index, "email", e.target.value)}
      className="flex-1 p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 text-white"
      required
    />
    <input
      type="text"
      placeholder="Role (e.g., Frontend, Backend)"
      value={member.role}
      onChange={(e) => handleChange(index, "role", e.target.value)}
      className="flex-1 p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 text-white"
      required
    />
    <label className="flex items-center gap-1 whitespace-nowrap">
      <input
        type="checkbox"
        checked={member.isLeader}
        onChange={(e) => handleChange(index, "isLeader", e.target.checked)}
      />
      Leader
    </label>
    {canRemove && (
      <button
        type="button"
        onClick={() => removeMember(index)}
        className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition-colors"
      >
        X
      </button>
    )}
  </div>
);

function TeamManagement() {
  const initialProject = { title: "", description: "", technologies: "", startDate: "", endDate: "" };
  const initialMembers = [{ email: "", role: "", isLeader: false }];

  const [project, setProject] = useState(initialProject);
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState(initialMembers);

  const handleProjectChange = (field, value) => setProject({ ...project, [field]: value });

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...members];
    if (field === "isLeader" && value) updatedMembers.forEach((m, i) => { if (i !== index) m.isLeader = false; });
    updatedMembers[index][field] = value;
    setMembers(updatedMembers);
  };

  const addMember = () => setMembers([...members, { email: "", role: "", isLeader: false }]);
  const removeMember = (index) => setMembers(members.filter((_, i) => i !== index));

  const validateForm = () => {
    if (!project.title.trim() || !teamName.trim()) { Swal.fire("Error", "Project title and team name are required", "error"); return false; }
    if (members.filter((m) => m.isLeader).length !== 1) { Swal.fire("Error", "There must be exactly 1 leader", "error"); return false; }
    return true;
  };

  const resetForm = () => { setProject(initialProject); setTeamName(""); setMembers(initialMembers); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      project: {
        projectTitle: project.title,
        description: project.description,
        technologiesUsed: project.technologies,
        startDate: project.startDate,
        endDate: project.endDate,
      },
      team: { teamName, members },
    };

    try {
      await axios.post("/api/teamsManager", payload);
      Swal.fire("Success", "Project & Team created successfully!", "success");
      resetForm();
    } catch (error) {
      Swal.fire("Error", error.response?.data || "Something went wrong", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-black p-6 flex justify-center items-start text-white">
      <div className="w-full max-w-5xl">
        {/* Header with Motion Animation */}
        <div className="flex justify-between items-center mb-6">
          <motion.h1
            className="text-3xl font-bold text-sky-400"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            whileHover={{ scale: 1.05, color: "#60a5fa" }}
          >
            Create Project & Team
          </motion.h1>

          <button
            type="button"
            className="bg-yellow-600 px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
            onClick={() => alert("Manage Projects & Teams - Future Feature")}
          >
            + Manage
          </button>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6 bg-gray-900/80 p-6 rounded-2xl shadow-xl backdrop-blur-md border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Project Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b border-gray-600 pb-1">Project Info</h2>
            <input type="text" placeholder="Project Title" value={project.title} onChange={(e) => handleProjectChange("title", e.target.value)} className="w-full p-3 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 text-white" required />
            <textarea placeholder="Project Description" value={project.description} onChange={(e) => handleProjectChange("description", e.target.value)} className="w-full p-3 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 text-white" />
            <input type="text" placeholder="Technologies Used (e.g., Java, React)" value={project.technologies} onChange={(e) => handleProjectChange("technologies", e.target.value)} className="w-full p-3 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 text-white" />
            <div className="flex gap-4">
              <input type="date" value={project.startDate} onChange={(e) => { handleProjectChange("startDate", e.target.value); if (project.endDate && e.target.value > project.endDate) handleProjectChange("endDate", e.target.value); }} className="flex-1 p-3 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 text-white" min={new Date().toISOString().split("T")[0]} />
              <input type="date" value={project.endDate} onChange={(e) => handleProjectChange("endDate", e.target.value)} className="flex-1 p-3 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 text-white" min={project.startDate || new Date().toISOString().split("T")[0]} />
            </div>
          </section>

          {/* Team Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b border-gray-600 pb-1">Team Info</h2>
            <input type="text" placeholder="Team Name" value={teamName} onChange={(e) => setTeamName(e.target.value)} className="w-full p-3 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 text-white" required />
            <h3 className="text-xl mt-2">Team Members</h3>
            {members.map((member, index) => (
              <TeamMemberInput key={index} member={member} index={index} handleChange={handleMemberChange} removeMember={removeMember} canRemove={members.length > 1} />
            ))}
            <motion.button
  type="button"
  onClick={addMember}
  className="flex items-center gap-2 bg-sky-600 px-5 py-2 rounded hover:bg-sky-700 transition-colors shadow-lg"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
  Team Member
</motion.button>

          </section>

          <button type="submit" className="bg-green-600 px-6 py-3 rounded mt-4 hover:bg-green-700 transition-colors w-full text-lg font-semibold">Create Team</button>
        </motion.form>
      </div>
    </div>
  );
}

export default TeamManagement;
